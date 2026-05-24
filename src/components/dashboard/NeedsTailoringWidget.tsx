"use client";

import { usePipelineStore } from "@/store/pipelineStore";
import { BsArrowRight, BsExclamationCircle, BsStars } from 'react-icons/bs';
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
    <div className="liquid-glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <BsExclamationCircle className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">Resumes Needed</h3>
          <p className="text-xs text-zinc-500 dark:text-gray-500">
            {jobs.length} evaluated {jobs.length === 1 ? "job" : "jobs"} without a tailored resume
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {jobs.length}
        </span>
      </div>

      {/* Job List */}
      <div className="space-y-2">
        {jobs.slice(0, 4).map((job) => (
          <Link
            key={job.id}
            href={`/dashboard/resume?tailorFor=${job.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-all group"
          >
            {/* Company initial */}
            <div
              className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                "from-brand-500 to-purple-400"
              )}
            >
              {(job.company?.name || "?").charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-700 dark:text-gray-300 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-900 dark:hover:text-gray-100 transition-colors">
                {job.title}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-700 dark:text-zinc-400 dark:text-gray-600">{job.company?.name}</span>
                {job.score !== undefined && (
                  <span className="text-[10px] text-zinc-500 dark:text-gray-500">
                    Score: {job.score.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center gap-1 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-all">
              <BsStars className="w-3 h-3" />
              <span className="whitespace-nowrap">Tailor</span>
              <BsArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Show more link */}
      {jobs.length > 4 && (
        <Link
          href="/dashboard/pipeline?filter=needs-resume"
          className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06] text-xs text-zinc-500 dark:text-gray-500 hover:text-brand-400 transition-colors"
        >
          View all {jobs.length} jobs
          <BsArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
