"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowsClockwise, FileText, Link, Sparkle, X } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { usePipelineStore } from "@/store/pipelineStore";
import type { JobEvaluation } from "@/types";

/* ═══════════════════════════════════════════════════
   AddJobDialog — Modal for adding a new job
   URL paste or JD text with mock AI evaluation
   ═══════════════════════════════════════════════════ */

type InputMode = "url" | "text";

// Mock evaluation generator
function generateMockEvaluation(): JobEvaluation {
  const scores = [2.5, 3.0, 3.2, 3.5, 3.8, 4.0, 4.2, 4.5, 4.8];
  const archetypes = [
    "Ad Tech",
    "AI Platform",
    "Fintech Platform",
    "E-Commerce",
    "Marketplace",
    "DevOps Platform",
    "SaaS B2B",
    "Consumer Tech",
  ];
  const score = scores[Math.floor(Math.random() * scores.length)];
  const tier = score >= 4.0 ? 1 : score >= 3.0 ? 2 : 3;
  const archetype = archetypes[Math.floor(Math.random() * archetypes.length)];

  return {
    score,
    tier,
    archetype,
    fit_reasons: [
      "Relevant product management experience",
      "Skills align with core requirements",
      "Industry background is transferable",
    ],
    concerns: [
      "May require domain-specific ramp-up",
      "Compensation expectations should be validated",
    ],
    key_requirements: [
      "5+ years product management",
      "Cross-functional leadership",
      "Data-driven decision making",
    ],
    match_summary: `This role is a ${
      tier === 1 ? "strong" : tier === 2 ? "moderate" : "weak"
    } match based on your experience profile. Score: ${score.toFixed(1)}/5.0`,
  };
}

export default function AddJobDialog() {
  const { addJobDialogOpen, setAddJobDialogOpen, addJob, companies } =
    usePipelineStore();
  const [mode, setMode] = useState<InputMode>("url");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluated, setEvaluated] = useState(false);
  const [evaluation, setEvaluation] = useState<JobEvaluation | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState("");

  if (!addJobDialogOpen) return null;

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setUrl("");
    setDescription("");
    setSalaryRange("");
    setEvaluated(false);
    setEvaluation(null);
    setIsEvaluating(false);
    setMode("url");
  };

  const handleClose = () => {
    resetForm();
    setAddJobDialogOpen(false);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    // Simulate AI evaluation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const mockEval = generateMockEvaluation();
    setEvaluation(mockEval);
    setEvaluated(true);
    setIsEvaluating(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (url.trim() && !/^https?:\/\/.+/.test(url.trim())) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    // Find or create company reference
    const existingCompany = companies.find(
      (c) => c.name.toLowerCase() === company.toLowerCase()
    );

    addJob({
      title: title.trim(),
      company_id: existingCompany?.id,
      company: existingCompany || (company
        ? {
            id: `temp-${Date.now()}`,
            user_id: "demo",
            name: company,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      url: url.trim() || undefined,
      salary_range: salaryRange.trim() || undefined,
      status: evaluated ? "evaluated" : "new",
      score: evaluation?.score,
      tier: evaluation?.tier,
      archetype: evaluation?.archetype,
      evaluation: evaluation || undefined,
    });

    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-xl bg-surface-50 border border-white/[0.08] rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-white/[0.06]">
            <h2 className="text-lg font-semibold">Add Job</h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Input Mode Toggle */}
          <div className="px-6 pt-4">
            <div className="flex gap-1 p-1 bg-surface-200/60 rounded-lg w-fit">
              <button
                onClick={() => setMode("url")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  mode === "url"
                    ? "bg-surface-100 text-white shadow-sm"
                    : "text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300"
                )}
              >
                <Link className="w-3.5 h-3.5" />
                Paste URL
              </button>
              <button
                onClick={() => setMode("text")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  mode === "text"
                    ? "bg-surface-100 text-white shadow-sm"
                    : "text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Paste JD
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {mode === "url" && (
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-gray-500 mb-1.5 block">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://careers.google.com/jobs/..."
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-gray-500 mb-1.5 block">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Product Manager"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-gray-500 mb-1.5 block">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Google"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-gray-500 mb-1.5 block">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Singapore"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-gray-500 mb-1.5 block">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="$200K–$300K"
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            {mode === "text" && (
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-gray-500 mb-1.5 block">
                  Job Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                  rows={6}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none"
                />
              </div>
            )}

            {/* Evaluation result preview */}
            {evaluated && evaluation && (
              <div className="rounded-xl border border-white/[0.08] bg-surface-100/50 p-4 animate-scale-in">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkle className="w-4 h-4 text-brand-400" />
                  <span className="text-sm font-medium">AI Evaluation</span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div>
                    <span className="text-2xl font-bold">{evaluation.score.toFixed(1)}</span>
                    <span className="text-xs text-zinc-500 dark:text-gray-500 ml-1">/ 5.0</span>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-xs font-semibold",
                      evaluation.tier === 1
                        ? "text-amber-400 bg-amber-400/10"
                        : evaluation.tier === 2
                        ? "text-zinc-600 dark:text-gray-400 bg-gray-400/10"
                        : "text-amber-700 bg-amber-700/10"
                    )}
                  >
                    Tier {evaluation.tier}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-xs text-zinc-600 dark:text-gray-400 bg-surface-200">
                    {evaluation.archetype}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-gray-500">{evaluation.match_summary}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-white/[0.06] bg-surface-100/30">
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || (!title.trim() && !description.trim())}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isEvaluating
                  ? "bg-brand-500/20 text-brand-300 cursor-wait"
                  : "bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              {isEvaluating ? (
                <ArrowsClockwise className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkle className="w-4 h-4" />
              )}
              {isEvaluating ? "Evaluating…" : evaluated ? "Re-evaluate" : "Evaluate with AI"}
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200 hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="px-5 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
