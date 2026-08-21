"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Compass,
  Kanban,
  ChatCircleDots,
  ArrowRight,
  Sparkle,
  TrendUp,
  Star,
  Check,
  Lightning,
  Broadcast,
  Clock,
} from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

export function StickyFeatureShowcase() {
  const { isZh } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const steps = isZh
    ? [
        {
          id: "resume",
          icon: FileText,
          tag: "ENGINE 01",
          title: "AI 简历工坊与 9 套 ATS 模板",
          desc: "告别千篇一律的模板。基于目标职位 JD 深度逆向解析，提取核心关键词并针对性润色工作成果 Bullet。搭配严苛单页排版数学算法，保证 100% 格式对齐与 ATS 解析通过率。",
          badge: "ATS 98% 验证通过",
        },
        {
          id: "discovery",
          icon: Compass,
          tag: "ENGINE 02",
          title: "企业官网直聘实时职位雷达",
          desc: "跳过中介与海投黑洞。雷达实时抓取全球顶尖科技公司与知名企业的官方招聘通道 (Greenhouse, Lever, Workday)，比传统招聘网站早 24-48 小时发现高匹配优质岗位。",
          badge: "直聘源头 · 0延迟",
        },
        {
          id: "tracker",
          icon: Kanban,
          tag: "ENGINE 03",
          title: "可视化求职看板与数据管道",
          desc: "像管理工程 Sprint 一样管理求职进度。拖拽式看板、面试复盘记录、薪酬对比与全流程转化率漏斗分析，助你清晰把控每一个投递进展与薪资谈判筹码。",
          badge: "推进效率提升 28%",
        },
        {
          id: "interview",
          icon: ChatCircleDots,
          tag: "ENGINE 04",
          title: "STAR 行为与技术全真模拟面试官",
          desc: "基于真实目标岗位画像与面试官评估体系进行多轮深度对练。AI 即时针对 STAR 结构完整性、量化成果表达给出逐句精修建议与答题策略，构建你的应答话术库。",
          badge: "智能即时反馈",
        },
      ]
    : [
        {
          id: "resume",
          icon: FileText,
          tag: "ENGINE 01",
          title: "AI Resume Studio & 9 ATS Templates",
          desc: "Engineered for maximum callback rates. Reverse-engineers any JD into tailored bullets with strict single-page auto-fitting. 100% compliant with Greenhouse, Lever, and Workday parsing engines.",
          badge: "ATS 98% Verified",
        },
        {
          id: "discovery",
          icon: Compass,
          tag: "ENGINE 02",
          title: "Direct Enterprise Job Radar",
          desc: "Bypass third-party spam and stale listings. Our radar indexes official career portals (Greenhouse, Lever, Workday) across top tech companies 24-48 hours before aggregator boards.",
          badge: "Direct ATS · Zero Delay",
        },
        {
          id: "tracker",
          icon: Kanban,
          tag: "ENGINE 03",
          title: "Kanban Job Pipeline & Analytics",
          desc: "Manage your job hunt like a high-velocity sprint. Drag-and-drop status columns, interview timeline notes, compensation comparison, and end-to-end conversion funnel metrics.",
          badge: "+28% Pipeline Velocity",
        },
        {
          id: "interview",
          icon: ChatCircleDots,
          tag: "ENGINE 04",
          title: "STAR Mock Interview Coach",
          desc: "Roleplay realistic behavioral and technical interview rounds. Receive instant structural critique on STAR impact quantification and build a battle-tested story repository.",
          badge: "Real-time AI Feedback",
        },
      ];

  return (
    <section id="features" className="relative py-24 md:py-32 px-4 border-t border-[#EAEAEA]">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7 }}
          className="mb-16 md:mb-20"
        >
          <div className="ds-pill-metallic mb-4">
            <div className="ds-pill-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
              <span className="text-[10px] font-mono font-bold text-neutral-800 tracking-wider uppercase">
                {isZh ? "核心能力 · 4 大引擎" : "CAPABILITIES · 4 CORE ENGINES"}
              </span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#111111] tracking-tight leading-tight max-w-3xl font-sans">
            {isZh ? (
              <>
                每项功能都是独立利器，<br />
                <span className="font-bold bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#9A3412] bg-clip-text text-transparent">
                  合为一体即是求职战力倍增器。
                </span>
              </>
            ) : (
              <>
                Every engine is an edge.<br />
                <span className="font-bold bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#9A3412] bg-clip-text text-transparent">
                  Combined, an unstoppable advantage.
                </span>
              </>
            )}
          </h2>
        </motion.div>

        {/* ── Desktop: 2-Column Split with Sticky Right Viewport ── */}
        <div className="hidden md:grid md:grid-cols-12 gap-10 2xl:gap-14 items-start">
          {/* Left Column: Interactive Feature Step Triggers */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer select-none ${
                    isActive
                      ? "bg-white/85 backdrop-blur-xl border-white/90 shadow-[0_12px_36px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.9)_inset]"
                      : "bg-white/40 backdrop-blur-sm border-white/50 hover:bg-white/70 hover:border-white/90 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shadow-xs ${
                        isActive
                          ? "bg-[#C2410C] text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      <Icon weight="duotone" className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[#C2410C] uppercase">
                        {step.tag}
                      </span>
                      <h3 className="text-base font-bold text-[#111111] tracking-tight font-sans">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#666666] leading-relaxed font-sans pl-12">
                    {step.desc}
                  </p>

                  {isActive && (
                    <div className="mt-3 pl-12 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#C2410C]/10 text-[#C2410C] border border-[#C2410C]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                        {step.badge}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Interactive Viewport */}
          <div className="md:col-span-7 sticky top-[16vh]">
            <div className="ds-terminal-card p-6 md:p-8 rounded-2xl min-h-[480px] flex flex-col justify-center overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.25)] border border-white/15">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C2410C]/15 rounded-full blur-[100px] pointer-events-none" />

              <AnimatePresence mode="wait">
                {/* ── Engine 0: AI Resume Studio & ATS Keyword Inserter ── */}
                {activeStep === 0 && (
                  <motion.div
                    key="preview-0"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 font-sans text-xs text-white"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/40">
                          ATS SCORE: 98/100
                        </span>
                        <span className="text-xs text-neutral-200 font-mono font-medium">
                          ENGINE: KEYWORD_OPTIMIZER
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
                        GREENHOUSE READY
                      </span>
                    </div>

                    {/* Diff comparison box */}
                    <div className="p-4 rounded-xl bg-[#141721] border border-white/[0.1] space-y-3 font-mono text-xs shadow-inner">
                      <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        [BEFORE · RAW BULLET]
                      </div>
                      <div className="text-neutral-300 bg-red-950/40 border border-red-800/50 p-3 rounded-lg text-[11px] font-sans">
                        • Built LLM features for the company web app to help answer customer questions.
                      </div>

                      <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Lightning weight="fill" className="w-3.5 h-3.5 text-[#C2410C]" />
                        [AFTER · ATS 98% TAILORED BULLET]
                      </div>
                      <div className="text-white bg-emerald-950/40 border border-emerald-600/60 p-3 rounded-lg text-[11px] font-sans leading-relaxed">
                        • Architected distributed{" "}
                        <span className="bg-emerald-500/30 text-emerald-200 font-semibold px-1 rounded">
                          LLM inference orchestration
                        </span>{" "}
                        serving 2.5M+ daily active requests with sub-120ms{" "}
                        <span className="bg-emerald-500/30 text-emerald-200 font-semibold px-1 rounded">
                          p95 latency
                        </span>
                        , reducing GPU infrastructure spend by 34%.
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-mono text-neutral-400 mr-1 flex items-center font-semibold">
                        INJECTED KEYWORDS:
                      </span>
                      {["Distributed Systems", "Inference Latency", "GPU Optimization", "SOC 2"].map((kw) => (
                        <span key={kw} className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-mono border border-white/20 font-medium">
                          + {kw}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.1]">
                      <div className="flex gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-200">PDF EXPORT</span>
                        <span className="px-2.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-neutral-200">DOCX SYNC</span>
                      </div>
                      <Link href="/register" className="text-xs text-[#EA580C] hover:underline font-bold inline-flex items-center gap-1">
                        <span>{isZh ? "免费体验职位定制 →" : "Try Tailoring Free →"}</span>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* ── Engine 1: Direct Enterprise Job Radar ── */}
                {activeStep === 1 && (
                  <motion.div
                    key="preview-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 font-sans text-xs text-white"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                      <span className="font-mono text-emerald-400 flex items-center gap-1.5 font-bold">
                        <Broadcast weight="bold" className="w-4 h-4 text-emerald-400 animate-pulse" />
                        DIRECT RADAR ACTIVE · 142 OPENINGS FOUND
                      </span>
                      <span className="text-neutral-300 font-mono text-[11px] font-medium">PORTALS: GREENHOUSE / LEVER</span>
                    </div>

                    {[
                      { role: "Staff Frontend Architect", company: "Stripe", loc: "San Francisco / Remote", pay: "$220k - $280k", match: 98, time: "4m ago", portal: "Greenhouse" },
                      { role: "Lead Product Designer", company: "Linear", loc: "New York · Hybrid", pay: "$190k - $240k", match: 95, time: "12m ago", portal: "Lever" },
                      { role: "Principal AI Engineer", company: "Anthropic", loc: "SF / Remote", pay: "$260k - $340k", match: 92, time: "28m ago", portal: "Workday" },
                    ].map((item) => (
                      <div
                        key={item.role}
                        className="p-3.5 rounded-xl bg-[#141721] border border-white/[0.12] flex items-center justify-between hover:border-white/30 transition-all group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white tracking-tight">{item.role}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                              {item.match}% MATCH
                            </span>
                          </div>
                          <div className="text-xs text-neutral-300 flex items-center gap-2 font-sans">
                            <span className="font-semibold text-white">{item.company}</span>
                            <span>•</span>
                            <span>{item.loc}</span>
                            <span>•</span>
                            <span className="text-[#EA580C] font-mono font-bold">{item.pay}</span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                            <Clock weight="bold" className="w-3 h-3 text-neutral-400" />
                            <span>{item.time} via {item.portal} Direct API</span>
                          </div>
                        </div>
                        <Link
                          href="/register"
                          className="px-3.5 py-1.5 rounded-full bg-[#C2410C] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-md transition-all shrink-0"
                        >
                          {isZh ? "一键针对定制" : "Tailor"}
                        </Link>
                      </div>
                    ))}

                    <div className="pt-1 flex items-center justify-between text-xs text-neutral-300">
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold">✔ 0 AGGREGATOR DELAY</span>
                      <Link href="/register" className="text-[#EA580C] hover:underline font-bold inline-flex items-center gap-1">
                        <span>{isZh ? "查看实时职位流 →" : "View Live Feed →"}</span>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* ── Engine 2: Kanban Pipeline & Velocity Analytics ── */}
                {activeStep === 2 && (
                  <motion.div
                    key="preview-2"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 font-sans text-xs text-white"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                      <span className="font-mono text-white font-bold">PIPELINE KANBAN & CONVERSION</span>
                      <span className="text-amber-300 font-mono font-bold flex items-center gap-1 bg-amber-950/50 border border-amber-600/50 px-2.5 py-0.5 rounded">
                        <TrendUp weight="bold" className="w-3.5 h-3.5" />
                        +28% PIPELINE VELOCITY
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Column 1 */}
                      <div className="p-3 rounded-xl bg-[#141721] border border-white/[0.12] space-y-2">
                        <div className="text-[10px] font-mono text-neutral-300 uppercase font-bold flex justify-between">
                          <span>APPLIED</span>
                          <span className="text-neutral-400">(8)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#1F232F] border border-white/[0.1] space-y-1">
                          <div className="font-bold text-white text-xs">Vercel</div>
                          <div className="text-[10px] text-neutral-300">Sr. Frontend Architect</div>
                          <div className="text-[9px] font-mono text-neutral-400">Applied 2d ago</div>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#1F232F] border border-white/[0.1] space-y-1">
                          <div className="font-bold text-white text-xs">Linear</div>
                          <div className="text-[10px] text-neutral-300">Staff Product Designer</div>
                          <div className="text-[9px] font-mono text-neutral-400">Applied 3d ago</div>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="p-3 rounded-xl bg-[#141721] border border-white/[0.12] space-y-2">
                        <div className="text-[10px] font-mono text-[#EA580C] uppercase font-bold flex justify-between">
                          <span>INTERVIEWS</span>
                          <span>(3)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#C2410C]/20 border border-[#C2410C]/40 space-y-1">
                          <div className="font-bold text-white text-xs">Stripe</div>
                          <div className="text-[10px] text-[#FFA07A] font-semibold">Round 3: System Design</div>
                          <div className="text-[9px] font-mono text-amber-200 font-medium">Tomorrow 2:00 PM</div>
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="p-3 rounded-xl bg-[#141721] border border-white/[0.12] space-y-2">
                        <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex justify-between">
                          <span>OFFERS</span>
                          <span>(1)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 space-y-1">
                          <div className="font-bold text-white text-xs">Anthropic</div>
                          <div className="text-[10px] text-emerald-300 font-bold">$260k Base + Equity</div>
                          <div className="text-[9px] font-mono text-emerald-200 font-medium">Decision in 5d</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.1] text-xs">
                      <span className="font-mono text-[10px] text-neutral-300 font-medium">CALLBACK CONVERSION: 38.4%</span>
                      <Link href="/register" className="text-[#EA580C] hover:underline font-bold">
                        {isZh ? "进入求职看板管理 →" : "Open Kanban Board →"}
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* ── Engine 3: STAR Mock Interview Coach ── */}
                {activeStep === 3 && (
                  <motion.div
                    key="preview-3"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 font-sans text-xs text-white"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
                      <span className="font-mono text-[#FFA07A] flex items-center gap-1.5 font-bold">
                        <Sparkle weight="fill" className="w-3.5 h-3.5 text-[#FFA07A]" />
                        STAR COACH SIMULATION · BEHAVIORAL ROUND
                      </span>
                      <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-600/50 font-bold">
                        SCORE: 94/100
                      </span>
                    </div>

                    {/* Interviewer Question */}
                    <div className="p-3.5 rounded-xl bg-[#141721] border border-white/[0.12] space-y-1">
                      <div className="text-[10px] font-mono text-[#FFA07A] font-bold">INTERVIEWER (AI)</div>
                      <div className="text-white font-medium leading-relaxed font-sans">
                        {isZh
                          ? "“请描述一次你如何在跨职能团队产生重大技术分歧时，推动全员达成共识并按期交付的经历？”"
                          : "“Tell me about a time you led a cross-functional engineering team through technical disagreement to deliver on schedule.”"}
                      </div>
                    </div>

                    {/* Candidate STAR Answer */}
                    <div className="p-3.5 rounded-xl bg-[#C2410C]/20 border border-[#C2410C]/40 ml-4 space-y-1">
                      <div className="text-[10px] font-mono text-neutral-300 font-bold flex items-center gap-1.5">
                        <span>YOU (STAR RESPONSE)</span>
                        <span className="text-[9px] bg-[#C2410C]/40 text-white px-1.5 py-0.5 rounded font-mono font-bold">S+T+A+R</span>
                      </div>
                      <div className="text-white leading-relaxed font-sans text-[11px]">
                        {isZh
                          ? "“在上一家公司推进微服务拆分时，团队对是否引入 GraphQL 产生分歧。我主导了 3 天对照基准实验，用真实吞吐与延迟数据消除了主观偏见，并在 2 周内按期上线...”"
                          : "“When migrating to microservices, our team debated adopting GraphQL. I organized a 3-day A/B benchmark measuring throughput & p99 latency, eliminating subjective bias with empirical metrics and shipping on time...”"}
                      </div>
                    </div>

                    {/* Coach Feedback */}
                    <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 flex items-start gap-2.5">
                      <Star weight="fill" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono text-emerald-300 font-bold">COACH EVALUATION & CRITIQUE</div>
                        <div className="text-white text-[11px] font-sans leading-relaxed">
                          {isZh
                            ? "STAR 结构清晰，Action 部分展现了领导力。建议在 Result 结尾补充具体的量化收益（例如：查询延迟降低 32%）。"
                            : "Solid STAR structure with high leadership signal. Enhance the Result with a specific quantifiable metric (e.g. +32% query throughput)."}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Mobile Fallback: Vertical Stacked Cards ── */}
        <div className="md:hidden flex flex-col gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="ds-glass-card p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C2410C] text-white flex items-center justify-center shadow-xs">
                    <Icon weight="duotone" className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#C2410C] uppercase">{step.tag}</span>
                    <h3 className="text-base font-bold text-[#111111] font-sans">{step.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-[#666666] leading-relaxed font-sans mb-3">{step.desc}</p>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span className="text-[10px] font-mono font-bold text-[#C2410C] bg-[#C2410C]/10 px-2 py-0.5 rounded border border-[#C2410C]/20">
                    {step.badge}
                  </span>
                  <Link href="/register" className="text-xs text-[#111111] font-semibold flex items-center gap-1">
                    <span>{isZh ? "了解详情" : "Explore"}</span>
                    <ArrowRight weight="bold" className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
