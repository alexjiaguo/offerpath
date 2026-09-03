"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Briefcase, CaretRight, Clock, Copy, FileText, MapPin, Plus, Star, Sparkle, Trash, UploadSimple } from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import Image from "next/image";

function TemplateThumbnail({ templateId, thumbnail }: { templateId: string; thumbnail?: string }) {
  return (
    <div className="w-full aspect-[816/1056] rounded-md border border-surface-200 overflow-hidden relative transition-all duration-200 group-hover:border-surface-400">
      <Image
        src={`/images/templates/${thumbnail || templateId}.png`}
        alt={`${templateId} thumbnail`}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        className="object-cover object-top"
      />
    </div>
  );
}

function ResumePageContent() {
  const { t, isZh } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tailorForJobId = searchParams.get("tailorFor");

  const { getJobById: getPipelineJob } = usePipelineStore();
  const { getJobById: getDiscoveryJob } = useDiscoveryStore();
  const { resumes, getATSScoreView, duplicateResume, deleteResume } = useResumeStore();
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
    const newTitle = [tailorJob.company?.name, tailorJob.title].filter(Boolean).join(" — ");
    // duplicateResume returns the new id — take the user straight to the
    // tailored copy instead of silently dropping it into the list.
    const newId = duplicateResume(resumeId, newTitle);
    if (newId) {
      toast.success(isZh ? `已创建定制副本：${newTitle}` : `Tailored copy created: ${newTitle}`);
      router.push(`/dashboard/resume/${newId}`);
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const targetResume = confirmDeleteId ? resumes.find((r) => r.id === confirmDeleteId) : null;
  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteResume(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Tailoring Context */}
      {tailorJob && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
          <Link
            href={tailorJob.source === "discovery" ? `/dashboard/discover/${tailorJob.id}` : `/dashboard/pipeline/${tailorJob.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-surface-400 hover:text-black transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft weight="bold" className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            {t.common.back}
          </Link>

          <div className="card-editorial flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-md bg-surface-400 flex items-center justify-center text-xl font-display font-bold text-surface-0 flex-shrink-0">
              {(tailorJob.company?.name || "?").charAt(0)}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="eyebrow-tag bg-pastel-yellow-bg text-pastel-yellow-fg border border-pastel-yellow-fg/20">
                  <Sparkle weight="bold" className="w-3 h-3" />
                  {t.resume.tailoringBanner}
                </span>
              </div>
              <h2 className="text-xl font-display font-bold text-surface-400 leading-snug">{tailorJob.title}</h2>
              <div className="flex items-center gap-4 text-xs font-mono text-surface-300">
                <span className="flex items-center gap-1"><Briefcase weight="bold" className="w-3.5 h-3.5" /> {tailorJob.company?.name}</span>
                {tailorJob.location && <span className="flex items-center gap-1"><MapPin weight="bold" className="w-3.5 h-3.5" /> {tailorJob.location}</span>}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-surface-200 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-surface-400">
            {tailorJob ? t.resume.chooseToTailor : t.resume.title}
          </h1>
          <p className="text-surface-300 text-xs mt-1">
            {tailorJob ? t.resume.chooseToTailorDesc : t.resume.subtitle}
          </p>
        </div>
        
        {!tailorJob && (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/resume/new"
              className="btn-editorial-secondary inline-flex items-center gap-2"
            >
              <UploadSimple weight="bold" className="w-3.5 h-3.5" />
              {t.resume.uploadBtn}
            </Link>
            <Link
              href="/dashboard/resume/new"
              className="btn-editorial-primary inline-flex items-center gap-2"
            >
              <Plus weight="bold" className="w-3.5 h-3.5" />
              {t.resume.createBtn}
            </Link>
          </div>
        )}
      </div>

      {/* Existing Assets Grid */}
      {resumes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
            {tailorJob ? (isZh ? "可用于定制的基础简历" : "Resumes you can tailor") : (isZh ? "我的简历库" : "Your resumes")}
          </h3>
          {filteredResumes.length === 0 ? (
            <div className="card-editorial p-10 text-center">
              <p className="text-xs font-mono text-surface-300">
                {isZh ? `未找到匹配 “${searchQuery}” 的简历` : `No resumes matching "${searchQuery}" found.`}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResumes.map((resume, i) => {
                const atsScore = tailorForJobId ? getATSScoreView(resume.id, tailorForJobId) : null;
                return (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-editorial flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-md border flex items-center justify-center flex-shrink-0",
                        resume.is_base ? "bg-surface-400 text-surface-0 border-surface-400" : "bg-surface-100 text-surface-400 border-surface-200"
                      )}>
                        <FileText weight="bold" className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h4 className="text-sm font-display font-bold text-surface-400 truncate group-hover:text-black">{resume.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "eyebrow-tag border",
                            resume.is_base ? "bg-pastel-blue-bg text-pastel-blue-fg border-pastel-blue-fg/20" : "bg-surface-100 text-surface-400 border-surface-200"
                          )}>
                            {resume.is_base ? (isZh ? "主简历" : "Master") : (isZh ? "定制版" : "Version")}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-mono text-surface-300">
                            <Clock weight="bold" className="w-3 h-3" />
                            {new Date(resume.updated_at).toLocaleDateString(isZh ? "zh-CN" : "en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {atsScore !== null && (
                      <div className="border-t border-surface-200 pt-3">
                        <ATSScoreInline score={atsScore} />
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-surface-200">
                      {tailorJob ? (
                        <button
                          onClick={() => handleUseAsBase(resume.id)}
                          className="btn-editorial-primary flex-1 flex items-center justify-center gap-1.5"
                        >
                          <Copy weight="bold" className="w-3.5 h-3.5" />
                          {t.resume.useAsBase}
                        </button>
                      ) : (
                        <>
                          <Link
                            href={`/dashboard/resume/${resume.id}`}
                            className="btn-editorial-secondary flex-1 text-center"
                          >
                            {t.resume.editBtn}
                          </Link>
                          <Link
                            href={`/dashboard/resume/${resume.id}`}
                            className="btn-editorial-primary flex-1 text-center"
                          >
                            {t.resume.previewBtn}
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteId(resume.id)}
                            className="p-2 rounded-md text-surface-300 hover:text-red-600 hover:bg-red-50 transition-all"
                            title={t.resume.deleteBtn}
                            aria-label={t.resume.deleteBtn}
                          >
                            <Trash weight="bold" className="w-4 h-4" />
                          </button>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-editorial max-w-xl mx-auto p-10 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-md bg-surface-100 border border-surface-200 flex items-center justify-center mb-4">
            <Sparkle weight="bold" className="w-7 h-7 text-surface-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-surface-400 mb-2">{t.resume.noResumesTitle}</h2>
          <p className="text-surface-300 text-xs max-w-md mx-auto mb-6">
            {t.resume.noResumesDesc}
          </p>
          <Link
            href="/dashboard/resume/new"
            className="btn-editorial-primary inline-flex items-center gap-2"
          >
            <Plus weight="bold" className="w-4 h-4" />
            {t.resume.createBtn}
          </Link>
        </motion.div>
      )}

      {/* Template Grid */}
      {!tailorJob && (
        <div className="space-y-6 pt-6 border-t border-surface-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
              {t.resume.templatesTitle}
            </h3>
            <span className="eyebrow-tag bg-surface-100 text-surface-400 border border-surface-200">
              {TEMPLATE_CONFIGS.length} {t.resume.templatesBadge}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEMPLATE_CONFIGS.map((tmpl, i) => {
              const camelKey = tmpl.id.replace(/-([a-z])/g, (_, g) => g.toUpperCase()) as keyof typeof t.resumeStudio.templateNames;
              const tmplName = t.resumeStudio?.templateNames?.[camelKey] || tmpl.name;
              const tmplDesc = t.resumeStudio?.templateDescs?.[camelKey] || tmpl.desc;
              const tagKey = tmpl.tag?.toLowerCase() as keyof typeof t.resumeStudio.templateTags;
              const tmplTag = tmpl.tag ? (t.resumeStudio?.templateTags?.[tagKey] || tmpl.tag) : undefined;

              return (
                <motion.div
                  key={tmpl.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  className="group cursor-pointer"
                >
                  <Link
                    href={`/dashboard/resume/new?template=${tmpl.id}`}
                    className="card-editorial block space-y-3"
                  >
                    <div className="relative rounded-md overflow-hidden border border-surface-200">
                      {tmpl.pro && (
                        <div className="absolute top-2 right-2 z-20 eyebrow-tag bg-surface-400 text-surface-0 border-none">
                          <Star weight="fill" className="w-2.5 h-2.5" />
                          PRO
                        </div>
                      )}
                      <TemplateThumbnail templateId={tmpl.id} thumbnail={tmpl.thumbnail} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-display font-bold text-surface-400 group-hover:text-black">{tmplName}</h4>
                        {tmplTag && !tmpl.pro && (
                          <span className="eyebrow-tag bg-surface-100 text-surface-300 border border-surface-200">
                            {tmplTag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-surface-300 line-clamp-2 leading-normal">{tmplDesc}</p>
                    </div>
                    
                    <div className="pt-2 border-t border-surface-200 flex items-center justify-between text-xs font-semibold text-surface-400 uppercase tracking-wider group-hover:text-black">
                      <span className="text-[10px] font-mono">{t.resume.useTemplate}</span>
                      <CaretRight weight="bold" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && targetResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="card-editorial w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
                <Trash weight="bold" className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-display font-bold text-surface-400">{t.resume.confirmDeleteTitle}</h3>
            </div>
            <p className="text-xs text-surface-300 mb-5 leading-relaxed">
              <span className="font-mono font-bold text-surface-400">&ldquo;{targetResume.title}&rdquo;</span> {t.resume.confirmDeleteDesc}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="btn-editorial-secondary flex-1"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-md text-sm font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-all"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  const { isZh } = useTranslation();
  return (
    <Suspense fallback={<div className="p-12 text-center text-surface-300 font-mono uppercase tracking-widest text-[10px] animate-pulse">{isZh ? "正在加载简历库..." : "Loading resumes…"}</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
