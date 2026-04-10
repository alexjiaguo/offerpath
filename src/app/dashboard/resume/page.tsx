"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Plus,
  Sparkles,
  ArrowLeft,
  Briefcase,
  MapPin,
  Star,
  Copy,
  Crown,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/ResumePreview";
import { Suspense } from "react";

/* ═══════════════════════════════════════════════════
   Resume Studio — Template picker + tailoring context
   + 9 premium template cards
   ═══════════════════════════════════════════════════ */

// Template color palette for thumbnails — muted, professional tones
const TEMPLATE_THUMBS: Record<string, { gradient: string; accent: string }> = {
  "classic-minimal": { gradient: "from-zinc-600 to-zinc-500", accent: "bg-zinc-400" },
  "ats-executive": { gradient: "from-zinc-700 to-zinc-600", accent: "bg-zinc-500" },
  "premium-headshot": { gradient: "from-brand-700 to-brand-600", accent: "bg-brand-500" },
  "bold-engineer": { gradient: "from-zinc-800 to-zinc-700", accent: "bg-zinc-400" },
  "clean-layout": { gradient: "from-zinc-500 to-zinc-400", accent: "bg-zinc-300" },
  "clean-professional": { gradient: "from-stone-600 to-stone-500", accent: "bg-stone-400" },
  "elegant-two-column": { gradient: "from-zinc-600 to-brand-700", accent: "bg-brand-500" },
  "photo-header": { gradient: "from-brand-600 to-brand-500", accent: "bg-brand-400" },
  "academic": { gradient: "from-stone-700 to-stone-600", accent: "bg-stone-500" },
};

function TemplateThumbnail({ templateId }: { templateId: string }) {
  const thumb = TEMPLATE_THUMBS[templateId] || TEMPLATE_THUMBS["classic-minimal"];

  return (
    <div className="w-full aspect-[3/4] rounded-lg overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-300">
      {/* Paper background */}
      <div className="absolute inset-0 bg-white">
        {/* Header bar */}
        <div
          className={cn(
            "h-[18%] bg-gradient-to-r flex items-center px-3",
            thumb.gradient
          )}
        >
          <div className="space-y-0.5">
            <div className="w-12 h-1.5 bg-white/80 rounded-full" />
            <div className="w-8 h-1 bg-white/50 rounded-full" />
          </div>
        </div>

        {/* Content lines */}
        <div className="p-2.5 space-y-1.5">
          <div className={cn("w-10 h-1 rounded-full", thumb.accent)} />
          <div className="w-full h-0.5 bg-gray-200 rounded-full" />
          <div className="w-[85%] h-0.5 bg-gray-200 rounded-full" />
          <div className="w-[90%] h-0.5 bg-gray-200 rounded-full" />

          <div className="pt-1">
            <div className={cn("w-8 h-1 rounded-full", thumb.accent)} />
          </div>
          <div className="w-full h-0.5 bg-gray-100 rounded-full" />
          <div className="w-[70%] h-0.5 bg-gray-100 rounded-full" />
          <div className="w-[80%] h-0.5 bg-gray-100 rounded-full" />

          <div className="pt-1">
            <div className={cn("w-6 h-1 rounded-full", thumb.accent)} />
          </div>
          <div className="flex flex-wrap gap-0.5">
            <div className="w-5 h-1.5 bg-gray-100 rounded" />
            <div className="w-7 h-1.5 bg-gray-100 rounded" />
            <div className="w-4 h-1.5 bg-gray-100 rounded" />
            <div className="w-6 h-1.5 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumePageContent() {
  const searchParams = useSearchParams();
  const tailorForJobId = searchParams.get("tailorFor");

  const { getJobById } = usePipelineStore();
  const { resumes, getATSScore, duplicateResume } = useResumeStore();

  const tailorJob = tailorForJobId ? getJobById(tailorForJobId) : null;

  const handleUseAsBase = (resumeId: string) => {
    if (!tailorForJobId) return;
    const job = getJobById(tailorForJobId);
    const newTitle = job
      ? `Tailored \u2014 ${job.company?.name || ""} ${job.title}`.trim()
      : undefined;
    duplicateResume(resumeId, newTitle);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Tailoring Banner */}
      {tailorJob && (
        <div className="mb-6 animate-slide-up">
          {/* Back link */}
          <Link
            href={`/dashboard/pipeline/${tailorJob.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Job Detail
          </Link>

          {/* Context card */}
          <div className="glass rounded-2xl p-6 border-l-4 border-brand-500">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-400 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                {(tailorJob.company?.name || "?").charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">
                    Tailoring Resume For
                  </span>
                </div>
                <h2 className="text-lg font-bold mb-1">{tailorJob.title}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                  {tailorJob.company?.name && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {tailorJob.company.name}
                    </span>
                  )}
                  {tailorJob.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {tailorJob.location}
                    </span>
                  )}
                  {tailorJob.score !== undefined && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      Score: {tailorJob.score.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {tailorJob.description && (
              <details className="mt-4 group">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition-colors">
                  View Job Description →
                </summary>
                <div className="mt-3 p-4 rounded-lg bg-surface-200/30 text-sm text-gray-400 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {tailorJob.description}
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">
            {tailorJob ? "Select a Base Resume" : "Resume Studio"}
          </h1>
        </div>
        {!tailorJob && (
          <Link
            href="/dashboard/resume/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Resume
          </Link>
        )}
      </div>

      {/* Existing Resumes */}
      {resumes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            {tailorJob ? "Choose a Base \u2014 We\u2019ll Tailor It" : "Your Resumes"}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {resumes.map((resume) => {
              const atsScore = tailorForJobId
                ? getATSScore(resume.id, tailorForJobId)
                : null;

              return (
                <div
                  key={resume.id}
                  className="glass-hover rounded-xl p-5 group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        resume.is_base
                          ? "bg-blue-500/10"
                          : "bg-brand-500/10"
                      )}
                    >
                      <FileText
                        className={cn(
                          "w-5 h-5",
                          resume.is_base ? "text-blue-400" : "text-brand-400"
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {resume.title}
                        </h4>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0",
                            resume.is_base
                              ? "text-blue-300 bg-blue-500/10"
                              : "text-brand-300 bg-brand-500/10"
                          )}
                        >
                          {resume.is_base ? "Base" : "Tailored"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Updated{" "}
                        {new Date(resume.updated_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>

                      {atsScore !== null && (
                        <div className="mt-2">
                          <ATSScoreInline score={atsScore} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {tailorJob ? (
                      <button
                        onClick={() => handleUseAsBase(resume.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg gradient-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <Copy className="w-3 h-3" />
                        Use as Base
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/dashboard/resume/${resume.id}`}
                          className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 bg-surface-200/50 hover:bg-surface-200 transition-all"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/resume/${resume.id}`}
                          className="flex-1 text-center px-3 py-2 rounded-lg text-xs font-medium text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 transition-all"
                        >
                          Preview
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!tailorJob && resumes.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-7 h-7 text-brand-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Create your first resume</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Choose a template to start, then customize with the visual editor. AI will help you
            tailor it for specific job descriptions.
          </p>
          <Link
            href="/dashboard/resume/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Start Building
          </Link>
        </div>
      )}

      {/* Template Preview Grid — 9 templates */}
      {!tailorJob && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Available Templates
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 font-medium">
              {TEMPLATE_CONFIGS.length} templates
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {TEMPLATE_CONFIGS.map((tmpl) => (
              <Link
                key={tmpl.id}
                href={`/dashboard/resume/new?template=${tmpl.id}`}
                className="glass-hover rounded-xl p-4 cursor-pointer group relative"
              >
                {/* PRO badge */}
                {tmpl.pro && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    <Crown className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold">PRO</span>
                  </div>
                )}

                {/* Template thumbnail */}
                <div className="mb-3">
                  <TemplateThumbnail templateId={tmpl.id} />
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{tmpl.name}</h4>
                  {tmpl.tag && !tmpl.pro && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 font-medium">
                      {tmpl.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{tmpl.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl font-bold">Resume Studio</h1>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      }
    >
      <ResumePageContent />
    </Suspense>
  );
}
