"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import type { Job, JobStatus } from "@/types";
import JobCard from "./JobCard";
import { Plus } from "lucide-react";

/* ═══════════════════════════════════════════════════
   KanbanColumn — Droppable status column
   ═══════════════════════════════════════════════════ */

export interface ColumnConfig {
  id: JobStatus;
  title: string;
  color: string;
  dotColor: string;
}

export const KANBAN_COLUMNS: ColumnConfig[] = [
  { id: "new", title: "New", color: "border-brand-500/40", dotColor: "bg-brand-500" },
  { id: "evaluated", title: "Evaluated", color: "border-blue-500/40", dotColor: "bg-blue-500" },
  { id: "applied", title: "Applied", color: "border-emerald-500/40", dotColor: "bg-emerald-500" },
  { id: "interviewing", title: "Interviewing", color: "border-amber-500/40", dotColor: "bg-amber-500" },
  { id: "offered", title: "Offered", color: "border-purple-500/40", dotColor: "bg-purple-500" },
  { id: "rejected", title: "Rejected", color: "border-red-500/40", dotColor: "bg-red-500" },
];

interface KanbanColumnProps {
  config: ColumnConfig;
  jobs: Job[];
  onAddClick?: () => void;
}

export default function KanbanColumn({ config, jobs, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${config.id}`,
    data: { type: "column", status: config.id },
  });

  const jobIds = jobs.map((j) => j.id);

  return (
    <div className="flex-shrink-0 w-[290px] flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-2.5 h-2.5 rounded-full", config.dotColor)} />
          <span className="text-sm font-semibold text-gray-300">{config.title}</span>
          <span className="text-xs text-gray-600 bg-surface-200 rounded-full px-2 py-0.5 font-medium">
            {jobs.length}
          </span>
        </div>
        {config.id === "new" && onAddClick && (
          <button
            onClick={onAddClick}
            className="p-1 rounded-md text-gray-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Droppable Area */}
      <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 rounded-xl border-2 border-dashed p-2 space-y-2 min-h-[200px] transition-all duration-200 overflow-y-auto",
            isOver
              ? `${config.color} bg-white/[0.02]`
              : "border-white/[0.04] hover:border-white/[0.08]"
          )}
        >
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center">
              <div className="w-10 h-10 rounded-xl bg-surface-200/50 flex items-center justify-center mb-3">
                <div className={cn("w-3 h-3 rounded-full opacity-30", config.dotColor)} />
              </div>
              <p className="text-xs text-gray-600 mb-1">No jobs</p>
              {config.id === "new" && onAddClick && (
                <button
                  onClick={onAddClick}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors mt-1"
                >
                  + Add a job
                </button>
              )}
              {config.id !== "new" && (
                <p className="text-[11px] text-gray-700">Drag jobs here</p>
              )}
            </div>
          ) : (
            jobs.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}
