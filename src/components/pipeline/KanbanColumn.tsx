"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import type { Job, JobStatus } from "@/types";
import JobCard from "./JobCard";
import { Plus, LayoutGrid, Target, Send, MessageSquare, Award, XCircle } from "lucide-react";

/* ═══════════════════════════════════════════════════
   KanbanColumn v3 — Professional Job Pipeline
   ═══════════════════════════════════════════════════ */

export interface ColumnConfig {
  id: JobStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  dotColor: string;
}

export const KANBAN_COLUMNS: ColumnConfig[] = [
  { id: "new", title: "To Apply", icon: Target, color: "oklch(0.6 0.15 256)", dotColor: "bg-brand-500" },
  { id: "evaluated", title: "Evaluated", icon: LayoutGrid, color: "oklch(0.6 0.1 220)", dotColor: "bg-blue-500" },
  { id: "applied", title: "Applied", icon: Send, color: "oklch(0.6 0.2 150)", dotColor: "bg-emerald-500" },
  { id: "interviewing", title: "Interviewing", icon: MessageSquare, color: "oklch(0.6 0.15 80)", dotColor: "bg-amber-500" },
  { id: "offered", title: "Offer Received", icon: Award, color: "oklch(0.6 0.2 310)", dotColor: "bg-purple-500" },
  { id: "rejected", title: "Archive", icon: XCircle, color: "oklch(0.6 0.1 20)", dotColor: "bg-red-500" },
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
    <div className="flex-shrink-0 w-[320px] flex flex-col h-full perspective-1000">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform duration-500"
            style={{ 
              background: `linear-gradient(135deg, ${config.color}, color-mix(in oklch, ${config.color}, black 20%))`,
              boxShadow: `0 4px 12px -2px color-mix(in oklch, ${config.color}, transparent 60%)`
            }}
          >
            <config.icon className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white font-display block leading-none">
              {config.title}
            </span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none mt-1 block">
              {jobs.length} Jobs
            </span>
          </div>
        </div>
        
        {config.id === "new" && onAddClick && (
          <button
            onClick={onAddClick}
            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Droppable Area */}
      <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 rounded-[24px] border border-white/[0.03] p-3 space-y-3 min-h-[200px] transition-all duration-500 ease-out overflow-y-auto scrollbar-hide",
            isOver
              ? "bg-white/[0.04] border-brand-500/30 ring-1 ring-brand-500/20"
              : "bg-white/[0.01] hover:bg-white/[0.02]"
          )}
        >
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[240px] text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4 opacity-50">
                <config.icon className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Column Empty</p>
              {config.id === "new" && onAddClick ? (
                <button
                  onClick={onAddClick}
                  className="text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors mt-2 uppercase tracking-widest"
                >
                  + Add New Job
                </button>
              ) : (
                <p className="text-[10px] text-zinc-700 font-medium italic">Drag jobs here...</p>
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
