"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BsActivity, BsArrowRight, BsBriefcase, BsCheckCircleFill, BsChevronRight, BsCompass, BsFileEarmarkText, BsGraphUp, BsKanban, BsPlus, BsStar, BsBullseye, BsTrophy } from 'react-icons/bs';
import { useMemo } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useProfileStore } from "@/store/profileStore";
import NeedsTailoringWidget from "@/components/dashboard/NeedsTailoringWidget";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
   Dashboard Hub v3 — Comprehensive Job Hunt Center
   ═══════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { getStats, weeklyGoalCount, setWeeklyGoalCount } = usePipelineStore();
  const { resumes } = useResumeStore();
  const { jobs: discoveredJobs, companies: discoveredCompanies } = useDiscoveryStore();
  const { stories } = useInterviewStore();
  const { apiKeys } = useProfileStore();
  const stats = getStats();

  const baseResumes = resumes.filter((r) => r.is_base).length;
  const tailoredResumes = resumes.filter((r) => !r.is_base).length;

  const MODULE_CARDS = useMemo(() => [
    {
      title: "Job Pipeline",
      desc: "Manage and track your active job applications",
      icon: BsKanban,
      href: "/dashboard/pipeline",
      color: "oklch(0.6 0.15 256)",
      stats: [
        { label: "Active Jobs", value: String(stats.total) },
        { label: "Interviews", value: String(stats.byStatus?.interviewing || 0) },
      ],
      cta: "Open Pipeline",
    },
    {
      title: "Resume Studio",
      desc: "Create and tailor high-impact resumes",
      icon: BsFileEarmarkText,
      href: "/dashboard/resume",
      color: "oklch(0.5 0.22 280)",
      stats: [
        { label: "Total Resumes", value: String(baseResumes + tailoredResumes) },
        { label: "Tailored", value: String(tailoredResumes) },
      ],
      cta: "Open Studio",
    },
    {
      title: "Job Discovery",
      desc: "Scan for new opportunities across platforms",
      icon: BsCompass,
      href: "/dashboard/discover",
      color: "oklch(0.6 0.2 310)",
      stats: [
        { label: "Leads", value: String(discoveredJobs.filter(j => !j.dismissed).length) },
        { label: "Companies", value: String(discoveredCompanies.length) },
      ],
      cta: "Discover Jobs",
    },
  ], [stats, baseResumes, tailoredResumes, discoveredJobs, discoveredCompanies]);

  const QUICK_STATS = useMemo(() => [
    { label: "Total Jobs", value: String(stats.total), icon: BsBriefcase },
    {
      label: "Success Rate",
      value: stats.interviewRate > 0 ? `${stats.interviewRate.toFixed(1)}%` : "—",
      icon: BsGraphUp,
    },
    {
      label: "Average Score",
      value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—",
      icon: BsStar,
    },
    {
      label: "Added This Week",
      value: `+${stats.addedThisWeek}`,
      icon: BsActivity,
    },
  ], [stats]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-2 text-brand-400">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Status: Active</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">Dashboard</h1>
          <p className="text-zinc-500 text-base mt-2 font-light">
            Welcome back. Your job hunt is progressing well.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/dashboard/pipeline/add"
            className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white text-black text-sm font-bold hover:bg-zinc-100 transition-all shadow-xl shadow-white/5"
          >
            <BsPlus className="w-5 h-5" />
            Add New Job
          </Link>
        </motion.div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {QUICK_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="liquid-glass rounded-3xl p-6 flex flex-col gap-4 group cursor-default"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/20 transition-colors">
                <stat.icon className="w-5 h-5 text-zinc-500 group-hover:text-brand-400 transition-colors" />
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700 group-hover:bg-brand-500 group-hover:animate-pulse transition-colors" />
            </div>
            <div>
              <p className="text-3xl font-light text-zinc-900 dark:text-white font-display tabular-nums tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-900 dark:hover:text-zinc-400 transition-colors">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Primary Modules */}
      <div className="grid lg:grid-cols-3 gap-8">
        {MODULE_CARDS.map((mod, i) => (
          <motion.div
            key={mod.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
            className="glass-card rounded-[32px] p-8 flex flex-col group"
          >
            <div className="flex items-start justify-between mb-8">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                style={{ background: `linear-gradient(135deg, ${mod.color}, oklch(0.4 0.1 256))` }}
              >
                <mod.icon className="w-6 h-6 text-zinc-900 dark:text-white" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-2.5 py-1 rounded-full bg-white/5 border border-zinc-200 dark:border-white/10 text-[9px] font-bold text-zinc-700 dark:text-zinc-400 uppercase tracking-widest">
                  Live Update
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2 font-display text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {mod.title}
            </h3>
            <p className="text-sm text-zinc-500 mb-8 font-light leading-relaxed">{mod.desc}</p>

            <div className="flex gap-10 mb-8">
              {mod.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-light text-zinc-900 dark:text-white font-display">{s.value}</p>
                  <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <Link
                href={mod.href}
                className="group/btn flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-300 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-all"
              >
                {mod.cta}
                <BsChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Needs Tailoring Widget */}
        <div className="lg:col-span-7">
          <NeedsTailoringWidget />
        </div>

        {/* System Onboarding & Weekly Goals */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Circular Onboarding Checklist */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="liquid-glass rounded-[32px] p-8"
          >
            {/* Compute checklist */}
            {(() => {
              const onboardingSteps = [
                {
                  step: "Add your first job application",
                  href: "/dashboard/pipeline",
                  done: stats.total > 0,
                },
                {
                  step: "Build your base resume",
                  href: "/dashboard/resume/new",
                  done: resumes.length > 0,
                },
                {
                  step: "Add your first interview story",
                  href: "/dashboard/interview/stories",
                  done: stories.length > 0,
                },
                {
                  step: "Configure your AI settings",
                  href: "/dashboard/settings/api-keys",
                  done: apiKeys.length > 0,
                },
              ];

              const doneCount = onboardingSteps.filter((s) => s.done).length;
              const percent = Math.round((doneCount / onboardingSteps.length) * 100);

              const badgeTitle = (() => {
                if (percent === 100) return "Dream Hunter Pro";
                if (percent >= 75) return "Interview Explorer";
                if (percent >= 50) return "SaaS Navigator";
                if (percent >= 25) return "Tracker Apprentice";
                return "Career Newbie";
              })();

              return (
                <>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-zinc-200/50 dark:border-white/[0.05]">
                    {/* SVG Progress Dial */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          className="text-zinc-100 dark:text-white/[0.03] stroke-current"
                          strokeWidth="8"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        />
                        <motion.circle
                          className="text-brand-500 stroke-current"
                          strokeWidth="8"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                          animate={{ strokeDashoffset: String(251.2 - (251.2 * percent) / 100) }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white font-display leading-none">
                          {percent}%
                        </span>
                        <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                          Strength
                        </span>
                      </div>
                    </div>

                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[9px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-widest w-fit">
                        <BsTrophy className="w-2.5 h-2.5" />
                        {badgeTitle}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2 font-light leading-snug">
                        {doneCount === onboardingSteps.length
                          ? "Your profile is fully configured to land dream offers!"
                          : `Complete ${onboardingSteps.length - doneCount} more steps to level up.`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {onboardingSteps.map((item) => (
                      <Link
                        key={item.step}
                        href={item.href}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-zinc-200 dark:border-white/[0.05] hover:bg-zinc-100 dark:hover:bg-white/[0.04] hover:border-zinc-300 dark:hover:border-white/[0.08] transition-all group"
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                          item.done 
                            ? "bg-brand-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]" 
                            : "border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-500"
                        )}>
                          {item.done && <BsCheckCircleFill className="w-4 h-4 text-white dark:text-zinc-900" />}
                        </div>
                        <span
                          className={cn(
                            "text-sm font-medium tracking-tight transition-all duration-500",
                            item.done ? "text-zinc-400 line-through dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-950 dark:group-hover:text-white"
                          )}
                        >
                          {item.step}
                        </span>
                        <div className="ml-auto w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <BsArrowRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              );
            })()}
          </motion.div>

          {/* Weekly Application Goals Widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="liquid-glass rounded-[32px] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <BsBullseye className="w-6 h-6 text-brand-500 dark:text-brand-400" />
              <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">Weekly Goal</h2>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500 dark:text-gray-500 uppercase tracking-wider">Target:</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setWeeklyGoalCount(Math.max(1, weeklyGoalCount - 1))}
                    className="w-5 h-5 rounded bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-xs hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white px-1.5 min-w-[20px] text-center">{weeklyGoalCount}</span>
                  <button 
                    onClick={() => setWeeklyGoalCount(weeklyGoalCount + 1)}
                    className="w-5 h-5 rounded bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-xs hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Progress calculation */}
            {(() => {
              const currentGoalProgress = stats.addedThisWeek;
              const goalPercent = Math.min(100, Math.round((currentGoalProgress / weeklyGoalCount) * 100));

              return (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-light font-display text-zinc-900 dark:text-white">{currentGoalProgress}</span>
                      <span className="text-zinc-500 text-sm font-medium ml-1">/ {weeklyGoalCount} applied</span>
                    </div>
                    <span className="text-sm font-bold text-brand-500 dark:text-brand-400">{goalPercent}%</span>
                  </div>

                  {/* Goal Progress bar */}
                  <div className="h-2 w-full bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-futuristic"
                      initial={{ width: 0 }}
                      animate={{ width: `${goalPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-xs text-zinc-500 leading-normal font-light">
                    {currentGoalProgress >= weeklyGoalCount 
                      ? "🎉 Stellar job! You have reached your weekly job application target." 
                      : `Keep going! Apply to ${weeklyGoalCount - currentGoalProgress} more roles to reach your goal.`}
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
