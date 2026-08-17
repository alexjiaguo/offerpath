"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpWithEmail, setGuestSession } from "@/lib/auth";
import { CheckCircle, Envelope, Eye, EyeSlash, Lock, User, Rocket, ArrowRight } from '@phosphor-icons/react';
import { useTranslation } from "@/i18n";

export default function RegisterPage() {
  const router = useRouter();
  const { t, isZh } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const benefits = useMemo(() => {
    if (isZh) {
      return [
        "无限追踪在途求职岗位",
        "AI 智能定制润色简历",
        "模拟面试实战与智能打分",
        "无需绑定任何信用卡",
      ];
    }
    return [
      "Track unlimited job applications",
      "AI-powered resume tailoring",
      "Mock interviews with scoring",
      "No credit card required",
    ];
  }, [isZh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError(t.auth.allFieldsRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.auth.invalidEmail);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }
    if (password.length < 8) {
      setError(t.auth.passwordMinLength);
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError(isZh ? "密码必须包含至少一个大写字母和一个数字" : "Password must contain at least one uppercase letter and one number");
      return;
    }
    if (!agreed) {
      setError(isZh ? "请阅读并同意服务条款和隐私政策" : "Please accept the terms and conditions");
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
        <h1 className="text-2xl font-bold mb-2 font-display text-surface-400">{t.auth.createAccount}</h1>
        <p className="text-sm text-surface-300">
          {t.auth.signUpSubtitle}
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {benefits.map((b) => (
          <div key={b} className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-ember-600 flex-shrink-0" weight="fill" />
            <span className="text-[11px] text-surface-300">{b}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="register-name" className="block text-xs font-medium text-surface-300 mb-1.5">
            {t.auth.fullNameLabel}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.auth.fullNamePlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="register-email" className="block text-xs font-medium text-surface-300 mb-1.5">
            {t.auth.emailLabel}
          </label>
          <div className="relative">
            <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.auth.emailPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="register-password" className="block text-xs font-medium text-surface-300 mb-1.5">
            {t.auth.passwordLabel}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              id="register-password"
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="register-confirm" className="block text-xs font-medium text-surface-300 mb-1.5">
            {t.auth.confirmPasswordLabel}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              id="register-confirm"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t.auth.passwordPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
            />
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-surface-300 bg-surface-200 text-ember-600 focus:ring-ember-500/20"
          />
          <span className="text-xs text-surface-300 leading-relaxed">
            {t.auth.termsAgreement}{" "}
            <Link href="/terms" className="text-ember-700 hover:text-ember-800 underline">
              {t.auth.termsLink}
            </Link>{" "}
            &{" "}
            <Link href="/privacy" className="text-ember-700 hover:text-ember-800 underline">
              {t.auth.privacyLink}
            </Link>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-ember-600 text-white text-sm font-semibold hover:bg-ember-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              {t.auth.signUpBtn}
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-surface-200" />
        <span className="text-xs text-surface-300 uppercase tracking-wider font-mono">
          {t.common.or}
        </span>
        <div className="flex-1 h-px bg-surface-200" />
      </div>

      <button
        type="button"
        onClick={() => {
          setGuestSession();
          router.push("/dashboard");
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 text-sm font-medium text-surface-400 transition-all"
      >
        {t.auth.continueWithoutAccount}
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Login Link */}
      <p className="text-center text-sm text-surface-300 mt-6">
        {t.auth.alreadyHaveAccount}{" "}
        <Link
          href="/login"
          className="text-ember-700 hover:text-ember-800 font-semibold transition-colors"
        >
          {t.auth.logInLink}
        </Link>
      </p>
    </>
  );
}
