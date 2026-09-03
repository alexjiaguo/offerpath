"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash, LockKey } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "no-session">("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isZh, setIsZh] = useState(false);

  useEffect(() => {
    setIsZh(document.cookie.includes("offerpath_lang=zh") || navigator.language.startsWith("zh"));
    let active = true;

    async function checkSession() {
      const { createClient, isSupabaseConfigured } = await import("@/lib/supabase");
      if (!isSupabaseConfigured()) {
        if (active) setStatus("no-session");
        return;
      }
      const sb = createClient();
      if (!sb) {
        if (active) setStatus("no-session");
        return;
      }
      // New-style Supabase links deliver ?code=... (PKCE) and require an
      // explicit code exchange; legacy links carry a #access_token hash
      // that the client picks up automatically (detectSessionInUrl).
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (error) {
          if (active) setStatus("no-session");
          return;
        }
        // Drop the single-use code from the URL so refresh/retry can't replay it.
        window.history.replaceState(null, "", window.location.pathname);
      }
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (active) setStatus(user ? "ready" : "no-session");
    }

    checkSession();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(isZh ? "密码至少需要 8 个字符。" : "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError(isZh ? "两次输入的密码不一致。" : "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase");
      const sb = createClient();
      if (!sb) throw new Error("Supabase is not configured.");
      const { error: updateError } = await sb.auth.updateUser({ password });
      if (updateError) throw updateError;
      toast.success(isZh ? "密码已更新，正在进入工作台…" : "Password updated. Taking you to your workspace…");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : isZh ? "更新失败，请重试。" : "Update failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const t = {
    title: isZh ? "设置新密码" : "Set a new password",
    subtitle: isZh ? "为你的 OfferPath 账号选择一个新密码。" : "Choose a new password for your OfferPath account.",
    password: isZh ? "新密码" : "New password",
    confirm: isZh ? "确认新密码" : "Confirm new password",
    submit: isZh ? "更新密码" : "Update password",
    updating: isZh ? "更新中…" : "Updating…",
    invalid: isZh ? "链接无效或已过期" : "Link invalid or expired",
    invalidDesc: isZh
      ? "该重置链接无效或已过期。请重新发起密码重置。"
      : "This reset link is invalid or has expired. Please request a new password reset.",
    requestNew: isZh ? "重新发送重置邮件" : "Request a new reset email",
    backToLogin: isZh ? "返回登录" : "Back to login",
    notConfigured: isZh ? "认证服务未配置。" : "Authentication is not configured.",
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-50 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[32px] border border-surface-200 bg-white p-8 shadow-sm">
          {status === "checking" && (
            <div className="flex flex-col items-center gap-3 py-10 text-surface-300">
              <LockKey className="w-6 h-6 animate-pulse" />
              <p className="text-xs uppercase tracking-widest">{isZh ? "正在验证链接…" : "Verifying link…"}</p>
            </div>
          )}

          {status === "no-session" && (
            <div className="space-y-4 text-center py-4">
              <h1 className="text-xl font-bold font-display text-surface-400">{t.invalid}</h1>
              <p className="text-sm text-surface-300 leading-relaxed">{t.invalidDesc}</p>
              <Link href="/login" className="btn-editorial-primary inline-flex justify-center px-6 py-3 text-sm w-full">
                {t.requestNew}
              </Link>
              <Link href="/login" className="block text-xs text-surface-300 hover:text-surface-400 transition-colors">
                {t.backToLogin}
              </Link>
            </div>
          )}

          {status === "ready" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <LockKey className="w-5 h-5 text-brand-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-display text-surface-400">{t.title}</h1>
                  <p className="text-xs text-surface-300 mt-0.5">{t.subtitle}</p>
                </div>
              </div>

              <div className="relative">
                <label htmlFor="reset-password" className="block text-xs font-medium text-surface-300 mb-1.5">
                  {t.password}
                </label>
                <input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-[2.35rem] text-surface-300 hover:text-surface-400 transition-colors"
                >
                  {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label htmlFor="reset-confirm" className="block text-xs font-medium text-surface-300 mb-1.5">
                  {t.confirm}
                </label>
                <input
                  id="reset-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
                />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full px-6 py-3.5 rounded-2xl text-sm font-bold transition-all ${submitting ? "bg-surface-300 cursor-not-allowed text-white" : "bg-brand-500 text-white hover:bg-brand-400"}`}
              >
                {submitting ? t.updating : t.submit}
              </button>

              <Link href="/login" className="block text-center text-xs text-surface-300 hover:text-surface-400 transition-colors">
                {t.backToLogin}
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
