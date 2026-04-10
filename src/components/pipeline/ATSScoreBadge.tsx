"use client";

import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   ATSScoreBadge — ATS compatibility score display
   Shows a color-coded ring with percentage score
   ═══════════════════════════════════════════════════ */

interface ATSScoreBadgeProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald
  if (score >= 60) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Weak";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
  if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
  return "bg-red-500/10 border-red-500/20";
}

const SIZE_CONFIG = {
  sm: { ring: 28, stroke: 3, fontSize: "text-[9px]", labelSize: "text-[8px]" },
  md: { ring: 40, stroke: 4, fontSize: "text-xs", labelSize: "text-[10px]" },
  lg: { ring: 56, stroke: 5, fontSize: "text-sm", labelSize: "text-xs" },
};

export default function ATSScoreBadge({
  score,
  size = "md",
  showLabel = true,
}: ATSScoreBadgeProps) {
  const config = SIZE_CONFIG[size];
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = (config.ring - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = config.ring;

  return (
    <div className="flex items-center gap-2">
      {/* Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: svgSize, height: svgSize }}
      >
        <svg
          className="-rotate-90"
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={config.stroke}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span
          className={cn(
            "absolute font-bold",
            config.fontSize
          )}
          style={{ color }}
        >
          {score}
        </span>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-medium text-gray-300", config.labelSize)}>
            ATS Match
          </span>
          <span className={cn("font-semibold", config.labelSize)} style={{ color }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── Inline badge variant (for cards/lists) ── */
export function ATSScoreInline({ score }: { score: number }) {
  const color = getScoreColor(score);
  const bg = getScoreBg(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border",
        bg
      )}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" className="-rotate-90">
        <circle
          cx="5"
          cy="5"
          r="3.5"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1.5"
        />
        <circle
          cx="5"
          cy="5"
          r="3.5"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 3.5}
          strokeDashoffset={2 * Math.PI * 3.5 * (1 - score / 100)}
        />
      </svg>
      <span style={{ color }}>{score}%</span>
    </span>
  );
}
