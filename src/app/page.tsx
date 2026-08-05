"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChatCircleText, Compass, FileText, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase";
import { IconProps } from "@phosphor-icons/react";
import { JobDiscoveryPreview, JobTrackerPreview, ResumeBuilderPreview, InterviewPackPreview } from "@/components/landing/BentoPreviews";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { PasteDemo } from "@/components/landing/PasteDemo";
import { HowItWorks } from "@/components/landing/HowItWorks";

/* ═══════════════════════════════════════════════════
   OfferPath - Landing Page v7
   Inspired by checkvibe.dev structural patterns,
   anchored to a warm cream base with a saturated
   ember accent. Editorial Luxury + Functional Tool.
   ═══════════════════════════════════════════════════ */

interface ModuleDef {
  icon: React.ComponentType<IconProps>;
  title: string;
  desc: string;
  features: string[];
  colSpan?: string;
  rowSpan?: string;
  preview?: React.ReactNode;
}

const MODULES: ModuleDef[] = [
  {
    icon: Compass,
    title: "Job Discovery",
    desc: "A scheduled Smart Feed across target companies, match-scored against your profile.",
    features: ["Smart Feed", "Company Watch"],
    colSpan: "md:col-span-6",
    rowSpan: "md:row-span-2",
    preview: <JobDiscoveryPreview />,
  },
  {
    icon: MagnifyingGlass,
    title: "Job Tracker",
    desc: "A Kanban pipeline built for the messiness of a real search. AI scores every JD against your resume as it lands.",
    features: ["JD Analysis", "Kanban Pipeline", "Match Scoring", "History"],
    colSpan: "md:col-span-6",
    rowSpan: "md:row-span-1",
    preview: <JobTrackerPreview />,
  },
  {
    icon: FileText,
    title: "Resume Builder",
    desc: "Nine templates, an editor that reads the JD, and AI tailoring that rewrites your bullets for the role you want.",
    features: ["9 Templates", "AI Tailoring"],
    colSpan: "md:col-span-6",
    rowSpan: "md:row-span-1",
    preview: <ResumeBuilderPreview />,
  },
  {
    icon: ChatCircleText,
    title: "Interview Pack",
    desc: "AI-generated prep guides, simulated mock sessions, and a reusable STAR story bank.",
    features: ["Mock Sessions", "STAR Bank", "Company Research", "Custom Qs"],
    colSpan: "md:col-span-12",
    rowSpan: "md:row-span-1",
    preview: <InterviewPackPreview />,
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "PM → Meta",
    initials: "SC",
    text: "The Job Tracker isn't just a pipeline. It's a strategist. I finally felt in control of a high-stakes search.",
  },
  {
    name: "Michael Park",
    role: "Eng → Stripe",
    initials: "MP",
    text: "The Resume Builder understood the engineering nuances Stripe was looking for. The tailoring caught signals I missed.",
  },
  {
    name: "Aisha Patel",
    role: "Designer → Apple",
    initials: "AP",
    text: "Elegant, intuitive, and powerful. OfferPath matches the design standards I expect from world-class software.",
  },
];

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Job Discovery", href: "#features" },
      { label: "Job Tracker", href: "#features" },
      { label: "Resume Builder", href: "#features" },
      { label: "Interview Pack", href: "#features" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Smart Feed", href: "#features" },
      { label: "Templates", href: "#features" },
      { label: "Mock Sessions", href: "#features" },
      { label: "Pricing", href: "/register" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/register" },
      { label: "Contact", href: "/register" },
      { label: "Changelog", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/register" },
      { label: "Terms", href: "/register" },
      { label: "Cookies", href: "/register" },
    ],
  },
];

const revealVariants = {
  hidden: { opacity: 0, y: 64, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] },
  },
};

const NAV_ITEMS = [
  { label: "Product", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Templates", href: "#features" },
  { label: "Stories", href: "#testimonials" },
];

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
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

      if (loggedIn) {
        router.push("/dashboard");
      } else {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-[100dvh] bg-surface-50 flex items-center justify-center">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-surface-300">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-50 text-surface-400 font-sans">
      <AnnouncementBar />

      {/* ── Floating Pill Navigation (3-col grid, checkvibe structure) ── */}
      <div className="sticky top-0 z-50 pt-4 md:pt-6 px-4">
        <motion.nav
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          className="mx-auto max-w-[90rem] grid grid-cols-[1fr_auto_1fr] items-center bg-white/85 backdrop-blur-2xl border border-white/40 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.12)] rounded-full px-3 py-2.5"
        >
          <Link href="/" className="flex items-center gap-3 pl-3 group">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Image src="/logo-infinity.svg" alt="OfferPath Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-medium tracking-tight text-brand-900 font-display hidden sm:inline">
              OfferPath
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-surface-400 hover:text-ember-600 transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2 justify-self-end pr-2">
            <Link href="/login" className="text-sm font-medium text-surface-400 hover:text-brand-900 transition-colors px-3 py-2">
              Log In
            </Link>
            <Link href="/register" className="btn-ember flex items-center gap-2 py-2.5 pl-5 pr-2 text-sm">
              <span>Sign Up</span>
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight weight="bold" className="w-3.5 h-3.5 text-white" />
              </span>
            </Link>
          </div>

          <button
            className="md:hidden col-start-3 -mr-1 w-11 h-11 flex flex-col justify-center items-center gap-1.5 relative z-[60]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="w-5 h-[1.5px] bg-brand-900 block transition-all"
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-[1.5px] bg-brand-900 block transition-all"
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="w-5 h-[1.5px] bg-brand-900 block transition-all"
            />
          </button>
        </motion.nav>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-surface-50/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-8"
          >
            {NAV_ITEMS.map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.5, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
                className="text-3xl font-display tracking-tight text-brand-900"
              >
                {item.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
              className="flex flex-col gap-4 mt-8 w-64"
            >
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center">Log In</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-ember w-full text-center">Sign Up</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero: editorial copy + interactive paste demo ── */}
      <section className="pt-16 md:pt-24 pb-24 md:pb-32 px-4">
        <div className="max-w-[90rem] mx-auto">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={revealVariants}
          >
            <div className="eyebrow-tag mb-8 mx-auto">
              <Sparkle weight="light" className="text-ember-600 w-3 h-3" />
              The Career Operating System
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-balance mb-8 leading-[0.95]">
              Land your <br />
              <span className="font-display italic font-medium">dream offer.</span>
            </h1>
            <p className="text-lg md:text-xl text-surface-300 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Paste a job URL or your resume. Get an AI match score, tailored bullets, and a tracked pipeline in 90 seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          >
            <PasteDemo />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-surface-300"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-ember-500" />
              BYOK, your model
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-ember-500" />
              No data retention
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-ember-500" />
              9 ATS-tested templates
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Trust strip - single focused message, no fake stats ── */}
      <section className="py-10 gridlines bg-white/50">
        <div className="max-w-[90rem] mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm">
          <span className="font-display italic text-2xl text-brand-900">4 modules.</span>
          <span className="text-surface-300">·</span>
          <span className="text-surface-400 font-medium">One workspace.</span>
          <span className="text-surface-300">·</span>
          <span className="text-surface-400 font-medium">AI anchored to your data, not the internet.</span>
        </div>
      </section>

      {/* ── Features (Asymmetrical Bento) ── */}
      <section id="features" className="py-32 md:py-40 px-4">
        <div className="max-w-[90rem] mx-auto">
          <motion.div
            className="max-w-2xl mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={revealVariants}
          >
            <div className="eyebrow-tag mb-6">Capabilities</div>
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 leading-none">
              Everything you <span className="font-display italic font-medium">need to win.</span>
            </h2>
            <p className="text-surface-300 text-xl font-light">
              Four specialized modules designed to remove the friction from your career search.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(300px,auto)] gap-6">
            {MODULES.map((mod) => (
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
                  <div className="w-14 h-14 shrink-0 rounded-full bg-ember-50 border border-ember-100 flex items-center justify-center">
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
                  {mod.features.map(f => (
                    <span key={f} className="px-3 py-1 rounded-full bg-surface-50 border border-surface-200/50 text-[10px] font-medium tracking-widest uppercase text-surface-400">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* ── Editorial Testimonials (clay-tinted variant) ── */}
      <section id="testimonials" className="py-32 md:py-40 px-4">
        <div className="max-w-[90rem] mx-auto">
          <motion.div
            className="mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
          >
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter max-w-3xl">
              Loved by <span className="font-display italic font-medium">job seekers.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={revealVariants}
                className="card-clay flex flex-col"
              >
                <p className="font-display text-xl md:text-2xl italic text-brand-900 mb-12 flex-1 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-ember-200/60">
                  <div className="w-12 h-12 rounded-full bg-ember-500 text-white flex items-center justify-center text-xs font-bold tracking-widest">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-wide text-brand-900">{t.name}</div>
                    <div className="text-[10px] text-ember-700 uppercase tracking-[0.2em] mt-1 font-medium">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA - split layout (headline + product card) ── */}
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
                Ready to land <br />
                <span className="font-display italic font-medium">your next role?</span>
              </h2>
              <Link href="/register" className="btn-ember inline-flex items-center gap-3 pl-7 pr-2 py-2 text-base">
                <span>Get Started</span>
                <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight weight="bold" className="w-4 h-4 text-white" />
                </span>
              </Link>
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
                  Three things ship today
                </div>
                <ul className="space-y-3">
                  {[
                    { name: "Discovery", desc: "Smart Feed, weekly" },
                    { name: "Tracker", desc: "Kanban + JD scoring" },
                    { name: "Interview Pack", desc: "Mocks + STAR bank" },
                  ].map((item) => (
                    <li key={item.name} className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white border border-ember-200 flex items-center justify-center text-ember-700 font-semibold text-sm">
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
                The career operating system for serious job seekers. End-to-end, from paste to offer.
              </p>
            </div>

            {FOOTER_LINKS.map((group) => (
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
              © {new Date().getFullYear()} OfferPath. All rights reserved.
            </p>
            <p className="text-[10px] text-surface-300 uppercase tracking-[0.2em] font-medium">
              The career operating system
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
