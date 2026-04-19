"use client";

import dynamic from "next/dynamic";
import { BsArrowLeft, BsBarChartFill } from 'react-icons/bs';
import Link from "next/link";

const AnalyticsCharts = dynamic(() => import("@/components/pipeline/AnalyticsCharts"), {
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  ),
  ssr: false,
});

/* ═══════════════════════════════════════════════════
   Analytics Page — /dashboard/pipeline/analytics
   Pipeline analytics with charts and stats
   ═══════════════════════════════════════════════════ */

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BsBarChartFill className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">Pipeline Analytics</h1>
        </div>
        <Link
          href="/dashboard/pipeline"
          className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 transition-colors"
        >
          <BsArrowLeft className="w-4 h-4" />
          Back to Board
        </Link>
      </div>

      <AnalyticsCharts />
    </div>
  );
}
