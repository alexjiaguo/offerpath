"use client";

import Link from "next/link";
import Image from "next/image";

/* ═══════════════════════════════════════════════════
   Auth Layout — centered card (Minimalist)
   ═══════════════════════════════════════════════════ */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-6">
      
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-10 group"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-surface-200 shadow-sm bg-white">
             <Image src="/logo-mark.svg" alt="OfferPath Logo" width={32} height={32} className="w-full h-full object-cover scale-110" />
          </div>
          <span className="text-xl font-medium tracking-tight font-display">
            OfferPath
          </span>
        </Link>

        {/* Card */}
        <div className="glass-card bg-surface-0 rounded-lg p-8">
          {children}
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-surface-300">
          By signing in, you agree to our Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
