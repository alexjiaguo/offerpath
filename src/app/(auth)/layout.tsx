"use client";

import Link from "next/link";
import { BsBullseye } from 'react-icons/bs';

/* ═══════════════════════════════════════════════════
   Auth Layout — centered card with animated background
   ═══════════════════════════════════════════════════ */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-brand-600/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-zinc-600/[0.05] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-zinc-500/[0.03] rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2.5 mb-8 group"
        >
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center group-hover:scale-105 transition-transform">
            <BsBullseye className="w-5 h-5 text-zinc-900 dark:text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Offer<span className="gradient-text">Path</span>
          </span>
        </Link>

        {/* Card */}
        <div className="liquid-glass rounded-2xl p-8 animate-scale-in">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          © {new Date().getFullYear()} OfferPath. All rights reserved.
        </p>
      </div>
    </div>
  );
}
