"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, Globe, ArrowRight } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

export function DeepSeekNavbar() {
  const { t, locale, setLocale, isZh } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: t.nav.features, href: "#features" },
    { label: isZh ? "9 套 ATS 模板" : "9 Templates", href: "#templates", badge: "ATS 98%" },
    { label: t.nav.howItWorks, href: "#how-it-works" },
    { label: isZh ? "快速启动" : "Quick Start", href: "#quick-start" },
  ];

  return (
    <div className="sticky top-4 z-50 w-full px-4 sm:px-6 2xl:px-8 max-w-7xl 2xl:max-w-[1600px] mx-auto pointer-events-none">
      <header
        className={`pointer-events-auto transition-all duration-300 rounded-full border border-white/85 ${
          scrolled
            ? "bg-white/75 backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.8)_inset] py-2 px-5"
            : "bg-white/60 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04),0_0_0_1px_rgba(255,255,255,0.6)_inset] py-2.5 px-6"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* ── Left: Brand & Version Tag ── */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
              <Image
                src="/logo-infinity.svg"
                alt="OfferPath Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight text-[#111111] font-sans">
                OfferPath
              </span>
              <span className="inline-flex items-center justify-center font-mono text-[10px] font-semibold text-neutral-600 bg-neutral-900/[0.04] border border-neutral-900/[0.08] px-1.5 py-[1.5px] rounded-md leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                v2.0
              </span>
            </div>
          </Link>

          {/* ── Center: Desktop Navigation Links ── */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-black/[0.03] font-sans text-[13px]"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#C2410C]/10 text-[#C2410C] border border-[#C2410C]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* ── Right: Language Switcher, Log In, & Primary CTA ── */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Switcher Pill */}
            <button
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-950 bg-white/70 hover:bg-white border border-neutral-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)] transition-all"
              title="Switch Language"
            >
              <Globe weight="bold" className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-mono text-[11px] font-medium">{locale === "zh" ? "EN" : "中文"}</span>
            </button>

            {/* Log In Link */}
            <Link
              href="/login"
              className="text-xs font-medium text-neutral-600 hover:text-neutral-950 px-2.5 py-1.5 transition-colors font-sans"
            >
              {t.nav.logIn}
            </Link>

            {/* Primary Sign Up Pill CTA */}
            <Link
              href="/register"
              className="ds-btn-primary text-xs font-semibold px-4 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.25)]"
            >
              <span>{t.nav.signUp}</span>
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* ── Mobile Hamburger Trigger ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              className="p-1.5 rounded-full text-xs font-medium text-[#666666] bg-[#F5F5F5] border border-[#EAEAEA]"
            >
              <Globe weight="bold" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#111111] hover:bg-[#F5F5F5] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X weight="bold" className="w-5 h-5" /> : <List weight="bold" className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Floating Dropdown Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto mt-2 p-5 bg-[#FFFFFF]/95 backdrop-blur-2xl border border-[#EAEAEA] rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col gap-3 md:hidden"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-[#111111] hover:text-[#C2410C] transition-colors py-2 flex items-center justify-between border-b border-[#F0F0F0]"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C2410C]/10 text-[#C2410C]">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold rounded-full border border-[#EAEAEA] text-[#111111] bg-[#F5F5F5]"
              >
                {t.nav.logIn}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold rounded-full bg-[#111111] text-white shadow-sm"
              >
                {t.nav.signUp} &rarr;
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
