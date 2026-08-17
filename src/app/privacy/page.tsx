import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-surface-50 px-6 py-16">
      <article className="max-w-2xl mx-auto card-editorial rounded-2xl p-8 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">Legal</p>
        <h1 className="text-2xl font-display font-semibold">Privacy Policy</h1>
        <p className="text-sm text-surface-300 leading-relaxed">
          OfferPath stores profile, resume, and pipeline data you enter so the workspace can
          function. When you add your own API keys, requests go to the provider you chose. Guest
          sessions live in this browser until you sign in or clear site data.
        </p>
        <p className="text-sm text-surface-300 leading-relaxed">
          If you connect a Supabase project, account data is stored there under your project’s
          policies. We do not sell personal data.
        </p>
        <Link href="/" className="text-sm font-medium text-brand-400 hover:text-brand-300">
          ← Back to OfferPath
        </Link>
      </article>
    </div>
  );
}
