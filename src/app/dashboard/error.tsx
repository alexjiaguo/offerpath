"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <span className="text-xl">!</span>
        </div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Something went wrong</h2>
        <p className="text-zinc-500 text-sm">{error.message || "An error occurred in the dashboard."}</p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
