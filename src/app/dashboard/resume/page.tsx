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
  Copy,
  Crown,
  ChevronRight,
  Clock,
  Upload,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/ResumePreview";
import { Suspense } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════
   Resume Studio v3 — Career Asset Management
   ═══════════════════════════════════════════════════ */

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
    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden relative group-hover:scale-[1.05] transition-transform duration-700 shadow-2xl">
      <div className="absolute inset-0 bg-white">
        <div className={cn("h-[20%] bg-gradient-to-r flex items-center px-4", thumb.gradient)}>
          <div className="space-y-1">
            <div className="w-16 h-2 bg-white/80 rounded-full" />
            <div className="w-10 h-1.5 bg-white/40 rounded-full" />
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className={cn("w-14 h-1.5 rounded-full", thumb.accent)} />
          <div className="w-full h-1 bg-gray-100 rounded-full" />
          <div className="w-[85%] h-1 bg-gray-100 rounded-full" />
          <div className="pt-2">
            <div className={cn("w-10 h-1.5 rounded-full", thumb.accent)} />
          </div>
          <div className="w-full h-1 bg-gray-50 rounded-full" />
          <div className="w-[70%] h-1 bg-gray-50 rounded-full" />
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
      ? `Tailored — ${job.company?.name || ""} ${job.title}`.trim()
      : undefined;
    duplicateResume(resumeId, newTitle);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Tailoring Context */}
      {tailorJob && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Link
            href={`/dashboard/pipeline/${tailorJob.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Abort Tailoring
          </Link>

          <div className="liquid-glass rounded-[32px] p-8 border-l-4 border-brand-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full" />
            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl gradient-futuristic flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-brand-500/20">
                {(tailorJob.company?.name || "?").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.2em]">Synthesis Protocol Active</span>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display tracking-tight">{tailorJob.title}</h2>
                <div className="flex items-center gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {tailorJob.company?.name}</span>
                  {tailorJob.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {tailorJob.location}</span>}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-brand-400">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Asset Studio 2.0</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">
            {tailorJob ? "Select Synthesis Base" : "Career Asset Studio"}
          </h1>
          <p className="text-zinc-500 text-base mt-2 font-light">
            {tailorJob ? "Choose an existing asset to deconstruct and re-tailor." : "Orchestrate high-fidelity documents for your next move."}
          </p>
        </div>
        
        {!tailorJob && (
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/resume/new"
              className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/[0.03] border border-border text-zinc-600 dark:text-zinc-300 text-sm font-bold hover:bg-black/10 dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              <Upload className="w-5 h-5" />
              Ingest Node
            </Link>
            <Link
              href="/dashboard/resume/new"
              className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black text-sm font-bold hover:bg-black dark:hover:bg-zinc-100 transition-all shadow-xl shadow-black/5 dark:shadow-white/5"
            >
              <Plus className="w-5 h-5" />
              Initialize Asset
            </Link>
          </div>
        )}
      </div>

      {/* Existing Assets Grid */}
      {resumes.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] ml-1">
            {tailorJob ? "Deployment Ready Bases" : "Active Career Assets"}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, i) => {
              const atsScore = tailorForJobId ? getATSScore(resume.id, tailorForJobId) : null;
              return (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-[32px] p-6 group cursor-default"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform duration-500 group-hover:scale-110",
                      resume.is_base ? "bg-brand-500/10 border border-brand-500/20" : "bg-purple-500/10 border border-purple-500/20"
                    )}>
                      <FileText className={cn("w-6 h-6", resume.is_base ? "text-brand-400" : "text-purple-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-brand-400 transition-colors uppercase tracking-tight">{resume.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest",
                          resume.is_base ? "bg-brand-500/10 text-brand-400" : "bg-purple-500/10 text-purple-400"
                        )}>
                          {resume.is_base ? "Protocol: Base" : "Protocol: Tailored"}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {atsScore !== null && (
                    <div className="mb-6 p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-border">
                      <ATSScoreInline score={atsScore} />
                    </div>
                  )}

                  <div className="flex gap-3 mt-auto">
                    {tailorJob ? (
                      <button
                        onClick={() => handleUseAsBase(resume.id)}
                        className="flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-zinc-200 transition-all shadow-lg"
                      >
                        <Copy className="w-4 h-4" />
                        Select Base
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/dashboard/resume/${resume.id}`}
                          className="flex-1 text-center px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 bg-black/5 dark:bg-white/5 border border-border hover:bg-black/10 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all"
                        >
                          Editing
                        </Link>
                        <Link
                          href={`/dashboard/resume/${resume.id}`}
                          className="flex-1 text-center px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-brand-400 bg-brand-500/5 border border-brand-500/10 hover:bg-brand-500/10 transition-all"
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
        </div>
      )}

      {/* Empty State */}
      {!tailorJob && resumes.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="liquid-glass rounded-[40px] p-16 text-center">
          <div className="w-20 h-20 rounded-[24px] bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Sparkles className="w-10 h-10 text-brand-400" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white font-display mb-4">Initialize Your First Asset</h2>
          <p className="text-zinc-500 text-lg font-light max-w-md mx-auto mb-10 leading-relaxed">
            Choose a synthesis protocol or ingest an existing node to begin mapping your career trajectory.
          </p>
          <Link
            href="/dashboard/resume/new"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-zinc-200 transition-all shadow-2xl shadow-black/5 dark:shadow-white/5"
          >
            <Plus className="w-5 h-5" />
            Begin Initialization
          </Link>
        </motion.div>
      )}

      {/* Template Grid */}
      {!tailorJob && (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">
              Synthesis Protocols (Templates)
            </h3>
            <div className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-border text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              {TEMPLATE_CONFIGS.length} Layouts Available
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {TEMPLATE_CONFIGS.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
              >
                <Link
                  href={`/dashboard/resume/new?template=${tmpl.id}`}
                  className="glass-card rounded-[28px] p-5 cursor-pointer group block relative overflow-hidden"
                >
                  {tmpl.pro && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-black shadow-lg">
                      <Crown className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-tighter">Elite</span>
                    </div>
                  )}

                  <div className="mb-5 perspective-1000">
                    <TemplateThumbnail templateId={tmpl.id} />
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight group-hover:text-brand-400 transition-colors">{tmpl.name}</h4>
                    {tmpl.tag && !tmpl.pro && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 border border-border text-zinc-500 font-bold uppercase tracking-widest">
                        {tmpl.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-snug font-light line-clamp-2">{tmpl.desc}</p>
                  
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">Deploy layout</span>
                    <ChevronRight className="w-4 h-4 text-brand-400" />
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
    <Suspense fallback={<div className="p-12 text-center text-zinc-500 uppercase tracking-widest text-xs font-bold animate-pulse">Syncing Asset Studio...</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
