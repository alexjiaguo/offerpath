"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { WarningCircle, CheckCircle, CaretDown, Info, Warning, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types";
import { validateResume, getIssueCounts, type ValidationIssue } from "@/lib/resumeValidation";
import { useTranslation } from "@/i18n";

interface ValidationPanelProps {
  data: ResumeData;
}

function IssueIcon({ severity }: { severity: ValidationIssue["severity"] }) {
  if (severity === "error") return <WarningCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />;
  if (severity === "warning") return <Warning className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
  return <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />;
}

export default function ValidationPanel({ data }: ValidationPanelProps) {
  const { t, locale } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const issues = useMemo(() => validateResume(data), [data]);
  const counts = getIssueCounts(issues);
  const hasIssues = issues.length > 0;

  // ESC to close and click outside
  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded]);

  if (!hasIssues) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider text-emerald-600 shadow-2xs">
        <CheckCircle className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("resumeStudio.validation.allGood") || "All Good"}</span>
      </div>
    );
  }

  const primaryLabel = locale === "zh"
    ? counts.errors > 0
      ? `${counts.errors} 项错误`
      : counts.warnings > 0
      ? `${counts.warnings} 项建议`
      : `${counts.info} 项提示`
    : counts.errors > 0
      ? `${counts.errors} Error${counts.errors > 1 ? "s" : ""}`
      : counts.warnings > 0
      ? `${counts.warnings} Warning${counts.warnings > 1 ? "s" : ""}`
      : `${counts.info} Tip${counts.info > 1 ? "s" : ""}`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shadow-2xs cursor-pointer",
          counts.errors > 0
            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            : counts.warnings > 0
            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
            : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
        )}
        title={t("resumeStudio.validation.qualityChecks") || "View Resume Content Suggestions"}
      >
        <WarningCircle className="w-3.5 h-3.5" />
        <span>{primaryLabel}</span>
        <CaretDown className={cn("w-3 h-3 transition-transform duration-200", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-surface-200 shadow-2xl z-50 p-3.5 space-y-2.5 animate-scale-in">
          <div className="flex items-center justify-between pb-2 border-b border-surface-200/60">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-surface-400 font-display">
                {t("resumeStudio.validation.qualityChecks") || "Resume Quality Checks"}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-100 text-surface-300">
                {issues.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="p-1 rounded-lg text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-colors cursor-pointer"
              title={t("resumeStudio.dialogs.cancel") || "Close"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {issues.map((issue, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-50 border border-surface-200/60 text-left transition-colors hover:bg-surface-100/70"
              >
                <IssueIcon severity={issue.severity} />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                    {issue.field}
                  </div>
                  <div className="text-xs text-surface-300 leading-snug mt-0.5">
                    {issue.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
