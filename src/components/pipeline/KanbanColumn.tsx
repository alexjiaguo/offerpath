"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Job, JobStatus } from "@/types";
import JobCard from "./JobCard";
import { Trophy, Target, ChatCircleText, GridFour, Plus, PaperPlaneRight, XCircle, IconProps } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   KanbanColumn v4 — Professional Minimalist Job Pipeline
   ═══════════════════════════════════════════════════ */

export interface ColumnConfig {
  id: JobStatus;
  title: string;
  icon: React.ComponentType<IconProps>;
}

export const KANBAN_COLUMNS: ColumnConfig[] = [
  { id: "new", title: "To Apply", icon: Target },
  { id: "evaluated", title: "Evaluated", icon: GridFour },
  { id: "applied", title: "Applied", icon: PaperPlaneRight },
  { id: "interviewing", title: "Interviewing", icon: ChatCircleText },
  { id: "offered", title: "Offer Received", icon: Trophy },
  { id: "rejected", title: "Archive", icon: XCircle },
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
    <div className="flex-shrink-0 w-[320px] flex flex-col h-full kanban-column-area">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-surface-0 border border-surface-200 flex items-center justify-center">
            <config.icon weight="bold" className="w-4.5 h-4.5 text-surface-400" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-surface-400 block leading-none">
              {config.title}
            </span>
            <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest leading-none mt-1.5 block">
              {jobs.length} Jobs
            </span>
          </div>
        </div>
        
        {config.id === "new" && onAddClick && (
          <button
            onClick={onAddClick}
            className="w-8 h-8 rounded-md bg-surface-0 border border-surface-200 flex items-center justify-center text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-colors"
          >
            <Plus weight="bold" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Droppable Area */}
      <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 rounded-xl p-2 space-y-2 min-h-[200px] transition-all duration-200 overflow-y-auto scrollbar-hide border border-surface-200 bg-surface-50/50",
            isOver ? "bg-surface-100 border-brand-500" : ""
          )}
        >
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-center px-4">
              <div className="w-12 h-12 rounded-lg border border-dashed border-surface-300 flex items-center justify-center mb-4 opacity-50 bg-surface-0">
                <config.icon weight="duotone" className="w-6 h-6 text-surface-300" />
              </div>
              <p className="text-[11px] font-bold text-surface-300 uppercase tracking-widest mb-1">Column Empty</p>
              {config.id === "new" && onAddClick ? (
                <button
                  onClick={onAddClick}
                  className="text-[10px] font-bold text-brand-500 hover:text-brand-600 transition-colors mt-2 uppercase tracking-widest"
                >
                  + Add New Job
                </button>
              ) : (
                <p className="text-[10px] text-surface-300 font-medium italic">Drag jobs here...</p>
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
