"use client";

import { useState } from "react";
import { ArrowsClockwise, Check, File, FileText } from '@phosphor-icons/react';
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
  const [exportingTxt, setExportingTxt] = useState(false);
  const [exportedTxt, setExportedTxt] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handlePdfExport = async () => {
    setExportingPdf(true);
    setExportError(null);
    try {
      // Find the element to export
      const element = document.getElementById("resume-preview-content");
      if (!element) throw new Error("Preview element not found");
      
      // We'll wrap the inner HTML with the necessary styling to preserve the look
      // Since it uses Tailwind classes, we'll need to fetch the compiled CSS or approximate it
      // For a robust implementation, passing the HTML is required.
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { margin: 0; padding: 0; background: white; }
              @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
            </style>
          </head>
          <body>
            ${element.outerHTML}
          </body>
        </html>
      `;

      const response = await fetch("/api/resume/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, title: resumeTitle }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${resumeTitle || "resume"}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportedPdf(true);
      setTimeout(() => setExportedPdf(false), 2000);
    } catch (err) {
      console.error("PDF export failed:", err);
      // Fallback to client-side print
      window.print();
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
      console.error("DOCX export failed:", err);
      setExportError("Export failed. Please try again.");
      setTimeout(() => setExportError(null), 4000);
    } finally {
      setExportingDocx(false);
    }
  };

  const handleTxtExport = async () => {
    setExportingTxt(true);
    setExportError(null);
    try {
      // Plain-text export. R15 mirrors resume.com’s "Download Resume Free / PDF / TXT"
      // affordance — the TXT format is what most ATS systems expect when a recruiter
      // pastes your resume into a form. Keep it human-readable, no markdown.
      const d: any = resumeData || {};
      const lines: string[] = [];
      const p: any = d.personal || {};
      lines.push((p.name || "Your Name").toUpperCase());
      const contactBits = [p.email, p.phone, p.location].filter(Boolean);
      if (contactBits.length) lines.push(contactBits.join(" | "));
      if (d.summary) { lines.push(""); lines.push("SUMMARY"); lines.push(d.summary); }
      if (Array.isArray(d.experience) && d.experience.length) {
        lines.push(""); lines.push("EXPERIENCE");
        for (const e of d.experience) {
          const dates = [e.start_date, e.end_date || "Present"].filter(Boolean).join(" – ");
          lines.push(`${e.title || ""} — ${e.company || ""}${dates ? ` (${dates})` : ""}`);
          for (const b of (e.bullets || [])) lines.push(`  • ${b}`);
        }
      }
      if (Array.isArray(d.education) && d.education.length) {
        lines.push(""); lines.push("EDUCATION");
        for (const ed of d.education) lines.push(`${ed.degree || ""} — ${ed.institution || ""}`);
      }
      if (Array.isArray(d.skills) && d.skills.length) {
        lines.push(""); lines.push("SKILLS");
        lines.push(d.skills.map((s: any) => s.name || s).join(", "));
      }
      const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${resumeTitle || "resume"}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportedTxt(true);
      setTimeout(() => setExportedTxt(false), 2000);
    } catch (err) {
      setExportError("TXT export failed");
    } finally {
      setExportingTxt(false);
    }
  };


  return (
    <div className="flex items-center gap-2">
      {/* PDF Export */}
      <button
        onClick={handlePdfExport}
        disabled={exportingPdf}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-200 text-surface-400 font-semibold text-sm hover:text-brand-600 hover:bg-surface-100 transition-all disabled:opacity-50"
        title="Export as PDF"
      >
        {exportingPdf ? (
          <ArrowsClockwise className="w-4 h-4 animate-spin text-surface-400" />
        ) : exportedPdf ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <FileText className="w-4 h-4 text-surface-400" />
        )}
        <span className="hidden sm:inline">
          {exportedPdf ? "Downloaded!" : "Download PDF"}
        </span>
      </button>

      {/* DOCX Export */}
      <button
        onClick={handleDocxExport}
        disabled={exportingDocx}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-200 text-surface-400 font-semibold text-sm hover:text-brand-600 hover:bg-surface-100 transition-all disabled:opacity-50"
        title="Export as DOCX"
      >
        {exportingDocx ? (
          <ArrowsClockwise className="w-4 h-4 animate-spin text-surface-400" />
        ) : exportedDocx ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <File className="w-4 h-4 text-surface-400" />
        )}
        <span className="hidden sm:inline">
          {exportedDocx ? "Downloaded!" : "Download Word"}
        </span>
      </button>

      {/* R15: Plain-text export — resume.com signature affordance for ATS-paste. */}
      <button
        onClick={handleTxtExport}
        disabled={exportingTxt}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-200 text-surface-400 font-semibold text-sm hover:text-brand-600 hover:bg-surface-100 transition-all disabled:opacity-50"
        title="Export as plain text — best for pasting into ATS forms"
      >
        {exportingTxt ? (
          <ArrowsClockwise className="w-4 h-4 animate-spin text-surface-400" />
        ) : exportedTxt ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <FileText className="w-4 h-4 text-surface-400" />
        )}
        <span className="hidden md:inline">
          {exportedTxt ? "Downloaded!" : "Download TXT"}
        </span>
      </button>
      {exportError && (
        <span className="text-xs text-red-500">{exportError}</span>
      )}
    </div>
  );
}
