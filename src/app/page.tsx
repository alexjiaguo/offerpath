"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  MessageSquare,
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Compass,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   OfferPath — Landing Page
   Premium dark SaaS landing with glassmorphism
   ═══════════════════════════════════════════════════════ */

const MODULES = [
  {
    icon: Search,
    title: "Pipeline Tracker",
    desc: "Track every application from discovery to offer. AI evaluates JDs, scores fit, and organizes your pipeline on a beautiful Kanban board.",
    features: ["AI JD Evaluation", "Kanban Board", "Smart Scoring", "Analytics Dashboard"],
    color: "from-zinc-600 to-zinc-500",
    delay: "stagger-1",
  },
  {
    icon: FileText,
    title: "Resume Studio",
    desc: "Build stunning resumes with 9 premium templates. AI tailors each version to match specific job descriptions for maximum impact.",
    features: ["9 Premium Templates", "AI Tailoring", "ATS Optimized", "PDF & DOCX Export"],
    color: "from-brand-600 to-brand-500",
    delay: "stagger-2",
  },
  {
    icon: Compass,
    title: "Job Discovery",
    desc: "AI-powered job scanning across 30+ top-tier companies. Automated career page monitoring, match scoring, and smart lead generation.",
    features: ["Company Scanner", "Match Scoring", "Auto-Scan Pipeline", "Smart Filters"],
    color: "from-purple-600 to-purple-500",
    delay: "stagger-3",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    desc: "AI-generated prep guides, question banks with STAR answers, mock interviews with real-time scoring, and a reusable story bank.",
    features: ["Company Research", "Question Bank", "Mock Interviews", "Story Bank"],
    color: "from-zinc-500 to-zinc-400",
    delay: "stagger-4",
  },
];

const STATS = [
  { value: "10K+", label: "Resumes Built" },
  { value: "85%", label: "Interview Rate" },
  { value: "4.9", label: "User Rating", icon: Star },
  { value: "32s", label: "AI Tailoring" },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "PM → Meta",
    text: "OfferPath's AI tailoring got me 3x more callbacks. The pipeline tracker kept me sane during a 40-application sprint.",
    avatar: "SC",
  },
  {
    name: "Michael Park",
    role: "Engineer → Stripe",
    text: "The mock interview feature was a game changer. I walked into my Stripe onsite feeling completely prepared.",
    avatar: "MP",
  },
  {
    name: "Aisha Patel",
    role: "Designer → Apple",
    text: "9 resume templates, each one premium quality. I finally have a resume that matches my design standards.",
    avatar: "AP",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with the essentials",
    features: [
      "2 Resumes",
      "3 Basic Templates",
      "10 Pipeline Jobs",
      "3 AI Tailorings/week",
      "2 Interview Preps",
      "5 Discovery Scans/week",
      "PDF Export",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    period: "/month",
    desc: "Unlimited power for serious job seekers",
    features: [
      "Unlimited Resumes",
      "All 9 Premium Templates",
      "Unlimited Pipeline Jobs",
      "Unlimited AI Tailoring",
      "Unlimited Interview Preps",
      "Unlimited Discovery Scans",
      "Auto-Scan Pipeline",
      "Mock Interviews with Scoring",
      "PDF + DOCX Export",
      "Live Interview Coach",
      "Full Analytics",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/seat/mo",
    desc: "For career coaches & bootcamps",
    features: [
      "Everything in Pro",
      "Team Dashboard",
      "Client Management",
      "Custom Templates",
      "API Access",
      "Priority Support",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface-0 text-gray-100 overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-surface-0/80 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Target className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Offer<span className="gradient-text">Path</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-sm text-gray-400 hover:text-white transition-colors">
              Testimonials
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-4 py-2 rounded-lg gradient-brand text-white hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-brand-600/[0.04] rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-zinc-600/[0.06] rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Job Hunting Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in text-balance">
            From search to{" "}
            <span className="gradient-text">signed offer</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up leading-relaxed">
            Track your pipeline, build tailored resumes, and ace interviews — all in one
            beautifully designed platform powered by AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-2">
            <Link
              href="/register"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-brand text-white font-semibold text-base hover:opacity-90 transition-all"
            >
              Start Free — No Card Required
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all text-base"
            >
              See How It Works
            </a>
          </div>

          {/* Social proof stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mt-16 animate-slide-up stagger-3">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features / Modules ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need, <span className="gradient-text">one platform</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Three powerful modules that cover your entire job hunting lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {MODULES.map((mod) => (
              <div
                key={mod.title}
                className={`group glass-hover rounded-2xl p-8 animate-slide-up ${mod.delay}`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <mod.icon className="w-6 h-6 text-white" />
                </div>

                {/* Title & Desc */}
                <h3 className="text-xl font-semibold mb-3">{mod.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{mod.desc}</p>

                {/* Feature list */}
                <ul className="space-y-2.5">
                  {mod.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your path to the <span className="gradient-text">perfect offer</span>
            </h2>
            <p className="text-gray-400 text-lg">Four steps. One platform. Zero chaos.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: Search,
                title: "Discover",
                desc: "Add jobs from any source. AI evaluates fit, scores each role, and ranks your pipeline.",
              },
              {
                step: "02",
                icon: FileText,
                title: "Tailor",
                desc: "Generate a tailored resume for each role in seconds. 9 templates, ATS-optimized.",
              },
              {
                step: "03",
                icon: MessageSquare,
                title: "Prepare",
                desc: "AI creates company research, targeted questions, and mock interviews with scoring.",
              },
              {
                step: "04",
                icon: TrendingUp,
                title: "Win",
                desc: "Track offers, compare packages, and negotiate with confidence using data-driven insights.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-brand-500/30 to-transparent" />
                )}

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass mb-5 group-hover:glow-brand-sm transition-all">
                  <item.icon className="w-7 h-7 text-brand-400" />
                </div>

                <div className="text-xs font-mono text-brand-400 mb-2">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by <span className="gradient-text">job seekers</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlight
                    ? "glass border-brand-500/30 glow-brand relative"
                    : "glass"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-brand text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>

                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-8 ${
                    plan.highlight
                      ? "gradient-brand text-white hover:opacity-90"
                      : "bg-surface-200 text-gray-200 hover:bg-surface-300"
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12">
          <Zap className="w-10 h-10 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to land your dream role?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of job seekers who found their path. Start free — no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-all text-base"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">
                  Offer<span className="gradient-text">Path</span>
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                The end-to-end job hunting platform.
                From search to signed offer.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Pipeline Tracker", "Resume Studio", "Job Discovery", "Interview Prep", "Pricing"],
              },
              {
                title: "Resources",
                links: ["Resume Tips", "Templates Guide", "Blog", "Changelog"],
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Contact"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold mb-4 text-gray-300">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.04]">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} OfferPath. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-600">Privacy-first. Your data, your control.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
