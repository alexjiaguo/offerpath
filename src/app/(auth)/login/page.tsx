"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignIn, Envelope, Eye, EyeSlash, Lock, ArrowRight } from "@phosphor-icons/react";
import { signInWithEmail, setGuestSession } from "@/lib/auth";

/* ═══════════════════════════════════════════════════
 Login Page — Glassmorphism auth form
 ═══════════════════════════════════════════════════ */

function LoginForm() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const redirect = searchParams.get("redirect") || "/dashboard";

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");

 if (!email || !password) {
 setError("Please fill in all fields");
 return;
 }

 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
 setError("Please enter a valid email address");
 return;
 }

 setLoading(true);
 try {
 await signInWithEmail(email, password);
 router.refresh();
 router.push(redirect);
 } catch (err) {
 setError(err instanceof Error ? err.message : "Sign in failed");
 } finally {
 setLoading(false);
 }
 };

 return (
 <>
 <div className="text-center mb-8">
 <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
 <p className="text-sm text-surface-300">
 Sign in to continue your job search journey
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 {error && (
 <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
 {error}
 </div>
 )}

 <div>
 <label className="block text-xs font-medium text-surface-300 mb-1.5">
 Email address
 </label>
 <div className="relative">
 <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="you@example.com"
 className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-medium text-surface-300 mb-1.5">
 Password
 </label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
 <input
 type={showPassword ? "text" : "password"}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-400 transition-colors"
 >
 {showPassword ? (
 <EyeSlash className="w-4 h-4" />
 ) : (
 <Eye className="w-4 h-4" />
 )}
 </button>
 </div>
 </div>

 <a
 href="#reset"
 onClick={async (e) => {
 e.preventDefault();
 if (!email) { setError("Enter your email above first."); return; }
 try {
 const { createClient } = await import("@/lib/supabase");
 const sb = createClient();
 if (!sb) { setError("Supabase is not configured."); return; }
 const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/login" });
 if (error) setError(error.message);
 else setError("Password reset email sent. Check your inbox.");
 } catch (err) { setError(err instanceof Error ? err.message : "Failed to send reset email."); }
 }}
 className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
 >
 Forgot password?
 </a>

 <button
 type="submit"
 disabled={loading}
 className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ember-600 text-white text-sm font-semibold hover:bg-ember-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {loading ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>
 <SignIn className="w-4 h-4" />
 Sign In
 </>
 )}
 </button>
 </form>

{/* Divider */}
 <div className="flex items-center gap-4 my-6">
 <div className="flex-1 h-px bg-surface-0/[0.06]" />
 <span className="text-xs text-surface-400 uppercase tracking-wider">
 or
 </span>
 <div className="flex-1 h-px bg-surface-0/[0.06]" />
 </div>

 <button
 type="button"
 onClick={() => {
 setGuestSession();
 router.push(redirect || "/dashboard");
 }}
 className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-0/[0.04] hover:bg-surface-0/[0.08] border border-white/[0.08] text-sm font-medium text-surface-400 transition-all"
 >
 Continue without account
 <ArrowRight className="w-4 h-4" />
 </button>

 <p className="text-center text-sm text-surface-300 mt-6">
 Don&apos;t have an account?{" "}
 <Link
 href="/register"
 className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
 >
 Sign up free
 </Link>
 </p>
 </>
 );
}

export default function LoginPage() {
 return (
 <Suspense
 fallback={
 <div className="flex justify-center py-12">
 <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-400 rounded-full animate-spin" />
 </div>
 }
 >
 <LoginForm />
 </Suspense>
 );
}
