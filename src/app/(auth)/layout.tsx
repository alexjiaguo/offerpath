"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6 relative">
      {/* Top right language switch */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Image src="/logo-infinity.svg" alt="OfferPath Logo" width={32} height={32} className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-medium tracking-tight font-display text-surface-400">
            Offer<span className="text-ember-600">Path</span>
          </span>
        </Link>

        {/* Card */}
        <div className="card-editorial bg-surface-0 rounded-lg p-8 shadow-sm">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-surface-300">
          {t.auth.termsAgreement}{" "}
          <Link href="/terms" className="text-ember-700 hover:text-ember-700 underline underline-offset-2">
            {t.auth.termsLink}
          </Link>
          {" "}&{" "}
          <Link href="/privacy" className="text-ember-700 hover:text-ember-700 underline underline-offset-2">
            {t.auth.privacyLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
