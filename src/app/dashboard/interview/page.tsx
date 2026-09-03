"use client";

import Link from "next/link";
import { ArrowRight, Book, ChatCircleText, CaretRight, Cards, Cpu, Star, Sparkle, Trophy } from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

/* ═══════════════════════════════════════════════════
   Interview Prep Hub — overview of all prep activity
   /dashboard/interview
   ═══════════════════════════════════════════════════ */

export default function InterviewPage() {
  const { t, isZh } = useTranslation();
  const jobs = usePipelineStore((s) => s.jobs);  const stories = useInterviewStore((s) => s.stories);
  const mockSessions = useInterviewStore((s) => s.mockSessions);
  const getPrepByJobId = useInterviewStore((s) => s.getPrepByJobId);

  // Jobs eligible for prep: anything active. "Saved" (pre-application)
  // is intentionally included — researching before you apply is the
  // primary use case. Rejected/discarded/archived are excluded.
  const prepJobs = jobs.filter(
    (j) =>
      j.status === "new" ||
      j.status === "evaluated" ||
      j.status === "applied" ||
      j.status === "interviewing" ||
      j.status === "offered"
  );

  // Jobs with existing preps
  const jobsWithPrep = prepJobs.filter((j) => getPrepByJobId(j.id));
  const jobsNeedPrep = prepJobs.filter((j) => !getPrepByJobId(j.id));

  // Recent mock sessions
  const recentMocks = [...mockSessions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Avg mock score
  const completedMocks = mockSessions.filter((m) => m.score !== undefined);
  const avgScore =
    completedMocks.length > 0
      ? completedMocks.reduce((sum, m) => sum + (m.score || 0), 0) / completedMocks.length
      : 0;

  // Human status labels keyed by the real JobStatus vocabulary (the kanban
  // `columns` map uses display names that never match these keys).
  const statusLabel = (status: string): string => {
    const map: Record<string, string> = {
      new: t.pipeline.statusNew,
      evaluated: t.pipeline.statusEvaluated,
      applied: t.pipeline.statusApplied,
      interviewing: t.pipeline.statusInterviewing,
      offered: t.pipeline.statusOffered,
      rejected: t.pipeline.statusRejected,
      discarded: t.pipeline.statusDiscarded,
      archived: t.pipeline.statusArchived,
    };
    return map[status] || status;
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-200">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-surface-400 flex items-center gap-3">
            <Cpu className="w-7 h-7 text-surface-400" />
            {t.interview.title}
          </h1>
          <p className="text-xs text-surface-300 mt-1 font-sans">
            {t.interview.subtitle}
          </p>
        </div>
        <Link
          href="/dashboard/interview/stories"
          className="btn-editorial-secondary inline-flex items-center gap-2"
        >
          <Cards className="w-4 h-4" />
          {t.interview.starStoriesBtn} ({stories.length})
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: t.interview.statsActivePreps,
            value: jobsWithPrep.length,
            icon: Book,
          },
          {
            label: t.interview.statsStories,
            value: stories.length,
            icon: Cards,
          },
          {
            label: t.interview.statsMockSessions,
            value: mockSessions.length,
            icon: ChatCircleText,
          },
          {
            label: t.interview.statsAvgScore,
            value: avgScore > 0 ? avgScore.toFixed(1) : "—",
            icon: Trophy,
          },
        ].map((stat) => (
          <div key={stat.label} className="card-editorial flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-md bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-400">
                <stat.icon weight="regular" className="w-4 h-4" />
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-surface-300" />
            </div>
            <div>
              <p className="text-2xl font-display font-semibold text-surface-400 tabular-nums">{stat.value}</p>
              <p className="text-[10px] font-mono font-medium text-surface-300 uppercase tracking-widest mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Needs Prep Section */}
      {jobsNeedPrep.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400 flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-pastel-yellow-fg" weight="bold" />
            {t.interview.needsPrepSection} ({jobsNeedPrep.length})
          </h2>
          <div className="space-y-2">
            {jobsNeedPrep.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/interview/${job.id}`}
                className="flex items-center justify-between p-3.5 card-editorial group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-pastel-yellow-bg border border-pastel-yellow-fg/20 flex items-center justify-center text-pastel-yellow-fg">
                    <Sparkle weight="bold" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-surface-400 group-hover:text-black transition-colors font-sans">
                      {job.title}
                    </p>
                    <p className="text-[11px] font-mono text-surface-300">
                      {job.company?.name} · {statusLabel(job.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-surface-400 uppercase tracking-wider">
                  <span>{t.interview.generatePrepBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Preps */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400 flex items-center gap-2">
          <Book className="w-4 h-4 text-surface-400" weight="bold" />
          {t.interview.activePackages}
        </h2>
        {jobsWithPrep.length === 0 ? (
          <div className="card-editorial p-8 text-center">
            <Cpu className="w-8 h-8 text-surface-300 mx-auto mb-2" />
            <p className="text-surface-300 text-xs mb-3 font-sans">
              {t.interview.noPackagesDesc}
            </p>
            <Link
              href="/dashboard/pipeline"
              className="text-xs font-mono font-semibold text-surface-400 hover:text-black uppercase tracking-wider inline-flex items-center gap-1"
            >
              {t.interview.goToPipeline} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jobsWithPrep.map((job) => {
              const prep = getPrepByJobId(job.id);
              const jobMocks = mockSessions.filter((m) => m.job_id === job.id);
              const bestScore = jobMocks.length > 0
                ? Math.max(...jobMocks.filter((m) => m.score).map((m) => m.score || 0))
                : null;

              return (
                <Link
                  key={job.id}
                  href={`/dashboard/interview/${job.id}`}
                  className="card-editorial group space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-surface-400 flex items-center justify-center text-xs font-mono font-bold text-surface-0 border border-surface-400">
                        {(job.company?.name || "?").charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-display font-bold text-surface-400 group-hover:text-black transition-colors">
                          {job.title}
                        </p>
                        <p className="text-[11px] font-mono text-surface-300">{job.company?.name}</p>
                      </div>
                    </div>
                    <CaretRight className="w-4 h-4 text-surface-300 group-hover:text-surface-400 transition-colors" />
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-surface-300 pt-2 border-t border-surface-200">
                      {prep && (
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          {prep.questions.length} {t.interview.questionsCount}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <ChatCircleText className="w-3 h-3" />
                        {jobMocks.length} {t.interview.mocksCount}
                      </span>
                      {bestScore && (
                        <span className="eyebrow-tag bg-pastel-green-bg text-pastel-green-fg border border-pastel-green-fg/20 ml-auto">
                          <Star className="w-3 h-3" />
                          {t.interview.bestScore}: {bestScore.toFixed(1)}
                        </span>
                      )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Mock Sessions */}
      {recentMocks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400 flex items-center gap-2">
            <ChatCircleText className="w-4 h-4 text-surface-400" weight="bold" />
            {t.interview.recentMocks}
          </h2>
          <div className="space-y-2">
            {recentMocks.map((mock) => {
              const mockJob = jobs.find((j) => j.id === mock.job_id);
              return (
                <Link
                  key={mock.id}
                  href={mockJob ? `/dashboard/interview/${mockJob.id}/mock?session=${mock.id}` : "#"}
                  className="flex items-center justify-between p-3.5 card-editorial group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-md flex items-center justify-center border",
                      mock.feedback ? "bg-pastel-green-bg text-pastel-green-fg border-pastel-green-fg/20" : "bg-pastel-yellow-bg text-pastel-yellow-fg border-pastel-yellow-fg/20"
                    )}>
                      <Trophy className="w-4 h-4" weight="bold" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-surface-400 font-sans">
                        {mockJob ? mockJob.title : t.interview.mockFallback}
                        {mockJob?.company?.name && ` · ${mockJob.company.name}`}
                      </p>
                      <p className="text-[11px] font-mono text-surface-300">
                        {new Date(mock.created_at).toLocaleDateString(isZh ? "zh-CN" : "en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {mock.duration_seconds &&
                          ` · ${Math.ceil(mock.duration_seconds / 60)} ${t.interview.minLabel}`}
                      </p>
                    </div>
                  </div>
                  {mock.score !== undefined && (
                    <div className="text-right">
                      <p className="text-base font-display font-bold text-surface-400 tabular-nums">
                        {mock.score.toFixed(1)}
                      </p>
                      <p className="text-[9px] font-mono uppercase tracking-wider text-surface-300">{t.pipeline.score}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
