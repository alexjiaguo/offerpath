"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowsClockwise, Book, Briefcase, ChatCircleText, CheckCircle, CaretDown, CaretUp, Cpu, WarningCircle, MapPin, Play, Star, Sparkle, Trash } from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useProfileStore } from "@/store/profileStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "@/i18n";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

/* ═══════════════════════════════════════════════════
 Job Prep Package — company research, role analysis,
 question bank, and mock interview launcher
 /dashboard/interview/[jobId]
 ═══════════════════════════════════════════════════ */

const CATEGORY_COLORS: Record<string, string> = {
 behavioral: "text-blue-700 bg-blue-500/10",
 technical: "text-cyan-700 bg-cyan-500/10",
 product: "text-purple-700 bg-purple-500/10",
 situational: "text-amber-700 bg-amber-500/10",
 leadership: "text-emerald-700 bg-emerald-500/10",
 case: "text-rose-700 bg-rose-500/10",
 culture: "text-pink-700 bg-pink-500/10",
};

const DIFFICULTY_STYLES: Record<string, string> = {
 easy: "text-emerald-700 bg-emerald-500/10",
 medium: "text-amber-700 bg-amber-500/10",
 hard: "text-red-700 bg-red-500/10",
};

export default function JobPrepPage({
 params,
}: {
 params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const { t, isZh } = useTranslation();
  const { getJobById } = usePipelineStore();
  const { getPrepByJobId, generatePrepForJob, generateAIPrepForJob, getMocksByJobId, deletePrep } = useInterviewStore();
  const { getProfileSummary } = useProfileStore();

  const job = getJobById(jobId);
  const prep = getPrepByJobId(jobId);
  const mocks = getMocksByJobId(jobId);

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"research" | "questions">("research");
  const [generating, setGenerating] = useState(false);
  const [confirmDeletePrep, setConfirmDeletePrep] = useState(false);

  if (!job) {
  return (
  <div className="w-full animate-fade-in">
  <div className="card-editorial rounded-2xl p-12 text-center">
  <WarningCircle className="w-10 h-10 text-surface-400 mx-auto mb-4" />
  <h2 className="text-lg font-semibold mb-2">{t.interview.prep.jobNotFound}</h2>
  <p className="text-sm text-surface-300 mb-4">
  {t.interview.prep.jobNotFoundDesc}
  </p>
  <Link
  href="/dashboard/pipeline"
  className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
  >
  ← {t.interview.prep.backToPipeline}
  </Link>
  </div>
  </div>
  );
  }

  const companyName = typeof job.company === "string" ? job.company : job.company?.name || t.interview.prep.unknownCompany;

  const handleGenerate = async () => {
  setGenerating(true);
  try {
  const { getLLMConfig } = await import("@/lib/aiService");
  if (getLLMConfig()) {
  await generateAIPrepForJob(
  jobId,
  job.title,
  companyName,
  job.description || "",
  getProfileSummary()
  );
  } else {
  // No API key: fall back to the built-in template prep instead of
  // leaving the user with only an error toast.
  generatePrepForJob(jobId, job.title, companyName, job.description || "");
  toast.info(t.interview.prep.standardPrepNote);
  }
  } catch (err) {
  toast.error(err instanceof Error ? err.message : "Could not generate prep.");
  } finally {
  setGenerating(false);
  }
  };

  const handleDeletePrep = () => {
  deletePrep(jobId);
  setConfirmDeletePrep(false);
  };

 return (
 <div className="w-full animate-fade-in">
 {/* Back link */}
 <Link
 href="/dashboard/interview"
 className="inline-flex items-center gap-1.5 text-sm text-surface-300 hover:text-surface-400 transition-colors mb-4"
 >
  <ArrowLeft className="w-4 h-4" />
  {t.interview.prep.backToPrep}
  </Link>

  {/* Job Context Card */}
  <div className="card-editorial rounded-2xl p-6 mb-6">
  <div className="flex items-start gap-4">
  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-lg font-bold text-surface-400 flex-shrink-0">
  {companyName.charAt(0)}
  </div>
  <div className="flex-1 min-w-0">
  <h1 className="text-xl font-bold mb-1">{job.title}</h1>
  <div className="flex items-center gap-3 text-sm text-surface-300 flex-wrap">
  <span className="flex items-center gap-1">
  <Briefcase className="w-3.5 h-3.5" />
  {companyName}
  </span>
 {job.location && (
 <span className="flex items-center gap-1">
 <MapPin className="w-3.5 h-3.5" />
 {job.location}
 </span>
 )}
 {job.score !== undefined && (
 <span className="flex items-center gap-1">
 <Star className="w-3.5 h-3.5" />
 Score: {job.score.toFixed(1)}
 </span>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* No prep yet — generate */}
 {!prep ? (
 <div className="card-editorial rounded-2xl p-12 text-center">
 <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
 <Sparkle className="w-8 h-8 text-brand-400" />
 </div>
  <h2 className="text-xl font-semibold mb-2">{t.interview.prep.generateTitle}</h2>
  <p className="text-sm text-surface-300 max-w-md mx-auto mb-8">
  {t.interview.prep.generateDesc}
  </p>
  <button
  onClick={handleGenerate}
  disabled={generating}
  className={cn(
  "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
  generating
  ? "bg-surface-300 text-surface-300 cursor-not-allowed"
  : "gradient-brand text-white hover:opacity-90"
  )}
  >
  {generating ? (
  <><ArrowsClockwise className="w-4 h-4 animate-spin" /> {t.interview.prep.generating}</>
  ) : (
  <><Sparkle className="w-4 h-4" /> {t.interview.prep.generateBtn}</>
  )}
  </button>
 </div>
 ) : (
 <>
  {/* Tab Navigation + prep lifecycle */}
  <div className="flex items-center gap-1 mb-6 bg-surface-100 rounded-xl p-1">
  {[
  { key: "research" as const, label: t.interview.prep.researchTab, icon: Book },
  { key: "questions" as const, label: `${t.interview.prep.questionsTab} (${prep.questions.length})`, icon: Cpu },
  ].map((tab) => (
 <button
 key={tab.key}
 onClick={() => setActiveTab(tab.key)}
 className={cn(
 "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
 activeTab === tab.key
 ? "bg-surface-200 text-white shadow-sm"
 : "text-surface-300 hover:text-surface-400"
 )}
 >
 <tab.icon className="w-4 h-4" />
 {tab.label}
 </button>
 ))}
 </div>

 {/* Research Tab */}
 {activeTab === "research" && (
 <div className="space-y-5 animate-fade-in">
 {/* Company Research */}
 {prep.company_research && (
 <div className="card-editorial rounded-2xl p-6">
 <div className="flex items-center gap-2 mb-4">
  <Book className="w-5 h-5 text-blue-400" />
  <h2 className="text-base font-semibold">{t.interview.prep.companyResearch}</h2>
 </div>
 <div className="prose prose-invert prose-sm max-w-none text-surface-400 leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-surface-400 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-surface-400 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_ul]:space-y-1 [&_li]:text-sm [&_strong]:text-surface-400">
 <ReactMarkdown>{prep.company_research}</ReactMarkdown>
 </div>
 </div>
 )}

 {/* Role Analysis */}
 {prep.role_analysis && (
 <div className="card-editorial rounded-2xl p-6">
 <div className="flex items-center gap-2 mb-4">
  <Cpu className="w-5 h-5 text-purple-400" />
  <h2 className="text-base font-semibold">{t.interview.prep.roleAnalysis}</h2>
 </div>
 <div className="prose prose-invert prose-sm max-w-none text-surface-400 leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-surface-400 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-surface-400 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_ul]:space-y-1 [&_li]:text-sm [&_strong]:text-surface-400">
 <ReactMarkdown>{prep.role_analysis}</ReactMarkdown>
 </div>
 </div>
 )}
 </div>
 )}

 {/* Questions Tab */}
 {activeTab === "questions" && (
 <div className="space-y-3 animate-fade-in">
 {prep.questions.map((q, i) => {
 const isExpanded = expandedQuestion === q.id;
 return (
 <div key={q.id} className="card-editorial rounded-xl overflow-hidden">
 <button
 onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
 className="w-full p-4 text-left flex items-start gap-3"
 >
 <span className="text-xs font-mono text-surface-400 mt-0.5 flex-shrink-0 w-6">
 {String(i + 1).padStart(2, "0")}
 </span>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-surface-400 leading-relaxed mb-2">
 {q.question}
 </p>
 <div className="flex items-center gap-2">
 <span className={cn(
 "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize",
 CATEGORY_COLORS[q.category] || "text-surface-400 bg-surface-300/10"
 )}>
 {q.category}
 </span>
 <span className={cn(
 "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize",
 DIFFICULTY_STYLES[q.difficulty]
 )}>
 {q.difficulty}
 </span>
 </div>
 </div>
 {isExpanded ? (
 <CaretUp className="w-4 h-4 text-surface-300 flex-shrink-0 mt-0.5" />
 ) : (
 <CaretDown className="w-4 h-4 text-surface-300 flex-shrink-0 mt-0.5" />
 )}
 </button>

 {isExpanded && (
 <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 ml-9 animate-fade-in">
 <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
 <div className="flex items-center gap-1.5 mb-2">
 <CheckCircle className="w-3.5 h-3.5 text-emerald-400" weight="fill" />
  <span className="text-xs font-semibold text-emerald-400">
  {t.interview.prep.suggestedApproach}
  </span>
 </div>
 <p className="text-sm text-surface-400 leading-relaxed">
 {q.suggested_answer}
 </p>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}

  {/* Mock Interview Section */}
  <div className="mt-8 card-editorial rounded-2xl p-6">
  <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
  <ChatCircleText className="w-5 h-5 text-brand-400" />
  <h2 className="text-base font-semibold">{t.interview.prep.mockTitle}</h2>
  </div>
  <div className="flex items-center gap-2">
  <button
  onClick={handleGenerate}
  disabled={generating}
  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-surface-300 hover:text-surface-400 hover:bg-surface-0/[0.04] border border-surface-200 transition-all disabled:opacity-50"
  title={t.interview.prep.regenerate}
  >
  <ArrowsClockwise className={cn("w-3.5 h-3.5", generating && "animate-spin")} />
  {t.interview.prep.regenerate}
  </button>
  <button
  onClick={() => setConfirmDeletePrep(true)}
  className="p-2 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-500/10 transition-all"
  title={t.interview.prep.deletePrep}
  aria-label={t.interview.prep.deletePrep}
  >
  <Trash className="w-4 h-4" />
  </button>
  <Link
  href={`/dashboard/interview/${jobId}/mock`}
  className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
  >
  <Play className="w-3.5 h-3.5" weight="fill" />
  {t.interview.prep.startMock}
  </Link>
  </div>
  </div>
  <ConfirmDialog
  open={confirmDeletePrep}
  title={t.interview.prep.deletePrep}
  message={t.interview.prep.deletePrepConfirm}
  onConfirm={handleDeletePrep}
  onCancel={() => setConfirmDeletePrep(false)}
  />

  {mocks.length === 0 ? (
  <p className="text-sm text-surface-300">
  {t.interview.prep.noMocks}
  </p>
 ) : (
 <div className="space-y-2">
 {mocks.map((m) => (
 <Link
 key={m.id}
 href={`/dashboard/interview/${jobId}/mock?session=${m.id}`}
 className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-0/[0.03] transition-all group"
 >
 <div className="flex items-center gap-3">
 <div className={cn(
 "w-8 h-8 rounded-lg flex items-center justify-center",
 m.feedback ? "bg-emerald-500/10" : "bg-amber-500/10"
 )}>
 <ChatCircleText className={cn(
 "w-4 h-4",
 m.feedback ? "text-emerald-400" : "text-amber-400"
 )} />
 </div>
 <div>
  <p className="text-sm font-medium">
  {m.feedback ? t.interview.prep.completedSession : t.interview.prep.inProgressSession}
  </p>
 <p className="text-xs text-surface-300">
  {new Date(m.created_at).toLocaleDateString(isZh ? "zh-CN" : "en-US", {
  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  })}
 {m.duration_seconds && ` · ${Math.ceil(m.duration_seconds / 60)} min`}
 </p>
 </div>
 </div>
 {m.score !== undefined && (
 <div className="text-right">
 <p className="text-lg font-bold text-brand-400">
 {m.score.toFixed(1)}
 </p>
  <p className="text-[10px] text-surface-400">{t.interview.prep.scoreLabel}</p>
 </div>
 )}
 </Link>
 ))}
 </div>
 )}
 </div>
 </>
 )}
 </div>
 );
}
