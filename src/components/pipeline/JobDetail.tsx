"use client";

import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import ATSScoreBadge from "./ATSScoreBadge";
import {
  ArrowLeft,
  Star,
  MapPin,
  ExternalLink,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Shield,
  Target,
  Briefcase,
  Trash2,
  ChevronRight,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JobStatus } from "@/types";
import { formatDate, statusColor } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   JobDetail — Full job view with evaluation panel
   ═══════════════════════════════════════════════════ */

const STATUS_OPTIONS: { id: JobStatus; label: string; color: string }[] = [
  { id: "new", label: "New", color: "bg-brand-500" },
  { id: "evaluated", label: "Evaluated", color: "bg-blue-500" },
  { id: "applied", label: "Applied", color: "bg-emerald-500" },
  { id: "interviewing", label: "Interviewing", color: "bg-amber-500" },
  { id: "offered", label: "Offered", color: "bg-purple-500" },
  { id: "rejected", label: "Rejected", color: "bg-red-500" },
  { id: "discarded", label: "Discarded", color: "bg-gray-500" },
  { id: "archived", label: "Archived", color: "bg-gray-600" },
];

// Score ring SVG component
function ScoreRing({ score }: { score: number }) {
  const percentage = (score / 5) * 100;
  const radius = 40;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    score >= 4.5
      ? "#10b981"
      : score >= 3.5
      ? "#3b82f6"
      : score >= 2.5
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-zinc-500 dark:text-gray-500">/ 5.0</span>
      </div>
    </div>
  );
}

interface JobDetailProps {
  jobId: string;
}

export default function JobDetail({ jobId }: JobDetailProps) {
  const router = useRouter();
  const { getJobById, moveJob, deleteJob } = usePipelineStore();
  const { getResumeById, getATSScore } = useResumeStore();
  const job = getJobById(jobId);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <AlertTriangle className="w-12 h-12 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-600 dark:text-gray-400 mb-2">Job Not Found</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-6">
          This job may have been deleted or doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard/pipeline"
          className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: JobStatus) => {
    moveJob(job.id, newStatus);
  };

  const handleDelete = () => {
    deleteJob(job.id);
    router.push("/dashboard/pipeline");
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Back navigation */}
      <Link
        href="/dashboard/pipeline"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pipeline
      </Link>

      {/* Header */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Company initial */}
            <div
              className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl font-bold text-white flex-shrink-0",
                "from-brand-500 to-purple-400"
              )}
            >
              {(job.company?.name || "?").charAt(0)}
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-gray-500 mb-0.5">{job.company?.name}</p>
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold border",
                    statusColor(job.status)
                  )}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                )}
                {job.salary_range && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-gray-500">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary_range}
                  </span>
                )}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Posting
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete job"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Status changer */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-surface-200/40 rounded-xl overflow-x-auto">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleStatusChange(opt.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                job.status === opt.id
                  ? "bg-surface-100 text-white shadow-sm"
                  : "text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.04]"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", opt.color)} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Job description */}
        <div className="lg:col-span-3 space-y-6">
          {/* Description */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" />
              Job Description
            </h2>
            {job.description ? (
              <div className="text-sm text-zinc-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            ) : (
              <p className="text-sm text-zinc-700 dark:text-zinc-400 dark:text-gray-600 italic">
                No description available. Add a description by editing this job.
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              Timeline
            </h2>
            <div className="space-y-3">
              {[
                { label: "Added", date: job.created_at, always: true },
                { label: "Applied", date: job.applied_at },
                { label: "Interview", date: job.interviewed_at },
                { label: "Offered", date: job.offered_at },
              ]
                .filter((e) => e.always || e.date)
                .map((event) => (
                  <div
                    key={event.label}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="text-zinc-600 dark:text-gray-400 w-20">{event.label}</span>
                    <span className="text-zinc-700 dark:text-gray-300">
                      {event.date ? formatDate(event.date) : "—"}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Comp details (if offer) */}
          {job.comp_details && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Compensation Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {job.comp_details.base_salary && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Base Salary</p>
                    <p className="text-lg font-semibold">{job.comp_details.base_salary}</p>
                  </div>
                )}
                {job.comp_details.equity && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Equity</p>
                    <p className="text-lg font-semibold">{job.comp_details.equity}</p>
                  </div>
                )}
                {job.comp_details.bonus && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Bonus</p>
                    <p className="text-lg font-semibold">{job.comp_details.bonus}</p>
                  </div>
                )}
                {job.comp_details.total_comp && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Total Comp</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {job.comp_details.total_comp}
                    </p>
                  </div>
                )}
              </div>
              {job.comp_details.benefits && job.comp_details.benefits.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/[0.06]">
                  <p className="text-xs text-zinc-500 dark:text-gray-500 mb-2">Benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {job.comp_details.benefits.map((b) => (
                      <span
                        key={b}
                        className="px-2 py-1 rounded-md text-xs bg-surface-200 text-zinc-600 dark:text-gray-400"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Evaluation panel */}
        <div className="lg:col-span-2 space-y-6">
          {job.evaluation ? (
            <>
              {/* Score card */}
              <div className="glass rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  AI Evaluation
                </h2>
                <div className="flex items-center gap-5 mb-4">
                  <ScoreRing score={job.evaluation.score} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-semibold",
                          job.evaluation.tier === 1
                            ? "text-amber-400 bg-amber-400/10"
                            : job.evaluation.tier === 2
                            ? "text-zinc-600 dark:text-gray-400 bg-gray-400/10"
                            : "text-amber-700 bg-amber-700/10"
                        )}
                      >
                        Tier {job.evaluation.tier}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs text-zinc-600 dark:text-gray-400 bg-surface-200">
                      {job.evaluation.archetype}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-gray-400 leading-relaxed">
                  {job.evaluation.match_summary}
                </p>
              </div>

              {/* Fit reasons */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Why It Fits
                </h3>
                <ul className="space-y-2">
                  {job.evaluation.fit_reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-gray-400">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-amber-400" />
                  Concerns
                </h3>
                <ul className="space-y-2">
                  {job.evaluation.concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-gray-400">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key requirements */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Key Requirements
                </h3>
                <ul className="space-y-2">
                  {job.evaluation.key_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-gray-400">
                      <Target className="w-3 h-3 text-blue-500 flex-shrink-0 mt-1" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl p-6 text-center">
              <Star className="w-10 h-10 text-zinc-700 dark:text-zinc-300 dark:text-gray-700 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-gray-400 mb-1">
                Not Evaluated Yet
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-4">
                Run AI evaluation to get a fitness score, tier assignment, and detailed
                analysis.
              </p>
              <button className="px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Evaluate with AI
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {/* Resume action — context-aware */}
              {job.resume_id ? (
                <div className="rounded-lg border border-zinc-200 dark:border-white/[0.06] overflow-hidden">
                  {/* Linked resume card */}
                  {(() => {
                    const linkedResume = getResumeById(job.resume_id!);
                    const atsScore = getATSScore(job.resume_id!, job.id);
                    return linkedResume ? (
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-3.5 h-3.5 text-brand-400" />
                          <span className="text-xs font-medium text-zinc-600 dark:text-gray-400">
                            Linked Resume
                          </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-gray-200 mb-2 truncate">
                          {linkedResume.title}
                        </p>
                        <div className="mb-2">
                          <ATSScoreBadge score={atsScore} size="sm" />
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/resume?view=${linkedResume.id}`}
                            className="flex-1 text-center px-2 py-1.5 rounded-md text-xs text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200 bg-surface-200/50 hover:bg-surface-200 transition-all"
                          >
                            View Resume
                          </Link>
                          <Link
                            href={`/dashboard/resume?tailorFor=${job.id}`}
                            className="flex-1 text-center px-2 py-1.5 rounded-md text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 transition-all"
                          >
                            Re-tailor
                          </Link>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <Link
                  href={`/dashboard/resume?tailorFor=${job.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-500/5 border border-brand-500/10 hover:bg-brand-500/10 hover:border-brand-500/20 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <span className="text-sm text-brand-300 font-medium">
                      Tailor Resume for This Job
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-500 group-hover:text-brand-400" />
                </Link>
              )}

              <Link
                href="/dashboard/interview"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-sm text-zinc-600 dark:text-gray-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-900 dark:hover:text-gray-200">
                  Start Interview Prep
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-900 dark:hover:text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
