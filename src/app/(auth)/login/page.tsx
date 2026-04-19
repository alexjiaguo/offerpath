"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BsBoxArrowInRight, BsEnvelope, BsEye, BsEyeSlash, BsLock } from 'react-icons/bs';
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

/* ═══════════════════════════════════════════════════
   Login Page — Glassmorphism auth form
   ═══════════════════════════════════════════════════ */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 800));

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Mock login — always succeed
    router.push("/dashboard");
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-sm text-zinc-500 dark:text-gray-500">
          Sign in to continue your job search journey
        </p>
      </div>

      {/* Social Login */}
      <SocialLoginButtons />

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-xs text-zinc-700 dark:text-zinc-400 dark:text-gray-600 uppercase tracking-wider">
          or
        </span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <BsEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <BsLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <BsEyeSlash className="w-4 h-4" />
              ) : (
                <BsEye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            onClick={() => alert("Password reset coming soon!")}
            type="button"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <BsBoxArrowInRight className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-zinc-500 dark:text-gray-500 mt-6">
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
