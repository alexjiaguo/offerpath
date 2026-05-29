"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChatCircleText, CheckCircle, CaretRight, Compass, Cpu, FileText, Globe, Lightning, MagnifyingGlass, Shield, Star, Sparkle } from "@phosphor-icons/react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════
   OfferPath — Landing Page v5
   Aesthetic: Premium Utilitarian Minimalism
   ═══════════════════════════════════════════════════════ */

import { IconProps } from "@phosphor-icons/react";

interface ModuleDef {
  icon: React.ComponentType<IconProps>;
  title: string;
  desc: string;
  features: string[];
}

const MODULES: ModuleDef[] = [
  {
    icon: MagnifyingGlass,
    title: "Job Tracker",
    desc: "A powerful Kanban-style pipeline to manage every application. AI analyzes job descriptions to score your fit and prioritize your next move.",
    features: ["JD Analysis", "Kanban Pipeline", "Match Scoring", "History"],
  },
  {
    icon: FileText,
    title: "Resume Builder",
    desc: "Build stunning, ATS-optimized resumes in minutes. Use AI to tailor your summary and experience for every specific role you apply to.",
    features: ["9 Templates", "AI Tailoring", "ATS Ready", "Export"],
  },
  {
    icon: Compass,
    title: "Job Discovery",
    desc: "Discover matching opportunities across the web. Our engine scans top-tier companies to find roles that align with your unique profile.",
    features: ["Smart Feed", "Company Watch", "Keyword Match", "Leads"],
  },
  {
    icon: ChatCircleText,
    title: "Interview Prep",
    desc: "Master your interviews with AI-generated prep guides. Practice with simulated mock sessions and build a reusable STAR story bank.",
    features: ["Mock Sessions", "STAR Bank", "Company Research", "Custom Qs"],
  },
];

const STATS = [
  { value: "12,480", label: "Jobs Tracked", suffix: "+" },
  { value: "92.4", label: "Interview Rate", suffix: "%" },
  { value: "4.95", label: "User Rating", suffix: "/5" },
  { value: "18.2", label: "Days to Offer", suffix: "d" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "PM → Meta",
    text: "The Job Tracker isn't just a pipeline; it's a strategist. I finally felt in control of a high-stakes search.",
    initials: "SC",
  },
  {
    name: "Michael Park",
    role: "Eng → Stripe",
    text: "The level of detail in the Resume Builder is unmatched. It understood the engineering nuances Stripe was looking for.",
    initials: "MP",
  },
  {
    name: "Aisha Patel",
    role: "Designer → Apple",
    text: "Elegant, intuitive, and powerful. OfferPath matches the design standards I expect from world-class software.",
    initials: "AP",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Everything you need to get started.",
    features: ["2 Resumes", "3 Templates", "12 Active Jobs", "3 AI Tailorings/wk"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/mo",
    desc: "Unlimited power for serious job seekers.",
    features: ["Unlimited Resumes", "9 Pro Templates", "Unlimited Tracking", "Real-time ATS"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/seat/mo",
    desc: "For coaches and recruiting teams.",
    features: ["Multi-user", "Client Management", "Custom Templates", "Analytics"],
    cta: "Contact",
    highlight: false,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 50], ["rgba(247, 246, 243, 0)", "rgba(247, 246, 243, 0.95)"]);
  const navFilter = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <span className="text-xs font-bold uppercase tracking-widest text-surface-300">
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 text-surface-400 font-sans">
      
      {/* ── Minimalist Navigation ── */}
      <motion.nav
        style={{ backgroundColor: navBg, backdropFilter: navFilter }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-surface-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
               <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="text-lg font-medium tracking-tight text-brand-900 font-display">
              OfferPath
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {["Features", "Pricing", "Testimonials"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-xs font-semibold uppercase tracking-wider text-surface-300 hover:text-brand-900 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-brand-500 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="btn-primary py-2 px-4 text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Section (Asymmetrical & Editorial) ── */}
      <section className="pt-40 pb-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <motion.div 
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-200/50 rounded-full text-xs font-semibold uppercase tracking-widest text-surface-400 mb-8 border border-surface-200">
            <Sparkle weight="fill" className="text-brand-500" />
            The Career Operating System
          </div>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-balance mb-6">
            Land your <br />
            <span className="font-display italic font-medium">dream offer.</span>
          </h1>
          <p className="text-lg md:text-xl text-surface-300 max-w-lg mb-10 leading-relaxed">
            Track pipelines, build tailored resumes, and ace interviews with precision AI. A unified space for serious job seekers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="btn-primary flex items-center justify-center gap-2">
              Start Your Search
              <ArrowRight weight="bold" />
            </Link>
            <a href="#features" className="btn-secondary flex items-center justify-center">
              Explore Platform
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:col-span-5 hidden lg:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="w-full aspect-square glass-card bg-surface-0 flex flex-col p-8 relative overflow-hidden">
             {/* Mock UI Element - Flat and Crisp */}
             <div className="flex justify-between items-center pb-4 border-b border-surface-200 mb-6">
                <div className="h-4 w-24 bg-surface-200 rounded"></div>
                <div className="h-4 w-8 bg-surface-200 rounded"></div>
             </div>
             <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                   <div key={i} className="h-16 w-full border border-surface-200 rounded-md bg-surface-50 flex items-center px-4 gap-4">
                      <div className="w-8 h-8 rounded-full bg-surface-200"></div>
                      <div className="flex-1 space-y-2">
                         <div className="h-2 w-1/2 bg-surface-200 rounded"></div>
                         <div className="h-2 w-1/3 bg-surface-200 rounded"></div>
                      </div>
                      <div className="h-6 w-16 bg-surface-200 rounded-full"></div>
                   </div>
                ))}
             </div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats Layout ── */}
      <section className="border-y border-surface-200 bg-surface-0">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-surface-200">
          {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              className={`pl-8 ${i === 0 || i === 2 ? 'pl-0 md:pl-8' : ''} ${i === 0 ? 'pl-0' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl font-display tracking-tight text-brand-500 mb-1">
                {stat.value}<span className="text-surface-300 text-2xl">{stat.suffix}</span>
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-surface-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features (Bento Grid) ── */}
      <section id="features" className="py-32 px-6 bg-surface-50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl font-light tracking-tight mb-4">
              Everything you <span className="font-display italic font-medium">need to win.</span>
            </h2>
            <p className="text-surface-300 text-lg">
              Four specialized modules designed to automate the friction of your career search.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 flex flex-col h-full"
              >
                <div className="w-12 h-12 bg-surface-50 border border-surface-200 rounded-lg flex items-center justify-center mb-6">
                  <mod.icon weight="duotone" className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-xl font-medium mb-3">{mod.title}</h3>
                <p className="text-surface-300 leading-relaxed mb-8 flex-1">
                  {mod.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {mod.features.map(f => (
                    <span key={f} className="px-3 py-1 rounded-md bg-surface-50 border border-surface-200 text-xs font-semibold tracking-wide text-surface-400">
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-32 px-6 border-t border-surface-200 bg-surface-0">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
             <h2 className="text-4xl font-light tracking-tight">
              Loved by <span className="font-display italic font-medium">job seekers.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="border-l border-surface-200 pl-6 flex flex-col h-full">
                <p className="font-display text-lg italic text-surface-400 mb-6 flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 bg-surface-50 border border-surface-200 rounded-full flex items-center justify-center font-bold text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-surface-300 uppercase tracking-wider mt-0.5">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-32 px-6 bg-surface-50 border-t border-surface-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <h2 className="text-4xl font-light tracking-tight mb-4">
              Simple, transparent <span className="font-display italic font-medium">pricing.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <div key={plan.name} className={`glass-card p-8 flex flex-col ${plan.highlight ? 'ring-2 ring-brand-500 shadow-md' : ''}`}>
                <div className="mb-8">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-surface-300 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-display font-medium mb-2">
                    {plan.price}<span className="text-lg text-surface-300 font-sans">{plan.period}</span>
                  </div>
                  <p className="text-sm text-surface-300">{plan.desc}</p>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle weight="fill" className="text-brand-500 w-4 h-4" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button className={plan.highlight ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer / CTA ── */}
      <section className="py-32 px-6 border-t border-surface-200 bg-surface-0 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-light tracking-tight mb-8">
            Ready to land <br />
            <span className="font-display italic font-medium">your next role?</span>
          </h2>
          <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-4">
            Get Started <ArrowRight weight="bold" />
          </Link>
        </div>
      </section>
      
      <footer className="py-8 text-center text-xs text-surface-300 uppercase tracking-widest border-t border-surface-200 bg-surface-50">
         &copy; {new Date().getFullYear()} OfferPath. All rights reserved.
      </footer>
    </div>
  );
}
