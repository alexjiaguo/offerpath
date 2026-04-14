"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Kanban,
  FileText,
  TrendingUp,
  Star,
  Briefcase,
  Plus,
  CheckCircle2,
  Compass,
  ChevronRight,
  Activity,
  Zap,
  ArrowRight,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import NeedsTailoringWidget from "@/components/dashboard/NeedsTailoringWidget";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════
   Dashboard Hub v3 — Comprehensive Job Hunt Center
   ═══════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { getStats } = usePipelineStore();
  const { resumes } = useResumeStore();
  const stats = getStats();

  const baseResumes = resumes.filter((r) => r.is_base).length;
  const tailoredResumes = resumes.filter((r) => !r.is_base).length;

  const MODULE_CARDS = [
    {
      title: "Job Pipeline",
      desc: "Manage and track your active job applications",
      icon: Kanban,
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
      icon: FileText,
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
      icon: Compass,
      href: "/dashboard/discover",
      color: "oklch(0.6 0.2 310)",
      stats: [
        { label: "Leads", value: String(useDiscoveryStore.getState().jobs.filter(j => !j.dismissed).length) },
        { label: "Companies", value: String(useDiscoveryStore.getState().companies.length) },
      ],
      cta: "Discover Jobs",
    },
  ];

  const QUICK_STATS = [
    { label: "Total Jobs", value: String(stats.total), icon: Briefcase },
    {
      label: "Success Rate",
      value: stats.interviewRate > 0 ? `${stats.interviewRate.toFixed(1)}%` : "—",
      icon: TrendingUp,
    },
    {
      label: "Average Score",
      value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—",
      icon: Star,
    },
    {
      label: "Added This Week",
      value: `+${stats.addedThisWeek}`,
      icon: Activity,
    },
  ];

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
            <Plus className="w-5 h-5" />
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
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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

        {/* System Onboarding */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="liquid-glass rounded-[32px] p-8 h-full"
          >
            <div className="flex items-center gap-3 mb-8">
              <Zap className="w-6 h-6 text-brand-500 dark:text-brand-400" />
              <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">Getting Started</h2>
              <div className="ml-auto flex items-center gap-2">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Progress</div>
                <div className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-[10px] font-bold text-brand-400">
                  {Math.round(([
                    stats.total > 0,
                    resumes.length > 0,
                    false, // story bank
                    false, // api key
                  ].filter(Boolean).length / 4) * 100)}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
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
                  done: false,
                },
                {
                  step: "Configure your AI settings",
                  href: "/dashboard/settings/api-keys",
                  done: false,
                },
              ].map((item) => (
                <Link
                  key={item.step}
                  href={item.href}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] border border-transparent hover:border-zinc-200 dark:hover:border-white/[0.05] transition-all group"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500",
                    item.done 
                      ? "bg-brand-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]" 
                      : "border-2 border-zinc-700 group-hover:border-zinc-500"
                  )}>
                    {item.done && <CheckCircle2 className="w-4 h-4 text-zinc-900 dark:text-white" />}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium tracking-tight transition-all duration-500",
                      item.done ? "text-zinc-500 line-through" : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    {item.step}
                  </span>
                  <div className="ml-auto w-8 h-8 rounded-lg bg-zinc-100 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
