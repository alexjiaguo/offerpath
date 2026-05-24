export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 animate-pulse">
      <div className="h-8 w-32 bg-surface-200 rounded-xl" />
      <div className="h-4 w-64 bg-surface-200 rounded-lg" />
      <div className="space-y-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-surface-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
