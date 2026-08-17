"use client";

import { useRef, useState, useEffect } from "react";
import { computePreviewScale, PAPER_HEIGHT_PX } from "@/lib/editorSplit";

export function AutoScaledPreview({
  children,
  isResizing = false,
  fit = "contain",
}: {
  children: React.ReactNode;
  isResizing?: boolean;
  fit?: "contain" | "width";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(PAPER_HEIGHT_PX);

  useEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || container.clientWidth === 0) return;
      const nextHeight = content?.scrollHeight || PAPER_HEIGHT_PX;
      setContentHeight(nextHeight);
      const newScale =
        fit === "contain"
          ? computePreviewScale(container.clientWidth, container.clientHeight, nextHeight)
          : computePreviewScale(container.clientWidth);
      setScale(newScale);
    };

    const observer = new ResizeObserver(update);
    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    update();
    const raf1 = requestAnimationFrame(update);
    const t1 = setTimeout(update, 60);
    const t2 = setTimeout(update, 200);
    const t3 = setTimeout(update, 400);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", update);
    };
  }, [fit]);

  return (
    <div
      ref={containerRef}
      className={
        fit === "contain"
          ? "w-full h-full min-h-0 origin-top overflow-hidden flex items-start justify-center"
          : "w-full origin-top flex items-start justify-center"
      }
      {...(fit === "contain" ? { "data-live-preview": true } : {})}
    >
      <div
        style={{
          width: 794 * scale,
          height: contentHeight * scale,
          maxWidth: "100%",
          overflow: "hidden",
        }}
        className="mx-auto"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: 794,
            height: contentHeight,
          }}
          className={isResizing ? undefined : "transition-transform duration-200"}
        >
          <div ref={contentRef} className="w-[794px] h-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
