"use client";

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
import {
  TrendingUp,
  Target,
  Briefcase,
  Star,
  ArrowUpRight,
  Percent,
} from "lucide-react";


/* ═══════════════════════════════════════════════════
   AnalyticsCharts — Pipeline analytics dashboard
   ═══════════════════════════════════════════════════ */

const STATUS_COLORS: Record<string, string> = {
  new: "#818cf8",
  evaluated: "#3b82f6",
  applied: "#10b981",
  interviewing: "#f59e0b",
  offered: "#a855f7",
  rejected: "#ef4444",
  discarded: "#6b7280",
  archived: "#4b5563",
};

const SCORE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

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
    <div className="bg-surface-100 border border-white/[0.1] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-zinc-700 dark:text-gray-300">{label}</p>
      <p className="text-sm font-bold text-white">{payload[0].value}</p>
    </div>
  );
};

export default function AnalyticsCharts() {
  const { jobs, getStats, getUniqueArchetypes } = usePipelineStore();
  const stats = getStats();

  // ── Chart Data ──

  // Pipeline funnel
  const funnelData = [
    { name: "New", count: stats.byStatus.new || 0, color: STATUS_COLORS.new },
    { name: "Evaluated", count: stats.byStatus.evaluated || 0, color: STATUS_COLORS.evaluated },
    { name: "Applied", count: stats.byStatus.applied || 0, color: STATUS_COLORS.applied },
    { name: "Interviewing", count: stats.byStatus.interviewing || 0, color: STATUS_COLORS.interviewing },
    { name: "Offered", count: stats.byStatus.offered || 0, color: STATUS_COLORS.offered },
    { name: "Rejected", count: stats.byStatus.rejected || 0, color: STATUS_COLORS.rejected },
  ];

  // Score distribution
  const scoredJobs = jobs.filter((j) => j.score !== undefined);
  const scoreDistribution = [
    {
      range: "1.0–2.4",
      count: scoredJobs.filter((j) => j.score! < 2.5).length,
      color: SCORE_COLORS[0],
    },
    {
      range: "2.5–3.4",
      count: scoredJobs.filter((j) => j.score! >= 2.5 && j.score! < 3.5).length,
      color: SCORE_COLORS[1],
    },
    {
      range: "3.5–4.4",
      count: scoredJobs.filter((j) => j.score! >= 3.5 && j.score! < 4.5).length,
      color: SCORE_COLORS[2],
    },
    {
      range: "4.5–5.0",
      count: scoredJobs.filter((j) => j.score! >= 4.5).length,
      color: SCORE_COLORS[3],
    },
  ];

  // Archetype distribution
  const archetypes = getUniqueArchetypes();
  const archetypeData = archetypes
    .map((a) => ({
      name: a,
      count: jobs.filter((j) => j.archetype === a).length,
    }))
    .sort((a, b) => b.count - a.count);

  // Tier distribution for pie chart
  const tierData = [
    {
      name: "Tier 1",
      value: jobs.filter((j) => j.tier === 1).length,
      color: "#fbbf24",
    },
    {
      name: "Tier 2",
      value: jobs.filter((j) => j.tier === 2).length,
      color: "#9ca3af",
    },
    {
      name: "Tier 3",
      value: jobs.filter((j) => j.tier === 3).length,
      color: "#b45309",
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Briefcase className="w-5 h-5 text-brand-400" />}
          label="Total Jobs"
          value={stats.total.toString()}
        />
        <StatCard
          icon={<Star className="w-5 h-5 text-amber-400" />}
          label="Avg Score"
          value={stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—"}
        />
        <StatCard
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-400" />}
          label="Interview Rate"
          value={stats.interviewRate > 0 ? `${Math.round(stats.interviewRate)}%` : "—"}
        />
        <StatCard
          icon={<Percent className="w-5 h-5 text-purple-400" />}
          label="Offer Rate"
          value={stats.offerRate > 0 ? `${Math.round(stats.offerRate)}%` : "—"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-400" />
            Pipeline Funnel
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={funnelData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
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
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Score Distribution
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={scoreDistribution} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} />
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
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            By Archetype
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={archetypeData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 11 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
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
                  <span className="text-sm text-zinc-600 dark:text-gray-400">{tier.name}</span>
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
    <div className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-surface-100/80 transition-all">
      <div className="w-10 h-10 rounded-lg bg-surface-200/50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-zinc-500 dark:text-gray-500">{label}</p>
      </div>
    </div>
  );
}
