"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-16 h-16 rounded-md bg-pastel-red-bg border border-surface-200 flex items-center justify-center mx-auto">
          <WarningCircle weight="bold" className="w-8 h-8 text-pastel-red-fg" />
        </div>
        <h2 className="text-2xl font-bold text-surface-400 font-display">Something went wrong</h2>
        <p className="text-surface-300 text-sm">An unexpected error occurred. Please try again.</p>
        <button onClick={reset} className="btn-editorial-primary">
          Try again
        </button>
      </div>
    </div>
  );
}
