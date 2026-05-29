"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Briefcase, CaretRight, Clock, Copy, FileText, MapPin, Plus, Star, Sparkle, UploadSimple } from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/ResumePreview";
import { Suspense } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════
   Resume Studio v4 — Minimalist Career Asset Management
   ═══════════════════════════════════════════════════ */

const TEMPLATE_THUMBS: Record<string, { bg: string; accent: string }> = {
  "classic-minimal": { bg: "bg-[#F7F6F3]", accent: "bg-[#2D2D2D]" },
  "ats-executive": { bg: "bg-[#FFFFFF]", accent: "bg-[#111111]" },
  "premium-headshot": { bg: "bg-[#F3F4F6]", accent: "bg-[#3B82F6]" },
  "bold-engineer": { bg: "bg-[#EAEAEA]", accent: "bg-[#000000]" },
  "clean-layout": { bg: "bg-[#FAFAFA]", accent: "bg-[#4B5563]" },
  "clean-professional": { bg: "bg-[#F9FAFB]", accent: "bg-[#374151]" },
  "elegant-two-column": { bg: "bg-[#F3F4F6]", accent: "bg-[#2563EB]" },
  "photo-header": { bg: "bg-[#EFF6FF]", accent: "bg-[#1D4ED8]" },
  "academic": { bg: "bg-[#F5F5F4]", accent: "bg-[#44403C]" },
};

function TemplateThumbnail({ templateId }: { templateId: string }) {
  const thumb = TEMPLATE_THUMBS[templateId] || TEMPLATE_THUMBS["classic-minimal"];

  return (
    <div className="w-full aspect-[3/4] rounded-md border border-surface-200 overflow-hidden relative group-hover:shadow-sm transition-all duration-300">
      <div className={cn("absolute inset-0", thumb.bg)}>
        <div className="h-[20%] border-b border-black/10 flex items-center px-4">
          <div className="space-y-1">
            <div className={cn("w-16 h-1.5 rounded", thumb.accent)} />
            <div className="w-10 h-1 bg-black/20 rounded" />
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className={cn("w-14 h-1 rounded", thumb.accent)} />
          <div className="w-full h-0.5 bg-black/10 rounded" />
          <div className="w-[85%] h-0.5 bg-black/10 rounded" />
          <div className="pt-2">
            <div className={cn("w-10 h-1 rounded", thumb.accent)} />
          </div>
          <div className="w-full h-0.5 bg-black/5 rounded" />
          <div className="w-[70%] h-0.5 bg-black/5 rounded" />
        </div>
      </div>
    </div>
  );
}

function ResumePageContent() {
  const searchParams = useSearchParams();
  const tailorForJobId = searchParams.get("tailorFor");

  const { getJobById: getPipelineJob } = usePipelineStore();
  const { getJobById: getDiscoveryJob } = useDiscoveryStore();
  const { resumes, getATSScore, duplicateResume } = useResumeStore();
  const searchQuery = usePipelineStore((s) => s.filters.search);

  const filteredResumes = resumes.filter(
    (resume) =>
      !searchQuery ||
      resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resume.data.personal?.name &&
        resume.data.personal.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check both pipeline and discovery stores for the tailor job
  const pipelineJob = tailorForJobId ? getPipelineJob(tailorForJobId) : null;
  const discoveryJob = tailorForJobId ? getDiscoveryJob(tailorForJobId) : null;

  // Normalize to common interface
  const tailorJob = pipelineJob
    ? { ...pipelineJob, source: "pipeline" as const }
    : discoveryJob
    ? {
        ...discoveryJob,
        company: { name: discoveryJob.company_name || "" },
        source: "discovery" as const,
      }
    : null;

  const handleUseAsBase = (resumeId: string) => {
    if (!tailorForJobId || !tailorJob) return;
    const newTitle = `Tailored — ${tailorJob.company?.name || ""} ${tailorJob.title}`.trim();
    duplicateResume(resumeId, newTitle);
  };

  return (
    <div className="w-full space-y-10 pb-20 p-6 md:p-8">
      {/* Tailoring Context */}
      {tailorJob && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <Link
            href={tailorJob.source === "discovery" ? `/dashboard/discover/${tailorJob.id}` : `/dashboard/pipeline/${tailorJob.id}`}
            className="inline-flex items-center gap-2 text-[11px] font-bold text-surface-400 hover:text-surface-500 transition-colors uppercase tracking-widest group"
          >
            <ArrowLeft weight="bold" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Abort Tailoring
          </Link>

          <div className="bg-surface-0 border border-brand-500 rounded-lg p-6 relative overflow-hidden group shadow-sm">
            <div className="flex items-start gap-5 relative z-10">
              <div className="w-12 h-12 rounded bg-brand-50 border border-brand-200 flex items-center justify-center text-xl font-bold text-brand-500">
                {(tailorJob.company?.name || "?").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkle weight="fill" className="w-3.5 h-3.5 text-brand-500" />
                  <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Synthesis Protocol Active</span>
                </div>
                <h2 className="text-xl font-bold text-surface-400 font-display tracking-tight leading-tight">{tailorJob.title}</h2>
                <div className="flex items-center gap-4 text-[11px] font-bold text-surface-300 uppercase tracking-widest mt-1.5">
                  <span className="flex items-center gap-1"><Briefcase weight="bold" className="w-3.5 h-3.5" /> {tailorJob.company?.name}</span>
                  {tailorJob.location && <span className="flex items-center gap-1"><MapPin weight="bold" className="w-3.5 h-3.5" /> {tailorJob.location}</span>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-surface-400 font-display">
            {tailorJob ? "Select Synthesis Base" : "Career Asset Studio"}
          </h1>
          <p className="text-surface-300 text-sm mt-1">
            {tailorJob ? "Choose an existing asset to deconstruct and re-tailor." : "Orchestrate high-fidelity documents for your next move."}
          </p>
        </div>
        
        {!tailorJob && (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/resume/new"
              className="btn-outline flex items-center gap-2"
            >
              <UploadSimple weight="bold" className="w-4 h-4" />
              Upload
            </Link>
            <Link
              href="/dashboard/resume/new"
              className="btn-primary flex items-center gap-2"
            >
              <Plus weight="bold" className="w-4 h-4" />
              Create
            </Link>
          </div>
        )}
      </div>

      {/* Existing Assets Grid */}
      {resumes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest">
            {tailorJob ? "Deployment Ready Bases" : "Active Career Assets"}
          </h3>
          {filteredResumes.length === 0 ? (
            <div className="bg-surface-50 rounded-lg p-8 text-center border border-surface-200">
              <p className="text-sm text-surface-300">No resumes matching &ldquo;{searchQuery}&rdquo; found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResumes.map((resume, i) => {
                const atsScore = tailorForJobId ? getATSScore(resume.id, tailorForJobId) : null;
              return (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-surface-0 border border-surface-200 rounded-lg p-5 flex flex-col hover:border-surface-300 transition-colors"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded border flex items-center justify-center flex-shrink-0",
                      resume.is_base ? "bg-brand-50 border-brand-200" : "bg-surface-50 border-surface-200"
                    )}>
                      <FileText weight="duotone" className={cn("w-5 h-5", resume.is_base ? "text-brand-500" : "text-surface-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-surface-400 truncate tracking-tight">{resume.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border",
                          resume.is_base ? "bg-brand-50 text-brand-600 border-brand-200" : "bg-surface-50 text-surface-400 border-surface-200"
                        )}>
                          {resume.is_base ? "Base" : "Tailored"}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-bold text-surface-300 uppercase tracking-widest">
                          <Clock weight="bold" className="w-3 h-3" />
                          {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {atsScore !== null && (
                    <div className="mb-4">
                      <ATSScoreInline score={atsScore} />
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    {tailorJob ? (
                      <button
                        onClick={() => handleUseAsBase(resume.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-bold bg-surface-400 text-surface-0 hover:bg-surface-500 transition-colors"
                      >
                        <Copy weight="bold" className="w-4 h-4" />
                        Select Base
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/dashboard/resume/${resume.id}`}
                          className="flex-1 text-center px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-surface-400 bg-surface-50 border border-surface-200 hover:bg-surface-100 transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/dashboard/resume/${resume.id}`}
                          className="flex-1 text-center px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors"
                        >
                          Preview
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!tailorJob && resumes.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface-0 border border-surface-200 rounded-lg p-12 text-center">
          <div className="w-16 h-16 rounded bg-surface-50 border border-surface-200 flex items-center justify-center mx-auto mb-6">
            <Sparkle weight="duotone" className="w-8 h-8 text-surface-300" />
          </div>
          <h2 className="text-xl font-bold text-surface-400 font-display mb-2">Create Your First Asset</h2>
          <p className="text-surface-300 text-sm max-w-sm mx-auto mb-8">
            Choose a template layout or upload an existing resume to begin building your career assets.
          </p>
          <Link
            href="/dashboard/resume/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus weight="bold" className="w-4 h-4" />
            Create Asset
          </Link>
        </motion.div>
      )}

      {/* Template Grid */}
      {!tailorJob && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest">
              Synthesis Protocols
            </h3>
            <div className="px-2 py-1 rounded bg-surface-50 border border-surface-200 text-[10px] font-bold text-surface-400">
              {TEMPLATE_CONFIGS.length} Layouts
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATE_CONFIGS.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
              >
                <Link
                  href={`/dashboard/resume/new?template=${tmpl.id}`}
                  className="bg-surface-0 border border-surface-200 rounded-lg p-4 block hover:border-surface-300 transition-colors group"
                >
                  <div className="mb-4 relative">
                    {tmpl.pro && (
                      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-400 text-surface-0 border border-surface-400">
                        <Star weight="fill" className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Pro</span>
                      </div>
                    )}
                    <TemplateThumbnail templateId={tmpl.id} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">{tmpl.name}</h4>
                      {tmpl.tag && !tmpl.pro && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-surface-50 border border-surface-200 text-surface-300 font-bold uppercase tracking-widest">
                          {tmpl.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-surface-300 line-clamp-2">{tmpl.desc}</p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-surface-200 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">Use Layout</span>
                    <CaretRight weight="bold" className="w-3 h-3 text-surface-400" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-surface-300 uppercase tracking-widest text-[10px] font-bold">Syncing Asset Studio...</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
