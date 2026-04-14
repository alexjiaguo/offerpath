"use client";

import { cn } from "@/lib/utils";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { ATSScoreInline } from "./ATSScoreBadge";
import {
  X,
  FileText,
  Check,
  Plus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/* ═══════════════════════════════════════════════════
   ResumePicker — Modal for selecting/creating resume
   Triggered when a job is moved to "applied" status
   ═══════════════════════════════════════════════════ */

export default function ResumePicker() {
  const {
    resumePickerOpen,
    resumePickerJobId,
    setResumePickerOpen,
    linkResumeToJob,
    moveJob,
    getJobById,
  } = usePipelineStore();

  const { resumes, getATSScore } = useResumeStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!resumePickerOpen || !resumePickerJobId) return null;

  const job = getJobById(resumePickerJobId);
  if (!job) return null;

  const handleSelect = (resumeId: string) => {
    setSelectedId(resumeId);
  };

  const handleConfirm = () => {
    if (selectedId) {
      linkResumeToJob(resumePickerJobId, selectedId);
    }
    // Complete the move to applied
    moveJob(resumePickerJobId, "applied");
    handleClose();
  };

  const handleSkip = () => {
    // Move without linking a resume
    moveJob(resumePickerJobId, "applied");
    handleClose();
  };

  const handleClose = () => {
    setSelectedId(null);
    setResumePickerOpen(false);
  };

  // Sort: tailored first, then base, then by ATS score
  const sortedResumes = [...resumes].sort((a, b) => {
    // Tailored resumes first
    if (!a.is_base && b.is_base) return -1;
    if (a.is_base && !b.is_base) return 1;
    // Then by ATS score (desc)
    const scoreA = getATSScore(a.id, resumePickerJobId);
    const scoreB = getATSScore(b.id, resumePickerJobId);
    return scoreB - scoreA;
  });

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
          className="w-full max-w-lg bg-surface-50 border border-white/[0.08] rounded-2xl shadow-2xl animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-semibold">Link Resume to Application</h2>
              <p className="text-xs text-zinc-500 dark:text-gray-500 mt-0.5">
                Applying for{" "}
                <span className="text-zinc-700 dark:text-gray-300">{job.title}</span>
                {job.company?.name && (
                  <>
                    {" "}at{" "}
                    <span className="text-zinc-700 dark:text-gray-300">{job.company.name}</span>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.06] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Resume List */}
          <div className="px-6 py-4 space-y-2.5 max-h-[400px] overflow-y-auto">
            {sortedResumes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-zinc-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500 dark:text-gray-500">No resumes yet</p>
                <p className="text-xs text-zinc-400 dark:text-gray-600 mt-1">
                  Create your first resume to link to applications
                </p>
              </div>
            ) : (
              sortedResumes.map((resume) => {
                const atsScore = getATSScore(resume.id, resumePickerJobId);
                const isSelected = selectedId === resume.id;

                return (
                  <button
                    key={resume.id}
                    onClick={() => handleSelect(resume.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                      isSelected
                        ? "bg-brand-500/10 border-brand-500/30 ring-1 ring-brand-500/20"
                        : "bg-surface-100/50 border-white/[0.06] hover:border-white/[0.12] hover:bg-surface-100"
                    )}
                  >
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        isSelected
                          ? "border-brand-400 bg-brand-500"
                          : "border-gray-600"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Resume icon */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                        resume.is_base
                          ? "bg-blue-500/10"
                          : "bg-brand-500/10"
                      )}
                    >
                      <FileText
                        className={cn(
                          "w-4 h-4",
                          resume.is_base ? "text-blue-400" : "text-brand-400"
                        )}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-gray-200 truncate">
                        {resume.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium",
                            resume.is_base
                              ? "text-blue-300 bg-blue-500/10"
                              : "text-brand-300 bg-brand-500/10"
                          )}
                        >
                          {resume.is_base ? "Base" : "Tailored"}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-gray-600">
                          Updated{" "}
                          {new Date(resume.updated_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* ATS Score */}
                    <ATSScoreInline score={atsScore} />
                  </button>
                );
              })
            )}

            {/* Create Tailored CTA */}
            <Link
              href={`/dashboard/resume?tailorFor=${resumePickerJobId}`}
              onClick={handleClose}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-white/[0.1] hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                <Plus className="w-4 h-4 text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-700 dark:text-gray-300 group-hover:text-zinc-900 dark:group-hover:text-gray-100 transition-colors">
                  Create Tailored Resume
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-gray-600">
                  Start from a base resume, optimized for this role
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-gray-600 group-hover:text-brand-400 transition-colors" />
            </Link>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.06] bg-surface-100/30">
            <button
              onClick={handleSkip}
              className="text-sm text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip for now
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200 hover:bg-white/[0.04] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedId}
                className="px-5 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedId ? "Link & Apply" : "Select a Resume"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
