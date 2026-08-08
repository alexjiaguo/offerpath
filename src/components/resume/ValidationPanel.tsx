"use client";

import { useMemo, useState } from "react";
import { WarningCircle, CheckCircle, CaretDown, Info, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types";
import { validateResume, getIssueCounts, type ValidationIssue } from "@/lib/resumeValidation";

interface ValidationPanelProps {
  data: ResumeData;
}

function IssueIcon({ severity }: { severity: ValidationIssue["severity"] }) {
  if (severity === "error") return <WarningCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />;
  if (severity === "warning") return <Warning className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />;
  return <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
}

export default function ValidationPanel({ data }: ValidationPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const issues = useMemo(() => validateResume(data), [data]);
  const counts = getIssueCounts(issues);
  const hasIssues = issues.length > 0;

  if (!hasIssues) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
        <CheckCircle className="w-3 h-3" />
        All Clear
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
          counts.errors > 0
            ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            : counts.warnings > 0
            ? "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100"
            : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
        )}
      >
        <WarningCircle className="w-3 h-3" />
        {counts.errors > 0 && `${counts.errors} err`}
        {counts.warnings > 0 && ` ${counts.warnings} warn`}
        {counts.info > 0 && ` ${counts.info} tip`}
        <CaretDown className={cn("w-3 h-3 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="absolute top-full left-0 mt-1 w-80 max-h-64 overflow-y-auto rounded-xl bg-white border border-surface-200 shadow-xl z-20 p-2">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-50 transition-colors">
              <IssueIcon severity={issue.severity} />
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">{issue.field}</div>
                <div className="text-xs text-surface-300 leading-snug">{issue.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
