"use client";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
        <span className="text-xl">!</span>
      </div>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Something went wrong</h2>
      <p className="text-sm text-zinc-500 dark:text-gray-400">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
