"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Pulse, ArrowRight, Briefcase, CheckCircle, CaretRight, Compass, FileText, TrendUp, Kanban, Star, Target, Trophy } from '@phosphor-icons/react';
import { useMemo } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useProfileStore } from "@/store/profileStore";
import NeedsTailoringWidget from "@/components/dashboard/NeedsTailoringWidget";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

/* ═══════════════════════════════════════════════════════
   Dashboard Hub — Comprehensive Job Hunt Center
   ═══════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { t, isZh } = useTranslation();
  const getStats = usePipelineStore((s) => s.getStats);
  const weeklyGoalCount = usePipelineStore((s) => s.weeklyGoalCount);
  const setWeeklyGoalCount = usePipelineStore((s) => s.setWeeklyGoalCount);
  const resumes = useResumeStore((s) => s.resumes);
  const discoveredJobs = useDiscoveryStore((s) => s.jobs);
  const discoveredCompanies = useDiscoveryStore((s) => s.companies);
  const stories = useInterviewStore((s) => s.stories);
  const apiKeys = useProfileStore((s) => s.apiKeys);
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
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
      </div>

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

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Needs Tailoring Widget */}
        <div className="lg:col-span-6">
          <NeedsTailoringWidget />
        </div>

        {/* System Onboarding & Weekly Goals */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Circular Onboarding Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card-editorial space-y-4"
          >
            {/* Compute checklist */}
            {(() => {
              const onboardingSteps = [
                {
                  step: t.dashboard.onboarding.stepAddJob,
                  href: "/dashboard/pipeline",
                  done: stats.total > 0,
                },
                {
                  step: t.dashboard.onboarding.stepBuildResume,
                  href: "/dashboard/resume/new",
                  done: resumes.length > 0,
                },
                {
                  step: t.dashboard.onboarding.stepAddStory,
                  href: "/dashboard/interview/stories",
                  done: stories.length > 0,
                },
                {
                  step: t.dashboard.onboarding.stepConfigureAi,
                  href: "/dashboard/settings/api-keys",
                  done: apiKeys.length > 0,
                },
              ];

              const doneCount = onboardingSteps.filter((s) => s.done).length;
              const percent = Math.round((doneCount / onboardingSteps.length) * 100);

              const badgeTitle = (() => {
                if (percent === 100) return t.dashboard.onboarding.badges.pro;
                if (percent >= 75) return t.dashboard.onboarding.badges.explorer;
                if (percent >= 50) return t.dashboard.onboarding.badges.navigator;
                if (percent >= 25) return t.dashboard.onboarding.badges.apprentice;
                return t.dashboard.onboarding.badges.newbie;
              })();

              return (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-surface-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-surface-100 border border-surface-200 flex flex-col items-center justify-center font-mono">
                        <span className="text-xs font-bold text-surface-400">{percent}%</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-surface-400 font-sans">{t.dashboard.onboarding.title}</h3>
                        <p className="text-xs text-surface-300">
                          {doneCount === onboardingSteps.length
                            ? t.dashboard.onboarding.allConfigured
                            : `${onboardingSteps.length - doneCount} ${t.dashboard.onboarding.stepsRemaining}`}
                        </p>
                      </div>
                    </div>
                    <span className="eyebrow-tag border border-surface-200 bg-surface-100 text-surface-400">
                      <Trophy weight="bold" className="w-3 h-3 text-surface-400" />
                      {badgeTitle}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {onboardingSteps.map((item) => (
                      <Link
                        key={item.step}
                        href={item.href}
                        className="flex items-center gap-3 p-2.5 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-100 transition-all group"
                      >
                        <div className={cn(
                          "w-5 h-5 rounded flex items-center justify-center transition-all",
                          item.done 
                            ? "bg-surface-400 text-surface-0" 
                            : "border border-surface-300 text-transparent"
                        )}>
                          {item.done && <CheckCircle className="w-3.5 h-3.5 text-surface-0" weight="bold" />}
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium tracking-tight flex-1",
                            item.done ? "text-surface-300 line-through" : "text-surface-400 group-hover:text-black"
                          )}
                        >
                          {item.step}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-400 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </>
              );
            })()}
          </motion.div>

          {/* Weekly Application Goals Widget */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="card-editorial space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-200">
              <div className="flex items-center gap-2">
                <Target weight="bold" className="w-4 h-4 text-surface-400" />
                <h2 className="text-sm font-semibold text-surface-400 font-sans">{t.dashboard.weeklyGoal.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-surface-300">{t.dashboard.weeklyGoal.target}</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setWeeklyGoalCount(Math.max(1, weeklyGoalCount - 1))}
                    className="w-5 h-5 rounded border border-surface-200 bg-surface-0 flex items-center justify-center font-mono text-xs text-surface-400 hover:bg-surface-100 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono font-bold text-surface-400 min-w-[16px] text-center">{weeklyGoalCount}</span>
                  <button 
                    onClick={() => setWeeklyGoalCount(weeklyGoalCount + 1)}
                    className="w-5 h-5 rounded border border-surface-200 bg-surface-0 flex items-center justify-center font-mono text-xs text-surface-400 hover:bg-surface-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Progress calculation */}
            {(() => {
              const currentGoalProgress = stats.appliedThisWeek;
              const goalPercent = Math.min(100, Math.round((currentGoalProgress / weeklyGoalCount) * 100));

              return (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-display font-semibold text-surface-400">{currentGoalProgress}</span>
                      <span className="text-surface-300 text-xs font-medium ml-1.5">/ {weeklyGoalCount} {t.dashboard.weeklyGoal.appliedCount}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-surface-400">{goalPercent}%</span>
                  </div>

                  {/* Goal Progress bar */}
                  <div className="h-1.5 w-full bg-surface-100 rounded-full overflow-hidden border border-surface-200">
                    <motion.div
                      className="h-full bg-surface-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${goalPercent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-[12px] text-surface-300 font-sans">
                    {currentGoalProgress >= weeklyGoalCount 
                      ? t.dashboard.weeklyGoal.reached 
                      : isZh
                      ? `距离达成目标还需投递 ${weeklyGoalCount - currentGoalProgress} 个职位。`
                      : `Apply to ${weeklyGoalCount - currentGoalProgress} more roles to reach your goal.`}
                  </p>
                </div>
              );
            })()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
