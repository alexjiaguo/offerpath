"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function PipelineError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-12 h-12 rounded-md bg-pastel-red-bg border border-surface-200 flex items-center justify-center mx-auto">
          <WarningCircle weight="bold" className="w-6 h-6 text-pastel-red-fg" />
        </div>
        <h2 className="text-lg font-bold text-surface-400">Something went wrong</h2>
        <p className="text-surface-300 text-sm">An error occurred. Please try again.</p>
        <button onClick={reset} className="btn-editorial-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
