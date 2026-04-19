"use client";

import { BsArrowDownUp, BsBarChartFill, BsFilter, BsKanban, BsPlus, BsSearch, BsX } from 'react-icons/bs';
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePipelineStore } from "@/store/pipelineStore";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import { useState } from "react";
import type { SortField } from "@/store/pipelineStore";

/* ═══════════════════════════════════════════════════
   Pipeline Page — BsKanban board + filter/sort toolbar
   ═══════════════════════════════════════════════════ */

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "created_at", label: "Date Added" },
  { field: "score", label: "Score" },
  { field: "title", label: "Title" },
  { field: "company", label: "Company" },
];

export default function PipelinePage() {
  const {
    filters,
    setFilter,
    clearFilters,
    sortField,
    sortDirection,
    setSort,
    setAddJobDialogOpen,
    getStats,
  } = usePipelineStore();

  const stats = getStats();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const hasActiveFilters =
    filters.search ||
    filters.statuses.length > 0 ||
    filters.tiers.length > 0 ||
    filters.archetypes.length > 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <BsKanban className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">Pipeline Tracker</h1>
          <span className="text-sm text-zinc-500 dark:text-gray-500">
            {stats.total} {stats.total === 1 ? "job" : "jobs"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <BsSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 dark:text-gray-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Search…"
              className="pl-8 pr-3 py-2 w-44 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => setFilter({ search: "" })}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300"
              >
                <BsX className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* BsFilter toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilters(!showFilters);
                setShowSort(false);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                hasActiveFilters
                  ? "bg-brand-500/10 border-brand-500/30 text-brand-300"
                  : "bg-surface-100 border-white/[0.06] text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200"
              )}
            >
              <BsFilter className="w-4 h-4" />
              BsFilter
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </button>

            {/* BsFilter dropdown */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface-50 border border-white/[0.08] rounded-xl shadow-2xl p-4 z-20 animate-scale-in">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Filters</span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-brand-400 hover:text-brand-300"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Tier filter */}
                <div className="mb-3">
                  <p className="text-xs text-zinc-500 dark:text-gray-500 mb-1.5">Tier</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          const tiers = filters.tiers.includes(t)
                            ? filters.tiers.filter((x) => x !== t)
                            : [...filters.tiers, t];
                          setFilter({ tiers });
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                          filters.tiers.includes(t)
                            ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                            : "bg-surface-200 text-zinc-500 dark:text-gray-500 border border-transparent hover:text-zinc-700 dark:hover:text-gray-300"
                        )}
                      >
                        T{t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score range */}
                <div>
                  <p className="text-xs text-zinc-500 dark:text-gray-500 mb-1.5">Min Score</p>
                  <div className="flex gap-1.5">
                    {[null, 3.0, 3.5, 4.0, 4.5].map((s) => (
                      <button
                        key={s ?? "all"}
                        onClick={() => setFilter({ scoreMin: s })}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium transition-all",
                          filters.scoreMin === s
                            ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                            : "bg-surface-200 text-zinc-500 dark:text-gray-500 border border-transparent hover:text-zinc-700 dark:hover:text-gray-300"
                        )}
                      >
                        {s === null ? "All" : `≥${s}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sort toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSort(!showSort);
                setShowFilters(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200 transition-all"
            >
              <BsArrowDownUp className="w-4 h-4" />
              Sort
            </button>

            {showSort && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-50 border border-white/[0.08] rounded-xl shadow-2xl p-2 z-20 animate-scale-in">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.field}
                    onClick={() => {
                      setSort(opt.field);
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                      sortField === opt.field
                        ? "bg-brand-500/10 text-brand-300"
                        : "text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200 hover:bg-white/[0.04]"
                    )}
                  >
                    {opt.label}
                    {sortField === opt.field && (
                      <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Analytics link */}
          <Link
            href="/dashboard/pipeline/analytics"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200 transition-all"
          >
            <BsBarChartFill className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Link>

          {/* Add Job */}
          <button
            onClick={() => setAddJobDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <BsPlus className="w-4 h-4" />
            Add Job
          </button>
        </div>
      </div>

      {/* Close dropdowns on click outside */}
      {(showFilters || showSort) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowFilters(false);
            setShowSort(false);
          }}
        />
      )}

      {/* BsKanban Board */}
      <KanbanBoard />
    </div>
  );
}
