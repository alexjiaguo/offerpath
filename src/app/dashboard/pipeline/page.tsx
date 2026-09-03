"use client";
import { logger } from "@/lib/logger";

import { ArrowsDownUp, ChartBar, Funnel, Kanban, MagnifyingGlass, X, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePipelineStore } from "@/store/pipelineStore";
import dynamic from "next/dynamic";
const KanbanBoard = dynamic(() => import("@/components/pipeline/KanbanBoard"), { ssr: false });
import { useState, useRef, useMemo } from "react";
import type { SortField } from "@/store/pipelineStore";
import { exportJobsToCSV, importJobsFromCSV } from "@/lib/csvUtility";
import { toast } from "sonner";
import { useTranslation } from "@/i18n";

export default function PipelinePage() {
  const { t, isZh } = useTranslation();
  const jobs = usePipelineStore((s) => s.jobs);
  const addJob = usePipelineStore((s) => s.addJob);
  const filters = usePipelineStore((s) => s.filters);
  const setFilter = usePipelineStore((s) => s.setFilter);
  const clearFilters = usePipelineStore((s) => s.clearFilters);
  const sortField = usePipelineStore((s) => s.sortField);
  const sortDirection = usePipelineStore((s) => s.sortDirection);
  const setSort = usePipelineStore((s) => s.setSort);
  const getStats = usePipelineStore((s) => s.getStats);
  const getUniqueArchetypes = usePipelineStore((s) => s.getUniqueArchetypes);
  const archetypeOptions = getUniqueArchetypes();

  const stats = getStats();
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortOptions = useMemo<{ field: SortField; label: string }[]>(() => [
    { field: "created_at", label: t.pipeline.sortDateAdded },
    { field: "score", label: t.pipeline.sortScore },
    { field: "title", label: t.pipeline.sortTitle },
    { field: "company", label: t.pipeline.sortCompany },
  ], [t]);

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
      toast.success(isZh ? "求职管道已成功导出为 CSV！" : "Pipeline exported successfully as CSV!");
    } catch (error) {
      logger.error(error);
      toast.error(isZh ? "导出 CSV 失败" : "Failed to export pipeline to CSV");
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
          toast.error(isZh ? "CSV 文件中未找到有效职位数据" : "No valid jobs found in the CSV");
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
            notes: job.notes,
            description: job.description,
          });
        });
        
        toast.success(isZh ? `成功导入 ${imported.length} 个职位！` : `Successfully imported ${imported.length} jobs!`);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        logger.error(err);
        toast.error(isZh ? "解析或导入 CSV 文件时出错" : "Error parsing or importing CSV file");
      }
    };
    reader.readAsText(file);
  };

  const hasActiveFilters =
    filters.search ||
    filters.statuses.length > 0 ||
    filters.tiers.length > 0 ||
    filters.archetypes.length > 0 ||
    filters.scoreMin !== null ||
    filters.scoreMax !== null;

  return (
    <div className="animate-fade-in">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Kanban weight="bold" className="w-6 h-6 text-surface-400" />
          <h1 className="text-2xl font-bold font-display text-surface-400">{t.pipeline.title}</h1>
          <span className="text-xs font-mono font-semibold text-surface-300">
            {stats.total} {isZh ? "个职位" : (stats.total === 1 ? "job" : "jobs")}
          </span>
        </div>
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
                // Pipeline-local only: must not leak into the Discover filter.
                setFilter({ search: e.target.value });
              }}
              placeholder={t.pipeline.searchPlaceholder}
              className="pl-9 pr-8 py-1.5 w-full rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-surface-300 transition-all font-sans"
            />
            {filters.search && (
              <button
                onClick={() => {
                  setFilter({ search: "" });
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
                  ? "bg-surface-400 text-surface-0 font-bold border-surface-400"
                  : "border-surface-200 bg-surface-50 text-surface-300 hover:text-surface-400 hover:bg-surface-100"
              )}
            >
              <Funnel weight={hasActiveFilters ? "fill" : "bold"} className="w-4 h-4" />
              <span>{t.pipeline.filterBtn}</span>
            </button>

            {/* Filter dropdown */}
            {showFilters && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-surface-0 border border-surface-200 rounded-md shadow-lg p-4 z-20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-surface-400">{t.pipeline.filterTitle}</span>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-mono font-bold text-surface-400 hover:text-black"
                    >
                      {t.pipeline.clearAll}
                    </button>
                  )}
                </div>

                {/* Tier filter */}
                <div className="mb-4">
                  <p className="text-xs font-mono font-bold text-surface-300 uppercase tracking-widest mb-2">{t.pipeline.tierLabel}</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((tierNum) => (
                      <button
                        key={tierNum}
                        onClick={() => {
                          const tiers = filters.tiers.includes(tierNum)
                            ? filters.tiers.filter((x) => x !== tierNum)
                            : [...filters.tiers, tierNum];
                          setFilter({ tiers });
                        }}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold transition-all border font-mono",
                          filters.tiers.includes(tierNum)
                            ? "bg-surface-400 text-surface-0 border-surface-400"
                            : "bg-surface-50 text-surface-300 border-surface-200 hover:bg-surface-100"
                        )}
                      >
                        T{tierNum}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score range */}
                <div className="mb-4">
                  <p className="text-xs font-mono font-bold text-surface-300 uppercase tracking-widest mb-2">{t.pipeline.minScoreLabel}</p>
                  <div className="flex gap-2 flex-wrap">
                    {[null, 3.0, 3.5, 4.0, 4.5].map((s) => (
                      <button
                        key={s ?? "all"}
                        onClick={() => setFilter({ scoreMin: s })}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold transition-all border font-mono",
                          filters.scoreMin === s
                            ? "bg-surface-400 text-surface-0 border-surface-400"
                            : "bg-surface-50 text-surface-300 border-surface-200 hover:bg-surface-100"
                        )}
                      >
                        {s === null ? (isZh ? "全部" : "All") : `≥${s}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max score */}
                <div className="mb-4">
                  <p className="text-xs font-mono font-bold text-surface-300 uppercase tracking-widest mb-2">
                    {isZh ? "最高分数" : "Max score"}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {[null, 3.5, 4.0, 4.5].map((s) => (
                      <button
                        key={s ?? "all-max"}
                        onClick={() => setFilter({ scoreMax: s })}
                        className={cn(
                          "px-3 py-1 rounded-md text-xs font-bold transition-all border font-mono",
                          filters.scoreMax === s
                            ? "bg-surface-400 text-surface-0 border-surface-400"
                            : "bg-surface-50 text-surface-300 border-surface-200 hover:bg-surface-100"
                        )}
                      >
                        {s === null ? (isZh ? "全部" : "All") : `≤${s}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Archetype filter */}
                {archetypeOptions.length > 0 && (
                  <div>
                    <p className="text-xs font-mono font-bold text-surface-300 uppercase tracking-widest mb-2">
                      {isZh ? "岗位类型" : "Archetype"}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {archetypeOptions.map((a) => (
                        <button
                          key={a}
                          onClick={() => {
                            const archetypes = filters.archetypes.includes(a)
                              ? filters.archetypes.filter((x) => x !== a)
                              : [...filters.archetypes, a];
                            setFilter({ archetypes });
                          }}
                          className={cn(
                            "px-3 py-1 rounded-md text-xs font-bold transition-all border font-mono",
                            filters.archetypes.includes(a)
                              ? "bg-surface-400 text-surface-0 border-surface-400"
                              : "bg-surface-50 text-surface-300 border-surface-200 hover:bg-surface-100"
                          )}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
              <span>{t.pipeline.sortBtn}</span>
            </button>

            {showSort && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-surface-0 border border-surface-200 rounded-md shadow-lg py-1 z-20">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.field}
                    onClick={() => {
                      setSort(opt.field);
                      setShowSort(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm transition-all",
                      sortField === opt.field
                        ? "bg-surface-100 text-surface-400 font-bold"
                        : "text-surface-300 hover:text-surface-400 hover:bg-surface-50"
                    )}
                  >
                    {opt.label}
                    {sortField === opt.field && (
                      <span className="text-xs font-bold font-mono">{sortDirection === "asc" ? "↑" : "↓"}</span>
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
            <span className="hidden sm:inline font-medium">{t.pipeline.analyticsBtn}</span>
          </Link>

          <button
            onClick={handleExportCSV}
            title={t.pipeline.exportCsv}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all h-[34px]"
          >
            <DownloadSimple weight="bold" className="w-4 h-4" />
            <span className="hidden lg:inline font-medium">{t.pipeline.exportCsv}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title={t.pipeline.importCsv}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-50 border border-surface-200 text-sm text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all h-[34px]"
          >
            <UploadSimple weight="bold" className="w-4 h-4" />
            <span className="hidden lg:inline font-medium">{t.pipeline.importCsv}</span>
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
