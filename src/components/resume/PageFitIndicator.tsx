"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

// A4 height at 96dpi: 297mm * (96 / 25.4) = ~1123px
const A4_HEIGHT_PX = 1123;

interface PageFitIndicatorProps {
  /** Selector for the resume paper element to measure */
  selector?: string;
}

export default function PageFitIndicator({ selector = "[data-live-preview] .resume-paper" }: PageFitIndicatorProps) {
  const { t, isZh } = useTranslation();
  const [fillPct, setFillPct] = useState(0);
  const [measured, setMeasured] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) return;
      const height = el.offsetHeight;
      const pct = Math.round((height / A4_HEIGHT_PX) * 100);
      setFillPct(pct);
      setMeasured(true);
    };

    // Initial measure after a short delay to allow render
    const timeoutId = setTimeout(measure, 500);

    // Watch for changes
    const el = document.querySelector(selector);
    if (el && typeof ResizeObserver !== "undefined") {
      observerRef.current = new ResizeObserver(measure);
      observerRef.current.observe(el);
    }

    // Also re-measure on window resize (affects scaling)
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", measure);
      observerRef.current?.disconnect();
    };
  }, [selector]);

  if (!measured) return null;

  const isOverflow = fillPct > 100;
  const isUnderflow = fillPct < 96 && fillPct > 0;

  const statusColor = isOverflow
    ? "bg-red-50 border-red-200 text-red-600"
    : isUnderflow
    ? "bg-amber-50 border-amber-200 text-amber-600"
    : "bg-emerald-50 border-emerald-200 text-emerald-600";

  const statusText = isOverflow
    ? `${t("resumeStudio.pageFitOverflow")} · ${fillPct}%`
    : isUnderflow
    ? (isZh ? "未填满 1 页" : "Under 1 page")
    : t("resumeStudio.pageFitGood");

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border", statusColor)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", isOverflow ? "bg-red-500" : isUnderflow ? "bg-amber-500" : "bg-emerald-500")} />
      {statusText}
    </div>
  );
}
