import { createClient, isSupabaseConfigured } from "@/lib/supabase";

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

export async function signInWithEmail(email: string, password: string): Promise<void> {
 if (isSupabaseConfigured()) {
 const supabase = createClient();
 if (!supabase) throw new Error("Supabase client unavailable");
 const { error } = await supabase.auth.signInWithPassword({ email, password });
 if (error) throw error;
 return;
 }
 setMockAuthSession(email);
}

export async function signUpWithEmail(email: string, password: string, metadata?: { full_name?: string }): Promise<void> {
 if (isSupabaseConfigured()) {
 const supabase = createClient();
 if (!supabase) throw new Error("Supabase client unavailable");
 const { error } = await supabase.auth.signUp({ email, password, options: metadata ? { data: metadata } : undefined });
 if (error) throw error;
 return;
 }
 setMockAuthSession(email);
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
