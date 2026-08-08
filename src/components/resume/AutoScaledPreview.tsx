"use client";

import { useRef, useState, useEffect } from "react";

export function AutoScaledPreview({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        const availableWidth = Math.max(containerWidth - 16, 240);
        const computedScale = availableWidth / 794;
        setScale(Math.max(0.3, Math.min(computedScale, 1.4)));
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center origin-top">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          height: `${297 * 3.779527 * scale}px`,
        }}
        className="w-[210mm] transition-transform duration-200"
      >
        {children}
      </div>
    </div>
  );
}
