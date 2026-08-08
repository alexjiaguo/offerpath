import { logger } from "@/lib/logger";
import { isSupabaseConfigured, createClient } from "./supabase";
import { syncStoreToSupabase, type StoreName } from "./supabase-sync";

const MIGRATION_FLAG = "offerpath_guest_migrated";

// localStorage keys for the four persisted stores (zustand persist).
// Kept in sync with each store's `persist` `name` option.
const STORAGE_KEYS: Record<StoreName, string> = {
 pipeline: "offerpath-pipeline",
 resume: "offerpath-resume",
 profile: "offerpath-profile",
 discovery: "offerpath-discovery",
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

 const slices: Record<StoreName, unknown> = {
 pipeline: extractSlice(readStoreState(STORAGE_KEYS.pipeline) ?? {}, "state"),
 resume: extractSlice(readStoreState(STORAGE_KEYS.resume) ?? {}, "resumes"),
 profile: extractSlice(readStoreState(STORAGE_KEYS.profile) ?? {}, "profile"),
 discovery: extractSlice(
 readStoreState(STORAGE_KEYS.discovery) ?? {},
 "state"
 ),
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
