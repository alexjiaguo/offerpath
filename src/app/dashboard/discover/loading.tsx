export default function DiscoverLoading() {
  return (
    <div className="w-full animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-surface-200" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-surface-200" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-surface-200" />
        ))}
      </div>
    </div>
  );
}
