"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Sparkle, Star, TrendUp } from "@phosphor-icons/react";

/* ═══════════════════════════════════════════════════
   Bento Card Previews — Real, populated feature mockups
   that fill the empty vertical space in the landing
   page bento grid.
   ═══════════════════════════════════════════════════ */

interface Job {
  initials: string;
  hue: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  tags: string[];
}

const DISCOVERY_JOBS: Job[] = [
  {
    initials: "VC",
    hue: "from-zinc-900 to-zinc-700",
    title: "Senior Frontend Engineer",
    company: "Vercel",
    location: "Remote · US",
    salary: "$180k – $240k",
    match: 94,
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    initials: "LN",
    hue: "from-indigo-500 to-indigo-700",
    title: "Product Designer",
    company: "Linear",
    location: "New York · Hybrid",
    salary: "$160k – $210k",
    match: 88,
    tags: ["Figma", "Systems"],
  },
  {
    initials: "ST",
    hue: "from-violet-500 to-violet-700",
    title: "Staff Software Engineer",
    company: "Stripe",
    location: "San Francisco",
    salary: "$220k – $310k",
    match: 81,
    tags: ["Ruby", "Distributed"],
  },
  {
    initials: "NO",
    hue: "from-neutral-700 to-neutral-900",
    title: "Engineering Manager",
    company: "Notion",
    location: "Remote · Global",
    salary: "$200k – $280k",
    match: 76,
    tags: ["Leadership"],
  },
];

export function JobDiscoveryPreview() {
  return (
    <div className="flex-1 flex flex-col justify-center min-h-0">
      {/* Compact filter chip row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-brand-900 text-white text-[10px] font-semibold uppercase tracking-widest">
          All Matches
        </span>
        <span className="px-3 py-1 rounded-full bg-surface-50 border border-surface-200/50 text-[10px] font-semibold uppercase tracking-widest text-surface-300">
          Remote
        </span>
        <span className="px-3 py-1 rounded-full bg-surface-50 border border-surface-200/50 text-[10px] font-semibold uppercase tracking-widest text-surface-300">
          $150k+
        </span>
        <span className="ml-auto text-[10px] font-medium text-surface-300">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle" />
          142 new today
        </span>
      </div>

      {/* Job cards */}
      <div className="space-y-2.5">
        {DISCOVERY_JOBS.map((job, i) => (
          <motion.div
            key={job.company}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="group flex items-center gap-3 p-3 rounded-xl bg-white border border-surface-200/50 hover:border-surface-300 transition-all"
          >
            <div className={`w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br ${job.hue} flex items-center justify-center text-white text-[11px] font-bold tracking-wider shadow-sm`}>
              {job.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-surface-400 truncate">{job.title}</span>
                <span className="hidden md:inline px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
                  {job.match}% match
                </span>
              </div>
              <div className="text-[11px] text-surface-300 truncate">
                {job.company} · {job.location} · {job.salary}
              </div>
            </div>
            <div className="hidden lg:flex gap-1">
              {job.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-surface-50 text-[9px] font-medium uppercase tracking-wider text-surface-300 border border-surface-200/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const KANBAN_COLUMNS = [
  {
    name: "Applied",
    count: 8,
    cards: [
      { company: "Vercel", role: "Sr. Frontend", hue: "from-zinc-700 to-zinc-900" },
      { company: "Linear", role: "Designer", hue: "from-indigo-500 to-indigo-700" },
    ],
  },
  {
    name: "Interview",
    count: 3,
    cards: [
      { company: "Stripe", role: "Staff Eng", hue: "from-violet-500 to-violet-700" },
    ],
  },
  {
    name: "Offer",
    count: 1,
    cards: [
      { company: "Anthropic", role: "AI Eng", hue: "from-amber-500 to-amber-700" },
    ],
  },
];

export function JobTrackerPreview() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">
          Your Pipeline
        </span>
        <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
          <TrendUp weight="bold" className="w-3 h-3" />
          +23% this week
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 flex-1">
        {KANBAN_COLUMNS.map((col) => (
          <div
            key={col.name}
            className="bg-surface-50/70 rounded-lg p-1.5 border border-surface-200/40 flex flex-col"
          >
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-surface-300">
                {col.name}
              </span>
              <span className="text-[9px] font-semibold text-surface-400 bg-white px-1.5 py-0.5 rounded-full border border-surface-200/50">
                {col.count}
              </span>
            </div>
            <div className="space-y-1.5 flex-1">
              {col.cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                  className="bg-white rounded-md p-1.5 border border-surface-200/50 shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${card.hue}`} />
                    <span className="text-[9px] font-bold text-surface-400 truncate">
                      {card.company}
                    </span>
                  </div>
                  <div className="text-[8px] text-surface-300 truncate mt-0.5 pl-5.5 ml-0">
                    {card.role}
                  </div>
                </motion.div>
              ))}
              {col.cards.length === 0 && (
                <div className="text-[8px] text-surface-300/60 italic text-center py-2">
                  —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResumeBuilderPreview() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0 relative">
      {/* Back card (offset, faded) */}
      <div className="absolute -right-1 top-2 w-28 h-36 bg-surface-100 rounded-lg border border-surface-200/50 shadow-sm rotate-6 opacity-60" />
      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-36 h-44 bg-white rounded-lg shadow-xl border border-surface-200 p-3 flex flex-col gap-1.5"
      >
        {/* Header with name placeholder */}
        <div className="flex items-center gap-2 pb-1.5 border-b border-surface-200/50">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700" />
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-3/4 bg-surface-300 rounded-full" />
            <div className="h-1 w-1/2 bg-surface-200 rounded-full" />
          </div>
        </div>
        {/* Summary bars */}
        <div className="space-y-1 pt-1">
          <div className="h-1 w-full bg-surface-100 rounded-full" />
          <div className="h-1 w-11/12 bg-surface-100 rounded-full" />
          <div className="h-1 w-9/12 bg-surface-100 rounded-full" />
        </div>
        {/* Section */}
        <div className="pt-1">
          <div className="h-1.5 w-1/3 bg-surface-400 rounded-full mb-1.5" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-surface-100 rounded-full" />
            <div className="h-1 w-10/12 bg-surface-100 rounded-full" />
            <div className="h-1 w-8/12 bg-surface-100 rounded-full" />
          </div>
        </div>
        {/* Section */}
        <div className="pt-1">
          <div className="h-1.5 w-1/4 bg-surface-400 rounded-full mb-1.5" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-surface-100 rounded-full" />
            <div className="h-1 w-9/12 bg-surface-100 rounded-full" />
          </div>
        </div>
        {/* ATS badge */}
        <div className="mt-auto pt-1.5 border-t border-surface-200/50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CheckCircle weight="fill" className="w-3 h-3 text-emerald-500" />
            <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider">
              ATS Ready
            </span>
          </div>
          <span className="text-[8px] font-bold text-surface-300">96</span>
        </div>
      </motion.div>
      {/* Sparkle accent */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 16, ease: "linear", repeat: Infinity }}
        className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-lg"
      >
        <Sparkle weight="fill" className="w-3.5 h-3.5" />
      </motion.div>
    </div>
  );
}

export function InterviewPackPreview() {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
      {/* Conversation thread */}
      <div className="md:col-span-2 flex flex-col gap-3 justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-surface-50 rounded-2xl rounded-tl-sm p-4 border border-surface-200/50 max-w-md"
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-500 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            AI Interviewer
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            &ldquo;Walk me through a time you influenced a cross-functional team without authority. What was the outcome?&rdquo;
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-brand-900 text-white rounded-2xl rounded-tl-sm p-4 ml-8 md:ml-16 max-w-md"
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1.5">
            You
          </div>
          <p className="text-xs leading-relaxed">
            &ldquo;At my last role, I needed product and design aligned on a new onboarding flow. I set up a working session where we mapped user friction together, then led the prototype sprint that won buy-in...&rdquo;
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-surface-50 rounded-2xl rounded-tl-sm p-4 border border-surface-200/50 max-w-md flex items-start gap-3"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <Star weight="fill" className="w-3 h-3 text-white" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-1.5">
              Coach Feedback
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              Strong STAR structure. Try quantifying the impact — how did activation move?
            </p>
          </div>
        </motion.div>
      </div>

      {/* Sidebar with feature highlights */}
      <div className="flex flex-col justify-center gap-3 md:border-l md:border-surface-200/50 md:pl-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300 mb-1">
          What you get
        </div>
        {[
          { label: "Mock Sessions", desc: "Behavioral + technical" },
          { label: "STAR Bank", desc: "Reusable stories" },
          { label: "Company Research", desc: "Auto-briefing" },
          { label: "Custom Questions", desc: "Tailored to JD" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-start gap-2.5"
          >
            <div className="w-7 h-7 shrink-0 rounded-lg bg-surface-50 border border-surface-200/50 flex items-center justify-center">
              <ArrowRight weight="bold" className="w-3.5 h-3.5 text-brand-900" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-surface-400">
                {item.label}
              </div>
              <div className="text-[10px] text-surface-300">{item.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HeroVisual — Real data mini-dashboard that replaces
   the prior animated placeholder bars. Shows a "Today's
   Pipeline" view with live stats, recent matches, and an
   ATS score gauge. Sized for a 4/5 aspect-ratio column.
   ═══════════════════════════════════════════════════ */

const HERO_KPIS = [
  { label: "Active", value: "12", trend: "+3", tone: "brand" as const },
  { label: "Interviews", value: "4", trend: "+2", tone: "indigo" as const },
  { label: "Offers", value: "1", trend: "this wk", tone: "emerald" as const },
];

const HERO_RECENT = [
  { company: "Vercel", role: "Senior Frontend", match: 94, hue: "from-zinc-700 to-zinc-900" },
  { company: "Stripe", role: "Staff Engineer", match: 81, hue: "from-violet-500 to-violet-700" },
  { company: "Linear", role: "Product Designer", match: 88, hue: "from-indigo-500 to-indigo-700" },
];

function toneClasses(tone: "brand" | "indigo" | "emerald") {
  switch (tone) {
    case "brand":   return "text-brand-900 bg-brand-50 border-brand-100";
    case "indigo":  return "text-indigo-700 bg-indigo-50 border-indigo-100";
    case "emerald": return "text-emerald-700 bg-emerald-50 border-emerald-100";
  }
}

export function HeroVisual() {
  return (
    <div className="w-full max-w-lg aspect-[4/5] doppel-shell relative overflow-hidden hidden md:block group">
      {/* Subtle background motion — decorative, not data */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-50"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(15,23,42,0.06) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, rgba(15,23,42,0.06) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, rgba(15,23,42,0.06) 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, rgba(15,23,42,0.06) 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, rgba(15,23,42,0.06) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 14, ease: "linear", repeat: Infinity }}
      />

      <div className="doppel-core w-full h-full flex flex-col p-6 relative overflow-hidden bg-gradient-to-b from-white to-surface-50/50 backdrop-blur-3xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-200/60 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-900 flex items-center justify-center text-white shadow-sm">
              <Sparkle weight="fill" className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">
                Live Pipeline
              </div>
              <div className="text-xs font-semibold text-surface-400">
                Today
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-medium uppercase tracking-wider text-surface-300">
              Synced
            </span>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-2 my-4 relative z-10">
          {HERO_KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className={`rounded-xl border p-2.5 ${toneClasses(kpi.tone)}`}
            >
              <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                {kpi.label}
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-display font-medium leading-none">
                  {kpi.value}
                </span>
                <span className="text-[9px] font-semibold opacity-80">
                  {kpi.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent matches */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-surface-300">
              New Matches
            </span>
            <span className="text-[9px] font-medium text-surface-300">
              142 added
            </span>
          </div>
          <div className="space-y-1.5">
            {HERO_RECENT.map((job, i) => (
              <motion.div
                key={job.company}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-surface-200/60"
              >
                <div className={`w-7 h-7 shrink-0 rounded-md bg-gradient-to-br ${job.hue} flex items-center justify-center text-white text-[9px] font-bold tracking-wider`}>
                  {job.company.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-surface-400 truncate">
                    {job.role}
                  </div>
                  <div className="text-[9px] text-surface-300 truncate">
                    {job.company}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-emerald-600 leading-none">
                    {job.match}%
                  </div>
                  <div className="text-[8px] font-semibold uppercase tracking-wider text-surface-300">
                    match
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ATS gauge */}
        <div className="mt-auto pt-4 relative z-10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200/60">
            <div className="relative w-10 h-10 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(228 228 231)" strokeWidth="3" />
                <motion.circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke="rgb(15 23 42)" strokeWidth="3"
                  strokeDasharray="94 100"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: "94 100" }}
                  transition={{ delay: 0.6, duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-brand-900">
                96
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-surface-300">
                Resume Score
              </div>
              <div className="text-xs font-semibold text-surface-400">
                ATS Ready
              </div>
            </div>
            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
