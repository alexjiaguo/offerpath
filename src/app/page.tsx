"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";
import { isSupabaseConfigured, createClient } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { DeepSeekNavbar } from "@/components/landing/DeepSeekNavbar";
import { BackgroundAnimation } from "@/components/landing/BackgroundAnimation";
import { DeepSeekHero } from "@/components/landing/DeepSeekHero";
import { PhilosophyPillars } from "@/components/landing/PhilosophyPillars";
import { useTranslation } from "@/i18n";

const StickyFeatureShowcase = dynamic(
  () => import("@/components/landing/StickyFeatureShowcase").then((m) => ({ default: m.StickyFeatureShowcase }))
);
const TemplateShowcase = dynamic(
  () => import("@/components/landing/TemplateShowcase").then((m) => ({ default: m.TemplateShowcase }))
);
const HowItWorks = dynamic(
  () => import("@/components/landing/HowItWorks").then((m) => ({ default: m.HowItWorks }))
);
const QuickStartSection = dynamic(
  () => import("@/components/landing/QuickStartSection").then((m) => ({ default: m.QuickStartSection }))
);

export default function LandingPage() {
  const router = useRouter();
  const { isZh } = useTranslation();

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

  const footerLinks = useMemo(() => [
    {
      title: isZh ? "产品矩阵" : "Product",
      links: [
        { label: isZh ? "AI 简历工坊" : "AI Resume Studio", href: "#features" },
        { label: isZh ? "9 套 ATS 模板" : "9 ATS Templates", href: "#templates" },
        { label: isZh ? "求职进度看板" : "Kanban Tracker", href: "#features" },
        { label: isZh ? "官网职位雷达" : "Direct Job Discovery", href: "#features" },
        { label: isZh ? "STAR 模拟面试" : "STAR Mock Prep", href: "#features" },
      ],
    },
    {
      title: isZh ? "资源中心" : "Resources",
      links: [
        { label: isZh ? "模板库预览" : "Template Gallery", href: "/preview-templates" },
        { label: isZh ? "求职方法论" : "Job Hunt Workflow", href: "#how-it-works" },
        { label: isZh ? "更新日志" : "Changelog", href: "#features" },
      ],
    },
    {
      title: isZh ? "法律与条款" : "Legal",
      links: [
        { label: isZh ? "隐私安全协议" : "Privacy Policy", href: "/privacy" },
        { label: isZh ? "服务使用条款" : "Terms of Service", href: "/terms" },
      ],
    },
  ], [isZh]);

  return (
    <div id="main-content" className="relative min-h-screen bg-[#FBFBFA] text-[#111111] selection:bg-[#111111] selection:text-white font-sans overflow-x-hidden">
      {/* ── Background Ambient Animation ── */}
      <BackgroundAnimation />

      {/* ── Announcement Ticker ── */}
      <AnnouncementBar />

      {/* ── DeepSeek Harness Floating Navbar ── */}
      <DeepSeekNavbar />

      {/* ── 1. Hero Section (60/40 Asymmetric Split & macOS Terminal) ── */}
      <DeepSeekHero />

      {/* ── 2. Philosophy Formula Pillars (DeepSeek Formula Pattern) ── */}
      <PhilosophyPillars />

      {/* ── 3. Sticky Step-Through Feature Showcase (DeepSeek Design Approach) ── */}
      <StickyFeatureShowcase />

      {/* ── 4. 9 ATS Templates Showcase ── */}
      <TemplateShowcase />

      {/* ── 5. Workflow Step Timeline ── */}
      <HowItWorks />

      {/* ── 6. Quick Start Dual Launch Section (DeepSeek Try It Now) ── */}
      <QuickStartSection />

      {/* ── 7. Atmospheric Bottom CTA ── */}
      <section className="relative py-28 md:py-36 px-4 border-t border-[#EAEAEA] overflow-hidden">
        {/* Soft Ambient Warm Glow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[800px] h-[400px] bg-gradient-to-t from-[#FEF3EC] via-[#FBE3D2]/40 to-transparent blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl 2xl:max-w-6xl mx-auto text-center flex flex-col items-center">
          <div className="ds-pill-metallic mb-6">
            <div className="ds-pill-inner">
              <Sparkle weight="fill" className="w-3 h-3 text-[#C2410C]" />
              <span className="text-[10px] font-mono font-bold text-neutral-800 tracking-wider uppercase">
                {isZh ? "加入高效求职者阵营" : "ENGINEER YOUR NEXT ROLE"}
              </span>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium text-[#111111] tracking-tight leading-tight mb-6 font-sans">
            {isZh ? (
              <>
                告别盲目海投，<br />
                <span className="text-[#C2410C] font-semibold">用工程化确定性拿下梦中 Offer。</span>
              </>
            ) : (
              <>
                Stop guessing.<br />
                <span className="text-[#C2410C] font-semibold">Land your dream role with precision.</span>
              </>
            )}
          </h2>

          <p className="text-base sm:text-lg text-[#666666] max-w-2xl mb-10 leading-relaxed font-sans font-light">
            {isZh
              ? "无需信用卡，免费注册即可获得 9 套 ATS 模板、职位逆向定制与求职看板体验。"
              : "No credit card required. Free tier includes all 9 ATS templates, instant JD tailoring, and pipeline tracker."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className="ds-btn-primary text-sm px-8 py-3.5 font-semibold">
              <span>{isZh ? "免费创建工作台" : "Get Started Free"}</span>
              <ArrowRight weight="bold" className="w-4 h-4" />
            </Link>
            <Link href="/preview-templates" className="ds-btn-secondary text-sm px-6 py-3.5 font-medium">
              <span>{isZh ? "预览全部 9 套模板" : "Preview 9 ATS Templates"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Minimalist Editorial Footer ── */}
      <footer className="border-t border-[#EAEAEA] bg-[#F5F5F4]/80 backdrop-blur-md">
        <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-5 gap-10 2xl:gap-12 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-infinity.svg"
                  alt="OfferPath Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-[15px] font-bold tracking-tight text-[#111111] font-sans">
                  OfferPath
                </span>
              </Link>
              <p className="text-xs text-[#666666] mt-3 leading-relaxed max-w-xs font-sans">
                {isZh
                  ? "现代求职操作系统：职位逆向解析、ATS 专属简历工坊、官网直聘雷达与 STAR 模拟面试。"
                  : "Modern AI Career Operating System. Reverse-engineering resumes, direct job discovery, and interview prep."}
              </p>
            </div>

            {footerLinks.map((group) => (
              <div key={group.title}>
                <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#C2410C] mb-4">
                  {group.title}
                </div>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-xs text-[#666666] hover:text-[#111111] transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#EAEAEA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888888] font-mono">
            <p>
              © {new Date().getFullYear()} OfferPath. All rights reserved.
            </p>
            <p className="text-[#C2410C]">
              ENGINEERED FOR HIGH-IMPACT JOB SEARCH
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
