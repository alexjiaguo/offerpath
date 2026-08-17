import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-surface-50 flex items-center justify-center p-6">
      <div className="card-editorial rounded-2xl p-10 max-w-md text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300 mb-3">404</p>
        <h1 className="text-2xl font-display font-semibold text-surface-400 mb-2">Page not found</h1>
        <p className="text-sm text-surface-300 mb-6">
          That route does not exist. Head back to the dashboard or the home page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Dashboard
          </Link>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
