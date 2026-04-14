"use client";

import { cn } from "@/lib/utils";
import type { Job } from "@/types";
import { MapPin, Star, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ═══════════════════════════════════════════════════
   JobCard v3 — Robotic Node Asset
   ═══════════════════════════════════════════════════ */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function scoreBadgeColor(score: number): string {
  if (score >= 4.5) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  if (score >= 3.5) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (score >= 2.5) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

function CompanyLogo({ name }: { name: string }) {
  const colors = [
    "oklch(0.6 0.15 256)", 
    "oklch(0.6 0.2 310)",
    "oklch(0.6 0.2 150)",
    "oklch(0.6 0.15 80)",
    "oklch(0.6 0.2 20)",
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-zinc-900 dark:text-white flex-shrink-0 shadow-lg"
      style={{ 
        background: `linear-gradient(135deg, ${colors[colorIdx]}, color-mix(in oklch, ${colors[colorIdx]}, black 30%))`,
        boxShadow: `0 4px 12px -2px color-mix(in oklch, ${colors[colorIdx]}, transparent 70%)`
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  overlay?: boolean;
}

export default function JobCard({ job, overlay }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: job.id,
    data: { type: "job", status: job.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group rounded-[20px] border border-white/[0.04] bg-white/[0.02] p-4 cursor-grab active:cursor-grabbing relative overflow-hidden",
        "hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-500 ease-out",
        isDragging && "opacity-40 scale-[0.98] z-50",
        overlay && "shadow-2xl ring-1 ring-brand-500/30 rotate-[1deg] bg-surface-100/90 backdrop-blur-xl"
      )}
    >
      {/* Subtle Glow Effect */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Header */}
      <div className="flex items-start gap-3.5 mb-4">
        <CompanyLogo name={job.company?.name || "?"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">
              {job.company?.name}
            </span>
            <span className="text-[10px] font-bold text-zinc-600 tabular-nums">
              {timeAgo(job.created_at)}
            </span>
          </div>
          <Link
            href={`/dashboard/pipeline/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-brand-400 transition-colors line-clamp-2 leading-tight font-display mt-0.5"
          >
            {job.title}
          </Link>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {job.score !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
              scoreBadgeColor(job.score)
            )}
          >
            <Star className="w-3 h-3 fill-current" />
            {job.score.toFixed(1)} <span className="opacity-40 font-light">Match</span>
          </div>
        )}
        
        {job.tier && (
          <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.15em]">
            Tier {job.tier}
          </div>
        )}
        
        {job.archetype && (
          <div className="px-2 py-1 rounded-lg bg-brand-500/5 border border-brand-500/10 text-[9px] font-bold text-brand-400 uppercase tracking-[0.15em]">
            {job.archetype}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-3">
          {job.location && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              <MapPin className="w-3 h-3" />
              {job.location.length > 12 ? job.location.slice(0, 10) + "…" : job.location}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {job.resume_id && (
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          )}
          
          <Link 
            href={`/dashboard/pipeline/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4 text-zinc-900 dark:text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Overlay version for drag preview
export function JobCardOverlay({ job }: { job: Job }) {
  return <JobCard job={job} overlay />;
}
