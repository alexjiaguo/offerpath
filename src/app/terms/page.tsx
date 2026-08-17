import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] bg-surface-50 px-6 py-16">
      <article className="max-w-2xl mx-auto card-editorial rounded-2xl p-8 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">Legal</p>
        <h1 className="text-2xl font-display font-semibold">Terms of Service</h1>
        <p className="text-sm text-surface-300 leading-relaxed">
          OfferPath is provided as a job-search workspace. You are responsible for the content you
          upload and for how you use generated suggestions. Do not upload data you are not allowed
          to process. Features such as billing, OAuth, and managed AI keys may be unavailable
          depending on your environment.
        </p>
        <p className="text-sm text-surface-300 leading-relaxed">
          We may change these terms as the product evolves. Continued use after an update means you
          accept the revised terms.
        </p>
        <Link href="/" className="text-sm font-medium text-brand-400 hover:text-brand-300">
          ← Back to OfferPath
        </Link>
      </article>
    </div>
  );
}
