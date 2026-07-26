"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle, Link as LinkIcon, Sparkle, TextT } from "@phosphor-icons/react";

// ponytail: 3 fake progress steps + a single seeded result set. Add a real API call when product team wires the demo endpoint.
const STEPS = [
  { id: "read", label: "Reading the job description" },
  { id: "match", label: "Matching against your profile" },
  { id: "rewrite", label: "Rewriting your bullets" },
];

const SAMPLE_BULLETS = [
  "Led the redesign of a 0-to-1 onboarding flow that lifted week-2 activation by 18% across 240k MAU.",
  "Owned the cross-functional GTM motion for a $4M ARR product line, partnering with Sales, Design, and Eng.",
  "Built an A/B testing framework that reduced experiment setup time from 3 days to 4 hours.",
];

const SAMPLE_TAGS = ["Senior PM", "0-to-1", "GTM", "Activation", "Cross-functional"];

type Mode = "idle" | "scanning" | "result";

export function PasteDemo() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMode("scanning");
    setStep(0);

    // ponytail: fake progress, deterministic 0.75s per step. Replace with real API polling.
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length - 1) {
          clearInterval(interval);
          setMode("result");
          return s;
        }
        return s + 1;
      });
    }, 750);
  }

  function handleReset() {
    setInput("");
    setStep(0);
    setMode("idle");
  }

  const matchScore = 87; // ponytail: locked sample value, the demo is non-deterministic enough as-is

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 p-2 rounded-full bg-white border border-surface-200 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.18)] focus-within:border-ember-300 focus-within:shadow-[0_18px_40px_-18px_rgba(194,65,12,0.28)] transition-all"
      >
        <div className="pl-4 pr-2 text-surface-300">
          {input.startsWith("http") ? <LinkIcon weight="bold" className="w-4 h-4" /> : <TextT weight="bold" className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a job URL or JD snippet..."
          disabled={mode === "scanning"}
          className="flex-1 min-w-0 bg-transparent text-sm md:text-base text-surface-400 placeholder:text-surface-300/80 outline-none py-3"
        />
        <button
          type="submit"
          disabled={mode === "scanning" || !input.trim()}
          className="btn-ember flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span className="hidden sm:inline">
            {mode === "scanning" ? "Tailoring..." : "Tailor my resume"}
          </span>
          <span className="sm:hidden">Go</span>
          {mode !== "scanning" && <ArrowRight weight="bold" className="w-4 h-4" />}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {mode === "scanning" && (
          <motion.div
            key="scanning"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="mt-6 p-6 rounded-2xl bg-white border border-surface-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={reduce ? {} : { rotate: 360 }}
                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-ember-50 text-ember-500 flex items-center justify-center"
              >
                <Sparkle weight="fill" className="w-4 h-4" />
              </motion.div>
              <div className="text-sm font-semibold text-surface-400">
                {STEPS[step].label}...
              </div>
            </div>
            <div className="space-y-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i <= step ? "bg-ember-500" : "bg-surface-200"
                    }`}
                  />
                  <span
                    className={`text-xs transition-colors ${
                      i <= step ? "text-surface-400" : "text-surface-300"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1 rounded-full bg-surface-100 overflow-hidden">
              <motion.div
                className="h-full bg-ember-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              />
            </div>
          </motion.div>
        )}

        {mode === "result" && (
          <motion.div
            key="result"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="mt-6 rounded-2xl bg-white border border-surface-200 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-surface-200/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ember-50 text-ember-600 flex items-center justify-center font-display text-lg font-semibold">
                  {matchScore}
                </div>
                <div>
                  <div className="text-sm font-semibold text-surface-400">
                    Match score
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-surface-300 mt-0.5">
                    Demo result, no resume sent
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-surface-300 hover:text-surface-400 transition-colors"
              >
                Try another
              </button>
            </div>

            <div className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300 mb-3">
                Tailored bullets
              </div>
              <ul className="space-y-2.5 mb-5">
                {SAMPLE_BULLETS.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={reduce ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                    className="flex items-start gap-2.5 text-sm text-surface-400 leading-relaxed"
                  >
                    <CheckCircle weight="fill" className="w-4 h-4 text-ember-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {SAMPLE_TAGS.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-full bg-ember-50 text-ember-700 text-[10px] font-semibold uppercase tracking-widest border border-ember-100"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href="/register"
                className="btn-ember w-full flex items-center justify-center gap-2 text-sm"
              >
                Save to dashboard
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
