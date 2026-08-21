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
        { label: "NEW", text: "90 秒内为目标岗位智能针对性润色简历" },
        { label: "KEYS", text: "支持接入 OpenAI、Anthropic、Google 或 DeepSeek 密钥" },
        { label: "RADAR", text: "每周自动巡航：追踪 30+ 家知名企业官网直聘岗位" },
      ];
    }
    return [
      { label: "NEW", text: "Tailor a resume to any job description in 90 seconds" },
      { label: "KEYS", text: "Bring your own OpenAI, Anthropic, Google, or DeepSeek API key" },
      { label: "RADAR", text: "Continuous radar: track 30+ enterprise career boards automatically" },
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
    <div className="relative z-[60] bg-[#111111] border-b border-black/20 text-xs">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 h-9 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${isZh}-${index}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-white/90"
          >
            <span className="inline-flex items-center rounded-full bg-[#C2410C] text-white text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 shrink-0">
              {current.label}
            </span>
            <span className="font-sans truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none text-xs text-white/90">{current.text}</span>
            <a
              href="#features"
              className="inline-flex items-center gap-0.5 text-[#FBE3D2] hover:text-white hover:underline font-semibold shrink-0 text-xs transition-colors"
            >
              {t.landing.announcementHighlight}
              <ArrowUpRight weight="bold" className="w-3 h-3" />
            </a>
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center rounded text-white/50 hover:text-white transition-colors"
        >
          <X weight="bold" className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
