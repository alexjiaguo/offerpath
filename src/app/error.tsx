"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display">Something went wrong</h2>
        <p className="text-zinc-500 text-sm">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl gradient-brand text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
