import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function scoreColor(score: number): string {
  if (score >= 4.5) return "text-emerald-400";
  if (score >= 3.5) return "text-blue-400";
  if (score >= 2.5) return "text-yellow-400";
  return "text-red-400";
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-brand-500/20 text-brand-300 border-brand-500/30",
    evaluated: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    applied: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    interviewing: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    offered: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    discarded: "bg-gray-500/20 text-zinc-600 dark:text-gray-400 border-gray-500/30",
    archived: "bg-gray-500/20 text-zinc-500 dark:text-gray-500 border-gray-500/30",
  };
  return colors[status] || colors.new;
}

export function tierLabel(tier: number): { label: string; color: string } {
  const tiers: Record<number, { label: string; color: string }> = {
    1: { label: "Tier 1", color: "text-amber-400" },
    2: { label: "Tier 2", color: "text-zinc-600 dark:text-gray-400" },
    3: { label: "Tier 3", color: "text-amber-700" },
  };
  return tiers[tier] || tiers[3];
}
