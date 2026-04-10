"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Star,
  Play,
  Loader2,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

/* ═══════════════════════════════════════════════════
   Job Prep Package — company research, role analysis,
   question bank, and mock interview launcher
   /dashboard/interview/[jobId]
   ═══════════════════════════════════════════════════ */

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "text-blue-300 bg-blue-500/10",
  technical: "text-cyan-300 bg-cyan-500/10",
  product: "text-purple-300 bg-purple-500/10",
  situational: "text-amber-300 bg-amber-500/10",
  leadership: "text-emerald-300 bg-emerald-500/10",
  case: "text-rose-300 bg-rose-500/10",
  culture: "text-pink-300 bg-pink-500/10",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  hard: "text-red-400 bg-red-500/10",
};

export default function JobPrepPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const { getJobById } = usePipelineStore();
  const { getPrepByJobId, generateAIPrepForJob, getMocksByJobId } = useInterviewStore();
  const { getProfileSummary } = useProfileStore();

  const job = getJobById(jobId);
  const prep = getPrepByJobId(jobId);
  const mocks = getMocksByJobId(jobId);

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"research" | "questions">("research");
  const [generating, setGenerating] = useState(false);

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="glass rounded-2xl p-12 text-center">
          <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Job not found</h2>
          <p className="text-sm text-gray-500 mb-4">
            This job may have been removed from your pipeline.
          </p>
          <Link
            href="/dashboard/pipeline"
            className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
          >
            ← Back to Pipeline
          </Link>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateAIPrepForJob(
        jobId,
        job.title,
        job.company?.name || "Unknown Company",
        job.description || "",
        getProfileSummary()
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back link */}
      <Link
        href="/dashboard/interview"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Interview Prep
      </Link>

      {/* Job Context Card */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
            {(job.company?.name || "?").charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold mb-1">{job.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
              {job.company?.name && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.company.name}
                </span>
              )}
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
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Generate Prep Package</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
            AI will analyze the job description and generate a comprehensive prep
            package with company research, role analysis, and targeted interview
            questions.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
              generating
                ? "bg-surface-300 text-gray-500 cursor-not-allowed"
                : "gradient-brand text-white hover:opacity-90"
            )}
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate AI Prep Package</>
            )}
          </button>
        </div>
      ) : (
        <>
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 mb-6 bg-surface-100 rounded-xl p-1">
            {[
              { key: "research" as const, label: "Research & Analysis", icon: BookOpen },
              { key: "questions" as const, label: `Questions (${prep.questions.length})`, icon: Brain },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-surface-200 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
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
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <h2 className="text-base font-semibold">Company Research</h2>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-200 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-300 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_ul]:space-y-1 [&_li]:text-sm [&_strong]:text-gray-200">
                    <ReactMarkdown>{prep.company_research}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Role Analysis */}
              {prep.role_analysis && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <h2 className="text-base font-semibold">Role Analysis</h2>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-200 [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-300 [&_h3]:mt-4 [&_h3]:mb-1.5 [&_ul]:space-y-1 [&_li]:text-sm [&_strong]:text-gray-200">
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
                  <div key={q.id} className="glass-hover rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                      className="w-full p-4 text-left flex items-start gap-3"
                    >
                      <span className="text-xs font-mono text-gray-600 mt-0.5 flex-shrink-0 w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 leading-relaxed mb-2">
                          {q.question}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded font-medium capitalize",
                            CATEGORY_COLORS[q.category] || "text-gray-300 bg-gray-500/10"
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
                        <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 ml-9 animate-fade-in">
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <div className="flex items-center gap-1.5 mb-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">
                              Suggested Approach
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-relaxed">
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
          <div className="mt-8 glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-400" />
                <h2 className="text-base font-semibold">Mock Interviews</h2>
              </div>
              <Link
                href={`/dashboard/interview/${jobId}/mock`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Play className="w-3.5 h-3.5" />
                Start Mock
              </Link>
            </div>

            {mocks.length === 0 ? (
              <p className="text-sm text-gray-500">
                No mock interview sessions yet. Start one to practice your answers and get AI feedback.
              </p>
            ) : (
              <div className="space-y-2">
                {mocks.map((m) => (
                  <Link
                    key={m.id}
                    href={`/dashboard/interview/${jobId}/mock?session=${m.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        m.feedback ? "bg-emerald-500/10" : "bg-amber-500/10"
                      )}>
                        <MessageSquare className={cn(
                          "w-4 h-4",
                          m.feedback ? "text-emerald-400" : "text-amber-400"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {m.feedback ? "Completed Session" : "Session in Progress"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(m.created_at).toLocaleDateString("en-US", {
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
                        <p className="text-[10px] text-gray-600">score</p>
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
