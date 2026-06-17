"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChatCircleText, Compass, FileText, MagnifyingGlass, Sparkle } from "@phosphor-icons/react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase";
import { IconProps } from "@phosphor-icons/react";
import { HeroVisual } from "@/components/landing/BentoPreviews";
import { JobDiscoveryPreview, JobTrackerPreview, ResumeBuilderPreview, InterviewPackPreview } from "@/components/landing/BentoPreviews";

/* ═══════════════════════════════════════════════════════
   OfferPath — Landing Page v6 (Vanguard UI Architect)
   Aesthetic: Soft Structuralism / Editorial Luxury
   ═══════════════════════════════════════════════════════ */

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
    desc: "Discover matching opportunities across the web.",
    features: ["Smart Feed", "Company Watch"],
    colSpan: "md:col-span-6",
    rowSpan: "md:row-span-2",
    preview: <JobDiscoveryPreview />,
  },
  {
    icon: MagnifyingGlass,
    title: "Job Tracker",
    desc: "A powerful Kanban-style pipeline to manage every application. AI analyzes job descriptions to score your fit and prioritize your next move.",
    features: ["JD Analysis", "Kanban Pipeline", "Match Scoring", "History"],
    colSpan: "md:col-span-6",
    rowSpan: "md:row-span-1",
    preview: <JobTrackerPreview />,
  },
  {
    icon: FileText,
    title: "Resume Builder",
    desc: "Build stunning, ATS-optimized resumes in minutes.",
    features: ["9 Templates", "AI Tailoring"],
    colSpan: "md:col-span-6",
    rowSpan: "md:row-span-1",
    preview: <ResumeBuilderPreview />,
  },
  {
    icon: ChatCircleText,
    title: "Interview Pack",
    desc: "Master your interviews with AI-generated prep guides. Practice with simulated mock sessions and build a reusable STAR story bank.",
    features: ["Mock Sessions", "STAR Bank", "Company Research", "Custom Qs"],
    colSpan: "md:col-span-12",
    rowSpan: "md:row-span-1",
    preview: <InterviewPackPreview />,
  },
];

const STATS = [
  { value: "12k", label: "Jobs Tracked", suffix: "+" },
  { value: "92", label: "Interview Rate", suffix: "%" },
  { value: "4.9", label: "User Rating", suffix: "/5" },
  { value: "18", label: "Days to Offer", suffix: "d" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "PM → Meta",
    text: "The Job Tracker isn't just a pipeline; it's a strategist. I finally felt in control of a high-stakes search.",
    initials: "SC",
    avatar: "/images/avatars/avatar1.png"
  },
  {
    name: "Michael Park",
    role: "Eng → Stripe",
    text: "The level of detail in the Resume Builder is unmatched. It understood the engineering nuances Stripe was looking for.",
    initials: "MP",
    avatar: "/images/avatars/avatar2.png"
  },
  {
    name: "Aisha Patel",
    role: "Designer → Apple",
    text: "Elegant, intuitive, and powerful. OfferPath matches the design standards I expect from world-class software.",
    initials: "AP",
    avatar: "/images/avatars/avatar3.png"
  },
];

const revealVariants = {
  hidden: { opacity: 0, y: 64, filter: "blur(8px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }
  }
};

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
    <div className="min-h-[100dvh] bg-surface-50 text-surface-400 font-sans selection:bg-black/10">
      
      {/* ── Fluid Island Navigation ── */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          className="pointer-events-auto bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.05)] rounded-full px-4 py-3 flex items-center justify-between w-full max-w-6xl"
        >
          <Link href="/" className="flex items-center gap-3 group px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-surface-200 shadow-sm">
               <Image src="/logo-mark.svg" alt="OfferPath Logo" width={32} height={32} className="w-full h-full object-cover scale-110" />
            </div>
            <span className="text-lg font-medium tracking-tight text-brand-900 font-display">
              OfferPath
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {["Job Discovery", "Job Tracker", "Resume Builder", "Interview Pack", "Testimonials"].map((label) => {
              const href = `#${label.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <a
                  key={label}
                  href={href}
                  className="text-[11px] font-semibold uppercase tracking-widest text-surface-300 hover:text-brand-900 transition-colors"
                >
                  {label}
                </a>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium hover:opacity-70 transition-opacity px-4">
              Log In
            </Link>
            <Link href="/register" className="btn-primary py-2.5 px-5 text-sm">
              Get Started
            </Link>
          </div>

          <button 
            className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 relative z-[60]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 bg-surface-50/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-8"
          >
            {["Job Discovery", "Job Tracker", "Resume Builder", "Interview Pack", "Testimonials"].map((label, i) => {
              const href = `#${label.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <motion.a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * i, duration: 0.5, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
                  className="text-3xl font-display tracking-tight text-brand-900"
                >
                  {label}
                </motion.a>
              );
            })}
            <motion.div 
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
              className="flex flex-col gap-4 mt-8 w-64"
            >
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full text-center">Log In</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-center">Get Started</Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section (Editorial Split) ── */}
      <section className="pt-48 pb-24 md:py-40 px-4 max-w-[90rem] mx-auto min-h-[100dvh] flex flex-col justify-center">
        <div className="grid md:grid-cols-12 gap-16 md:gap-8 items-center w-full">
          <motion.div 
            className="md:col-span-6 w-full"
            initial="hidden"
            animate="visible"
            variants={revealVariants}
          >
            <div className="eyebrow-tag mb-8">
              <Sparkle weight="light" className="text-brand-500 w-3 h-3" />
              The Career Operating System
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-light tracking-tighter text-balance mb-8 leading-[0.95]">
              Land your <br />
              <span className="font-display italic font-medium">dream offer.</span>
            </h1>
            <p className="text-xl md:text-2xl text-surface-300 max-w-xl mb-12 leading-relaxed font-light">
              Track pipelines, build tailored resumes, and ace interviews with precision AI. A unified space for serious job seekers.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/register" className="btn-primary group flex items-center justify-between gap-6 pl-8 pr-2 w-max">
                <span className="text-base">Start Your Search</span>
                <div className="btn-icon-wrapper group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                  <ArrowRight weight="light" className="text-white w-4 h-4" />
                </div>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:col-span-6 w-full flex justify-end"
            initial={{ opacity: 0, x: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          >
            <HeroVisual />
          </motion.div>
        </div>
      </section>

      {/* ── Stats Layout ── */}
      <section className="py-24 border-y border-surface-200/50 bg-white/50">
        <div className="max-w-[90rem] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 divide-x-0 md:divide-x divide-surface-200/50">
          {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              className={`md:pl-12 ${i === 0 ? 'md:pl-0' : ''}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={revealVariants}
            >
              <div className="text-4xl md:text-5xl font-display tracking-tight text-brand-900 mb-3">
                {stat.value}<span className="text-surface-300 text-3xl font-sans">{stat.suffix}</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-surface-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features (Asymmetrical Bento) ── */}
      <section id="features" className="py-32 md:py-40 px-4 max-w-[90rem] mx-auto">
        <motion.div 
          className="max-w-2xl mb-24"
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
            Four specialized modules designed to automate the friction of your career search.
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
              className={`doppel-shell flex flex-col ${mod.colSpan} ${mod.rowSpan} w-full scroll-mt-32`}
            >
              <div className="doppel-core flex-1 flex flex-col p-8 md:p-10 relative group">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-surface-50 border border-surface-200/50 flex items-center justify-center shadow-inner">
                    <mod.icon weight="light" className="w-7 h-7 text-brand-900" />
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
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Editorial Testimonials ── */}
      <section id="testimonials" className="py-32 md:py-40 px-4 bg-white border-y border-surface-200/50">
        <div className="max-w-[90rem] mx-auto">
          <motion.div 
            className="mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={revealVariants}
          >
             <div className="eyebrow-tag mb-6">Success Stories</div>
             <h2 className="text-5xl md:text-7xl font-light tracking-tighter">
              Loved by <span className="font-display italic font-medium">job seekers.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {TESTIMONIALS.map((t) => (
              <motion.div 
                key={t.name} 
                className="doppel-shell"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={revealVariants}
              >
                <div className="doppel-core h-full flex flex-col p-8 md:p-10">
                  <p className="font-display text-2xl italic text-surface-400 mb-12 flex-1 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 mt-auto pt-8 border-t border-surface-200/50">
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center font-bold text-xs tracking-widest text-brand-900 border border-brand-100 shadow-inner overflow-hidden relative">
                      <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold tracking-wide">{t.name}</div>
                      <div className="text-[10px] text-surface-300 uppercase tracking-[0.2em] mt-1">{t.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer / CTA ── */}
      <section className="py-32 md:py-48 px-4 border-t border-surface-200/50 bg-white text-center">
        <motion.div 
          className="max-w-4xl mx-auto flex flex-col items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={revealVariants}
        >
          <div className="w-16 h-16 rounded-full bg-white border border-surface-200/50 flex items-center justify-center mb-12 shadow-inner overflow-hidden">
            <Image src="/logo-mark.svg" alt="OfferPath Logo" width={64} height={64} className="w-full h-full object-cover scale-110" />
          </div>
          <h2 className="text-6xl md:text-8xl font-light tracking-tighter mb-12 leading-[0.9]">
            Ready to land <br />
            <span className="font-display italic font-medium">your next role?</span>
          </h2>
          <Link href="/register" className="btn-primary group flex items-center justify-between gap-6 pl-8 pr-2 w-max text-lg">
            <span>Get Started</span>
            <div className="btn-icon-wrapper group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
              <ArrowRight weight="light" className="text-white w-4 h-4" />
            </div>
          </Link>
        </motion.div>
      </section>
      
      <footer className="py-12 text-center text-[10px] text-surface-300 uppercase tracking-[0.2em] bg-white font-medium">
         &copy; {new Date().getFullYear()} OfferPath. All rights reserved.
      </footer>
    </div>
  );
}
