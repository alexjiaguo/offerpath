import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function checkIsConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === "" || supabaseAnonKey.trim() === "") {
    return false;
  }
  if (
    supabaseUrl.includes("ubkywtxwzrudstqvpafh.supabase.co") ||
    supabaseUrl.includes("placeholder") ||
    supabaseUrl.includes("your-supabase-url") ||
    supabaseUrl.includes("example.supabase.co") ||
    supabaseAnonKey.includes("placeholder") ||
    supabaseAnonKey.includes("your-anon-key") ||
    supabaseAnonKey.startsWith("sb_publishable_") ||
    !(supabaseAnonKey.startsWith("eyJ") || supabaseAnonKey.startsWith("sbp_"))
  ) {
    return false;
  }
  return true;
}

const isConfigured = checkIsConfigured();

export function createClient() {
  if (!isConfigured) {
    return null;
  }
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

