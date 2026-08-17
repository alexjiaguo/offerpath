"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import { ArrowsClockwise, CaretDown, Check, DownloadSimple, File, FileText } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types";
import { useTranslation } from "@/i18n";

function usePdfExport() {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportedPdf, setExportedPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const handlePdfExport = async () => {
    setExportingPdf(true);
    setExportError(null);
    try {
      window.print();
      setExportedPdf(true);
      setTimeout(() => setExportedPdf(false), 2000);
    } catch (err) {
      logger.error("PDF export failed:", err);
      setExportError("Print failed. Please try again.");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setExportingPdf(false);
    }
  };
  return { exportingPdf, exportedPdf, exportError, handlePdfExport };
}

function useDocxExport(resumeData: ResumeData, resumeTitle: string) {
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
      logger.error("DOCX export failed:", err);
      setExportError("Export failed. Please try again.");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setExportingDocx(false);
    }
  };
  return { exportingDocx, exportedDocx, exportError, handleDocxExport };
}

export function DownloadPdfButton({ className }: { className?: string }) {
  const { isZh, t } = useTranslation();
  const { exportingPdf, exportedPdf, exportError, handlePdfExport } = usePdfExport();
  const pdfLabel = t.resumeStudio?.exportPdf || (isZh ? "导出 PDF 格式" : "Download PDF");
  const downloadedLabel = t.resumeStudio?.downloaded || (isZh ? "下载成功！" : "Downloaded!");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handlePdfExport}
        disabled={exportingPdf}
        className={cn("btn-editorial-secondary flex items-center justify-center gap-1.5 !px-2.5 !py-1.5 disabled:opacity-50 !rounded-lg w-full", className)}
      >
        {exportingPdf ? <ArrowsClockwise className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        {exportedPdf ? downloadedLabel : pdfLabel}
      </button>
      {exportError && <span className="absolute right-0 top-full mt-1 text-[10px] text-red-500 whitespace-nowrap">{exportError}</span>}
    </div>
  );
}

export function DownloadDocxButton({
  resumeData,
  resumeTitle,
  className,
}: {
  resumeData: ResumeData;
  resumeTitle: string;
  className?: string;
}) {
  const { isZh, t } = useTranslation();
  const { exportingDocx, exportedDocx, exportError, handleDocxExport } = useDocxExport(resumeData, resumeTitle);
  const docxLabel = t.resumeStudio?.exportDocx || (isZh ? "导出 DOCX (Word)" : "Download DOCX (Word)");
  const downloadedLabel = t.resumeStudio?.downloaded || (isZh ? "下载成功！" : "Downloaded!");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDocxExport}
        disabled={exportingDocx}
        className={cn("btn-editorial-secondary flex items-center justify-center gap-1.5 !px-2.5 !py-1.5 disabled:opacity-50 !rounded-lg w-full", className)}
      >
        {exportingDocx ? <ArrowsClockwise className="w-3.5 h-3.5 animate-spin" /> : <File className="w-3.5 h-3.5" />}
        {exportedDocx ? downloadedLabel : docxLabel}
      </button>
      {exportError && <span className="absolute right-0 top-full mt-1 text-[10px] text-red-500 whitespace-nowrap">{exportError}</span>}
    </div>
  );
}

interface ExportButtonsProps {
  resumeData: ResumeData;
  resumeTitle: string;
}

export default function ExportButtons({
  resumeData,
  resumeTitle,
}: ExportButtonsProps) {
  const { isZh, t } = useTranslation();
  const { exportingPdf, exportedPdf, exportError: pdfError, handlePdfExport } = usePdfExport();
  const { exportingDocx, exportedDocx, exportError: docxError, handleDocxExport } = useDocxExport(resumeData, resumeTitle);
  const exportError = pdfError || docxError;

  const [open, setOpen] = useState(false);
  const busy = exportingPdf || exportingDocx;

  const exportMenuTitle = t.resumeStudio?.exportMenu || t.resumeStudio?.export || (isZh ? "导出简历" : "Export Resume");
  const downloadedLabel = t.resumeStudio?.downloaded || (isZh ? "下载成功！" : "Downloaded!");

  const items = [
    {
      key: "pdf",
      label: t.resumeStudio?.exportPdf || (isZh ? "导出 PDF 格式" : "Download PDF"),
      hint: t.resumeStudio?.printReady || (isZh ? "适配打印与 ATS 筛选的标准 PDF" : "Print-ready, ATS-compliant PDF"),
      icon: FileText,
      loading: exportingPdf,
      done: exportedPdf,
      action: handlePdfExport,
    },
    {
      key: "docx",
      label: t.resumeStudio?.exportDocx || (isZh ? "导出 DOCX (Word)" : "Download DOCX (Word)"),
      hint: t.resumeStudio?.editableDoc || (isZh ? "可自由二次编辑的 Word 文档" : "Editable Microsoft Word document"),
      icon: File,
      loading: exportingDocx,
      done: exportedDocx,
      action: handleDocxExport,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        className="btn-editorial-secondary flex items-center gap-1.5 !px-2.5 !py-1.5 disabled:opacity-50 !rounded-lg"
        title={exportMenuTitle}
      >
        {busy ? (
          <ArrowsClockwise className="w-4 h-4 animate-spin" />
        ) : (
          <DownloadSimple className="w-4 h-4" />
        )}
        <CaretDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 top-full mt-1.5 z-50 w-60 rounded-xl border border-surface-200 bg-white shadow-xl p-1.5 animate-fade-in">
            {items.map((item) => (
              <button
                key={item.key}
                role="menuitem"
                onClick={() => { setOpen(false); item.action(); }}
                disabled={item.loading}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-surface-100 transition-all disabled:opacity-50 group"
              >
                {item.loading ? (
                  <ArrowsClockwise className="w-4 h-4 animate-spin text-surface-400 shrink-0" />
                ) : item.done ? (
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <item.icon className="w-4 h-4 text-surface-400 group-hover:text-brand-900 transition-colors shrink-0" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-brand-900 leading-tight">
                    {item.done ? downloadedLabel : item.label}
                  </span>
                  <span className="block text-[10px] text-surface-300 leading-snug mt-0.5">
                    {item.hint}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {exportError && (
        <span className="absolute right-0 top-full mt-1.5 text-xs text-red-500 whitespace-nowrap">{exportError}</span>
      )}
    </div>
  );
}
