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
  TrendUp,
  Star,
  CheckCircle,
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
          desc: "基于目标职位 JD 深度逆向解析，提取关键词并定制工作成果 Bullet，保证 100% 格式对齐与 ATS 通过率。",
          badge: "ATS 98% 验证通过",
        },
        {
          id: "discovery",
          icon: Compass,
          tag: "ENGINE 02",
          title: "企业官网直聘实时职位雷达",
          desc: "直连科技名企官方招聘通道 (Greenhouse, Lever, Workday)，比传统招聘网站早 24-48 小时抢先直投。",
          badge: "直聘源头 · 0延迟",
        },
        {
          id: "tracker",
          icon: Kanban,
          tag: "ENGINE 03",
          title: "可视化求职看板与数据管道",
          desc: "拖拽式看板、面试复盘记录与全流程转化漏斗分析，清晰把控每一个投递进展与薪资谈判筹码。",
          badge: "推进效率提升 28%",
        },
        {
          id: "interview",
          icon: ChatCircleDots,
          tag: "ENGINE 04",
          title: "STAR 行为与技术全真模拟面试官",
          desc: "基于真实目标岗位画像进行多轮对练，AI 即时针对 STAR 结构完整性与量化表达给出逐句精修建议。",
          badge: "智能即时反馈",
        },
      ]
    : [
        {
          id: "resume",
          icon: FileText,
          tag: "ENGINE 01",
          title: "AI Resume Studio & 9 ATS Templates",
          desc: "Reverse-engineers target JDs into high-impact bullets with strict single-page auto-fit and ATS 98% pass rate.",
          badge: "ATS 98% Verified",
        },
        {
          id: "discovery",
          icon: Compass,
          tag: "ENGINE 02",
          title: "Direct Enterprise Job Radar",
          desc: "Indexes direct career portals (Greenhouse, Lever, Workday) across top tech firms 24-48h before job boards.",
          badge: "Direct ATS · Zero Delay",
        },
        {
          id: "tracker",
          icon: Kanban,
          tag: "ENGINE 03",
          title: "Kanban Job Pipeline & Analytics",
          desc: "Drag-and-drop pipeline stages, interview timeline notes, and end-to-end callback conversion analytics.",
          badge: "+28% Pipeline Velocity",
        },
        {
          id: "interview",
          icon: ChatCircleDots,
          tag: "ENGINE 04",
          title: "STAR Mock Interview Coach",
          desc: "Simulate behavioral & technical rounds with instant structural critique on STAR impact quantification.",
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 md:mb-18"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C2410C]/8 border border-[#C2410C]/20 text-[#C2410C] text-xs font-mono font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C] animate-pulse" />
            {isZh ? "四大核心智能引擎" : "FOUR CORE INTELLIGENT ENGINES"}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111] font-sans">
            {isZh ? (
              <>
                全流程求职操作系统，
                <br className="hidden sm:inline" />
                从<span className="text-[#C2410C]">简历定制</span>到<span className="text-[#C2410C]">Offer 谈判</span>
              </>
            ) : (
              <>
                The Complete Job Search OS,
                <br className="hidden sm:inline" />
                From <span className="text-[#C2410C]">ATS Tailoring</span> to <span className="text-[#C2410C]">Offer Negotiation</span>
              </>
            )}
          </h2>
        </motion.div>

        {/* ── Desktop: 2-Column Split with Sticky Right Viewport ── */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 lg:gap-8 2xl:gap-10 items-start">
          {/* Left Column: Interactive Feature Step Triggers */}
          <div className="md:col-span-5 flex flex-col gap-2">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  whileHover={{ x: 4, scale: 1.008 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`p-3 lg:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? "bg-white/95 backdrop-blur-xl border-[#C2410C]/30 shadow-[0_8px_24px_rgba(0,0,0,0.06),0_0_0_1px_rgba(255,255,255,0.9)_inset]"
                      : "bg-white/50 backdrop-blur-sm border-white/70 hover:bg-white/80 hover:border-white opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shadow-xs shrink-0 ${
                        isActive
                          ? "bg-[#C2410C] text-white"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      <Icon weight="duotone" className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-bold tracking-wider text-[#C2410C] uppercase block">
                          {step.tag}
                        </span>
                        <h3 className="text-xs lg:text-sm font-bold text-[#111111] tracking-tight font-sans truncate">
                          {step.title}
                        </h3>
                      </div>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#C2410C]/10 text-[#C2410C] border border-[#C2410C]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] shrink-0 ml-2">
                          {step.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11.5px] text-[#666666] leading-relaxed font-sans pl-9.5">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Sticky Interactive Viewport */}
          <div className="md:col-span-7 sticky top-[14vh]">
            <div className="ds-terminal-card p-5 lg:p-6 rounded-2xl overflow-hidden relative shadow-[0_24px_64px_rgba(0,0,0,0.22)] border border-white/15 space-y-3">
              {/* Subtle background warm glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#C2410C]/12 rounded-full blur-[90px] pointer-events-none" />

              {/* SaaS App Header Bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.1] text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-2 font-mono text-[11px] text-white/60 bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                    offerpath.app/{steps[activeStep].id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                    {isZh ? "工作台实时就绪" : "STUDIO ENGINE ACTIVE"}
                  </span>
                </div>
              </div>

              {/* Dynamic Step Content */}
              <div>
                <AnimatePresence mode="wait">
                  {/* ── Engine 0: AI Resume Studio (Dark Studio Resume Viewer) ── */}
                  {activeStep === 0 && (
                    <motion.div
                      key="preview-0"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5 font-sans text-xs text-white"
                    >
                      {/* Document Toolbar & Metadata */}
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white/80 font-medium">Alex_Chen_Staff_Architect.pdf</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                            ATS 98% MATCH
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-white/60">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle weight="fill" className="w-3 h-3" />
                            1-PAGE FIT (100%)
                          </span>
                        </div>
                      </div>

                      {/* Dark Studio Rendered ATS Resume Document */}
                      <div className="p-3 sm:p-3.5 rounded-xl bg-[#141721] border border-white/[0.12] space-y-2 font-sans">
                        {/* Resume Header */}
                        <div className="border-b border-white/[0.08] pb-1 text-center">
                          <h4 className="text-sm font-bold tracking-tight text-white">Alex Chen</h4>
                          <p className="text-[9.5px] text-neutral-400 font-mono mt-0.5">
                            Staff AI Infrastructure Architect · San Francisco, CA · alex.chen@example.com
                          </p>
                        </div>

                        {/* Experience Section */}
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#EA580C] border-b border-white/[0.06] pb-0.5">
                            Work Experience
                          </div>
                          <div className="space-y-1 text-[10.5px] leading-relaxed">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-white">Stripe</span>
                              <span className="text-[9.5px] font-mono text-neutral-400">2022 – Present</span>
                            </div>
                            <div className="text-[9.5px] font-medium text-neutral-300 italic">Staff AI Systems Architect</div>
                            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-neutral-300">
                              <li>
                                Architected distributed <span className="text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded font-mono font-semibold border border-emerald-500/30">LLM inference orchestration</span> serving 2.5M+ daily requests with sub-120ms <span className="text-emerald-300 bg-emerald-500/20 px-1 py-0.2 rounded font-mono font-semibold border border-emerald-500/30">p95 latency</span>, reducing GPU spend by <strong className="text-emerald-400 font-bold">34%</strong>.
                              </li>
                              <li>
                                Designed multi-cluster Kubernetes autoscaling engine achieving <strong className="text-white font-bold">99.99% availability</strong> during peak Black Friday volumes.
                              </li>
                            </ul>
                          </div>

                          <div className="space-y-1 text-[10.5px] leading-relaxed pt-1 border-t border-white/[0.04]">
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-white">Linear</span>
                              <span className="text-[9.5px] font-mono text-neutral-400">2020 – 2022</span>
                            </div>
                            <div className="text-[9.5px] font-medium text-neutral-300 italic">Senior Full-Stack Engineer</div>
                            <p className="text-[10px] text-neutral-300">
                              • Built real-time collaborative workspace sync engine using WebSockets & CRDTs with sub-50ms latency across 40k+ teams.
                            </p>
                          </div>
                        </div>

                        {/* Skills Section */}
                        <div className="space-y-0.5 pt-0.5 border-t border-white/[0.06]">
                          <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#EA580C]">
                            Core Competencies
                          </div>
                          <p className="text-[9.5px] text-neutral-300 leading-normal">
                            <strong className="text-white">Systems:</strong> Distributed Systems, PyTorch, LLM Serving, Kubernetes, Go, TypeScript, PostgreSQL, SOC 2
                          </p>
                        </div>
                      </div>

                      {/* Live ATS Target Match Strip */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.08] text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] text-white/50">TARGET JD KEYWORDS:</span>
                          {["Distributed Systems", "Inference Latency", "GPU Optimization", "SOC 2"].map((kw) => (
                            <span key={kw} className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[10px] border border-white/15">
                              + {kw}
                            </span>
                          ))}
                        </div>
                        <Link href="/register" className="text-xs text-[#EA580C] hover:underline font-bold inline-flex items-center gap-1 shrink-0 ml-2">
                          <span>{isZh ? "进入简历工坊 →" : "Open Studio →"}</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Engine 1: Direct Enterprise Job Radar (Dark Studio Discovery Feed) ── */}
                  {activeStep === 1 && (
                    <motion.div
                      key="preview-1"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5 font-sans text-xs text-white"
                    >
                      {/* Discovery Search & Live Status Bar */}
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-mono text-emerald-400 font-bold">142 DIRECT OPENINGS DETECTED</span>
                          <span className="text-white/40 font-mono">· GREENHOUSE / LEVER / WORKDAY</span>
                        </div>
                        <span className="text-[10px] font-mono text-white/60 bg-white/[0.06] px-2 py-0.5 rounded">
                          SORT: MATCH SCORE
                        </span>
                      </div>

                      {/* Real System Job Cards */}
                      <div className="space-y-2">
                        {[
                          { role: "Staff Frontend Architect", company: "Stripe", loc: "San Francisco / Remote", pay: "$220k - $280k", match: 98, time: "4m ago", portal: "Greenhouse API", initial: "S", bg: "bg-indigo-500/20 text-indigo-300" },
                          { role: "Lead Product Designer", company: "Linear", loc: "New York · Hybrid", pay: "$190k - $240k", match: 95, time: "12m ago", portal: "Lever API", initial: "L", bg: "bg-emerald-500/20 text-emerald-300" },
                          { role: "Principal AI Systems Engineer", company: "Anthropic", loc: "SF / Remote", pay: "$260k - $340k", match: 92, time: "28m ago", portal: "Workday API", initial: "A", bg: "bg-amber-500/20 text-amber-300" },
                        ].map((item) => (
                          <motion.div
                            key={item.role}
                            whileHover={{ scale: 1.01, x: 2 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className="p-2.5 rounded-xl bg-[#141721] border border-white/[0.1] hover:border-white/25 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-sans shrink-0 border border-white/10 ${item.bg}`}>
                                {item.initial}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white tracking-tight">{item.role}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9.5px] font-bold border border-emerald-500/30">
                                    {item.match}% MATCH
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-neutral-300 flex items-center gap-2">
                                  <span className="font-semibold text-white/90">{item.company}</span>
                                  <span>•</span>
                                  <span>{item.loc}</span>
                                  <span>•</span>
                                  <span className="text-[#EA580C] font-mono font-bold">{item.pay}</span>
                                </div>
                                <div className="text-[9px] font-mono text-neutral-400 flex items-center gap-1">
                                  <Clock weight="bold" className="w-2.5 h-2.5 text-neutral-400" />
                                  <span>{item.time} via {item.portal}</span>
                                </div>
                              </div>
                            </div>
                            <Link
                              href="/register"
                              className="px-3 py-1.5 rounded-lg bg-[#C2410C] hover:bg-[#EA580C] text-white text-[10.5px] font-semibold transition-all shrink-0 ml-2 shadow-xs"
                            >
                              {isZh ? "一键定制" : "Tailor"}
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* Scanner Live Status Strip */}
                      <div className="p-2 rounded-lg bg-[#141721]/80 border border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">INDEXED: 3,420 DIRECT PORTALS</span>
                        <span className="text-emerald-400">LAST SYNC: 10 SECONDS AGO</span>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-xs text-neutral-300 border-t border-white/[0.08]">
                        <span className="font-mono text-[10px] text-emerald-400 font-semibold">✔ 0 AGGREGATOR DELAY · DIRECT ATS SYNC</span>
                        <Link href="/register" className="text-[#EA580C] hover:underline font-bold inline-flex items-center gap-1">
                          <span>{isZh ? "浏览全部 142 个直聘岗位 →" : "View All 142 Roles →"}</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Engine 2: Kanban Pipeline & Data Analytics (Dark Studio Kanban Board) ── */}
                  {activeStep === 2 && (
                    <motion.div
                      key="preview-2"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5 font-sans text-xs text-white"
                    >
                      {/* Pipeline Metric Ribbon */}
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 text-[11px]">
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-white/80">PIPELINES: <strong className="text-white">12 ACTIVE</strong></span>
                          <span className="text-amber-400">INTERVIEWS: <strong className="text-amber-300">3</strong></span>
                          <span className="text-emerald-400">OFFERS: <strong className="text-emerald-300">1</strong></span>
                        </div>
                        <span className="text-emerald-300 font-mono font-bold flex items-center gap-1 bg-emerald-950/50 border border-emerald-600/40 px-2 py-0.5 rounded text-[10px]">
                          <TrendUp weight="bold" className="w-3 h-3" />
                          +38.4% CALLBACK RATE
                        </span>
                      </div>

                      {/* Real Kanban Columns & Job Cards */}
                      <div className="grid grid-cols-3 gap-2">
                        {/* Column 1: Applied */}
                        <div className="p-2.5 rounded-xl bg-[#141721] border border-white/[0.1] space-y-1.5">
                          <div className="text-[9.5px] font-mono text-neutral-300 uppercase font-bold flex justify-between pb-1 border-b border-white/[0.06]">
                            <span>APPLIED</span>
                            <span className="text-neutral-400">(8)</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#1F232F] border border-white/[0.08] space-y-0.5">
                            <div className="font-bold text-white text-[10.5px]">Vercel</div>
                            <div className="text-[9.5px] text-neutral-300">Sr. Frontend Architect</div>
                            <div className="text-[8.5px] font-mono text-neutral-400 flex justify-between">
                              <span>Applied 2d ago</span>
                              <span className="text-emerald-400 font-bold">96%</span>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-[#1F232F] border border-white/[0.08] space-y-0.5">
                            <div className="font-bold text-white text-[10.5px]">Linear</div>
                            <div className="text-[9.5px] text-neutral-300">Staff Product Designer</div>
                            <div className="text-[8.5px] font-mono text-neutral-400 flex justify-between">
                              <span>Applied 3d ago</span>
                              <span className="text-emerald-400 font-bold">94%</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Interviewing */}
                        <div className="p-2.5 rounded-xl bg-[#141721] border border-white/[0.1] space-y-1.5">
                          <div className="text-[9.5px] font-mono text-[#EA580C] uppercase font-bold flex justify-between pb-1 border-b border-white/[0.06]">
                            <span>INTERVIEWS</span>
                            <span>(3)</span>
                          </div>
                          <div className="p-2 rounded-lg bg-[#C2410C]/20 border border-[#C2410C]/40 space-y-0.5">
                            <div className="font-bold text-white text-[10.5px]">Stripe</div>
                            <div className="text-[9.5px] text-[#FFA07A] font-semibold">Round 3: System Design</div>
                            <div className="text-[8.5px] font-mono text-amber-200 font-medium">Tomorrow 2:00 PM</div>
                          </div>
                          <div className="p-2 rounded-lg bg-[#1F232F] border border-white/[0.08] space-y-0.5">
                            <div className="font-bold text-white text-[10.5px]">OpenAI</div>
                            <div className="text-[9.5px] text-neutral-300">Round 2: Technical Loop</div>
                            <div className="text-[8.5px] font-mono text-neutral-400 flex justify-between">
                              <span>Friday 10:00 AM</span>
                              <span className="text-emerald-400 font-bold">95%</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 3: Offers */}
                        <div className="p-2.5 rounded-xl bg-[#141721] border border-white/[0.1] space-y-1.5">
                          <div className="text-[9.5px] font-mono text-emerald-400 uppercase font-bold flex justify-between pb-1 border-b border-white/[0.06]">
                            <span>OFFERS</span>
                            <span>(1)</span>
                          </div>
                          <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-500/40 space-y-0.5">
                            <div className="font-bold text-white text-[10.5px]">Anthropic</div>
                            <div className="text-[9.5px] text-emerald-300 font-bold">$260k Base + Equity</div>
                            <div className="text-[8.5px] font-mono text-emerald-200 font-medium">Decision in 5d</div>
                          </div>
                          <div className="p-2 rounded-lg bg-[#1F232F] border border-white/[0.08] space-y-0.5">
                            <div className="font-bold text-white text-[10.5px]">Figma</div>
                            <div className="text-[9.5px] text-neutral-300">Staff Systems Engineer</div>
                            <div className="text-[8.5px] font-mono text-neutral-400 flex justify-between">
                              <span>Under Review</span>
                              <span className="text-emerald-400 font-bold">90%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Velocity Benchmark Strip */}
                      <div className="p-2 rounded-lg bg-[#141721]/80 border border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">AVG RESPONSE: 3.2 DAYS (VS 14.8D AVG)</span>
                        <span className="text-amber-300">TARGET COMP: $240K+</span>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-xs border-t border-white/[0.08]">
                        <span className="font-mono text-[10px] text-neutral-300">CONVERSION VELOCITY: +38.4%</span>
                        <Link href="/register" className="text-[#EA580C] hover:underline font-bold">
                          {isZh ? "进入求职看板管理 →" : "Open Kanban Board →"}
                        </Link>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Engine 3: STAR Mock Interview Coach (Dark Studio Chat Simulator) ── */}
                  {activeStep === 3 && (
                    <motion.div
                      key="preview-3"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5 font-sans text-xs text-white"
                    >
                      {/* Session Top Bar */}
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#FFA07A] font-bold">STRIPE · STAFF AI SYSTEMS ARCHITECT</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-600/40 font-bold">
                          SCORE: 94/100
                        </span>
                      </div>

                      {/* Interviewer Question */}
                      <div className="p-2.5 rounded-xl bg-[#141721] border border-white/[0.1] space-y-1">
                        <div className="text-[9.5px] font-mono text-[#FFA07A] font-bold">INTERVIEWER (AI)</div>
                        <div className="text-white font-medium leading-relaxed font-sans text-[11px]">
                          {isZh
                            ? "“请描述一次你如何在跨职能团队产生重大架构分歧时，主导技术决策并按期交付生产系统的经历？”"
                            : "“Tell me about a time you led an engineering team through technical disagreement to deliver a high-performance system on schedule.”"}
                        </div>
                      </div>

                      {/* Candidate STAR Answer */}
                      <div className="p-2.5 rounded-xl bg-[#C2410C]/15 border border-[#C2410C]/35 ml-3 space-y-1">
                        <div className="text-[9.5px] font-mono text-neutral-300 font-bold flex items-center gap-1.5">
                          <span>YOU (STAR RESPONSE)</span>
                          <span className="text-[8.5px] bg-[#C2410C]/40 text-white px-1.5 py-0.5 rounded font-mono font-bold">S+T+A+R</span>
                        </div>
                        <div className="text-white/90 leading-relaxed font-sans text-[10.5px]">
                          {isZh
                            ? "“在推进微服务拆分时，团队对引入 GraphQL 产生分歧。我主导了 3 天对照基准实验，用真实吞吐与延迟数据消除了主观偏见，并在 2 周内将查询延迟降低 32%...”"
                            : "“When migrating services, our team debated GraphQL. I led a 3-day A/B benchmark measuring throughput & p99 latency, eliminating subjective bias and improving query latency by 32%...”"}
                        </div>
                      </div>

                      {/* Coach Real-Time Evaluation */}
                      <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-2.5">
                        <Star weight="fill" className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="text-[9.5px] font-mono text-emerald-300 font-bold">COACH EVALUATION & CRITIQUE</div>
                          <div className="text-white/90 text-[10.5px] font-sans leading-relaxed">
                            {isZh
                              ? "STAR 结构完整，Action 展现了技术领导力。量化指标（32% 延迟降低）极具说服力。"
                              : "Solid STAR structure with high engineering leadership signal. Quantified metric (+32% latency reduction) is persuasive."}
                          </div>
                        </div>
                      </div>

                      {/* Story Bank Prep Status */}
                      <div className="p-2 rounded-lg bg-[#141721]/80 border border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">LINKED STAR STORIES: 12</span>
                        <span className="text-emerald-400">SYSTEM DESIGN READY: 4 CARDS</span>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-xs border-t border-white/[0.08]">
                        <span className="font-mono text-[10px] text-neutral-300">REAL-TIME RUBRIC: ACTIVE</span>
                        <Link href="/register" className="text-[#EA580C] hover:underline font-bold">
                          {isZh ? "进入模拟面试室 →" : "Start Mock Session →"}
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
