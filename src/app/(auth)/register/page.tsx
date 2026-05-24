"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/auth";
import { BsCheckCircleFill, BsEnvelope, BsEye, BsEyeSlash, BsLock, BsPerson, BsRocket } from 'react-icons/bs';
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

/* ═══════════════════════════════════════════════════
   Register Page — Account creation form
   ═══════════════════════════════════════════════════ */

const BENEFITS = [
  "Track unlimited job applications",
  "AI-powered resume tailoring",
  "Mock interviews with scoring",
  "No credit card required",
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one uppercase letter and one number");
      return;
    }
    if (!agreed) {
      setError("Please accept the terms and conditions");
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, { full_name: name });
      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Create your account</h1>
        <p className="text-sm text-zinc-500 dark:text-gray-500">
          Start your journey to the perfect offer
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {BENEFITS.map((b) => (
          <div key={b} className="flex items-center gap-1.5">
            <BsCheckCircleFill className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <span className="text-[11px] text-zinc-600 dark:text-gray-400">{b}</span>
          </div>
        ))}
      </div>

      {/* Social Signup */}
      <SocialLoginButtons variant="compact" />

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

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
            Full name
          </label>
          <div className="relative">
            <BsPerson className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-gray-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Chen"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

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
              placeholder="Min. 8 characters"
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

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <BsLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-surface-200 text-brand-500 focus:ring-brand-500/20"
          />
          <span className="text-xs text-zinc-600 dark:text-gray-400 leading-relaxed">
            I agree to the{" "}
            <a href="#" className="text-brand-400 hover:text-brand-300">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-brand-400 hover:text-brand-300">
              Privacy Policy
            </a>
          </span>
        </label>

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
              <BsRocket className="w-4 h-4" />
              Create Account
            </>
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-zinc-500 dark:text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
