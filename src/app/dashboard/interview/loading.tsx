export default function InterviewLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 animate-pulse">
      <div className="h-8 w-48 bg-surface-200 rounded-xl" />
      <div className="h-4 w-72 bg-surface-200 rounded-lg" />
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-surface-200 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
