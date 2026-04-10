"use client";

import Link from "next/link";
import {
  Kanban,
  FileText,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
  Briefcase,
  Plus,
  CheckCircle2,
  Sparkles,
  Compass,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import NeedsTailoringWidget from "@/components/dashboard/NeedsTailoringWidget";

/* ═══════════════════════════════════════════════════
   Dashboard Hub — Unified home with 3 module cards,
   quick stats, and recent activity
   ═══════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { getStats } = usePipelineStore();
  const { resumes } = useResumeStore();
  const stats = getStats();

  const baseResumes = resumes.filter((r) => r.is_base).length;
  const tailoredResumes = resumes.filter((r) => !r.is_base).length;

  const MODULE_CARDS = [
    {
      title: "Pipeline Tracker",
      desc: "Track applications from discovery to offer",
      icon: Kanban,
      href: "/dashboard/pipeline",
      color: "from-zinc-600 to-zinc-500",
      stats: [
        { label: "Active Jobs", value: String(stats.total) },
        { label: "Interviews", value: String(stats.byStatus?.interviewing || 0) },
      ],
      cta: "Open Pipeline",
    },
    {
      title: "Resume Studio",
      desc: "Build and tailor stunning resumes",
      icon: FileText,
      href: "/dashboard/resume",
      color: "from-brand-600 to-brand-500",
      stats: [
        { label: "Resumes", value: String(baseResumes + tailoredResumes) },
        { label: "Tailored", value: String(tailoredResumes) },
      ],
      cta: "Open Studio",
    },
    {
      title: "Job Discovery",
      desc: "Find matching opportunities across 30+ companies",
      icon: Compass,
      href: "/dashboard/discover",
      color: "from-purple-600 to-purple-500",
      stats: [
        { label: "Leads", value: String(useDiscoveryStore.getState().jobs.filter(j => !j.dismissed).length) },
        { label: "Companies", value: String(useDiscoveryStore.getState().companies.length) },
      ],
      cta: "Discover Jobs",
    },
    {
      title: "Interview Prep",
      desc: "Research, practice, and ace interviews",
      icon: MessageSquare,
      href: "/dashboard/interview",
      color: "from-zinc-500 to-zinc-400",
      stats: [
        { label: "Preps", value: "0" },
        { label: "Mock Sessions", value: "0" },
      ],
      cta: "Open Prep",
    },
  ];

  const QUICK_STATS = [
    { label: "Total Jobs", value: String(stats.total), icon: Briefcase },
    {
      label: "Interview Rate",
      value: stats.interviewRate > 0 ? `${stats.interviewRate.toFixed(0)}%` : "—",
      icon: TrendingUp,
    },
    {
      label: "Avg. Score",
      value: stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—",
      icon: Star,
    },
    {
      label: "This Week",
      value: `${stats.addedThisWeek} added`,
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome back 👋</h1>
          <p className="text-zinc-500 text-sm">
            Your job hunting command center. Here&apos;s your current snapshot.
          </p>
        </div>
        <Link
          href="/dashboard/pipeline/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Job
        </Link>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {QUICK_STATS.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-surface-100/80 transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Module Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {MODULE_CARDS.map((mod, i) => (
          <div
            key={mod.title}
            className="glass-hover rounded-2xl p-6 flex flex-col animate-slide-up"
            style={{ animationDelay: `${(i + 1) * 0.1}s` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center`}
              >
                <mod.icon className="w-5.5 h-5.5 text-white" />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-1">{mod.title}</h3>
            <p className="text-sm text-gray-500 mb-5">{mod.desc}</p>

            {/* Mini stats */}
            <div className="flex gap-4 mb-6">
              {mod.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-auto">
              <Link
                href={mod.href}
                className="group flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                {mod.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Needs Tailoring Widget */}
      <NeedsTailoringWidget />

      {/* Getting Started Checklist (for new users) */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h2 className="text-lg font-semibold">Get Started</h2>
          <span className="text-xs text-gray-500 ml-auto">
            {[
              stats.total > 0,
              resumes.length > 0,
              false, // story bank
              false, // api key
            ].filter(Boolean).length}{" "}
            / 4 completed
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {[
            {
              step: "Add your first job to the pipeline",
              href: "/dashboard/pipeline",
              done: stats.total > 0,
            },
            {
              step: "Create your base resume",
              href: "/dashboard/resume/new",
              done: resumes.length > 0,
            },
            {
              step: "Build your STAR story bank",
              href: "/dashboard/interview/stories",
              done: false,
            },
            {
              step: "Configure your AI provider",
              href: "/dashboard/settings/api-keys",
              done: false,
            },
          ].map((item) => (
            <Link
              key={item.step}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-all group"
            >
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex-shrink-0 group-hover:border-brand-400 transition-colors" />
              )}
              <span
                className={`text-sm ${
                  item.done ? "text-gray-500 line-through" : "text-gray-300"
                }`}
              >
                {item.step}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
