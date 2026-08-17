"use client";

import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

export function AnnouncementBar() {
  const { isZh, t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const messages = useMemo(() => {
    if (isZh) {
      return [
        { label: "最新", text: "90 秒内为目标岗位智能针对性润色简历" },
        { label: "模型", text: "支持接入自己的 OpenAI、Anthropic、Google 或 DeepSeek 密钥" },
        { label: "精选", text: "每周自动巡航：追踪 30 家心仪企业与高匹配岗位" },
      ];
    }
    return [
      { label: "New", text: "Tailor a resume to a job in about 90 seconds" },
      { label: "Keys", text: "Bring your own OpenAI, Anthropic, Google, or DeepSeek key" },
      { label: "Free", text: "Weekly job feed: 30 roles across 30 companies you follow" },
    ];
  }, [isZh]);

  useEffect(() => {
    if (dismissed) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4500);
    return () => clearInterval(id);
  }, [dismissed, messages.length]);

  if (dismissed) return null;

  const current = messages[index] || messages[0];

  return (
    <div className="relative z-[60] bg-ember-50 border-b border-ember-100">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-center text-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${isZh}-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-center gap-2 text-ember-700"
          >
            <span className="inline-flex items-center rounded-md bg-ember-500 text-white text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 shrink-0">
              {current.label}
            </span>
            <span className="font-medium truncate max-w-[180px] xs:max-w-[240px] sm:max-w-none text-xs sm:text-sm">{current.text}</span>
            <a
              href="#features"
              className="inline-flex items-center gap-0.5 underline underline-offset-2 font-semibold hover:text-ember-600 transition-colors shrink-0 text-xs sm:text-sm"
            >
              {t.landing.announcementHighlight}
              <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-md text-ember-700 hover:bg-ember-100 transition-colors"
        >
          <X weight="bold" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
