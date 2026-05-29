"use client";

import { ArrowsDownUp, ChartBar, Funnel, Kanban, Plus, MagnifyingGlass, X, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import KanbanBoard from "@/components/pipeline/KanbanBoard";
import { useState, useRef } from "react";
import type { SortField } from "@/store/pipelineStore";
import { exportJobsToCSV, importJobsFromCSV } from "@/lib/csvUtility";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════
   Pipeline Page — Kanban board + filter/sort toolbar (Minimalist)
   ═══════════════════════════════════════════════════ */

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "created_at", label: "Date Added" },
  { field: "score", label: "Score" },
  { field: "title", label: "Title" },
  { field: "company", label: "Company" },
];

export default function PipelinePage() {
  const {
    jobs,
    addJob,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    try {
      const csv = exportJobsToCSV(jobs);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `offerpath_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Pipeline exported successfully as CSV!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export pipeline to CSV");
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;
        const imported = importJobsFromCSV(text);
        if (imported.length === 0) {
          toast.error("No valid jobs found in the CSV");
          return;
        }
        
        imported.forEach((job) => {
          addJob({
            title: job.title,
            company: job.company,
            location: job.location,
            url: job.url,
            status: job.status,
            score: job.score,
            tier: job.tier,
            salary_range: job.salary_range,
            notes: job.notes
          });
        });
        
        toast.success(`Successfully imported ${imported.length} jobs!`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error(err);
        toast.error("Error parsing or importing CSV file");
      }
    };
    reader.readAsText(file);
  };

  const hasActiveFilters =
    filters.search ||
    filters.statuses.length > 0 ||
    filters.tiers.length > 0 ||
    filters.archetypes.length > 0;

  return (
    <div className="animate-fade-in p-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Kanban weight="bold" className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold font-display">Pipeline Tracker</h1>
          <span className="text-sm font-semibold text-surface-300">
            {stats.total} {stats.total === 1 ? "job" : "jobs"}
          </span>
        </div>

        {/* Add Job */}
        <button
          onClick={() => setAddJobDialogOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus weight="bold" className="w-4 h-4" />
          Add Job
        </button>
      </div>

      {/* Toolbar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 bg-surface-0 p-3 rounded-lg border border-surface-200">
        {/* Left Side: Search, Filters & Sort */}
        <div className="flex items-center flex-wrap gap-2 flex-grow">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilter({ search: e.target.value });
                useDiscoveryStore.getState().setSearchQuery(e.target.value);
              }}
              placeholder="Search pipeline..."
              className="pl-9 pr-8 py-1.5 w-full rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-300 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => {
                  setFilter({ search: "" });
                  useDiscoveryStore.getState().setSearchQuery("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-100 text-surface-300"
              >
                <X weight="bold" className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFilters(!showFilters);
                setShowSort(false);
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all h-[34px]",
                hasActiveFilters
                  ? "bg-brand-100 border-brand-500 text-brand-500 font-bold"
                  : "border-surface-200 bg-surface-50 text-surface-300 hover:text-surface-400 hover:bg-surface-100"
              )}
            >
              <Funnel weight={hasActiveFilters ? "fill" : "bold"} className="w-4 h-4" />
              <span>Filter</span>
            </button>

            {/* Filter dropdown */}
            {showFilters && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-surface-0 border border-surface-200 rounded-md shadow-lg p-4 z-20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold">Filters</span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold text-brand-500 hover:text-brand-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Tier filter */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-surface-300 uppercase tracking-widest mb-2">Tier</p>
                  <div className="flex gap-2">
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
                          "px-3 py-1 rounded-md text-xs font-bold transition-all border",
                          filters.tiers.includes(t)
                            ? "bg-brand-500 text-surface-0 border-brand-500"
                            : "bg-surface-50 text-surface-300 border-surface-200 hover:bg-surface-100"
                        )}
                      >
                        T{t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score range */}
                <div>
                  <p className="text-xs font-bold text-surface-300 uppercase tracking-widest mb-2">Min Score</p>
                  <div className="flex gap-2 flex-wrap">
                    {[null, 3.0, 3.5, 4.0, 4.5].map((s) => (
                      <button
                        key={s ?? "all"}
                        onClick={() => setFilter({ scoreMin: s })}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold transition-all border",
                          filters.scoreMin === s
                            ? "bg-brand-500 text-surface-0 border-brand-500"
                            : "bg-surface-50 text-surface-300 border-surface-200 hover:bg-surface-100"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all h-[34px]"
            >
              <ArrowsDownUp weight="bold" className="w-4 h-4" />
              <span>Sort</span>
            </button>

            {showSort && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-surface-0 border border-surface-200 rounded-md shadow-lg py-1 z-20">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.field}
                    onClick={() => {
                      setSort(opt.field);
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm transition-all",
                      sortField === opt.field
                        ? "bg-brand-100 text-brand-500 font-bold"
                        : "text-surface-300 hover:text-surface-400 hover:bg-surface-50"
                    )}
                  >
                    {opt.label}
                    {sortField === opt.field && (
                      <span className="text-xs font-bold">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Analytics, Export & Import CSV */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/dashboard/pipeline/analytics"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all h-[34px]"
          >
            <ChartBar weight="bold" className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Analytics</span>
          </Link>

          <button
            onClick={handleExportCSV}
            title="Export to CSV"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all h-[34px]"
          >
            <DownloadSimple weight="bold" className="w-4 h-4" />
            <span className="hidden lg:inline font-medium">Export</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import from CSV"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all h-[34px]"
          >
            <UploadSimple weight="bold" className="w-4 h-4" />
            <span className="hidden lg:inline font-medium">Import</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />
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

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
