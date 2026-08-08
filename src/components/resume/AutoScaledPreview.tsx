"use client";

import { useRef, useState, useEffect } from "react";

export function AutoScaledPreview({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(1122.52); // Default to 1 A4 page height

  useEffect(() => {
    let currentScale = 1;

    const observer = new ResizeObserver((entries) => {
      let shouldUpdate = false;
      let newScale = currentScale;
      let newHeight = contentHeight;

      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          const containerWidth = entry.contentRect.width;
          const availableWidth = Math.max(containerWidth - 16, 240);
          const computedScale = availableWidth / 794;
          newScale = Math.max(0.2, Math.min(computedScale, 1.5));
          shouldUpdate = true;
        } else if (entry.target === contentRef.current) {
          newHeight = entry.contentRect.height;
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        currentScale = newScale;
        setScale(newScale);
        setContentHeight(newHeight);
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    if (contentRef.current) observer.observe(contentRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center origin-top">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          height: `${contentHeight * scale}px`,
        }}
        className="w-[210mm] transition-transform duration-200"
      >
        <div ref={contentRef} className="w-full h-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
