"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pulse, Briefcase, CaretRight, Compass, FileText, TrendUp, Kanban, Star, Target } from '@phosphor-icons/react';
import { useMemo } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import NeedsTailoringWidget from "@/components/dashboard/NeedsTailoringWidget";
import OnboardingChecklistWidget from "@/components/dashboard/OnboardingChecklistWidget";
import { useTranslation } from "@/i18n";

/* ═══════════════════════════════════════════════════════
   Dashboard Hub — Comprehensive Job Hunt Center
   ═══════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { t } = useTranslation();
  const getStats = usePipelineStore((s) => s.getStats);
  const weeklyGoalCount = usePipelineStore((s) => s.weeklyGoalCount);
  const setWeeklyGoalCount = usePipelineStore((s) => s.setWeeklyGoalCount);
  const resumes = useResumeStore((s) => s.resumes);
  const discoveredJobs = useDiscoveryStore((s) => s.jobs);
  const discoveredCompanies = useDiscoveryStore((s) => s.companies);
  const getJobsNeedingResume = usePipelineStore((s) => s.getJobsNeedingResume);
  const hasNeedsTailoring = getJobsNeedingResume().length > 0;
  const stats = getStats();

  const baseResumes = resumes.filter((r) => r.is_base).length;
  const tailoredResumes = resumes.filter((r) => !r.is_base).length;

  const MODULE_CARDS = useMemo(() => [
    {
      title: t.dashboard.modules.tracker.title,
      desc: t.dashboard.modules.tracker.desc,
      icon: Kanban,
      href: "/dashboard/pipeline",
      stats: [
        { label: t.dashboard.modules.tracker.activeJobs, value: String(stats.total) },
        { label: t.dashboard.modules.tracker.interviews, value: String(stats.byStatus?.interviewing || 0) },
      ],
      cta: t.dashboard.modules.tracker.cta,
    },
    {
      title: t.dashboard.modules.resumes.title,
      desc: t.dashboard.modules.resumes.desc,
      icon: FileText,
      href: "/dashboard/resume",
      stats: [
        { label: t.dashboard.modules.resumes.totalResumes, value: String(baseResumes + tailoredResumes) },
        { label: t.dashboard.modules.resumes.versions, value: String(tailoredResumes) },
      ],
      cta: t.dashboard.modules.resumes.cta,
    },
    {
      title: t.dashboard.modules.discovery.title,
      desc: t.dashboard.modules.discovery.desc,
      icon: Compass,
      href: "/dashboard/discover",
      stats: [
        { label: t.dashboard.modules.discovery.jobs, value: String(discoveredJobs.filter(j => !j.dismissed).length) },
        { label: t.dashboard.modules.discovery.companies, value: String(discoveredCompanies.length) },
      ],
      cta: t.dashboard.modules.discovery.cta,
    },
  ], [t, stats, baseResumes, tailoredResumes, discoveredJobs, discoveredCompanies]);

  const QUICK_STATS = useMemo(() => [
    { label: t.dashboard.stats.totalJobs, value: String(stats.total), icon: Briefcase },
    {
      label: t.dashboard.stats.successRate,
      value: stats.interviewRate > 0 ? `${stats.interviewRate.toFixed(1)}%` : "—",
      icon: TrendUp,
    },
    {
      label: t.dashboard.stats.averageScore,
      value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—",
      icon: Star,
    },
    {
      label: t.dashboard.stats.addedThisWeek,
      value: `+${stats.addedThisWeek}`,
      icon: Pulse,
    },
  ], [t, stats]);

  return (
    <div className="w-full space-y-8 pb-12">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-200">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="eyebrow-tag text-surface-300">{t.dashboard.systemStatus}</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-surface-400">{t.dashboard.welcomeGreeting}</h1>
          <p className="text-surface-300 text-xs mt-1">
            {t.dashboard.searchAtGlance}
          </p>
        </motion.div>
      </div>

      {/* Quick Stats & Weekly Goal Grid (5 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {QUICK_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="card-editorial flex flex-col justify-between gap-3"
          >
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
          </motion.div>
        ))}

        {/* 5th Card: Weekly Application Goal */}
        {(() => {
          const currentGoalProgress = stats.appliedThisWeek;
          const goalPercent = Math.min(100, Math.round((currentGoalProgress / weeklyGoalCount) * 100));

          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="card-editorial flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-md bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-400">
                  <Target weight="regular" className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 bg-surface-50 px-1 py-0.5 rounded border border-surface-200">
                  <button
                    type="button"
                    onClick={() => setWeeklyGoalCount(Math.max(1, weeklyGoalCount - 1))}
                    className="w-4 h-4 rounded text-surface-300 hover:text-surface-400 hover:bg-surface-200/50 flex items-center justify-center text-[10px] font-mono transition-colors"
                    aria-label="Decrease goal"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono font-bold text-surface-400 min-w-[14px] text-center">
                    {weeklyGoalCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setWeeklyGoalCount(weeklyGoalCount + 1)}
                    className="w-4 h-4 rounded text-surface-300 hover:text-surface-400 hover:bg-surface-200/50 flex items-center justify-center text-[10px] font-mono transition-colors"
                    aria-label="Increase goal"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-display font-semibold text-surface-400 tabular-nums">
                    {currentGoalProgress}{" "}
                    <span className="text-xs font-normal text-surface-300">
                      / {weeklyGoalCount}
                    </span>
                  </p>
                  <span className="text-[10px] font-mono font-bold text-surface-400">
                    {goalPercent}%
                  </span>
                </div>

                {/* Compact Progress bar */}
                <div className="h-1 w-full bg-surface-100 rounded-full overflow-hidden my-1.5 border border-surface-200">
                  <div
                    className="h-full bg-surface-400 rounded-full transition-all duration-500"
                    style={{ width: `${goalPercent}%` }}
                  />
                </div>

                <p className="text-[10px] font-mono font-medium text-surface-300 uppercase tracking-widest">
                  {t.dashboard.weeklyGoal.title}
                </p>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* Onboarding Checklist (Clean standalone full-width card; auto-hides when 100% complete or dismissed) */}
      <OnboardingChecklistWidget />

      {/* Primary Modules */}
      <div className="grid md:grid-cols-3 gap-4">
        {MODULE_CARDS.map((mod, i) => (
          <motion.div
            key={mod.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + (i * 0.05) }}
            className="card-editorial flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-md bg-surface-400 text-surface-0 flex items-center justify-center">
                <mod.icon weight="regular" className="w-4.5 h-4.5" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-display font-bold text-surface-400 group-hover:text-black">
                {mod.title}
              </h3>
              <p className="text-xs text-surface-300 mt-1 leading-normal">{mod.desc}</p>
            </div>

            <div className="flex gap-6 pt-3 border-t border-surface-200">
              {mod.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-lg font-display font-semibold text-surface-400">{s.value}</p>
                  <p className="text-[10px] font-mono font-medium text-surface-300 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href={mod.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-surface-400 uppercase tracking-wider hover:text-black transition-colors"
              >
                {mod.cta}
                <CaretRight weight="bold" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Needs Tailoring Alert Widget — Only shown when active opportunities require resumes */}
      {hasNeedsTailoring && (
        <NeedsTailoringWidget />
      )}
    </div>
  );
}
