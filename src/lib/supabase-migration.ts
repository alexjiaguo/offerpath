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
  const hasAnyData = Object.values(slices).some((s) => {
    if (s == null) return false;
    if (Array.isArray(s)) return s.length > 0;
    if (typeof s === "object") return Object.keys(s as object).length > 0;
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

  clearStorageKeys();
  window.localStorage.setItem(MIGRATION_FLAG, "1");
  return true;
}

export function isMigrationDone(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MIGRATION_FLAG) === "1";
}

export function resetMigrationFlag(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MIGRATION_FLAG);
}
