"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle, Link as LinkIcon, Sparkle, TextT } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

type Mode = "idle" | "scanning" | "result";

export function PasteDemo() {
  const { isZh } = useTranslation();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();

  const steps = useMemo(() => {
    if (isZh) {
      return [
        { id: "read", label: "正在深度解析招聘需求 (JD)" },
        { id: "match", label: "正在与个人背景画像进行匹配" },
        { id: "rewrite", label: "正在针对性重写工作成果 Bullet" },
      ];
    }
    return [
      { id: "read", label: "Reading the job description" },
      { id: "match", label: "Matching against your profile" },
      { id: "rewrite", label: "Rewriting your bullets" },
    ];
  }, [isZh]);

  const sampleBullets = useMemo(() => {
    if (isZh) {
      return [
        "主导 0 到 1 的新用户旅程重构，在 24 万 MAU 规模下将次周留存激活率提升 18%。",
        "端到端统筹 400 万美元 ARR 产品线跨职能 GTM 落地，协同销售、设计与产研团队按期交付。",
        "搭建标准化 A/B 实验评估体系，将新功能实验上线周期从 3 天缩短至 4 小时。",
      ];
    }
    return [
      "Led the redesign of a 0-to-1 onboarding flow that lifted week-2 activation by 18% across 240k MAU.",
      "Owned the cross-functional GTM motion for a $4M ARR product line, partnering with Sales, Design, and Eng.",
      "Built an A/B testing framework that reduced experiment setup time from 3 days to 4 hours.",
    ];
  }, [isZh]);

  const sampleTags = isZh
    ? ["高级产品经理", "0到1商业化", "GTM增长", "用户激活", "跨团队协同"]
    : ["Senior PM", "0-to-1", "GTM", "Activation", "Cross-functional"];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setMode("scanning");
    setStep(0);

    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) {
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

  const matchScore = 87;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center gap-2 p-2 rounded-md bg-white border border-surface-200 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.18)] focus-within:border-ember-200 focus-within:shadow-[0_18px_40px_-18px_rgba(194,65,12,0.28)] transition-all"
      >
        <div className="pl-4 pr-2 text-surface-300">
          {input.startsWith("http") ? <LinkIcon weight="bold" className="w-4 h-4" /> : <TextT weight="bold" className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isZh ? "粘贴职位链接 (JD URL) 或招聘需求文本..." : "Paste a job URL or JD snippet..."}
          disabled={mode === "scanning"}
          className="flex-1 min-w-0 bg-transparent text-sm md:text-base text-surface-400 placeholder:text-surface-300/80 outline-none py-3"
        />
        <button
          type="submit"
          disabled={mode === "scanning" || !input.trim()}
          className="btn-ember flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span className="hidden sm:inline">
            {mode === "scanning"
              ? isZh ? "正在分析..." : "Tailoring..."
              : isZh ? "定制优化简历" : "Tailor my resume"}
          </span>
          <span className="sm:hidden">{isZh ? "分析" : "Go"}</span>
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
                className="w-8 h-8 rounded-md bg-ember-50 text-ember-500 flex items-center justify-center"
              >
                <Sparkle weight="fill" className="w-4 h-4" />
              </motion.div>
              <div className="text-sm font-semibold text-surface-400">
                {steps[step].label}...
              </div>
            </div>
            <div className="space-y-2">
              {steps.map((s, i) => (
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
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
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
                <div className="w-10 h-10 rounded-md bg-ember-50 text-ember-600 flex items-center justify-center font-display text-lg font-semibold">
                  {matchScore}%
                </div>
                <div>
                  <div className="text-sm font-semibold text-surface-400">
                    {isZh ? "岗位契合度评分" : "Match score"}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-surface-300 mt-0.5">
                    {isZh ? "演示数据 · 真实信息不外泄" : "Demo result, no resume sent"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-surface-300 hover:text-surface-400 transition-colors"
              >
                {isZh ? "尝试另一个职位" : "Try another"}
              </button>
            </div>

            <div className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300 mb-3">
                {isZh ? "针对该岗位的专属 Bullet 建议" : "Tailored bullets"}
              </div>
              <ul className="space-y-2.5 mb-5">
                {sampleBullets.map((b, i) => (
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
                {sampleTags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md bg-ember-50 text-ember-700 text-[10px] font-semibold uppercase tracking-widest border border-ember-100"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <Link
                href="/register"
                className="btn-ember w-full flex items-center justify-center gap-2 text-sm"
              >
                {isZh ? "保存至我的求职看板" : "Save to dashboard"}
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
