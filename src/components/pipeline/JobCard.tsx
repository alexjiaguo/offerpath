"use client";

import { cn } from "@/lib/utils";
import type { Job } from "@/types";
import { MapPin, Clock, Star, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ═══════════════════════════════════════════════════
   JobCard — Compact Kanban card (draggable)
   ═══════════════════════════════════════════════════ */

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function scoreBadgeColor(score: number): string {
  if (score >= 4.5) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (score >= 3.5) return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  if (score >= 2.5) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-red-500/20 text-red-300 border-red-500/30";
}

function tierBadge(tier: number): { label: string; color: string } {
  const tiers: Record<number, { label: string; color: string }> = {
    1: { label: "T1", color: "text-amber-400 bg-amber-400/10" },
    2: { label: "T2", color: "text-gray-400 bg-gray-400/10" },
    3: { label: "T3", color: "text-amber-700 bg-amber-700/10" },
  };
  return tiers[tier] || tiers[3];
}

// Company initial as logo placeholder
function CompanyInitial({ name }: { name: string }) {
  const colors = [
    "from-blue-500 to-cyan-400",
    "from-brand-500 to-purple-400",
    "from-emerald-500 to-teal-400",
    "from-amber-500 to-orange-400",
    "from-pink-500 to-rose-400",
    "from-violet-500 to-indigo-400",
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
        colors[colorIdx]
      )}
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
        "group rounded-xl border border-white/[0.06] bg-surface-100/80 p-3.5 cursor-grab active:cursor-grabbing",
        "hover:border-white/[0.12] hover:bg-surface-100 transition-all duration-200",
        isDragging && "opacity-40 scale-[0.98]",
        overlay && "shadow-2xl ring-2 ring-brand-500/30 rotate-[2deg]"
      )}
    >
      {/* Company + Title */}
      <div className="flex items-start gap-2.5 mb-3">
        <CompanyInitial name={job.company?.name || "?"} />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 truncate">{job.company?.name}</p>
          <Link
            href={`/dashboard/pipeline/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm font-medium text-gray-200 hover:text-white line-clamp-2 leading-snug transition-colors"
          >
            {job.title}
          </Link>
        </div>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        {job.score !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border",
              scoreBadgeColor(job.score)
            )}
          >
            <Star className="w-3 h-3" />
            {job.score.toFixed(1)}
          </span>
        )}
        {job.tier !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-md text-[11px] font-semibold",
              tierBadge(job.tier).color
            )}
          >
            {tierBadge(job.tier).label}
          </span>
        )}
        {job.archetype && (
          <span className="px-1.5 py-0.5 rounded-md text-[11px] text-gray-500 bg-surface-200">
            {job.archetype}
          </span>
        )}
      </div>

      {/* Bottom meta */}
      <div className="flex items-center justify-between text-[11px] text-gray-600">
        <div className="flex items-center gap-2">
          {job.location && (
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {job.location.length > 16 ? job.location.slice(0, 14) + "…" : job.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {job.resume_id && (
            <span
              className="flex items-center gap-0.5 text-brand-400/70"
              title="Resume linked"
            >
              <FileText className="w-3 h-3" />
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {timeAgo(job.created_at)}
          </span>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-400"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// Overlay version for drag preview
export function JobCardOverlay({ job }: { job: Job }) {
  return <JobCard job={job} overlay />;
}
