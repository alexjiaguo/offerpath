"use client";

import { useState } from "react";
import {
  ArrowsOut,
  FileText,
  X,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import PageFitIndicator from "@/components/resume/PageFitIndicator";
import ValidationPanel from "@/components/resume/ValidationPanel";
import { generateAtsPlainText } from "@/lib/atsTextLayer";
import type { ResumeData } from "@/types";
import { useTranslation } from "@/i18n";

interface StudioCanvasDockProps {
  resumeData: ResumeData;
  onFullscreen: () => void;
}

export function StudioCanvasDock({ resumeData, onFullscreen }: StudioCanvasDockProps) {
  const { t, isZh } = useTranslation();
  const [showAtsModal, setShowAtsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const atsText = generateAtsPlainText(resumeData);

  const handleCopyAts = async () => {
    try {
      await navigator.clipboard.writeText(atsText);
      setCopied(true);
      toast.success(t("resumeStudio.atsModal.copiedToast") || "ATS plain text copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("resumeStudio.atsModal.copyError") || "Failed to copy plain text");
    }
  };

  return (
    <>
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-white/85 backdrop-blur-md border border-surface-200 shadow-sm transition-all hover:shadow-md">
        <PageFitIndicator />
        <div className="w-px h-3.5 bg-surface-200 mx-0.5" />
        <ValidationPanel data={resumeData} />
        <div className="w-px h-3.5 bg-surface-200 mx-0.5" />
        <button
          type="button"
          onClick={() => setShowAtsModal(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all cursor-pointer"
          title={t("resumeStudio.atsModal.title") || "Preview ATS Plain Text Layer"}
        >
          <FileText className="w-3.5 h-3.5 text-brand-500" />
          <span className="hidden sm:inline">{isZh ? "ATS 文本" : "ATS Text"}</span>
        </button>
        <button
          type="button"
          onClick={onFullscreen}
          className="p-1.5 rounded-lg text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all cursor-pointer"
          title={t("resumeStudio.dock.fullscreen") || "Fullscreen preview (Esc to exit)"}
          aria-label="Fullscreen preview"
        >
          <ArrowsOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {showAtsModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setShowAtsModal(false)}
        >
          <div
            className="bg-white dark:bg-surface-900 border border-surface-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-50 dark:bg-surface-950/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-surface-400">{t("resumeStudio.atsModal.title") || "ATS Plain Text Layer"}</h3>
                  <p className="text-[11px] text-surface-300">{t("resumeStudio.atsModal.desc") || "Exact machine-parseable text ingested by ATS systems"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAts}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 bg-white text-xs font-semibold text-surface-400 hover:bg-surface-100 transition-all shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? (t("resumeStudio.atsModal.copied") || "Copied") : (t("resumeStudio.atsModal.copyText") || "Copy Text")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAtsModal(false)}
                  className="p-1.5 rounded-lg text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto font-mono text-xs text-surface-400 bg-surface-50/50 leading-relaxed whitespace-pre-wrap select-text">
              {atsText || (t("resumeStudio.atsModal.noData") || "No text data available.")}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
