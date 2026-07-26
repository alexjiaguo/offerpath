"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "@phosphor-icons/react";

// ponytail: 4 rotating messages on a fixed interval. Add/remove strings as the product surface evolves.
const MESSAGES = [
  { label: "New", text: "AI Resume Tailoring 2.0: 90s turnaround per JD" },
  { label: "BYOK", text: "OpenAI, Anthropic, Google, or DeepSeek. Switch any time." },
  { label: "Free", text: "Smart Feed: 30 leads across 30 target companies, weekly" },
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(id);
  }, [dismissed]);

  if (dismissed) return null;

  const current = MESSAGES[index];

  return (
    <div className="relative z-[60] bg-ember-50 border-b border-ember-100">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-center text-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="flex items-center gap-2 text-ember-700"
          >
            <span className="inline-flex items-center rounded-full bg-ember-500 text-white text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5">
              {current.label}
            </span>
            <span className="hidden sm:inline font-medium">{current.text}</span>
            <span className="sm:hidden font-medium">New release</span>
            <a
              href="#features"
              className="inline-flex items-center gap-0.5 underline underline-offset-2 font-semibold hover:text-ember-600 transition-colors"
            >
              See how it works
              <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </AnimatePresence>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-full text-ember-700 hover:bg-ember-100 transition-colors"
        >
          <X weight="bold" className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
