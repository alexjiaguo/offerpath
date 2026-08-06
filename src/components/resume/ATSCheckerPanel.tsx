"use client";

import React, { useState, useEffect } from "react";
import { ArrowsClockwise, Target, CheckCircle, CaretRight, Warning, Sparkle, XCircle, X } from '@phosphor-icons/react';
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
  const [showModal, setShowModal] = useState(false);

  // ESC to close + lock body scroll while the modal is open.
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showModal]);

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
    <>
      {/* Slim card - always visible, opens the modal */}
      <button
        onClick={() => setShowModal(true)}
        className="group w-full flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 dark:border-white/[0.05] bg-surface-0 dark:bg-white/[0.03] p-2.5 text-left transition-all hover:border-brand-500/30 hover:bg-zinc-100/60 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-brand-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wide whitespace-nowrap text-zinc-900 dark:text-white">ATS Intelligence</span>
            <span className="block text-[10px] text-zinc-500 mt-0.5 truncate">
              {result ? `${result.score} · ${result.matchedKeywords.length} matched` : "Match resume against a target JD."}
            </span>
          </div>
        </div>
        <CaretRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-400 transition-colors flex-shrink-0" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/[0.08] bg-surface-50 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/[0.05] sticky top-0 bg-surface-50 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-brand-400" />
                </div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-widest">ATS Intelligence</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
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
                        <CheckCircle className="w-3.5 h-3.5" weight="fill" /> Matched
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
          </div>
        </div>
      )}
    </>
  );
}
