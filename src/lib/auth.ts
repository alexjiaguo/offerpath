import { createClient, isSupabaseConfigured } from "@/lib/supabase";

const MOCK_AUTH_COOKIE = "auth_token";
const MOCK_AUTH_MAX_AGE = 60 * 60 * 24 * 7;

export function setMockAuthSession(email?: string): void {
  const token = btoa(JSON.stringify({ email: email ?? "user@demo.local", ts: Date.now() }));
  document.cookie = `${MOCK_AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${MOCK_AUTH_MAX_AGE}; SameSite=Lax`;
}

export function clearMockAuthSession(): void {
  document.cookie = `${MOCK_AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
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
}
