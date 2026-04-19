"use client";

import { useState } from "react";
import { BsArrowRepeat, BsCheck, BsFileEarmark, BsFileEarmarkText } from 'react-icons/bs';
import type { ResumeData } from "@/types";

/* ═══════════════════════════════════════════════════
   ExportButtons — PDF & DOCX export controls
   ═══════════════════════════════════════════════════ */

interface ExportButtonsProps {
  resumeData: ResumeData;
  resumeTitle: string;
}

export default function ExportButtons({
  resumeData,
  resumeTitle,
}: ExportButtonsProps) {
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportedDocx, setExportedDocx] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDocxExport = async () => {
    setExportingDocx(true);
    setExportError(null);
    try {
      const { generateDocx } = await import("@/lib/exportDocx");
      await generateDocx(resumeData, resumeTitle);
      setExportedDocx(true);
      setTimeout(() => setExportedDocx(false), 2000);
    } catch (err) {
      console.error("DOCX export failed:", err);
      setExportError("Export failed. Please try again.");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setExportingDocx(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* PDF Export */}
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-200 text-zinc-300 dark:text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-gray-900 dark:hover:text-white hover:bg-surface-300 transition-all"
        title="Export as PDF (opens print dialog)"
      >
        <BsFileEarmarkText className="w-4 h-4" />
        <span className="hidden sm:inline">PDF</span>
      </button>

      {/* DOCX Export */}
      <button
        onClick={handleDocxExport}
        disabled={exportingDocx}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-200 text-zinc-300 dark:text-gray-700 dark:text-gray-300 text-sm font-medium hover:text-gray-900 dark:hover:text-white hover:bg-surface-300 transition-all disabled:opacity-50"
        title="Export as DOCX"
      >
        {exportingDocx ? (
          <BsArrowRepeat className="w-4 h-4 animate-spin" />
        ) : exportedDocx ? (
          <BsCheck className="w-4 h-4 text-emerald-400" />
        ) : (
          <BsFileEarmark className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {exportedDocx ? "Downloaded!" : "DOCX"}
        </span>
      </button>
      {exportError && (
        <span className="text-xs text-red-400">{exportError}</span>
      )}
    </div>
  );
}
