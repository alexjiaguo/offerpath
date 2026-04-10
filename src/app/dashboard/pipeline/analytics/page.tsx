"use client";

import { ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import AnalyticsCharts from "@/components/pipeline/AnalyticsCharts";

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
          <BarChart3 className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">Pipeline Analytics</h1>
        </div>
        <Link
          href="/dashboard/pipeline"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Board
        </Link>
      </div>

      <AnalyticsCharts />
    </div>
  );
}
