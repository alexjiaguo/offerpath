"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, X } from "@phosphor-icons/react";
import { isGuestMode, setGuestSession } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { useTranslation } from "@/i18n";

const DISMISS_KEY = "offerpath_guest_banner_dismissed";

export default function GuestBanner() {
  const { isZh } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (typeof window === "undefined") return;
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
      if (isGuestMode()) {
        if (!cancelled) setVisible(true);
        return;
      }
      const hasMockAuth = document.cookie.split("; ").some((c) => c.startsWith("auth_token="));
      if (hasMockAuth) return;
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session || cancelled) return;
        }
      }
      setGuestSession();
      if (!cancelled) setVisible(true);
    }
    check();
    return () => { cancelled = true; };
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, "1");
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          className="flex items-center gap-2.5 px-4 py-1.5 rounded-md bg-brand-50 border border-brand-200/40 text-[11px] text-brand-700 shadow-sm"
        >
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span className="flex-1">
            {isZh ? (
              <>
                <strong className="font-semibold text-brand-700">提示：</strong>
                您当前正以访客模式体验 OfferPath。关闭浏览器后数据可能会丢失。
                建议{" "}
                <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2">
                  登录或注册账户
                </Link>{" "}
                以永久云端保存您的求职资产。
              </>
            ) : (
              <>
                <strong className="font-semibold text-brand-700">Note:</strong>{" "}
                You entered OfferPath without signing in. Your work may be{" "}
                <strong className="font-semibold text-brand-700">lost</strong>{" "}
                when you leave.{" "}
                <Link
                  href="/login"
                  className="font-semibold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
                >
                  Sign in
                </Link>{" "}
                to keep it.
              </>
            )}
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-md text-brand-500 hover:bg-brand-100 transition-colors"
            aria-label="Dismiss guest banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
