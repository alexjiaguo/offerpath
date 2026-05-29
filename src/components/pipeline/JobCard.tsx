"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";
import { CaretRight, FileText, MapPin, Star } from '@phosphor-icons/react';
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ═══════════════════════════════════════════════════
   JobCard v4 — Minimalist Bento Node
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
  if (score >= 4.5) return "bg-[#EDF3EC] text-[#346538]";
  if (score >= 3.5) return "bg-[#E1F3FE] text-[#1F6C9F]";
  if (score >= 2.5) return "bg-[#FBF3DB] text-[#956400]";
  return "bg-[#FDEBEC] text-[#9F2F2D]";
}

function CompanyLogo({ name }: { name: string }) {
  const colors = [
    "#E1F3FE", 
    "#EDF3EC",
    "#FBF3DB",
    "#FDEBEC",
    "#EAEAEA",
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  return (
    <div
      className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold text-surface-400 flex-shrink-0 border border-surface-200"
      style={{ backgroundColor: colors[colorIdx] }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  overlay?: boolean;
}

const JobCard = React.memo(function JobCard({ job, overlay }: JobCardProps) {
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
        "group rounded-lg border border-surface-200 bg-surface-0 p-4 cursor-grab active:cursor-grabbing relative overflow-hidden",
        "hover:shadow-sm hover:-translate-y-[1px] hover:border-surface-300 transition-all duration-200 ease-out",
        isDragging && "opacity-50 z-50",
        overlay && "shadow-xl ring-1 ring-brand-500 rotate-2 bg-surface-0"
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <CompanyLogo name={job.company?.name || "?"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest truncate">
              {job.company?.name}
            </span>
            <span className="text-[10px] font-bold text-surface-300 tabular-nums">
              {timeAgo(job.created_at)}
            </span>
          </div>
          <Link
            href={`/dashboard/pipeline/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-semibold text-surface-400 group-hover:text-brand-500 transition-colors line-clamp-2 leading-tight mt-0.5 font-display"
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
              "flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
              scoreBadgeColor(job.score)
            )}
          >
            <Star weight="fill" className="w-3 h-3" />
            {job.score.toFixed(1)}
          </div>
        )}
        
        {job.tier && (
          <div className="px-2 py-0.5 rounded-md bg-surface-100 text-[10px] font-bold text-surface-400 uppercase tracking-widest border border-surface-200">
            T{job.tier}
          </div>
        )}
        
        {job.archetype && (
          <div className="px-2 py-0.5 rounded-md bg-surface-100 text-[10px] font-bold text-surface-400 uppercase tracking-widest border border-surface-200">
            {job.archetype}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-200">
        <div className="flex items-center gap-3">
          {job.location && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-surface-300 uppercase tracking-widest">
              <MapPin weight="bold" className="w-3 h-3" />
              {job.location.length > 15 ? job.location.slice(0, 12) + "…" : job.location}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {job.resume_id && (
            <div className="w-6 h-6 rounded bg-surface-100 flex items-center justify-center border border-surface-200">
              <FileText weight="bold" className="w-3.5 h-3.5 text-surface-400" />
            </div>
          )}
          
          <Link 
            href={`/dashboard/pipeline/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded bg-surface-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-100 border border-surface-200"
          >
            <CaretRight weight="bold" className="w-3 h-3 text-surface-400" />
          </Link>
        </div>
      </div>
    </div>
  );
});

export default JobCard;

export function JobCardOverlay({ job }: { job: Job }) {
  return <JobCard job={job} overlay />;
}
