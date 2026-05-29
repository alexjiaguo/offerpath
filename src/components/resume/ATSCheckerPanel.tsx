"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowsClockwise, Target, CheckCircle, CaretDown, CaretUp, Warning, Sparkle, XCircle } from '@phosphor-icons/react';
import type { ResumeData } from "@/types";
import { cn } from "@/lib/utils";
import { evaluateATS } from "@/lib/aiService";

interface ATSResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: { severity: "high" | "medium" | "low"; message: string }[];
}

interface ATSCheckerPanelProps {
  resumeData: ResumeData;
}

export default function ATSCheckerPanel({ resumeData }: ATSCheckerPanelProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCheck = async () => {
    if (!jobDescription.trim()) {
      setError("Please provide a job description first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw = await evaluateATS({
        resumeData,
        jobDescription,
      });
      setResult(raw);
    } catch {
      setError("Analysis failed. Please check your connection or AI settings.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="liquid-glass rounded-3xl border border-zinc-200 dark:border-white/[0.05] overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <Target className="w-4.5 h-4.5 text-brand-400" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">ATS Intelligence</span>
        </div>
        {isExpanded ? <CaretUp className="w-4 h-4 text-zinc-500" /> : <CaretDown className="w-4 h-4 text-zinc-500" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 space-y-4">
              {!result && (
                <>
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                    Compare your asset against a target deployment JD to calculate match frequency.
                  </p>
                  <textarea
                    placeholder="Paste the target job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-xs text-zinc-900 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:border-brand-500/40 transition-all resize-none font-sans"
                  />
                  <button
                    onClick={handleCheck}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <ArrowsClockwise className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkle className="w-4 h-4" />
                    )}
                    {loading ? "Scanning Protocols..." : "Initialize Analysis"}
                  </button>
                </>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-400 font-bold uppercase tracking-widest">
                  {error}
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Score */}
                  <div className={cn("p-6 rounded-[24px] border flex items-center gap-6", scoreBg(result.score))}>
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="text-white/5"
                          strokeDasharray="100, 100"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={scoreColor(result.score)}
                          strokeDasharray={`${result.score}, 100`}
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold font-display">
                        {result.score}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest">
                        {result.score >= 80 ? "Strong Signal" : result.score >= 60 ? "Weak Sync" : "Low Alignment"}
                      </div>
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        {result.matchedKeywords.length} Matched · {result.missingKeywords.length} Missing
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        <CheckCircle className="w-3.5 h-3.5"  weight="fill" /> Matched
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-bold text-emerald-500/70 uppercase">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                        <XCircle className="w-3.5 h-3.5" /> Missing
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((kw, i) => (
                          <span key={i} className="px-2 py-1 rounded-md bg-red-500/5 border border-red-500/10 text-[9px] font-bold text-red-500/70 uppercase">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Warning className="w-3.5 h-3.5" /> System Suggestions
                    </div>
                    <div className="space-y-2">
                      {result.feedback.map((fb, i) => (
                        <div key={i} className={cn(
                          "p-3 rounded-xl border-l-2 text-[10px] font-medium leading-relaxed",
                          fb.severity === "high" ? "bg-red-500/5 border-red-500/40 text-red-300" :
                          fb.severity === "medium" ? "bg-amber-500/5 border-amber-500/40 text-amber-300" :
                          "bg-blue-500/5 border-blue-500/40 text-blue-300"
                        )}>
                          {fb.message}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { setResult(null); setJobDescription(""); }}
                    className="w-full py-3 rounded-xl border border-zinc-200 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
                  >
                    Reset Analysis
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
