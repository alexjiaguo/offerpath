"use client";

import { useMemo } from "react";
import { usePipelineStore } from "@/store/pipelineStore";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 Cell,
 PieChart,
 Pie,
} from "recharts";
import { ArrowUpRight, Briefcase, Target, TrendUp, Percent, Star } from '@phosphor-icons/react';


/* ═══════════════════════════════════════════════════
 AnalyticsCharts — Pipeline analytics dashboard
 ═══════════════════════════════════════════════════ */

const STATUS_COLORS: Record<string, string> = {
 new: "#1F6C9F", // pastel-blue-fg
 evaluated: "#346538", // pastel-green-fg
 applied: "#956400", // pastel-yellow-fg
 interviewing: "#C2410C", // ember-500
 offered: "#111111", // surface-400
 rejected: "#9F2F2D", // pastel-red-fg
 discarded: "#888888", // surface-300
 archived: "#EAEAEA", // surface-200
};

const SCORE_COLORS = ["#9F2F2D", "#956400", "#346538", "#111111"];

// Custom tooltip style
const CustomTooltip = ({
 active,
 payload,
 label,
}: {
 active?: boolean;
 payload?: Array<{ value: number; name: string }>;
 label?: string;
}) => {
 if (!active || !payload?.length) return null;
 return (
  <div className="bg-surface-0 border border-surface-200 rounded-lg px-3 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
  <p className="text-[10px] uppercase tracking-wider font-mono text-surface-300 mb-0.5">{label}</p>
  <p className="text-sm font-semibold text-surface-400">{payload[0].value}</p>
  </div>
 );
};

export default function AnalyticsCharts() {
 const jobs = usePipelineStore((s) => s.jobs);
 const getStats = usePipelineStore((s) => s.getStats);
 const getUniqueArchetypes = usePipelineStore((s) => s.getUniqueArchetypes);
 const stats = getStats();

 // ── Chart Data ──

 const funnelData = useMemo(() => [
 { name: "New", count: stats.byStatus.new || 0, color: STATUS_COLORS.new },
 { name: "Evaluated", count: stats.byStatus.evaluated || 0, color: STATUS_COLORS.evaluated },
 { name: "Applied", count: stats.byStatus.applied || 0, color: STATUS_COLORS.applied },
 { name: "Interviewing", count: stats.byStatus.interviewing || 0, color: STATUS_COLORS.interviewing },
 { name: "Offered", count: stats.byStatus.offered || 0, color: STATUS_COLORS.offered },
 { name: "Rejected", count: stats.byStatus.rejected || 0, color: STATUS_COLORS.rejected },
 ], [stats]);

 const scoreDistribution = useMemo(() => {
 const scoredJobs = jobs.filter((j) => j.score !== undefined);
 return [
 { range: "1.0–2.4", count: scoredJobs.filter((j) => j.score! < 2.5).length, color: SCORE_COLORS[0] },
 { range: "2.5–3.4", count: scoredJobs.filter((j) => j.score! >= 2.5 && j.score! < 3.5).length, color: SCORE_COLORS[1] },
 { range: "3.5–4.4", count: scoredJobs.filter((j) => j.score! >= 3.5 && j.score! < 4.5).length, color: SCORE_COLORS[2] },
 { range: "4.5–5.0", count: scoredJobs.filter((j) => j.score! >= 4.5).length, color: SCORE_COLORS[3] },
 ];
 }, [jobs]);

 const archetypes = getUniqueArchetypes();
 const archetypeData = useMemo(() => archetypes
 .map((a) => ({ name: a, count: jobs.filter((j) => j.archetype === a).length }))
 .sort((a, b) => b.count - a.count),
 [jobs, archetypes]);

  const tierData = useMemo(() => [
  { name: "Tier 1", value: jobs.filter((j) => j.tier === 1).length, color: "#111111" },
  { name: "Tier 2", value: jobs.filter((j) => j.tier === 2).length, color: "#888888" },
  { name: "Tier 3", value: jobs.filter((j) => j.tier === 3).length, color: "#EAEAEA" },
 ].filter((d) => d.value > 0), [jobs]);

  return (
  <div className="space-y-6 animate-stagger-in">
 {/* Summary Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <StatCard
  icon={<Briefcase className="w-5 h-5 text-surface-400" />}
  label="Total Jobs"
  value={stats.total.toString()}
  />
  <StatCard
  icon={<Star className="w-5 h-5 text-surface-400" />}
  label="Avg Score"
  value={stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—"}
  />
  <StatCard
  icon={<ArrowUpRight className="w-5 h-5 text-surface-400" />}
  label="Interview Rate"
  value={stats.interviewRate > 0 ? `${Math.round(stats.interviewRate)}%` : "—"}
  />
  <StatCard
  icon={<Percent className="w-5 h-5 text-surface-400" />}
 label="Offer Rate"
 value={stats.offerRate > 0 ? `${Math.round(stats.offerRate)}%` : "—"}
 />
 </div>

 {/* Charts Grid */}
 <div className="grid lg:grid-cols-2 gap-6">
  {/* Pipeline Funnel */}
  <div className="card-editorial rounded-2xl p-6">
  <h3 className="text-[11px] uppercase tracking-[0.15em] font-mono font-semibold text-surface-400 mb-6 flex items-center gap-2">
  <Target className="w-4 h-4" />
  Pipeline Funnel
  </h3>
  <ResponsiveContainer width="100%" height={240}>
  <BarChart data={funnelData} layout="vertical" barCategoryGap="20%">
  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" horizontal={false} />
  <XAxis type="number" tick={{ fill: "#888888", fontSize: 11, fontFamily: "var(--font-mono)" }} allowDecimals={false} axisLine={false} tickLine={false} />
  <YAxis
  type="category"
  dataKey="name"
  tick={{ fill: "#111111", fontSize: 11, fontFamily: "var(--font-mono)" }}
  axisLine={false}
  tickLine={false}
  width={85}
 />
 <Tooltip content={<CustomTooltip />} />
 <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
 {funnelData.map((entry, i) => (
 <Cell key={i} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>

  {/* Score Distribution */}
  <div className="card-editorial rounded-2xl p-6">
  <h3 className="text-[11px] uppercase tracking-[0.15em] font-mono font-semibold text-surface-400 mb-6 flex items-center gap-2">
  <Star className="w-4 h-4" />
  Score Distribution
  </h3>
  <ResponsiveContainer width="100%" height={240}>
  <BarChart data={scoreDistribution} barCategoryGap="25%">
  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
  <XAxis dataKey="range" tick={{ fill: "#111111", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
  <YAxis tick={{ fill: "#888888", fontSize: 11, fontFamily: "var(--font-mono)" }} allowDecimals={false} axisLine={false} tickLine={false} />
 <Tooltip content={<CustomTooltip />} />
 <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
 {scoreDistribution.map((entry, i) => (
 <Cell key={i} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>

  {/* Archetype Breakdown */}
  <div className="card-editorial rounded-2xl p-6">
  <h3 className="text-[11px] uppercase tracking-[0.15em] font-mono font-semibold text-surface-400 mb-6 flex items-center gap-2">
  <Briefcase className="w-4 h-4" />
  By role type
  </h3>
  <ResponsiveContainer width="100%" height={240}>
  <BarChart data={archetypeData} layout="vertical" barCategoryGap="20%">
  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" horizontal={false} />
  <XAxis type="number" tick={{ fill: "#888888", fontSize: 11, fontFamily: "var(--font-mono)" }} allowDecimals={false} axisLine={false} tickLine={false} />
  <YAxis
  type="category"
  dataKey="name"
  tick={{ fill: "#111111", fontSize: 11, fontFamily: "var(--font-mono)" }}
  axisLine={false}
  tickLine={false}
  width={120}
  />
  <Tooltip content={<CustomTooltip />} />
  <Bar dataKey="count" fill="#111111" radius={[0, 6, 6, 0]} maxBarSize={24} />
 </BarChart>
 </ResponsiveContainer>
 </div>

  {/* Tier Distribution */}
  <div className="card-editorial rounded-2xl p-6">
  <h3 className="text-[11px] uppercase tracking-[0.15em] font-mono font-semibold text-surface-400 mb-6 flex items-center gap-2">
  <TrendUp className="w-4 h-4" />
  Tier Breakdown
  </h3>
 <div className="flex items-center gap-8">
 <ResponsiveContainer width="50%" height={200}>
 <PieChart>
 <Pie
 data={tierData}
 cx="50%"
 cy="50%"
 innerRadius={50}
 outerRadius={75}
 paddingAngle={4}
 dataKey="value"
 >
 {tierData.map((entry, i) => (
 <Cell key={i} fill={entry.color} stroke="none" />
 ))}
 </Pie>
 <Tooltip content={<CustomTooltip />} />
 </PieChart>
 </ResponsiveContainer>
 <div className="space-y-3">
 {tierData.map((tier) => (
 <div key={tier.name} className="flex items-center gap-3">
 <div
 className="w-3 h-3 rounded-full"
 style={{ backgroundColor: tier.color }}
 />
 <span className="text-sm text-surface-300">{tier.name}</span>
 <span className="text-sm font-semibold">{tier.value}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

// Stat card subcomponent
function StatCard({
 icon,
 label,
 value,
}: {
 icon: React.ReactNode;
 label: string;
 value: string;
}) {
 return (
 <div className="card-editorial rounded-xl p-4 flex items-center gap-4 group hover:bg-surface-50 transition-all">
 <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center border border-surface-200 group-hover:bg-surface-0 transition-colors">
 {icon}
 </div>
 <div>
 <p className="text-lg font-bold font-display tracking-tight text-surface-400">{value}</p>
 <p className="text-[10px] uppercase tracking-wider font-mono text-surface-300">{label}</p>
 </div>
 </div>
 );
}
