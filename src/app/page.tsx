"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChatCircleText, Compass, FileText, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase";
import { IconProps } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { PasteDemo } from "@/components/landing/PasteDemo";
import { useTranslation } from "@/i18n";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

const HowItWorks = dynamic(
  () => import("@/components/landing/HowItWorks").then((m) => ({ default: m.HowItWorks }))
);
const JobDiscoveryPreview = dynamic(
  () => import("@/components/landing/BentoPreviews").then((m) => ({ default: m.JobDiscoveryPreview }))
);
const JobTrackerPreview = dynamic(
  () => import("@/components/landing/BentoPreviews").then((m) => ({ default: m.JobTrackerPreview }))
);
const ResumeBuilderPreview = dynamic(
  () => import("@/components/landing/BentoPreviews").then((m) => ({ default: m.ResumeBuilderPreview }))
);
const InterviewPackPreview = dynamic(
  () => import("@/components/landing/BentoPreviews").then((m) => ({ default: m.InterviewPackPreview }))
);
const TemplateShowcase = dynamic(
  () => import("@/components/landing/TemplateShowcase").then((m) => ({ default: m.TemplateShowcase }))
);

interface ModuleDef {
  icon: React.ComponentType<IconProps>;
  title: string;
  desc: string;
  features: string[];
  colSpan?: string;
  rowSpan?: string;
  preview?: React.ReactNode;
}

const revealVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
  },
};

export default function LandingPage() {
  const router = useRouter();
  const { isZh, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      let loggedIn = false;
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          loggedIn = !!session;
        }
      } else {
        loggedIn = document.cookie.includes("auth_token=");
      }
      if (loggedIn) router.push("/dashboard");
    }
    checkAuth();
  }, [router]);

  const navItems = useMemo(() => [
    { label: t.nav.features || t.nav.capabilities, href: "#features" },
    { label: t.nav.templates || (isZh ? "简历模板" : "Templates"), href: "#templates", badge: "9" },
    { label: t.nav.howItWorks, href: "#how-it-works" },
  ], [t, isZh]);

  const modules = useMemo<ModuleDef[]>(() => [
    {
      icon: Compass,
      title: t.landing.modules.discovery.title,
      desc: t.landing.modules.discovery.desc,
      features: t.landing.modules.discovery.tags,
      colSpan: "md:col-span-6",
      rowSpan: "md:row-span-2",
      preview: <JobDiscoveryPreview />,
    },
    {
      icon: MagnifyingGlass,
      title: t.landing.modules.tracker.title,
      desc: t.landing.modules.tracker.desc,
      features: t.landing.modules.tracker.tags,
      colSpan: "md:col-span-6",
      rowSpan: "md:row-span-1",
      preview: <JobTrackerPreview />,
    },
    {
      icon: FileText,
      title: t.landing.modules.resume.title,
      desc: t.landing.modules.resume.desc,
      features: t.landing.modules.resume.tags,
      colSpan: "md:col-span-6",
      rowSpan: "md:row-span-1",
      preview: <ResumeBuilderPreview />,
    },
    {
      icon: ChatCircleText,
      title: t.landing.modules.interview.title,
      desc: t.landing.modules.interview.desc,
      features: t.landing.modules.interview.tags,
      colSpan: "md:col-span-12",
      rowSpan: "md:row-span-1",
      preview: <InterviewPackPreview />,
    },
  ], [t]);

  const footerLinks = useMemo(() => [
    {
      title: t.landing.footerLinks.product,
      links: [
        { label: t.landing.modules.resume.title, href: "#features" },
        { label: isZh ? "9 套 ATS 模板" : "9 ATS Templates", href: "#templates" },
        { label: t.landing.modules.tracker.title, href: "#features" },
        { label: t.landing.modules.discovery.title, href: "#features" },
        { label: t.landing.modules.interview.title, href: "#features" },
      ],
    },
    {
      title: t.landing.footerLinks.resources,
      links: [
        { label: isZh ? "模板库预览" : "Template Gallery", href: "/preview-templates" },
        { label: t.nav.howItWorks, href: "#how-it-works" },
        { label: t.nav.pricing, href: "#features" },
      ],
    },
    {
      title: t.landing.footerLinks.company,
      links: [
        { label: t.landing.footerLinks.about, href: "#features" },
        { label: t.landing.footerLinks.contact, href: "/register" },
        { label: t.landing.footerLinks.changelog, href: "#features" },
      ],
    },
    {
      title: t.landing.footerLinks.legal,
      links: [
        { label: t.landing.footerLinks.privacy, href: "/privacy" },
        { label: t.landing.footerLinks.terms, href: "/terms" },
        { label: t.landing.footerLinks.cookies, href: "/privacy" },
      ],
    },
  ], [t, isZh]);

  return (
    <div id="main-content" className="min-h-[100dvh] bg-surface-50 text-surface-400 font-sans">
      <AnnouncementBar />

      {/* ── Fixed Glassmorphic Navigation Bar ── */}
      <header className="sticky top-0 z-50 bg-surface-50/85 backdrop-blur-md border-b border-surface-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
              <Image src="/logo-infinity.svg" alt="OfferPath Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-900 font-display">
              OfferPath
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-surface-400 hover:text-ember-600 transition-colors font-medium flex items-center gap-1.5"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-ember-100 text-ember-700">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            <div className="w-[1px] h-4 bg-surface-200 mx-1" />
            <Link href="/login" className="text-sm font-semibold text-surface-400 hover:text-brand-900 transition-colors px-3 py-1.5">
              {t.nav.logIn}
            </Link>
            <Link href="/register" className="btn-ember flex items-center gap-1.5 py-2 px-4 text-xs font-semibold rounded-lg shadow-sm">
              <span>{t.nav.signUp}</span>
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
              className="w-9 h-9 flex flex-col justify-center items-center gap-1.5 rounded-lg border border-surface-200/80 bg-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="w-4 h-[1.5px] bg-brand-900 block transition-all"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-4 h-[1.5px] bg-brand-900 block transition-all"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="w-4 h-[1.5px] bg-brand-900 block transition-all"
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-surface-50/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 px-6"
          >
            {navItems.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
                className="text-2xl font-display font-semibold tracking-tight text-brand-900"
              >
                {item.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="flex flex-col gap-3 mt-6 w-full max-w-xs"
            >
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center py-2.5 text-sm">{t.nav.logIn}</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-ember w-full text-center py-2.5 text-sm">{t.nav.signUp}</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero: outcome-focused headline + 4-pillar quick badges + interactive paste demo ── */}
      <section className="pt-12 md:pt-20 pb-20 md:pb-28 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={revealVariants}
          >
            <div className="eyebrow-tag mb-6 mx-auto inline-flex items-center gap-1.5">
              <Sparkle weight="fill" className="text-ember-600 w-3.5 h-3.5" />
              <span>{t.landing.heroEyebrow}</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-balance mb-6 leading-[0.95] text-brand-900">
              {t.landing.heroTitlePrefix} <br />
              <span className="font-display font-semibold text-ember-600">{t.landing.heroTitleHighlight}</span>
            </h1>
            <p className="text-base md:text-lg text-surface-300 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
              {t.landing.heroSubtitle}
            </p>

            {/* 4 Superpower feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-10">
              <a href="#templates" className="px-3.5 py-1.5 rounded-full bg-white border border-surface-200/80 shadow-xs text-xs font-semibold text-brand-900 hover:border-ember-500/50 hover:text-ember-600 transition-colors inline-flex items-center gap-1.5">
                <FileText weight="duotone" className="w-4 h-4 text-ember-600" />
                <span>{isZh ? "AI 简历工坊 (9套模板)" : "AI Resume Studio (9 Templates)"}</span>
              </a>
              <a href="#features" className="px-3.5 py-1.5 rounded-full bg-white border border-surface-200/80 shadow-xs text-xs font-semibold text-brand-900 hover:border-blue-500/50 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5">
                <MagnifyingGlass weight="duotone" className="w-4 h-4 text-blue-600" />
                <span>{isZh ? "智能求职看板" : "Kanban Job Tracker"}</span>
              </a>
              <a href="#features" className="px-3.5 py-1.5 rounded-full bg-white border border-surface-200/80 shadow-xs text-xs font-semibold text-brand-900 hover:border-emerald-500/50 hover:text-emerald-600 transition-colors inline-flex items-center gap-1.5">
                <Compass weight="duotone" className="w-4 h-4 text-emerald-600" />
                <span>{isZh ? "企业官网职位发现" : "Direct Job Discovery"}</span>
              </a>
              <a href="#features" className="px-3.5 py-1.5 rounded-full bg-white border border-surface-200/80 shadow-xs text-xs font-semibold text-brand-900 hover:border-purple-500/50 hover:text-purple-600 transition-colors inline-flex items-center gap-1.5">
                <ChatCircleText weight="duotone" className="w-4 h-4 text-purple-600" />
                <span>{isZh ? "AI 模拟面试备战" : "AI Mock Interview"}</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          >
            <PasteDemo />
          </motion.div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="py-8 bg-white border-y border-surface-200/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm font-medium text-surface-400">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <strong className="text-brand-900">{isZh ? "90 秒" : "90-Second"}</strong> {isZh ? "智能针对性润色" : "AI Resume Tailoring"}
          </span>
          <span className="text-surface-200 hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong className="text-brand-900">9 {isZh ? "套" : ""}</strong> {isZh ? "ATS 实战验证模板" : "ATS-Engineered Templates"}
          </span>
          <span className="text-surface-200 hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <strong className="text-brand-900">4 {isZh ? "大" : ""}</strong> {isZh ? "一体化求职工具" : "Integrated Career Tools"}
          </span>
          <span className="text-surface-200 hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <strong className="text-brand-900">{isZh ? "100% 本地优先" : "100% Private"}</strong> {isZh ? "数据安全不滥用" : "& Local-First Data"}
          </span>
        </div>
      </section>

      {/* ── Features (Asymmetrical Bento) ── */}
      <section id="features" className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="max-w-2xl mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealVariants}
          >
            <div className="eyebrow-tag mb-4">{t.landing.capabilitiesEyebrow}</div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-4 leading-tight text-brand-900">
              {t.landing.capabilitiesTitle}{" "}
              <span className="font-display font-semibold text-ember-600">{t.landing.capabilitiesHighlight}</span>
            </h2>
            <p className="text-surface-300 text-base md:text-lg font-normal">
              {t.landing.capabilitiesSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(300px,auto)] gap-6">
            {modules.map((mod) => (
              <motion.div
                key={mod.title}
                id={mod.title.toLowerCase().replace(/\s+/g, "-")}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={revealVariants}
                className={`card-editorial flex flex-col p-8 md:p-10 relative group ${mod.colSpan} ${mod.rowSpan} w-full scroll-mt-32`}
              >
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-14 h-14 shrink-0 rounded-md bg-ember-50 border border-ember-100 flex items-center justify-center">
                    <mod.icon weight="light" className="w-7 h-7 text-ember-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl md:text-3xl font-display tracking-tight mb-2">{mod.title}</h3>
                    <p className="text-surface-300 text-sm md:text-base leading-relaxed font-light">
                      {mod.desc}
                    </p>
                  </div>
                </div>
                {mod.preview && (
                  <div className="flex-1 min-h-0 mb-4">{mod.preview}</div>
                )}
                <div className="flex flex-wrap gap-2">
                  {mod.features.map((f) => (
                    <span key={f} className="px-3 py-1 rounded-md bg-surface-50 border border-surface-200/50 text-[10px] font-medium tracking-widest uppercase text-surface-400">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9 ATS Templates Showcase ── */}
      <TemplateShowcase />

      <HowItWorks />

      {/* ── Final CTA ── */}
      <section className="py-32 md:py-40 px-4 bg-white border-t border-surface-200/60">
        <div className="max-w-[90rem] mx-auto">
          <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-center">
            <motion.div
              className="md:col-span-7"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={revealVariants}
            >
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-10 leading-[0.9]">
                {t.landing.ctaTitle} <br />
                <span className="font-display font-semibold text-ember-600">{t.landing.ctaHighlight}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/register" className="btn-ember inline-flex items-center gap-3 pl-7 pr-2 py-2 text-base">
                  <span>{t.landing.ctaButton}</span>
                  <span className="w-9 h-9 rounded-md bg-surface-0/20 flex items-center justify-center">
                    <ArrowRight weight="bold" className="w-4 h-4 text-white" />
                  </span>
                </Link>
                <a
                  href="#how-it-works"
                  className="btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm"
                >
                  {t.landing.ctaSecondary}
                </a>
              </div>
            </motion.div>

            <motion.div
              className="md:col-span-5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={revealVariants}
            >
              <div className="card-clay">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-ember-700 mb-4">
                  {t.landing.ctaBadge}
                </div>
                <ul className="space-y-3">
                  {t.landing.ctaFeatures.map((item) => (
                    <li key={item.name} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-md bg-white border border-ember-200 flex items-center justify-center text-ember-700 font-semibold text-sm">
                        {item.name[0]}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-brand-900">{item.name}</div>
                        <div className="text-xs text-ember-700">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-surface-200/60">
        <div className="max-w-[90rem] mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Image src="/logo-infinity.svg" alt="OfferPath Logo" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-medium tracking-tight text-brand-900 font-display">OfferPath</span>
              </Link>
              <p className="text-xs text-surface-300 mt-4 leading-relaxed max-w-xs">
                {t.landing.footerTagline}
              </p>
            </div>

            {footerLinks.map((group) => (
              <div key={group.title}>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-900 mb-4">
                  {group.title}
                </div>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-surface-300 hover:text-ember-600 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-surface-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-surface-300 uppercase tracking-[0.2em] font-medium">
              © {new Date().getFullYear()} {t.landing.footerCopyright}
            </p>
            <p className="text-[10px] text-surface-300 uppercase tracking-[0.2em] font-medium">
              {t.landing.heroEyebrow}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
