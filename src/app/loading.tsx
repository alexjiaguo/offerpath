export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Loading OfferPath...</p>
      </div>
    </div>
  );
}
