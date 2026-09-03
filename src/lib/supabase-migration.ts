import { logger } from "@/lib/logger";
import { isSupabaseConfigured, createClient } from "./supabase";
import { syncStoreToSupabase, isUUID, type StoreName } from "./supabase-sync";

const MIGRATION_FLAG = "offerpath_guest_migrated";

// localStorage keys for the persisted stores (zustand persist).
// Kept in sync with each store's `persist` `name` option.
const STORAGE_KEYS: Record<StoreName, string> = {
  pipeline: "offerpath-pipeline",
  resume: "offerpath-resume",
  profile: "offerpath-profile",
  discovery: "offerpath-discovery",
  interview: "offerpath-interview",
};

type AnyRecord = Record<string, unknown>;

function readStoreState(key: string): AnyRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as AnyRecord;
  } catch {
    return null;
  }
}

function extractSlice(state: AnyRecord, sliceKey: string): unknown {
  if (state && typeof state === "object" && "state" in state) {
    const inner = (state as { state: AnyRecord }).state;
    if (inner && sliceKey in inner) {
      return (inner as AnyRecord)[sliceKey];
    }
    return inner;
  }
  if (state && sliceKey in state) {
    return (state as AnyRecord)[sliceKey];
  }
  return state;
}

function clearStorageKeys() {
  if (typeof window === "undefined") return;
  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

/**
 * Migrate any local-only guest data into Supabase once the user signs in.
 * Idempotent — guarded by a localStorage flag and skipped when Supabase is
 * not configured or there's no authenticated user.
 */
export async function migrateGuestDataToSupabase(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!isSupabaseConfigured()) return false;

  const supabase = createClient();
  if (!supabase) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  if (window.localStorage.getItem(MIGRATION_FLAG) === "1") return false;

  // Remap legacy non-UUID IDs to valid UUIDs while preserving relationships
  const idMap = new Map<string, string>();
  function toUUID(rawId: unknown): string {
    if (typeof rawId !== "string" || !rawId) return crypto.randomUUID();
    if (isUUID(rawId)) return rawId;
    if (!idMap.has(rawId)) {
      idMap.set(rawId, crypto.randomUUID());
    }
    return idMap.get(rawId)!;
  }

  // 1. Pipeline: companies & jobs
  const pipelineRaw = extractSlice(readStoreState(STORAGE_KEYS.pipeline) ?? {}, "state") as {
    jobs?: Record<string, unknown>[];
    companies?: Record<string, unknown>[];
  } | null;

  const rawCompanies = pipelineRaw?.companies ?? [];
  const normalizedCompanies = rawCompanies.map((c) => ({
    ...c,
    id: toUUID(c.id),
  }));

  // 2. Resumes
  const resumeRaw = extractSlice(readStoreState(STORAGE_KEYS.resume) ?? {}, "resumes");
  const rawResumes = Array.isArray(resumeRaw) ? resumeRaw : [];
  const normalizedResumes = rawResumes.map((r: Record<string, unknown>) => ({
    ...r,
    id: toUUID(r.id),
  }));

  // 3. Jobs in pipeline
  const rawJobs = pipelineRaw?.jobs ?? [];
  const normalizedJobs = rawJobs.map((j) => ({
    ...j,
    id: toUUID(j.id),
    company_id: j.company_id ? toUUID(j.company_id) : null,
    resume_id: j.resume_id ? toUUID(j.resume_id) : null,
  }));

  // 4. Discovery companies
  const discoveryRaw = extractSlice(readStoreState(STORAGE_KEYS.discovery) ?? {}, "state") as {
    companies?: Record<string, unknown>[];
  } | null;
  const rawDiscCompanies = discoveryRaw?.companies ?? [];
  const normalizedDiscCompanies = rawDiscCompanies.map((c) => ({
    ...c,
    id: toUUID(c.id),
  }));

  // 5. Interview stories, preps, sessions
  const interviewRaw = (() => {
    const raw = readStoreState(STORAGE_KEYS.interview) ?? {};
    const inner = extractSlice(raw, "state") as Record<string, unknown> | null;
    return {
      stories: ((inner?.stories as Record<string, unknown>[]) ?? []).map((s) => ({
        ...s,
        id: toUUID(s.id),
      })),
      preps: ((inner?.preps as Record<string, unknown>[]) ?? []).map((p) => ({
        ...p,
        id: toUUID(p.id),
        job_id: toUUID(p.job_id),
      })),
      mockSessions: ((inner?.mockSessions as Record<string, unknown>[]) ?? []).map((m) => ({
        ...m,
        id: toUUID(m.id),
        job_id: m.job_id ? toUUID(m.job_id) : null,
      })),
    };
  })();

  const slices: Record<StoreName, unknown> = {
    pipeline: { jobs: normalizedJobs, companies: normalizedCompanies },
    resume: normalizedResumes,
    profile: extractSlice(readStoreState(STORAGE_KEYS.profile) ?? {}, "profile"),
    discovery: { companies: normalizedDiscCompanies },
    interview: interviewRaw,
  };

  // If no store has any data, mark migrated and bail — there's nothing to push.
  // NOTE: { jobs: [], companies: [] } counts as EMPTY (nested arrays checked),
  // otherwise empty stores trigger pointless sync calls on every fresh account.
  // A default/blank guest profile (all "" / [] / defaults) likewise counts as
  // empty: the profiles row is created at signup/login, and later edits sync
  // back through the normal debounced path. Only curated user-content fields
  // count — tier/aiUsesThisMonth/disclosure defaults are always present and
  // must not trigger a migration by themselves.
  const isNonBlank = (v: unknown): boolean => {
    if (v == null) return false;
    if (typeof v === "boolean" || typeof v === "number") return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "object") {
      return Object.values(v as Record<string, unknown>).some(isNonBlank);
    }
    return true;
  };
  const PROFILE_CONTENT_FIELDS = [
    "fullName", "email", "phone", "location", "linkedin", "website",
    "avatarUrl", "headline", "yearsOfExperience", "targetRoleSummary",
    "currentCompany", "currentTitle", "keySkills", "careerGoals",
    "preferredIndustries", "preferredLocations", "salaryExpectation",
    "workAuthorization", "workExperience", "education",
  ];
  const profileSlice = slices.profile as Record<string, unknown> | null;
  const profileHasData =
    !!profileSlice &&
    PROFILE_CONTENT_FIELDS.some((f) => isNonBlank(profileSlice[f]));
  const hasAnyData =
    profileHasData ||
    (Object.entries(slices) as [StoreName, unknown][]).some(([name, s]) => {
      if (name === "profile" || s == null) return false;
      if (Array.isArray(s)) return s.length > 0;
      if (typeof s === "object") {
        return Object.values(s as Record<string, unknown>).some(isNonBlank);
      }
      return true;
    });

  if (!hasAnyData) {
    window.localStorage.setItem(MIGRATION_FLAG, "1");
    return false;
  }

  try {
    await syncStoreToSupabase("pipeline", slices.pipeline);
    await syncStoreToSupabase("resume", slices.resume);
    await syncStoreToSupabase("profile", slices.profile);
    await syncStoreToSupabase("discovery", slices.discovery);
    await syncStoreToSupabase("interview", slices.interview);
  } catch (err) {
    logger.error("[supabase-migration] migration failed:", err);
    return false;
  }

  // Adopt the remapped UUIDs in the LIVE zustand stores. Without this, the
  // in-memory jobs/resumes/stories keep their legacy ids (s1, exp-..., ...)
  // while localStorage was just cleared — the next debounced sync would push
  // stale ids that supabase-sync silently skips as non-UUID.
  remapLiveStoreIds(idMap);

  clearStorageKeys();
  window.localStorage.setItem(MIGRATION_FLAG, "1");
  return true;
}

/**
 * Rewrite legacy guest ids to their migrated UUIDs inside the LIVE zustand
 * stores (idMap built by toUUID above). Called once after a successful
 * migration so subsequent debounced syncs reference server-side rows.
 * Dynamic imports avoid hard module cycles with the stores.
 */
async function remapLiveStoreIds(idMap: Map<string, string>): Promise<void> {
  if (idMap.size === 0) return;
  const mapped = (id: unknown) =>
    typeof id === "string" && idMap.has(id) ? (idMap.get(id) as string) : id;
  try {
    const { usePipelineStore } = await import("@/store/pipelineStore");
    usePipelineStore.setState((s) => ({
      jobs: s.jobs.map((j) => {
        const raw = j as unknown as Record<string, unknown>;
        const companyId = mapped(raw.company_id);
        const resumeId = mapped(raw.resume_id);
        return {
          ...j,
          id: mapped(j.id) as string,
          // Job.company_id / resume_id are optional strings (not null).
          ...(typeof companyId === "string" ? { company_id: companyId } : {}),
          ...(typeof resumeId === "string" ? { resume_id: resumeId } : {}),
          company: j.company ? { ...j.company, id: mapped(j.company.id) as string } : j.company,
        };
      }),
      companies: s.companies.map((c) => ({ ...c, id: mapped(c.id) as string })),
    }));
  } catch (err) {
    logger.error("[supabase-migration] pipeline id remap failed:", err);
  }
  try {
    const { useResumeStore } = await import("@/store/resumeStore");
    useResumeStore.setState((s) => ({
      resumes: s.resumes.map((r) => ({ ...r, id: mapped(r.id) as string })),
    }));
  } catch (err) {
    logger.error("[supabase-migration] resume id remap failed:", err);
  }
  try {
    const { useDiscoveryStore } = await import("@/store/discoveryStore");
    useDiscoveryStore.setState((s) => ({
      companies: s.companies.map((c) => ({ ...c, id: mapped(c.id) as string })),
      jobs: s.jobs.map((j) => ({ ...j, company_id: mapped(j.company_id) as string })),
    }));
  } catch (err) {
    logger.error("[supabase-migration] discovery id remap failed:", err);
  }
  try {
    const { useInterviewStore } = await import("@/store/interviewStore");
    useInterviewStore.setState((s) => ({
      stories: s.stories.map((st) => ({ ...st, id: mapped(st.id) as string })),
      preps: s.preps.map((p) => ({
        ...p,
        id: mapped(p.id) as string,
        job_id: mapped(p.job_id) as string,
      })),
      mockSessions: s.mockSessions.map((m) => ({
        ...m,
        id: mapped(m.id) as string,
        job_id: mapped(m.job_id) as string,
      })),
    }));
  } catch (err) {
    logger.error("[supabase-migration] interview id remap failed:", err);
  }
}

export function isMigrationDone(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MIGRATION_FLAG) === "1";
}

export function resetMigrationFlag(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MIGRATION_FLAG);
}
