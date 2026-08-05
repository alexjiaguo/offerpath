"use client";

import { usePipelineStore } from "@/store/pipelineStore";
import { ArrowRight, WarningCircle, Sparkle } from '@phosphor-icons/react';
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   NeedsTailoringWidget — Dashboard card showing
   evaluated jobs that don't have a linked resume
   ═══════════════════════════════════════════════════ */

export default function NeedsTailoringWidget() {
  const { getJobsNeedingResume } = usePipelineStore();
  const jobs = getJobsNeedingResume();

  if (jobs.length === 0) return null;

  return (
    <div className="card-editorial space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-surface-200">
        <div className="w-8 h-8 rounded-md bg-pastel-yellow-bg border border-pastel-yellow-fg/20 flex items-center justify-center flex-shrink-0">
          <WarningCircle className="w-4 h-4 text-pastel-yellow-fg" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-surface-400 font-sans">Resumes Needed</h3>
          <p className="text-[12px] text-surface-300">
            {jobs.length} evaluated {jobs.length === 1 ? "job" : "jobs"} without a tailored resume
          </p>
        </div>
        <span className="eyebrow-tag bg-pastel-yellow-bg text-pastel-yellow-fg border border-pastel-yellow-fg/20">
          {jobs.length} PENDING
        </span>
      </div>

      {/* Job List */}
      <div className="space-y-1.5">
        {jobs.slice(0, 4).map((job) => (
          <Link
            key={job.id}
            href={`/dashboard/resume?tailorFor=${job.id}`}
            className="flex items-center gap-3 p-2.5 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-100 transition-all group"
          >
            {/* Company initial */}
            <div className="w-7 h-7 rounded-md bg-surface-400 flex items-center justify-center text-xs font-mono font-bold text-surface-0 flex-shrink-0">
              {(job.company?.name || "?").charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-400 truncate group-hover:text-black">
                {job.title}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-surface-300">{job.company?.name}</span>
                {job.score !== undefined && (
                  <span className="text-[10px] font-mono text-surface-300">
                    Score: {job.score.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1 text-xs font-semibold text-surface-400 opacity-0 group-hover:opacity-100 transition-all">
              <Sparkle className="w-3 h-3 text-surface-400" />
              <span className="whitespace-nowrap uppercase tracking-wider text-[10px] font-mono">Tailor</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Show more link */}
      {jobs.length > 4 && (
        <Link
          href="/dashboard/pipeline?filter=needs-resume"
          className="flex items-center justify-center gap-1 pt-2 text-xs font-mono font-medium text-surface-300 hover:text-surface-400 transition-colors"
        >
          View all {jobs.length} jobs
          <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
