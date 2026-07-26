"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import {
  ArrowLeft, Briefcase, CaretRight, Clock, Copy, FileText, MapPin, Plus,
  Star, Sparkle, UploadSimple, Check, ShieldCheck, FilePdf,
} from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";
import { motion } from "framer-motion";

/* ─── Persona: a sample render-of-record for each template ───
   Inspired by flowcv's "Brian T. Wayne / Camila Rivera / Rohan K. Patel"
   sample personas. Each persona pins the template to a concrete use case
   so the user can evaluate the design without having to upload data first. */
const TEMPLATE_PERSONAS: Record<string, { name: string; role: string; tag: string }> = {
  "classic-minimal":    { name: "Brian T. Wayne",  role: "Business Development Consultant", tag: "First-time / Career switch" },
  "ats-executive":      { name: "Margaret Holloway", role: "VP of Operations",          tag: "Senior leaders" },
  "premium-headshot":   { name: "Camila Rivera",   role: "Senior Sales Manager",            tag: "Client-facing" },
  "bold-engineer":      { name: "Rohan K. Patel",  role: "Project Engineer",                tag: "Engineering" },
  "clean-layout":       { name: "Priya Anand",     role: "Product Manager",                  tag: "Product" },
  "clean-professional": { name: "Daniel Whitford", role: "Finance Director",                 tag: "Senior finance" },
  "elegant-two-column": { name: "Isabella Moreau", role: "Brand Strategist",                 tag: "Creative / agency" },
  "photo-header":       { name: "Theo Nakamura",   role: "UX Designer",                       tag: "Design / portfolio" },
  "academic":           { name: "Dr. Aisha Khan",  role: "Postdoctoral Researcher",           tag: "Academic / research" },
};

const PROCESS_STEPS = [
  { n: 1, t: "Pick a layout",      d: "Choose from ATS-friendly templates curated by role." },
  { n: 2, t: "Add your experience", d: "Type or upload — we structure the rest." },
  { n: 3, t: "Tailor with AI",      d: "Paste a job link, get a JD-matched draft in seconds." },
  { n: 4, t: "Download unlimited",  d: "Free PDF and Word exports, no watermark, no paywall." },
];

const TRUST_PILLS = [
  { icon: Check,        text: "100% free forever" },
  { icon: FilePdf,      text: "Unlimited PDF downloads" },
  { icon: ShieldCheck,  text: "ATS-friendly layouts" },
];

function ResumePageContent() {
  const searchParams = useSearchParams();
  const tailorForJobId = searchParams.get("tailorFor");

  const { getJobById: getPipelineJob } = usePipelineStore();
  const { getJobById: getDiscoveryJob } = useDiscoveryStore();
  const { resumes, getATSScore, duplicateResume } = useResumeStore();
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

  return (
    <div className="w-full pb-20">
      {/* ═════════════ HERO — flowcv "Build a job-winning resume for free" ═════════════ */}
      <section className="doppel-shell mb-10">
        <div className="doppel-core relative z-10 px-6 py-10 md:px-12 md:py-16 bg-white">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/50 text-[10px] font-bold uppercase tracking-widest text-brand-900">
                <Sparkle weight="fill" className="w-3 h-3" />
                Free online resume builder
              </div>
              <h1 className="mt-5 text-4xl md:text-5xl font-light text-brand-900 font-display tracking-tight leading-[1.05]">
                Build a job-winning<br />resume for free
              </h1>
              <p className="mt-5 text-surface-500 text-[15px] md:text-base font-medium max-w-md leading-relaxed">
                Your first resume is 100% free forever. Unlimited downloads, no hidden fees, no watermark. Yes, really.
              </p>

              {/* Trust pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {TRUST_PILLS.map(({ icon: Icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-surface-200/50 text-[11px] font-semibold text-surface-500">
                    <Icon weight="bold" className="w-3.5 h-3.5 text-brand-900" />
                    {text}
                  </span>
                ))}
              </div>

              {/* Two-button hero — flowcv uses "Get started for free" + secondary upload */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#template-gallery"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-md transition-all"
                >
                  <Plus weight="light" className="w-4 h-4" />
                  Get started for free
                </Link>
                <Link
                  href="/dashboard/resume/new"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-surface-500 bg-white border border-surface-200/50 hover:bg-surface-50 transition-all"
                >
                  <UploadSimple weight="light" className="w-4 h-4" />
                  Upload existing
                </Link>
              </div>
            </div>

            {/* 4-step process card */}
            <div className="grid grid-cols-2 gap-3">
              {PROCESS_STEPS.map((s) => (
                <div key={s.n} className="doppel-shell">
                  <div className="doppel-core bg-white p-4 relative z-10">
                    <div className="w-8 h-8 rounded-lg bg-brand-900 text-white flex items-center justify-center text-xs font-bold mb-3">
                      {s.n}
                    </div>
                    <div className="text-[12px] font-bold text-brand-900 uppercase tracking-widest">{s.t}</div>
                    <p className="text-[11px] text-surface-400 font-medium mt-1.5 leading-relaxed">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════ ACTIVE RESUMES (if any) ═════════════ */}
      {resumes.length > 0 && (
        <section className="max-w-6xl mx-auto px-2 mb-12">
          <div className="flex items-end justify-between mb-5 border-b border-surface-200/50 pb-3">
            <div>
              <h2 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                {tailorJob ? "Deployment Ready Bases" : "Your Career Assets"}
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
                return (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="doppel-shell group hover:-translate-y-1 hover:shadow-lg transition-all"
                  >
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

                      {atsScore !== null && (
                        <div className="mb-5 border-t border-surface-200/50 pt-4">
                          <ATSScoreInline score={atsScore} />
                        </div>
                      )}

                      <div className="flex gap-2.5 mt-auto pt-4 border-t border-surface-200/50">
                        {tailorJob ? (
                          <button
                            onClick={() => handleUseAsBase(resume.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-900 text-white hover:bg-brand-800 transition-all"
                          >
                            <Copy weight="bold" className="w-3.5 h-3.5" />
                            Select base
                          </button>
                        ) : (
                          <>
                            <Link href={`/dashboard/resume/${resume.id}`} className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-surface-500 bg-surface-50 border border-surface-200/50 hover:bg-white transition-all">
                              Edit
                            </Link>
                            <Link href={`/dashboard/resume/${resume.id}`} className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-sm">
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
        </section>
      )}

      {/* ═════════════ TEMPLATE GALLERY — the primary UI ═════════════ */}
      <section id="template-gallery" className="max-w-6xl mx-auto px-2 scroll-mt-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-5 border-b border-surface-200/50 pb-3">
          <div>
            <h2 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
              {resumes.length === 0 ? "Choose Your Starting Layout" : "Or Start a New Asset"}
            </h2>
            <p className="text-[12px] text-surface-400/80 mt-1">
              {resumes.length === 0
                ? "Click any layout below — the editor opens with that template pre-selected and a sample persona loaded so you can see it in action."
                : "Browse 9 ATS-aware layouts. Every one is editable and you can switch any time."}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-white border border-surface-200/50 text-[10px] font-bold text-brand-900">
            {visibleTemplates.length} / {TEMPLATE_CONFIGS.length} layouts
          </span>
        </div>

        {/* Category chips — the central interaction of this design */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-6">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  active
                    ? "bg-brand-900 text-white shadow-sm"
                    : "bg-white text-surface-400 border border-surface-200/50 hover:border-surface-300 hover:text-brand-900"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {visibleTemplates.map((tmpl, i) => {
            const persona = TEMPLATE_PERSONAS[tmpl.id];
            return (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04 }}
                className="group"
              >
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
                        <img
                          src={`/images/templates/${tmpl.thumbnail || tmpl.id}.png`}
                          alt={`${tmpl.name} preview`}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="px-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[12px] font-bold text-brand-900 uppercase tracking-widest">{tmpl.name}</h3>
                      {tmpl.tag && !tmpl.pro && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-50 border border-surface-200/50 text-surface-400 font-bold uppercase tracking-widest">
                          {tmpl.tag}
                        </span>
                      )}
                    </div>
                    {persona && (
                      <p className="text-[10px] font-semibold text-surface-500 mt-1.5">
                        <span className="text-brand-900">{persona.name}</span> · {persona.role}
                      </p>
                    )}
                    <p className="text-[11px] text-surface-400 mt-1 leading-relaxed line-clamp-2">{tmpl.desc}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-surface-200/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity px-1">
                    <span className="text-[10px] font-bold text-brand-900 uppercase tracking-widest">Use template</span>
                    <CaretRight weight="light" className="w-4 h-4 text-brand-900 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
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
