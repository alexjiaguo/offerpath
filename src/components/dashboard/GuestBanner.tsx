"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, X } from "@phosphor-icons/react";
import { isGuestMode } from "@/lib/auth";

const DISMISS_KEY = "offerpath_guest_banner_dismissed";

/**
 * GuestBanner — soft, dismissible banner shown at the top of the dashboard
 * when the visitor is exploring OfferPath without an account. Hidden for
 * signed-in users and for guests who already dismissed it on this device.
 */
export default function GuestBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    if (dismissed) return;
    setVisible(isGuestMode());
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
          className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/40 text-[11px] text-brand-700 shadow-sm"
        >
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span className="flex-1">
            <strong className="font-semibold text-brand-700">Heads up:</strong>{" "}
            You entered OfferPath without signing in. Your work will be{" "}
            <strong className="font-semibold text-brand-700">lost</strong>{" "}
            when you leave.{" "}
            <Link
              href="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline"
            >
              Sign in
            </Link>{" "}
            to keep it.
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full text-brand-500 hover:bg-brand-100 transition-colors"
            aria-label="Dismiss guest banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
