"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { BsArrowRight, BsBullseye, BsChatSquareText, BsCheckCircleFill, BsChevronRight, BsCompass, BsCpu, BsFileEarmarkText, BsGlobe, BsLayers, BsLightningFill, BsSearch, BsShield, BsStar, BsStars } from 'react-icons/bs';

/* ═══════════════════════════════════════════════════════
   OfferPath — Landing Page v3
   Aesthetic: Liquid Glass, Editorial Flow, Sentient UI
   ═══════════════════════════════════════════════════════ */

interface ModuleDef {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  features: string[];
  color: string;
  secondaryColor: string;
  delay: number;
}

const MODULES: ModuleDef[] = [
  {
    icon: BsSearch,
    title: "Job Tracker",
    desc: "A powerful Kanban-style pipeline to manage every application. AI analyzes job descriptions to score your fit and prioritize your next move.",
    features: ["JD Analysis", "Kanban Pipeline", "Match Scoring", "Application History"],
    color: "oklch(0.6 0.15 256)",
    secondaryColor: "oklch(0.4 0.1 256)",
    delay: 0.1,
  },
  {
    icon: BsFileEarmarkText,
    title: "Resume Builder",
    desc: "Build stunning, ATS-optimized resumes in minutes. Use AI to tailor your summary and experience for every specific role you apply to.",
    features: ["9 Professional Templates", "AI Resume Tailoring", "ATS Optimization", "PDF & DOCX Export"],
    color: "oklch(0.5 0.22 280)",
    secondaryColor: "oklch(0.35 0.15 280)",
    delay: 0.2,
  },
  {
    icon: BsCompass,
    title: "Job Discovery",
    desc: "Discover matching opportunities across the web. Our engine scans top-tier companies to find roles that align with your unique profile.",
    features: ["Smart Job Feed", "Company Monitoring", "Keyword Matching", "Lead Generation"],
    color: "oklch(0.6 0.2 310)",
    secondaryColor: "oklch(0.45 0.15 310)",
    delay: 0.3,
  },
  {
    icon: BsChatSquareText,
    title: "Interview Prep",
    desc: "Master your interviews with AI-generated prep guides. Practice with simulated mock sessions and build a reusable STAR story bank.",
    features: ["Mock Interviews", "STAR Story Bank", "Company Research", "Custom Question Sets"],
    color: "oklch(0.65 0.1 220)",
    secondaryColor: "oklch(0.45 0.05 220)",
    delay: 0.4,
  },
];

const STATS = [
  { value: "12,480", label: "Jobs Tracked", suffix: "+" },
  { value: "92.4", label: "Interview Rate", suffix: "%" },
  { value: "4.95", label: "User Rating", icon: BsStar },
  { value: "18.2", label: "Avg. Days to Offer", suffix: "d" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "PM → Meta",
    text: "The Job Tracker isn't just a pipeline; it's a strategist. I finally felt in control of a high-stakes search.",
    avatar: "SC",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
  {
    name: "Michael Park",
    role: "Engineer → Stripe",
    text: "The level of detail in the Resume Builder is unmatched. It understood the engineering nuances Stripe was looking for.",
    avatar: "MP",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    name: "Aisha Patel",
    role: "Designer → Apple",
    text: "Elegant, intuitive, and powerful. OfferPath matches the design standards I expect from world-class software.",
    avatar: "AP",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
];

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

const PRICING: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Everything you need to get started.",
    features: [
      "2 Resumes",
      "3 Basic Templates",
      "12 Active Jobs",
      "3 AI Tailorings/week",
      "2 Prep Guides",
    ],
    cta: "Start for Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    desc: "Unlimited power for serious job seekers.",
    features: [
      "Unlimited Resumes",
      "All 9 Premium Templates",
      "Unlimited Job Tracking",
      "Real-time ATS Scoring",
      "Job Discovery Feed",
      "DOCX + PDF Exports",
      "Priority Support",
    ],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/seat/mo",
    desc: "For career coaches and recruitment teams.",
    features: [
      "Multi-user Workspace",
      "Client Management",
      "Custom Templates",
      "Advanced Analytics",
      "Dedicated Support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBgOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const navBlur = useTransform(scrollY, [0, 100], [0, 24]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-surface-0 selection:bg-brand-500/30">
      {/* ── Sentient Background ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/[0.03] rounded-full blur-[120px] animate-pulse-subtle" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/[0.02] rounded-full blur-[150px] animate-pulse-subtle delay-1000" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/[0.02] rounded-full blur-[100px] animate-liquid-float" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* ── Navigation ── */}
      <motion.nav
        style={{ backgroundColor: `rgba(18, 18, 18, ${navBgOpacity.get()})`, backdropFilter: `blur(${navBlur.get()}px)` }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.03] transition-colors"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl gradient-futuristic flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-500">
              <BsBullseye className="w-5 h-5 text-zinc-900 dark:text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-display">
              Offer<span className="text-gradient-futuristic">Path</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {["Features", "Pricing", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors shadow-xl shadow-white/5"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-700 dark:text-zinc-400 text-xs font-medium tracking-wider uppercase mb-10"
          >
            <BsStars className="w-3.5 h-3.5 text-brand-400" />
            All-in-one Job Hunting Toolkit
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8 font-display text-zinc-900 dark:text-white text-balance"
          >
            Land your <br />
            <span className="text-gradient-futuristic italic">dream offer.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-zinc-700 dark:text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          >
            Track your pipeline, build tailored resumes, and ace interviews with AI. The complete operating system for your career.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Link
              href="/register"
              className="group relative flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-black font-bold text-lg hover:bg-zinc-100 transition-all shadow-2xl shadow-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-400/0 via-brand-400/20 to-brand-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              Start Your Search
              <BsArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-10 py-4 rounded-2xl border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-semibold text-lg hover:bg-white/5 transition-all"
            >
              See All Features
            </a>
          </motion.div>

          {/* Editorial Stats Layout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto mt-24 border-t border-zinc-200 dark:border-white/[0.05] pt-12"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center group cursor-default">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-3xl font-light text-zinc-900 dark:text-white font-display tabular-nums">
                    {stat.value}{stat.suffix}
                  </span>
                  {stat.icon && <stat.icon className="w-5 h-5 text-amber-400" />}
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase group-hover:text-brand-400 transition-colors">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Active Grid: Intelligence Modules ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-display">
                Everything you <br />
                <span className="text-gradient-futuristic italic">need to win.</span>
              </h2>
              <p className="text-zinc-700 dark:text-zinc-400 text-xl font-light">
                Four specialized modules designed to automate the friction of your career search.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-zinc-200 dark:border-white/10">
                <BsGlobe className="w-6 h-6 text-brand-400" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-zinc-200 dark:border-white/10">
                <BsCpu className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MODULES.map((mod, i) => (
              <ModuleCard key={mod.title} mod={mod} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial Flow: The Synthesis ── */}
      <section className="py-40 px-6 relative overflow-hidden bg-surface-50">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-2 rounded-3xl bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent" />
              <Image
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
					width={1200}
					height={800}
					priority
                alt="Resume Editor Interface"
                className="rounded-2xl opacity-80 mix-blend-luminosity grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute bottom-8 left-8 right-8 p-6 liquid-glass rounded-2xl border border-zinc-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-brand-400">Live Editor</span>
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Analyzing: Product Designer Application</p>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "94%" }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="h-full gradient-futuristic"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">ATS Match Score</span>
                  <span className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest">94.8%</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-bold font-display leading-[1.1]">
              Built for <br />
              <span className="text-gradient-futuristic italic">maximum callbacks.</span>
            </h2>
            <p className="text-xl text-zinc-700 dark:text-zinc-400 font-light leading-relaxed max-w-xl">
              OfferPath doesn&apos;t just track your applications; it optimizes every part of your profile to match what hiring managers are looking for.
            </p>

            <div className="grid sm:grid-cols-2 gap-8 pt-6">
              {[
                {
                  icon: BsLayers,
                  title: "Smart Tailoring",
                  desc: "Automatically adjust your experience bullets to match job descriptions perfectly.",
                },
                {
                  icon: BsShield,
                  title: "ATS-Ready",
                  desc: "Templates designed to be easily readable by both human recruiters and software.",
                },
              ].map((item) => (
                <div key={item.title} className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials: Emotional Validation ── */}
      <section id="testimonials" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display tracking-tight">
              Loved by <span className="text-gradient-futuristic italic">job seekers.</span>
            </h2>
            <div className="flex items-center justify-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <BsStar key={i} className="w-5 h-5 text-zinc-900 dark:text-white fill-white" />
              ))}
              <span className="ml-2 text-zinc-500 font-medium uppercase tracking-widest text-xs italic">Exceptional Feedback</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-white/[0.01] border border-zinc-200 dark:border-white/[0.05] hover:bg-white/[0.02] hover:border-white/[0.1] transition-all duration-500 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${t.gradient} blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <p className="text-zinc-700 dark:text-zinc-300 text-lg font-light leading-relaxed mb-8 relative z-10 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl gradient-futuristic flex items-center justify-center text-sm font-bold text-white shadow-xl shadow-brand-500/20">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">{t.name}</div>
                    <div className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing: Value Orchestration ── */}
      <section id="pricing" className="py-40 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 font-display tracking-tight">
              Simple, transparent <span className="text-gradient-futuristic italic">pricing.</span>
            </h2>
            <p className="text-zinc-500 text-xl font-light">Start for free and upgrade as your search scales.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {PRICING.map((plan, i) => (
              <PricingCard key={plan.name} plan={plan} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call ── */}
      <section className="py-40 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-5xl mx-auto relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-purple-600/10 to-blue-600/20 rounded-[40px] blur-[80px] opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
          <div className="relative liquid-glass rounded-[40px] p-16 md:p-24 text-center border border-white/[0.08]">
            <BsLightningFill className="w-16 h-16 text-brand-400 mx-auto mb-10 animate-pulse-subtle" />
            <h2 className="text-4xl md:text-7xl font-bold mb-8 font-display tracking-tighter text-zinc-900 dark:text-white">
              Ready to land <br />
              <span className="text-gradient-futuristic italic text-5xl md:text-8xl">your next role?</span>
            </h2>
            <p className="text-zinc-700 dark:text-zinc-400 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands of professionals who have accelerated their career hunt with OfferPath.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-4 px-12 py-5 rounded-2xl bg-white text-black font-bold hover:bg-zinc-200 transition-all text-xl shadow-2xl shadow-white/10 group/btn"
            >
              Get Started for Free
              <BsChevronRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-24 px-6 border-t border-white/[0.03] bg-surface-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-5">
              <Link href="/" className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl gradient-futuristic flex items-center justify-center">
                  <BsBullseye className="w-4.5 h-4.5 text-zinc-900 dark:text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white font-display uppercase tracking-[0.15em]">
                  OfferPath
                </span>
              </Link>
              <p className="text-zinc-500 leading-relaxed font-light text-lg max-sm mb-8">
                The all-in-one operating system for your professional career search.
              </p>
              <div className="flex items-center gap-4 text-zinc-500">
                <BsShield className="w-5 h-5" />
                <span className="text-xs uppercase tracking-widest font-bold">Secure & Private Protocol</span>
              </div>
            </div>

            {[
              {
                title: "Product",
                links: ["Pipeline", "Resume Studio", "Job Discovery", "Interview Prep", "Pricing"],
              },
              {
                title: "Resources",
                links: ["Changelog", "System Status", "Support", "Documentation"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security"],
              },
            ].map((col) => (
              <div key={col.title} className="md:col-span-2 md:last:col-span-1">
                <h4 className="text-[10px] font-bold tracking-[0.3em] mb-8 text-zinc-700 dark:text-zinc-300 uppercase">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium tracking-tight"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/[0.03]">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
              © {new Date().getFullYear()} OfferPath Labs. All rights reserved.
            </p>
            <div className="mt-6 md:mt-0 text-[10px] uppercase tracking-widest text-zinc-600 font-bold italic">
              Empowering the modern workforce.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ModuleCard({ mod, index }: { mod: ModuleDef; index: number }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group glass-card rounded-3xl p-10 flex flex-col h-full perspective-1000"
    >
      <div className="mb-8 relative">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 shadow-xl"
          style={{ 
            background: `linear-gradient(135deg, ${mod.color}, ${mod.secondaryColor})`,
            boxShadow: `0 10px 30px -5px ${mod.color}40`
          }}
        >
          <mod.icon className="w-7 h-7 text-zinc-900 dark:text-white" />
        </div>
        <div 
          className="absolute inset-0 w-14 h-14 rounded-2xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700"
          style={{ backgroundColor: mod.color }}
        />
      </div>

      <h3 className="text-2xl font-bold mb-4 font-display group-hover:text-brand-400 transition-colors">
        {mod.title}
      </h3>
      <p className="text-zinc-500 text-sm leading-relaxed mb-8 flex-grow font-light">
        {mod.desc}
      </p>

      <ul className="space-y-3.5 mt-auto">
        {mod.features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-xs font-bold tracking-tight text-zinc-700 dark:text-zinc-400 uppercase">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mod.color }} />
            {f}
          </li>
        ))}
      </ul>
      
      <div className="mt-8 pt-8 border-t border-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
          Get Started <BsChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative group p-10 rounded-[32px] flex flex-col h-full border transition-all duration-700 ${
        plan.highlight 
          ? "liquid-glass border-brand-500/30 bg-white/[0.02]" 
          : "bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.02]"
      }`}
    >
      {plan.highlight && (
        <>
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/10 rounded-full blur-[60px] opacity-50" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full gradient-futuristic text-[10px] font-bold tracking-[0.2em] uppercase text-white shadow-xl">
            Recommended
          </div>
        </>
      )}

      <div className="mb-10">
        <h3 className="text-2xl font-bold mb-2 font-display">{plan.name}</h3>
        <p className="text-zinc-500 text-sm font-light leading-relaxed">{plan.desc}</p>
      </div>

      <div className="flex items-baseline gap-2 mb-10">
        <span className="text-5xl font-light text-zinc-900 dark:text-white font-display">{plan.price}</span>
        <span className="text-zinc-600 text-sm font-medium uppercase tracking-widest">{plan.period}</span>
      </div>

      <button
        className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all mb-10 ${
          plan.highlight
            ? "bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5"
            : "bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white"
        }`}
      >
        {plan.cta}
      </button>

      <div className="space-y-5 mt-auto">
        <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-600">Plan Features</div>
        <ul className="space-y-4">
          {plan.features.map((f: string) => (
            <li key={f} className="flex items-start gap-3.5 text-sm text-zinc-700 dark:text-zinc-400 group-hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors">
              <BsCheckCircleFill className="w-5 h-5 text-brand-500 flex-shrink-0 mt-[-2px]" />
              <span className="font-light leading-tight">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
