"use client";

import Link from "next/link";
import {
  BookOpen,
  Library,
  MessageSquare,
  Brain,
  Sparkles,
  ChevronRight,
  Star,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   Interview Prep Hub — overview of all prep activity
   /dashboard/interview
   ═══════════════════════════════════════════════════ */

export default function InterviewPage() {
  const { jobs } = usePipelineStore();
  const { stories, mockSessions, getPrepByJobId } = useInterviewStore();

  // Jobs that should have prep (interviewing or applied)
  const prepJobs = jobs.filter(
    (j) =>
      j.status === "interviewing" ||
      j.status === "applied" ||
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

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 mb-1">
            <Brain className="w-7 h-7 text-brand-400" />
            Interview Prep
          </h1>
          <p className="text-sm text-zinc-500 dark:text-gray-500">
            Prepare for interviews with AI-powered research, question banks, and mock sessions.
          </p>
        </div>
        <Link
          href="/dashboard/interview/stories"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-200 text-zinc-700 dark:text-gray-300 text-sm font-medium hover:text-white hover:bg-surface-300 transition-all"
        >
          <Library className="w-4 h-4" />
          Story Bank ({stories.length})
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Active Preps",
            value: jobsWithPrep.length,
            icon: BookOpen,
            color: "text-blue-400",
          },
          {
            label: "STAR Stories",
            value: stories.length,
            icon: Library,
            color: "text-purple-400",
          },
          {
            label: "Mock Sessions",
            value: mockSessions.length,
            icon: MessageSquare,
            color: "text-emerald-400",
          },
          {
            label: "Avg Score",
            value: avgScore > 0 ? avgScore.toFixed(1) : "—",
            icon: Trophy,
            color: "text-amber-400",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <span className="text-xs text-zinc-500 dark:text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Needs Prep Section */}
      {jobsNeedPrep.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Needs Prep ({jobsNeedPrep.length})
          </h2>
          <div className="space-y-2">
            {jobsNeedPrep.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/interview/${job.id}`}
                className="flex items-center justify-between p-4 glass-hover rounded-xl group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-brand-300 transition-colors">
                      {job.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-gray-500">
                      {job.company?.name} · {job.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">Generate Prep</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active Preps */}
      <div className="mb-8">
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          Active Prep Packages
        </h2>
        {jobsWithPrep.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <Brain className="w-10 h-10 text-zinc-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-zinc-500 dark:text-gray-500 text-sm mb-4">
              No prep packages yet. Move jobs to &quot;Applied&quot; or &quot;Interviewing&quot; and generate a prep package.
            </p>
            <Link
              href="/dashboard/pipeline"
              className="text-sm text-brand-400 hover:text-brand-300"
            >
              Go to Pipeline →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
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
                  className="glass-hover rounded-xl p-5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-400 flex items-center justify-center text-sm font-bold text-white">
                        {(job.company?.name || "?").charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold group-hover:text-brand-300 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-gray-500">{job.company?.name}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-gray-600 group-hover:text-brand-400 transition-colors" />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-gray-500">
                    {prep && (
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {prep.questions.length} questions
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {jobMocks.length} mocks
                    </span>
                    {bestScore && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Star className="w-3 h-3" />
                        Best: {bestScore.toFixed(1)}
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
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Recent Mock Sessions
          </h2>
          <div className="space-y-2">
            {recentMocks.map((mock) => {
              const mockJob = jobs.find((j) => j.id === mock.job_id);
              return (
                <Link
                  key={mock.id}
                  href={mockJob ? `/dashboard/interview/${mockJob.id}/mock?session=${mock.id}` : "#"}
                  className="flex items-center justify-between p-4 glass-hover rounded-xl group"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      mock.feedback ? "bg-emerald-500/10" : "bg-amber-500/10"
                    )}>
                      <Trophy className={cn(
                        "w-5 h-5",
                        mock.feedback ? "text-emerald-400" : "text-amber-400"
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {mockJob ? mockJob.title : "Mock Interview"}
                        {mockJob?.company?.name && ` · ${mockJob.company.name}`}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-gray-500">
                        {new Date(mock.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {mock.duration_seconds &&
                          ` · ${Math.ceil(mock.duration_seconds / 60)} min`}
                      </p>
                    </div>
                  </div>
                  {mock.score !== undefined && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-brand-400">
                        {mock.score.toFixed(1)}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-gray-600">score</p>
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
