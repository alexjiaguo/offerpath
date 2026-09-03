"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SignIn, Envelope, Eye, EyeSlash, Lock, ArrowRight } from "@phosphor-icons/react";
import { signInWithEmail, setGuestSession } from "@/lib/auth";
import { useTranslation } from "@/i18n";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password) {
      setError(t.auth.allFieldsRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.auth.invalidEmail);
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
        <h1 className="text-2xl font-bold mb-2 font-display text-surface-400">{t.auth.welcomeBack}</h1>
        <p className="text-sm text-surface-300">
          {t.auth.signInSubtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {error}
          </div>
        )}
        {info && (
          <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700">
            {info}
          </div>
        )}

        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-surface-300 mb-1.5">
            {t.auth.emailLabel}
          </label>
          <div className="relative">
            <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium text-surface-300 mb-1.5">
            {t.auth.passwordLabel}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-400 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
            if (!email) { setError(t.auth.invalidEmail); return; }
            try {
              const { createClient } = await import("@/lib/supabase");
              const sb = createClient();
              if (!sb) { setError("Supabase is not configured."); return; }
              const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
              if (error) setError(error.message);
              else setInfo(t.auth.resetPasswordSent);
            } catch (err) { setError(err instanceof Error ? err.message : "Failed to send reset email."); }
          }}
          className="text-xs text-ember-700 hover:text-ember-700 transition-colors block text-right"
        >
          {t.auth.forgotPassword}
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
              {t.auth.signInBtn}
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setGuestSession();
          router.push(redirect || "/dashboard");
        }}
        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-sm font-medium text-surface-400 transition-all"
      >
        {t.auth.continueWithoutAccount}
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-center text-sm text-surface-300 mt-6">
        {t.auth.dontHaveAccount}{" "}
        <Link
          href="/register"
          className="text-ember-700 hover:text-ember-700 font-semibold transition-colors"
        >
          {t.auth.signUpFree}
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
