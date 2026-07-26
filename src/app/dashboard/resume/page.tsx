"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import {
  CheckCircle, CaretRight, Clock, Copy, FileText, Plus, Stack, Star,
  Sparkle, Target, UploadSimple, Briefcase,
} from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";
import { RESUME_SAMPLES, type ResumeSample } from "@/lib/resumeSamples";
import { motion } from "framer-motion";

function ResumePageContent() {
  const searchParams = useSearchParams();
  const tailorForJobId = searchParams.get("tailorFor");

  const { getJobById: getPipelineJob } = usePipelineStore();
  const { getJobById: getDiscoveryJob } = useDiscoveryStore();
  const { resumes, getATSScore, duplicateResume, addResume } = useResumeStore();
  const searchQuery = usePipelineStore((s) => s.filters.search);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(TEMPLATE_CONFIGS.map((t) => t.tag).filter(Boolean)))],
    []
  );
  const visibleTemplates = useMemo(
    () => activeCategory === "All" ? TEMPLATE_CONFIGS : TEMPLATE_CONFIGS.filter((t) => t.tag === activeCategory),
    [activeCategory]
  );

  const filteredResumes = resumes.filter(
    (r) => !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.data.personal?.name && r.data.personal.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pipelineJob = tailorForJobId ? getPipelineJob(tailorForJobId) : null;
  const discoveryJob = tailorForJobId ? getDiscoveryJob(tailorForJobId) : null;
  const tailorJob = pipelineJob
    ? { ...pipelineJob, source: "pipeline" as const }
    : discoveryJob
    ? { ...discoveryJob, company: { name: discoveryJob.company_name || "" }, source: "discovery" as const }
    : null;

  const handleUseAsBase = (resumeId: string) => {
    if (!tailorForJobId || !tailorJob) return;
    duplicateResume(resumeId, `Tailored — ${tailorJob.company?.name || ""} ${tailorJob.title}`.trim());
  };

  const handleUseSample = (sample: ResumeSample) => {
    addResume({
      title: sample.title,
      data: sample.data,
      template: sample.template,
      theme: sample.theme,
      section_order: sample.section_order,
      section_visibility: sample.section_visibility,
      is_base: false,
    } as never);
  };

  return (
    <div className="w-full pb-20">
      {/* ═════════════ HERO — resume.com's dual-CTA + trust badges ═════════════ */}
      <section className="mb-10">
        <div className="text-center max-w-3xl mx-auto py-6 md:py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/50 text-[10px] font-bold uppercase tracking-widest text-brand-900 mb-5">
            <Sparkle weight="fill" className="w-3 h-3" />
            AI-Powered Resume Builder
          </div>
          <h1 className="text-3xl md:text-5xl font-light text-brand-900 font-display tracking-tight leading-[1.05]">
            Build a professional and<br />outstanding <span className="font-medium">resume</span> with our<br />free builder and templates.
          </h1>

          {/* Two-button hero — the resume.com signature */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#template-gallery"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-md transition-all"
            >
              <Plus weight="bold" className="w-4 h-4" />
              Create my resume
            </Link>
            <Link
              href="/dashboard/resume/new"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-brand-900 bg-white border border-brand-200 hover:bg-brand-50 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <UploadSimple weight="bold" className="w-4 h-4" />
              Upload resume
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-surface-500">
            <span className="inline-flex items-center gap-1.5"><Target weight="fill" className="w-4 h-4 text-amber-500" /> AI writer</span>
            <span className="inline-flex items-center gap-1.5"><Briefcase weight="fill" className="w-4 h-4 text-brand-900" /> Build-in jobs</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" /> Easy to match</span>
          </div>
        </div>
      </section>

      {/* ═════════════ RESUME SAMPLES — resume.com's "Use Resume Sample" affordance ═════════════ */}
      {resumes.length === 0 && RESUME_SAMPLES.length > 0 && (
        <section className="max-w-6xl mx-auto px-2 mb-12">
          <div className="doppel-shell">
            <div className="doppel-core bg-white p-6 md:p-8 relative z-10">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-sm font-bold font-display text-brand-900 uppercase tracking-widest">Use a Resume Sample</h2>
                  <p className="text-[12px] text-surface-400 mt-1">Skip the blank page. Start from a proven example, then customize.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-surface-50 border border-surface-200/50 text-[10px] font-bold text-brand-900">
                  {RESUME_SAMPLES.length} samples
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {RESUME_SAMPLES.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleUseSample(s)}
                    className="text-left p-4 rounded-xl bg-surface-50 border border-surface-200/50 hover:border-brand-200/50 hover:bg-white transition-all group"
                  >
                    <div className="text-[11px] font-bold text-brand-900 uppercase tracking-widest">{s.title}</div>
                    <div className="text-[10px] text-surface-400 mt-1.5 line-clamp-2">{s.summary}</div>
                    <div className="text-[9px] text-brand-900 font-bold uppercase tracking-widest mt-3 group-hover:translate-x-0.5 transition-transform">
                      Start from this →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═════════════ ACTIVE RESUMES with section-progress chip ═════════════ */}
      {resumes.length > 0 && (
        <section className="max-w-6xl mx-auto px-2 mb-12">
          <div className="flex items-end justify-between mb-5 border-b border-surface-200/50 pb-3">
            <div>
              <h2 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                {tailorJob ? "Deployment Ready Bases" : "Your Resumes"}
              </h2>
              <p className="text-[12px] text-surface-400/80 mt-1">
                {tailorJob ? "Select a base to deconstruct and re-tailor." : "Open any to edit, tailor, or export."}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white border border-surface-200/50 text-[10px] font-bold text-brand-900">
              {resumes.length} {resumes.length === 1 ? "asset" : "assets"}
            </span>
          </div>

          {filteredResumes.length === 0 ? (
            <div className="doppel-shell p-12 text-center">
              <p className="text-sm font-medium text-surface-400">No resumes matching &ldquo;{searchQuery}&rdquo; found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResumes.map((resume, i) => {
                const atsScore = tailorForJobId ? getATSScore(resume.id, tailorForJobId) : null;
                const d = resume.data;
                const started = [
                  d.personal?.name, d.summary, d.experience?.length, d.education?.length, d.skills?.length,
                ].filter(Boolean).length;
                return (
                  <motion.div key={resume.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="doppel-shell group hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="doppel-core p-5 flex flex-col h-full bg-white relative z-10">
                      <div className="flex items-start gap-4 mb-5">
                        <div className={cn(
                          "w-11 h-11 rounded-[0.7rem] border flex items-center justify-center flex-shrink-0 shadow-sm",
                          resume.is_base ? "bg-brand-50 border-brand-200/50" : "bg-surface-50 border-surface-200/50"
                        )}>
                          <FileText weight="light" className={cn("w-5 h-5", resume.is_base ? "text-brand-900" : "text-surface-400")} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h4 className="text-[14px] font-semibold text-brand-900 truncate tracking-tight">{resume.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border",
                              resume.is_base ? "bg-brand-50 text-brand-900 border-brand-200/50" : "bg-surface-50 text-surface-400 border-surface-200/50"
                            )}>
                              {resume.is_base ? "Base" : "Tailored"}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-surface-400 uppercase tracking-widest">
                              <Clock weight="light" className="w-3 h-3" />
                              {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 border-t border-surface-200/50 pt-4 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-surface-400 uppercase tracking-widest">
                          {started} / 5 sections started
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, k) => (
                            <span key={k} className={cn("w-1.5 h-1.5 rounded-full", k < started ? "bg-brand-900" : "bg-surface-200")} />
                          ))}
                        </div>
                      </div>

                      {atsScore !== null && (
                        <div className="mb-5"><ATSScoreInline score={atsScore} /></div>
                      )}

                      <div className="flex gap-2.5 mt-auto pt-4 border-t border-surface-200/50">
                        {tailorJob ? (
                          <button onClick={() => handleUseAsBase(resume.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-900 text-white hover:bg-brand-800 transition-all">
                            <Copy weight="bold" className="w-3.5 h-3.5" /> Select base
                          </button>
                        ) : (
                          <>
                            <Link href={`/dashboard/resume/${resume.id}`} className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-surface-500 bg-surface-50 border border-surface-200/50 hover:bg-white transition-all">Edit</Link>
                            <Link href={`/dashboard/resume/${resume.id}`} className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-sm">Preview</Link>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═════════════ TEMPLATE GALLERY with Manage Sections link ═════════════ */}
      <section id="template-gallery" className="max-w-6xl mx-auto px-2 scroll-mt-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-5 border-b border-surface-200/50 pb-3">
          <div>
            <h2 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
              {resumes.length === 0 ? "Or Start From a Template" : "Add Another Asset"}
            </h2>
            <p className="text-[12px] text-surface-400/80 mt-1">
              {resumes.length === 0 ? "Pick a layout, customize the sections, and tailor with AI." : "Browse ATS-aware layouts. Manage sections, view tips, export PDF + Word."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {resumes.length > 0 && (
              <Link href="/dashboard/resume" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-surface-200/50 text-[10px] font-bold text-surface-500 hover:text-brand-900 hover:border-brand-200/50 transition-all">
                <Stack weight="bold" className="w-3.5 h-3.5" /> Manage Sections
              </Link>
            )}
            <span className="px-3 py-1 rounded-full bg-white border border-surface-200/50 text-[10px] font-bold text-brand-900">
              {visibleTemplates.length} / {TEMPLATE_CONFIGS.length} layouts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-6">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                active ? "bg-brand-900 text-white shadow-sm" : "bg-white text-surface-400 border border-surface-200/50 hover:border-surface-300 hover:text-brand-900"
              )}>{cat}</button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleTemplates.map((tmpl, i) => (
            <motion.div key={tmpl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }} className="group">
              <Link href={`/dashboard/resume/new?template=${tmpl.id}`} className="block">
                <div className="mb-4 relative rounded-xl doppel-shell overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all">
                  <div className="doppel-core bg-white relative z-10 p-1">
                    {tmpl.pro && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-brand-900 text-white shadow-md">
                        <Star weight="fill" className="w-2.5 h-2.5" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">Pro</span>
                      </div>
                    )}
                    <div className="w-full aspect-[816/1056] rounded-lg border border-surface-200/50 overflow-hidden relative">
                      <img src={`/images/templates/${tmpl.thumbnail || tmpl.id}.png`} alt={`${tmpl.name} preview`} className="w-full h-full object-cover object-top" loading="lazy" />
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[12px] font-bold text-brand-900 uppercase tracking-widest">{tmpl.name}</h3>
                    {tmpl.tag && !tmpl.pro && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-50 border border-surface-200/50 text-surface-400 font-bold uppercase tracking-widest">{tmpl.tag}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-surface-400 mt-1 leading-relaxed line-clamp-2">{tmpl.desc}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-surface-200/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity px-1">
                  <span className="text-[10px] font-bold text-brand-900 uppercase tracking-widest">Use template</span>
                  <CaretRight weight="light" className="w-4 h-4 text-brand-900 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-surface-400 uppercase tracking-widest text-[10px] font-bold animate-pulse">Loading studio...</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
