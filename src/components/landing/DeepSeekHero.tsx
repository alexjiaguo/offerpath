"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkle,
  FileText,
  MagnifyingGlass,
  Compass,
  Kanban,
  ChatCircleDots,
  ChatCircleText,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

export function DeepSeekHero() {
  const { isZh } = useTranslation();
  const [activeTab, setActiveTab] = useState<"tailor" | "radar">("tailor");
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const presets = isZh
    ? [
        {
          role: "资深全栈工程师",
          company: "Anthropic",
          jdSnippet: "要求 5+ 年 React/Node/TypeScript 经验，熟练掌握 LLM Agent 架构设计与性能调优...",
          score: 96,
          bullets: [
            "主导企业级 Agentic Workflow 编排核心模块设计，端到端调用延迟缩减 42%",
            "深度重构 Next.js 15 全栈数据流架构，支撑日均 200 万+ 次高并发推理请求稳定运行",
            "设计零数据泄露的本地沙箱执行环境，通过 SOC 2 Type II 安全合规认证",
          ],
        },
        {
          role: "AI 产品专家 (GTM)",
          company: "Linear",
          jdSnippet: "负责 AI 生产力工具商业化落地，具备 0 到 1 产品定义与跨职能 GTM 经验...",
          score: 94,
          bullets: [
            "端到端主导 AI 协同套件从 0 到 1 商业化变现，上线 6 个月贡献 380 万美元 ARR",
            "重构新用户旅程并接入自动化 A/B 实验体系，次周留存激活率从 28% 跃升至 46%",
            "协同设计与产研团队按周敏捷迭代，客户 NPS 净推荐值达到 78 分",
          ],
        },
      ]
    : [
        {
          role: "Staff Software Engineer",
          company: "Anthropic",
          jdSnippet: "5+ yrs TypeScript/React, experience building distributed agent loops, LLM tool-calling...",
          score: 96,
          bullets: [
            "Architected low-latency LLM agent runtime, reducing multi-step execution latency by 42%",
            "Scaled Next.js distributed data pipelines to sustain 2M+ daily async inference jobs",
            "Engineered local-first zero-trust sandbox compliant with SOC 2 Type II standards",
          ],
        },
        {
          role: "Principal Product Manager",
          company: "Linear",
          jdSnippet: "Own 0-to-1 AI productivity suite, deep SaaS GTM experience, customer activation...",
          score: 94,
          bullets: [
            "Led 0-to-1 monetization for AI team collaboration, driving $3.8M net-new ARR in 6 mo",
            "Overhauled user activation funnel, lifting 14-day cohort retention from 28% to 46%",
            "Partnered with Eng and Design to establish weekly release cadence with 78+ NPS",
          ],
        },
      ];

  const radarJobs = isZh
    ? [
        { title: "Staff Frontend Architect", company: "Stripe", source: "官网直聘 · Greenhouse", time: "2 分钟前", match: 98 },
        { title: "Senior AI Agent Engineer", company: "Vercel", source: "官网直聘 · Lever", time: "14 分钟前", match: 95 },
        { title: "Product Lead, Developer OS", company: "OpenAI", source: "官网直聘 · Workday", time: "28 分钟前", match: 91 },
      ]
    : [
        { title: "Staff Frontend Architect", company: "Stripe", source: "Direct · Greenhouse", time: "2m ago", match: 98 },
        { title: "Senior AI Agent Engineer", company: "Vercel", source: "Direct · Lever", time: "14m ago", match: 95 },
        { title: "Product Lead, Developer OS", company: "OpenAI", source: "Direct · Workday", time: "28m ago", match: 91 },
      ];

  const currentPreset = presets[selectedPreset];

  function handleCopy() {
    navigator.clipboard.writeText(currentPreset.bullets.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSwitchPreset(idx: number) {
    setSelectedPreset(idx);
  }

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 md:py-24 overflow-hidden">
      {/* Background Lighting Nebulae */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-radial from-[#1A3870] via-[#102447]/30 to-transparent blur-[120px]" />
      </div>
      <div className="absolute top-1/4 right-[5%] w-[450px] h-[450px] pointer-events-none opacity-25">
        <div className="absolute inset-0 bg-radial from-[#4d6bfe]/50 via-transparent to-transparent blur-[100px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 ds-grid-bg pointer-events-none" />

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 2xl:gap-16 items-center">
          
          {/* ── Left Column: Value Proposition & CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 2xl:col-span-7 flex flex-col items-start"
          >
            {/* Liquid-Metal & Frosted Glass Hero Badge */}
            <div className="ds-pill-metallic group mb-6">
              <div className="ds-pill-inner">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#C2410C]/10 border border-[#C2410C]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <Sparkle weight="fill" className="w-3 h-3 text-[#C2410C]" />
                  <span className="text-[10px] font-mono font-bold text-[#C2410C] tracking-wide uppercase">
                    {isZh ? "公测 v2.0" : "v2.0 Beta"}
                  </span>
                </div>
                <span className="text-xs font-medium text-neutral-700 tracking-tight font-sans">
                  {isZh ? "智能求职操作系统 · 开发者预览版" : "Career OS · Developer Preview"}
                </span>
                <ArrowRight weight="bold" className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700 transition-colors ml-0.5" />
              </div>
            </div>

            {/* High-Impact Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-normal tracking-[-0.035em] text-[#111111] leading-[1.06] mb-6 font-sans">
              {isZh ? (
                <>
                  从职位到 Offer，<br />
                  <span className="font-bold bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#9A3412] bg-clip-text text-transparent">全流程工程化。</span>
                </>
              ) : (
                <>
                  From search to offer,<br />
                  <span className="font-bold bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#9A3412] bg-clip-text text-transparent">engineered.</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#666666] max-w-xl mb-8 leading-relaxed font-sans">
              {isZh
                ? "专为高标准求职者打造的一体化 AI 工作台。根据目标职位 (JD) 90 秒逆向定制高通过率 ATS 简历、实时雷达扫描企业官网直聘岗位、用 STAR 法则全真模拟名企面试。"
                : "The developer-grade AI job search OS. Reverse-engineer any job description into ATS-beating resumes in 90 seconds, scan direct company career boards, and train with adaptive STAR interview coaches."}
            </p>

            {/* Primary & Secondary Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              <Link href="/register" className="ds-btn-primary w-full sm:w-auto">
                <span>{isZh ? "免费开始使用" : "Get Started Free"}</span>
                <ArrowRight weight="bold" className="w-4 h-4" />
              </Link>
              <a href="#templates" className="ds-btn-secondary w-full sm:w-auto">
                <FileText weight="duotone" className="w-4 h-4 text-[#111111]" />
                <span>{isZh ? "浏览 9 套 ATS 模板" : "Explore 9 ATS Templates"}</span>
              </a>
            </div>

            {/* 4 Superpower Feature Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/5 w-full">
              <a
                href="#features"
                className="px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white/90 hover:border-white shadow-[0_2px_8px_rgba(0,0,0,0.03),0_0_0_1px_rgba(255,255,255,0.7)_inset] transition-all text-xs text-[#333333] font-medium flex items-center gap-1.5"
              >
                <FileText weight="duotone" className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>{isZh ? "9套 ATS 简历工坊" : "9 ATS Resume Studio"}</span>
              </a>
              <a
                href="#features"
                className="px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white/90 hover:border-white shadow-[0_2px_8px_rgba(0,0,0,0.03),0_0_0_1px_rgba(255,255,255,0.7)_inset] transition-all text-xs text-[#333333] font-medium flex items-center gap-1.5"
              >
                <Compass weight="duotone" className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isZh ? "官网职位实时雷达" : "Direct Job Radar"}</span>
              </a>
              <a
                href="#features"
                className="px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white/90 hover:border-white shadow-[0_2px_8px_rgba(0,0,0,0.03),0_0_0_1px_rgba(255,255,255,0.7)_inset] transition-all text-xs text-[#333333] font-medium flex items-center gap-1.5"
              >
                <Kanban weight="duotone" className="w-3.5 h-3.5 text-amber-600" />
                <span>{isZh ? "求职进度看板" : "Kanban Tracker"}</span>
              </a>
              <a
                href="#features"
                className="px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 hover:bg-white/90 hover:border-white shadow-[0_2px_8px_rgba(0,0,0,0.03),0_0_0_1px_rgba(255,255,255,0.7)_inset] transition-all text-xs text-[#333333] font-medium flex items-center gap-1.5"
              >
                <ChatCircleDots weight="duotone" className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isZh ? "STAR 模拟面试教练" : "STAR Mock Coach"}</span>
              </a>
            </div>
          </motion.div>

          {/* ── Right Column: Dark Tech Interactive Terminal / Playground ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 2xl:col-span-5 w-full"
          >
            <div className="ds-terminal-card overflow-hidden">
              {/* Terminal Header & Mode Tabs */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  <span className="ml-2 font-mono text-[11px] text-white/40">offerpath-cli</span>
                </div>

                <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-lg border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tailor")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === "tailor"
                        ? "bg-[#6799fe]/20 text-[#6799fe] border border-[#6799fe]/30"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {isZh ? "针对性润色" : "Instant Tailor"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("radar")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === "radar"
                        ? "bg-[#6799fe]/20 text-[#6799fe] border border-[#6799fe]/30"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {isZh ? "职位雷达扫描" : "Radar Stream"}
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {activeTab === "tailor" ? (
                    <motion.div
                      key="tailor"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {/* Preset Selector */}
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                          {isZh ? "选择目标岗位范例" : "Target Job Preset"}
                        </div>
                        <div className="flex gap-1.5">
                          {presets.map((p, idx) => (
                            <button
                              key={p.company}
                              type="button"
                              onClick={() => handleSwitchPreset(idx)}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                                selectedPreset === idx
                                  ? "bg-white/20 text-white font-semibold border border-white/20"
                                  : "bg-white/5 text-white/50 hover:text-white/80"
                              }`}
                            >
                              {p.company}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* JD Input Simulation Block */}
                      <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] font-mono text-xs">
                        <div className="flex items-center justify-between text-white/40 text-[10px] mb-1">
                          <span>TARGET_JD · {currentPreset.company}</span>
                          <span className="text-[#6799fe]">PARSER: ATS-OK</span>
                        </div>
                        <div className="text-white/80 line-clamp-2">{currentPreset.jdSnippet}</div>
                      </div>

                      {/* Generated Output Stream */}
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                              {currentPreset.score}%
                            </span>
                            <span className="text-xs font-semibold text-white/90">
                              {isZh ? "契合度得分与润色成果" : "ATS Match & Tailored Bullets"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopy}
                            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white transition-colors"
                          >
                            {copied ? (
                              <>
                                <Check weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">{isZh ? "已复制" : "Copied"}</span>
                              </>
                            ) : (
                              <>
                                <Copy weight="bold" className="w-3.5 h-3.5" />
                                <span>{isZh ? "复制" : "Copy"}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Bullets */}
                        <div className="space-y-2 font-sans text-xs text-white/75 leading-relaxed">
                          {currentPreset.bullets.map((b, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[#6799fe] font-mono mt-0.5 font-bold">→</span>
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-white/40 font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {isZh ? "就绪 · 90秒导出 PDF" : "Ready · 90s Single-Page Export"}
                        </span>
                        <Link href="/register" className="text-[#6799fe] hover:underline font-sans font-medium">
                          {isZh ? "进入工作台体验 →" : "Open Workspace →"}
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="radar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mb-2">
                        <span>DIRECT_RADAR_FEED</span>
                        <span className="text-emerald-400">● LIVE (3/142)</span>
                      </div>

                      {radarJobs.map((j) => (
                        <div
                          key={j.company}
                          className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/20 transition-all flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white/90">{j.title}</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                                {j.match}%
                              </span>
                            </div>
                            <div className="text-[11px] text-white/40 mt-0.5">
                              {j.company} · {j.source} · {j.time}
                            </div>
                          </div>
                          <Link
                            href="/register"
                            className="px-2.5 py-1 rounded text-xs bg-white/10 hover:bg-[#6799fe] hover:text-black font-medium transition-colors text-white/80"
                          >
                            {isZh ? "速投" : "Apply"}
                          </Link>
                        </div>
                      ))}

                      <div className="pt-2 text-center">
                        <Link
                          href="/register"
                          className="text-xs text-[#6799fe] hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <span>{isZh ? "登录查看全部 142+ 每日更新直聘岗位" : "Sign up to track 142+ daily enterprise positions"}</span>
                          <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
