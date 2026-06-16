"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Briefcase, CaretRight, Clock, Copy, FileText, MapPin, Plus, Star, Sparkle, UploadSimple } from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";
import { Suspense } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════
   Resume Studio v4 — Minimalist Career Asset Management
   ═══════════════════════════════════════════════════ */

import Image from "next/image";

function TemplateThumbnail({ templateId, thumbnail }: { templateId: string; thumbnail?: string }) {
  return (
    <div className="w-full aspect-[816/1056] rounded-xl border border-surface-200/50 overflow-hidden relative transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]">
      <Image
        src={`/images/templates/${thumbnail || templateId}.png`}
        alt={`${templateId} thumbnail`}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
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
    <div className="w-full space-y-10 pb-20">
      {/* Tailoring Context */}
      {tailorJob && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
          <Link
            href={tailorJob.source === "discovery" ? `/dashboard/discover/${tailorJob.id}` : `/dashboard/pipeline/${tailorJob.id}`}
            className="inline-flex items-center gap-2 text-[11px] font-bold text-surface-400 hover:text-brand-900 transition-colors uppercase tracking-widest group"
          >
            <ArrowLeft weight="light" className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
            Abort Tailoring
          </Link>

          <div className="doppel-shell">
            <div className="doppel-core flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10 p-6 md:p-8">
              <div className="w-16 h-16 rounded-[1rem] bg-brand-50 border border-brand-200/50 flex items-center justify-center text-2xl font-display text-brand-900 shadow-sm flex-shrink-0">
                {(tailorJob.company?.name || "?").charAt(0)}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-900">
                    <Sparkle weight="fill" className="w-3 h-3" />
                  </span>
                  <span className="text-[10px] font-bold text-brand-900 uppercase tracking-widest">Synthesis Protocol Active</span>
                </div>
                <h2 className="text-2xl font-medium text-surface-500 font-display tracking-tight leading-tight">{tailorJob.title}</h2>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-surface-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Briefcase weight="light" className="w-4 h-4" /> {tailorJob.company?.name}</span>
                  {tailorJob.location && <span className="flex items-center gap-1.5"><MapPin weight="light" className="w-4 h-4" /> {tailorJob.location}</span>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-surface-200/50 pb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-4xl font-light tracking-tight text-brand-900 font-display">
            {tailorJob ? "Select Synthesis Base" : "Career Asset Studio"}
          </h1>
          <p className="text-surface-400 mt-2 font-medium">
            {tailorJob ? "Choose an existing asset to deconstruct and re-tailor." : "Orchestrate high-fidelity documents for your next move."}
          </p>
        </div>
        
        {!tailorJob && (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/resume/new"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-tight text-surface-500 bg-white border border-surface-200/50 hover:bg-surface-50 hover:scale-[1.02] active:scale-95 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <UploadSimple weight="light" className="w-4 h-4" />
              Upload
            </Link>
            <Link
              href="/dashboard/resume/new"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-tight text-white bg-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              <Plus weight="light" className="w-4 h-4" />
              Create
            </Link>
          </div>
        )}
      </div>

      {/* Existing Assets Grid */}
      {resumes.length > 0 && (
        <div className="space-y-6 max-w-6xl mx-auto">
          <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
            {tailorJob ? "Deployment Ready Bases" : "Active Career Assets"}
          </h3>
          {filteredResumes.length === 0 ? (
            <div className="doppel-shell p-12 text-center">
              <p className="text-sm font-medium text-surface-400">No resumes matching &ldquo;{searchQuery}&rdquo; found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumes.map((resume, i) => {
                const atsScore = tailorForJobId ? getATSScore(resume.id, tailorForJobId) : null;
              return (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="doppel-shell group hover:-translate-y-1 hover:shadow-lg transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-default"
                >
                  <div className="doppel-core p-6 flex flex-col h-full bg-white relative z-10">
                    <div className="flex items-start gap-5 mb-6">
                      <div className={cn(
                        "w-12 h-12 rounded-[0.75rem] border flex items-center justify-center flex-shrink-0 shadow-sm",
                        resume.is_base ? "bg-brand-50 border-brand-200/50" : "bg-surface-50 border-surface-200/50"
                      )}>
                        <FileText weight="light" className={cn("w-6 h-6", resume.is_base ? "text-brand-900" : "text-surface-400")} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-[15px] font-semibold text-brand-900 truncate tracking-tight">{resume.title}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border",
                            resume.is_base ? "bg-brand-50 text-brand-900 border-brand-200/50" : "bg-surface-50 text-surface-400 border-surface-200/50"
                          )}>
                            {resume.is_base ? "Base" : "Tailored"}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-surface-400 uppercase tracking-widest">
                            <Clock weight="light" className="w-3.5 h-3.5" />
                            {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {atsScore !== null && (
                      <div className="mb-6 border-t border-surface-200/50 pt-4">
                        <ATSScoreInline score={atsScore} />
                      </div>
                    )}

                    <div className="flex gap-3 mt-auto pt-4 border-t border-surface-200/50">
                      {tailorJob ? (
                        <button
                          onClick={() => handleUseAsBase(resume.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-brand-900 text-white hover:bg-brand-800 hover:scale-[1.02] active:scale-95 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-sm"
                        >
                          <Copy weight="bold" className="w-3.5 h-3.5" />
                          Select Base
                        </button>
                      ) : (
                        <>
                          <Link
                            href={`/dashboard/resume/${resume.id}`}
                            className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-surface-500 bg-surface-50 border border-surface-200/50 hover:bg-white hover:border-surface-300 hover:scale-[1.02] active:scale-95 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/dashboard/resume/${resume.id}`}
                            className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-brand-900 border border-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                          >
                            Preview
                          </Link>
                        </>
                      )}
                    </div>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="doppel-shell max-w-2xl mx-auto">
          <div className="doppel-core p-12 text-center bg-white relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-[1.5rem] bg-surface-50 border border-surface-200/50 flex items-center justify-center mb-8 shadow-sm">
              <Sparkle weight="light" className="w-10 h-10 text-brand-900" />
            </div>
            <h2 className="text-3xl font-light text-brand-900 font-display mb-3 tracking-tight">Create Your First Asset</h2>
            <p className="text-surface-400 text-[15px] font-medium max-w-md mx-auto mb-10">
              Choose a template layout or upload an existing resume to begin building your career assets.
            </p>
            <Link
              href="/dashboard/resume/new"
              className="flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold tracking-tight text-white bg-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-md transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group"
            >
              <Plus weight="light" className="w-5 h-5 group-active:scale-90 transition-transform" />
              Create Asset
            </Link>
          </div>
        </motion.div>
      )}

      {/* Template Grid */}
      {!tailorJob && (
        <div className="space-y-8 pt-8 max-w-6xl mx-auto border-t border-surface-200/50 mt-12">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
              Synthesis Protocols
            </h3>
            <div className="px-3 py-1 rounded-full bg-white border border-surface-200/50 text-[10px] font-bold text-brand-900 shadow-sm">
              {TEMPLATE_CONFIGS.length} Layouts
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {TEMPLATE_CONFIGS.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                className="group cursor-pointer"
              >
                <Link
                  href={`/dashboard/resume/new?template=${tmpl.id}`}
                  className="block"
                >
                  <div className="mb-5 relative rounded-xl doppel-shell overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <div className="doppel-core bg-white relative z-10 p-1">
                      {tmpl.pro && (
                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-brand-900 text-white shadow-md">
                          <Star weight="fill" className="w-2.5 h-2.5" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">Pro</span>
                        </div>
                      )}
                      <TemplateThumbnail templateId={tmpl.id} thumbnail={tmpl.thumbnail} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 px-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[12px] font-bold text-brand-900 uppercase tracking-widest">{tmpl.name}</h4>
                      {tmpl.tag && !tmpl.pro && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-50 border border-surface-200/50 text-surface-400 font-bold uppercase tracking-widest">
                          {tmpl.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-surface-400 line-clamp-2 leading-relaxed">{tmpl.desc}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-surface-200/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] px-1">
                    <span className="text-[10px] font-bold text-brand-900 uppercase tracking-widest">Use Layout</span>
                    <CaretRight weight="light" className="w-4 h-4 text-brand-900 group-hover:translate-x-1 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
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
    <Suspense fallback={<div className="p-12 text-center text-surface-400 uppercase tracking-widest text-[10px] font-bold animate-pulse">Syncing Asset Studio...</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
