import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { useProfileStore, createEmptyProfile } from "@/store/profileStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";
import { logger } from "@/lib/logger";

const MOCK_AUTH_COOKIE = "auth_token";
const GUEST_COOKIE = "offerpath_guest";
const MOCK_AUTH_MAX_AGE = 60 * 60 * 24 * 7;

export function setMockAuthSession(email?: string): void {
  const token = btoa(JSON.stringify({ email: email ?? "user@demo.local", ts: Date.now() }));
  document.cookie = `${MOCK_AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MOCK_AUTH_MAX_AGE}; SameSite=Lax`;
  // Landing in a real account clears the guest flag.
  clearGuestSession();
}

export function clearMockAuthSession(): void {
  document.cookie = `${MOCK_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function setGuestSession(): void {
  document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${MOCK_AUTH_MAX_AGE}; SameSite=Lax`;
}

export function clearGuestSession(): void {
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function isGuestMode(): boolean {
  if (typeof document === "undefined") return false;
  // Guest only if there's a guest flag AND no auth token.
  const hasGuest = document.cookie.split("; ").some((c) => c.startsWith(`${GUEST_COOKIE}=`));
  const hasAuth = document.cookie.split("; ").some((c) => c.startsWith(`${MOCK_AUTH_COOKIE}=`));
  return hasGuest && !hasAuth;
}

/**
 * Wipes all demo/placeholder data from every Zustand store so the user
 * starts with a clean slate after signup or login. The persist middleware
 * automatically saves the cleared state to localStorage.
 *
 * For Supabase users, useSupabaseSync will hydrate the stores with the
 * user's real data from the database immediately after this runs.
 */
function resetAllStores(fullName: string, email: string): void {
  useProfileStore.setState({
    profile: createEmptyProfile(fullName, email),
    uploadedResume: null,
    apiKeys: [],
    defaultProvider: null,
  });
  usePipelineStore.setState({ jobs: [], companies: [] });
  useResumeStore.setState({
    resumes: [],
    history: { resumeId: null, past: [], future: [] },
    canUndo: false,
    canRedo: false,
  });
  useDiscoveryStore.setState({
    companies: [],
    jobs: [],
    scanRuns: [],
    profile: {
      id: "",
      title: "",
      target_roles: [],
      industries: [],
      locations: [],
      min_match_score: 0,
      keywords: [],
      experience_years: "",
      auto_scan_enabled: false,
      auto_scan_interval: "weekly",
      created_at: "",
      updated_at: "",
    },
  });
  useInterviewStore.setState({ stories: [], preps: [], mockSessions: [] });
}

/**
 * Ensures a profiles row exists in Supabase for the given user.
 * Uses upsert with ignoreDuplicates so it only creates the row if it
 * doesn't already exist - it never overwrites a user's saved data.
 *
 * This is needed because:
 * 1. The DB trigger (handle_new_user) may not be set up if the user
 *    hasn't run schema.sql in their Supabase instance.
 * 2. useSupabaseSync only syncs store changes that happen AFTER
 *    hydration, so the initial profile state is never pushed to Supabase.
 */
async function ensureProfileRow(
  supabase: NonNullable<ReturnType<typeof createClient>>,
  userId: string,
  fullName: string,
  email: string
): Promise<void> {
  try {
    await supabase.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        email,
        avatar_url: "",
        tier: "free",
        ai_uses_this_month: 0,
        month_reset_at: new Date().toISOString(),
        onboarding_completed: false,
        preferences: {},
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
  } catch (err) {
    logger.error("[auth] ensureProfileRow failed:", err);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase client unavailable");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const authEmail = data.user?.email ?? email;
    const authName = (data.user?.user_metadata?.full_name as string) ?? "";

    // Ensure a profiles row exists in the database (signup trigger may
    // not have fired, or schema.sql wasn't run).
    if (data.user) {
      await ensureProfileRow(supabase, data.user.id, authName, authEmail);
    }

    // Clean slate: clear all demo/stale data. useSupabaseSync will
    // hydrate the stores with the user's real data from the database.
    resetAllStores(authName, authEmail);
    return;
  }
  // Mock auth: clean slate, no hydration source.
  resetAllStores("", email);
  setMockAuthSession(email);
}

export async function signUpWithEmail(email: string, password: string, metadata?: { full_name?: string }): Promise<{ needsConfirmation: boolean }> {
  const fullName = metadata?.full_name ?? "";

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase client unavailable");
    const { data, error } = await supabase.auth.signUp({ email, password, options: metadata ? { data: metadata } : undefined });
    if (error) throw error;

    const authEmail = data.user?.email ?? email;
    const authName = (data.user?.user_metadata?.full_name as string) ?? fullName;

    // Create the profiles row immediately. Only possible when we have
    // a session (email confirmation disabled). If confirmation is
    // required, the DB trigger or the next login will handle it.
    if (data.session && data.user) {
      await ensureProfileRow(supabase, data.user.id, authName, authEmail);
    }

    // Brand-new account: clean slate with the user's info.
    resetAllStores(authName, authEmail);
    // No session + a user means Supabase is waiting on email confirmation —
    // callers must NOT push to /dashboard as if signed in.
    return { needsConfirmation: !data.session };
  }
  // Mock auth: brand-new account, clean slate.
  resetAllStores(fullName, email);
  setMockAuthSession(email);
  return { needsConfirmation: false };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
  }
  clearMockAuthSession();
  // After signing out, treat the visitor as a guest again.
  setGuestSession();
}

/**
 * Permanently deletes everything OfferPath holds for this browser identity:
 * all stores, persisted localStorage slices, and the Supabase session/token.
 * The Supabase Auth user row itself cannot be deleted client-side (that needs
 * the service-role key), so the settings UI labels this "Delete my data",
 * not "Delete my account".
 */
export async function deleteLocalAccountData(): Promise<void> {
  resetAllStores("", "");
  useInterviewStore.setState({ stories: [], preps: [], mockSessions: [], storySearch: "" });
  if (typeof window !== "undefined") {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith("offerpath") || k === "offerpath-locale")) keys.push(k);
    }
    for (const k of keys) {
      try {
        window.localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
  }
  await signOut();
}
