import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Auth is optional. Signed-in users skip /login and /register; everyone else
// (including guests) can reach /dashboard directly. Server actions still gate
// writes to Supabase, and a guest who later signs in triggers a one-time
// localStorage -> Supabase migration.
const AUTH_ROUTES = ["/login", "/register"];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useSupabase = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Only signed-in users are redirected away from /login and /register.
  // /dashboard is open to everyone — guests and authenticated users alike.
  if (!isAuthRoute) {
    return NextResponse.next();
  }

  if (useSupabase) {
    const res = NextResponse.next();
    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return res;
  }

  // Fallback: mock auth token in cookies (for development without Supabase)
  const authToken = request.cookies.get("auth_token")?.value;
  if (authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
