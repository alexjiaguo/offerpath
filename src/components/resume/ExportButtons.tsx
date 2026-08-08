"use client";
import { logger } from "@/lib/logger";

import { useState } from "react";
import { ArrowsClockwise, CaretDown, Check, DownloadSimple, File, FileText } from '@phosphor-icons/react';
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
 const [exportingPdf, setExportingPdf] = useState(false);
 const [exportedPdf, setExportedPdf] = useState(false);
 const [exportError, setExportError] = useState<string | null>(null);

 const handlePdfExport = async () => {
 // Print-to-PDF: the @media print rules in globals.css isolate the full-scale
 // .print-resume preview so the browser produces a faithful A4 PDF of just the
 // resume. No CDN script, no server round-trip, works offline.
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

 const [open, setOpen] = useState(false);
 const busy = exportingPdf || exportingDocx;

 const items = [
 {
 key: "pdf",
 label: "PDF",
 hint: "Print-ready A4",
 icon: FileText,
 loading: exportingPdf,
 done: exportedPdf,
 action: handlePdfExport,
 },
 {
 key: "docx",
 label: "Word (.docx)",
 hint: "Editable document",
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
 className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-200 text-surface-400 font-semibold text-sm hover:text-brand-600 hover:bg-surface-100 transition-all disabled:opacity-50"
 title="Download resume"
 >
 {busy ? (
 <ArrowsClockwise className="w-4 h-4 animate-spin text-surface-400" />
 ) : (
 <DownloadSimple className="w-4 h-4 text-surface-400" />
 )}
 <span className="hidden sm:inline">Download</span>
 <CaretDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
 </button>

 {open && (
 <>
 <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
 <div role="menu" className="absolute right-0 top-full mt-1.5 z-50 w-52 rounded-xl border border-surface-200 bg-white shadow-xl p-1.5 animate-fade-in">
 {items.map((item) => (
 <button
 key={item.key}
 role="menuitem"
 onClick={() => { setOpen(false); item.action(); }}
 disabled={item.loading}
 className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left hover:bg-surface-100 transition-all disabled:opacity-50"
 >
 {item.loading ? (
 <ArrowsClockwise className="w-4 h-4 animate-spin text-surface-400" />
 ) : item.done ? (
 <Check className="w-4 h-4 text-emerald-500" />
 ) : (
 <item.icon className="w-4 h-4 text-surface-400" />
 )}
 <span className="flex-1">
 <span className="block text-sm font-semibold text-surface-400">{item.done ? "Downloaded!" : item.label}</span>
 <span className="block text-[11px] text-surface-300">{item.hint}</span>
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
