"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Sparkle, Eye, Cpu, ShieldCheck } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";

export function TemplateShowcase() {
  const { isZh, t } = useTranslation();
  const [selectedId, setSelectedId] = useState(TEMPLATE_CONFIGS[0].id);
  const [viewMode, setViewMode] = useState<"visual" | "xray">("visual");

  const featured = TEMPLATE_CONFIGS.slice(0, 6);
  const activeTemplate = TEMPLATE_CONFIGS.find((c) => c.id === selectedId) || featured[0];

  return (
    <section id="templates" className="relative py-24 md:py-32 px-4 border-t border-[#EAEAEA] overflow-hidden">
      <div className="relative z-10 max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="ds-pill-metallic mb-4">
              <div className="ds-pill-inner">
                <Sparkle weight="fill" className="text-[#C2410C] w-3 h-3" />
                <span className="text-[10px] font-mono font-bold text-neutral-800 tracking-wider uppercase">
                  {t.landing.templatesEyebrow || (isZh ? "实战验证排版" : "Proven Formatting")}
                </span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#111111] tracking-tight leading-tight font-sans">
              {isZh ? (
                <>
                  9 套经过严苛验证的 ATS 简历模板，<br />
                  <span className="font-bold bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#9A3412] bg-clip-text text-transparent">
                    专为高面试回复率打造。
                  </span>
                </>
              ) : (
                <>
                  9 ATS-engineered resume templates,<br />
                  <span className="font-bold bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#9A3412] bg-clip-text text-transparent">
                    crafted for maximum callback rates.
                  </span>
                </>
              )}
            </h2>
          </div>
          <div>
            <Link
              href="/preview-templates"
              className="ds-btn-secondary inline-flex items-center gap-2 text-xs"
            >
              <span>{isZh ? "浏览全部 9 套模板" : "View All 9 Templates"}</span>
              <ArrowRight weight="bold" className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Template Selector Tabs & View Switcher ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-0">
            {featured.map((tmpl) => {
              const isActive = tmpl.id === selectedId;
              return (
                <motion.button
                  key={tmpl.id}
                  onClick={() => setSelectedId(tmpl.id)}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#111111] text-white font-semibold shadow-md"
                      : "bg-white/70 backdrop-blur-md text-[#555555] border border-neutral-200/80 hover:bg-white hover:text-[#111111] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  <span>{tmpl.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? "bg-white/20 text-white font-bold"
                        : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                    }`}
                  >
                    {tmpl.tag}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Interactive Inspector Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-neutral-200/60 backdrop-blur-md border border-white/60 self-start sm:self-auto shrink-0">
            <motion.button
              onClick={() => setViewMode("visual")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "visual"
                  ? "bg-white text-neutral-900 shadow-xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Eye weight="bold" className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>{isZh ? "视觉呈现" : "Visual Preview"}</span>
            </motion.button>
            <motion.button
              onClick={() => setViewMode("xray")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "xray"
                  ? "bg-neutral-900 text-white shadow-xs font-semibold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Cpu weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isZh ? "ATS 透视 X-Ray" : "ATS X-Ray"}</span>
            </motion.button>
          </div>
        </div>

        {/* ── Active Template Card & Interactive Document Console ── */}
        <div className="ds-glass-card p-6 md:p-10 grid md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Template Information & ATS Compliance Checklist */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-1 rounded-md bg-[#C2410C]/10 text-[#C2410C] text-[11px] font-mono font-bold uppercase tracking-wider border border-[#C2410C]/20">
                {activeTemplate.tag} · ATS VERIFIED
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-semibold">
                <ShieldCheck weight="bold" className="w-3 h-3 text-emerald-600" />
                ATS-FRIENDLY
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-sans font-bold text-[#111111] tracking-tight">
              {activeTemplate.name}
            </h3>
            <p className="text-[#555555] text-sm leading-relaxed font-sans">
              {activeTemplate.desc}
            </p>

            <ul className="space-y-2.5 pt-2 text-xs text-[#333333] font-medium font-sans">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check weight="bold" className="w-2.5 h-2.5 text-emerald-700" />
                </div>
                <span>{isZh ? "100% 结构化解析 (Greenhouse, Lever, Workday)" : "100% ATS Parser Compliant (Greenhouse, Lever, Workday)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check weight="bold" className="w-2.5 h-2.5 text-emerald-700" />
                </div>
                <span>{isZh ? "严苛单页排版算法，智能自适应字间距与段间距" : "Zero-overflow single-page auto-fitting algorithm"}</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Check weight="bold" className="w-2.5 h-2.5 text-emerald-700" />
                </div>
                <span>{isZh ? "所见即所得双向编辑，支持高精度 PDF / DOCX 导出" : "Dual Markdown/Visual editor with pixel-perfect PDF & Word export"}</span>
              </li>
            </ul>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href={`/preview-templates#template-${activeTemplate.id}`}
                className="ds-btn-primary text-xs py-2.5 px-5 font-semibold inline-flex items-center gap-2"
              >
                <span>{isZh ? "在工坊中预览" : "Open in Studio"}</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register"
                className="ds-btn-secondary text-xs py-2.5 px-4 font-medium"
              >
                {isZh ? "免费使用此模板" : "Use This Free"}
              </Link>
            </div>
          </div>

          {/* Right Column: High-Fidelity Micro Document / ATS X-Ray Viewport */}
          <div className="md:col-span-7 flex justify-center">
            <div className="relative w-full max-w-lg xl:max-w-[560px] 2xl:max-w-[620px] aspect-[816/1056] bg-[#FFFFFF] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col p-4 sm:p-5 select-none border border-neutral-200/80">
              {/* Document Top Status HUD */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100 text-[10px] font-mono text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-neutral-700 font-semibold uppercase">{activeTemplate.name}</span>
                </div>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {viewMode === "visual" ? "RECRUITER VIEW" : "ATS PARSER X-RAY"}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {viewMode === "visual" ? (
                  /* ── Recruiter Visual View: Formatted Typography & Layout ── */
                  <motion.div
                    key={`visual-${activeTemplate.id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="relative flex-1 rounded-lg border border-neutral-100 bg-white"
                  >
                    <Image
                      src={`/images/templates/${activeTemplate.thumbnail}.png`}
                      alt={`${activeTemplate.name} resume template preview`}
                      fill
                      sizes="(max-width: 768px) 100vw, 480px"
                      className="object-contain"
                      priority
                    />
                  </motion.div>
                ) : (
                  /* ── ATS Parser X-Ray Mode: Token Heatmap & Extraction ── */
                  <motion.div
                    key={`xray-${activeTemplate.id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="flex-1 flex flex-col justify-between font-mono text-[10px] space-y-2.5 bg-neutral-950 p-4 rounded-xl text-white"
                  >
                    <div className="p-2 rounded bg-neutral-900/90 border border-emerald-500/40 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-emerald-400 font-bold">
                        <span>[PARSED_HEADER] · CONFIDENCE 99.8%</span>
                        <span>GREENHOUSE_OK</span>
                      </div>
                      <div className="text-white font-bold">Alex Zhang · Senior Staff Engineer</div>
                      <div className="text-neutral-400 text-[9px]">EMAIL: alex@offerpath.dev | GITHUB: alex-zhang</div>
                    </div>

                    <div className="p-2 rounded bg-neutral-900/90 border border-emerald-500/40 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-emerald-400 font-bold">
                        <span>[EXTRACTED_EXPERIENCE] · 2 NODES</span>
                        <span>WORKDAY_OK</span>
                      </div>
                      <div className="text-amber-300">ROLE: Lead Architect @ Anthropic (2023 - Present)</div>
                      <div className="text-neutral-300 text-[9px] leading-snug">
                        KW_MATCH: <span className="bg-emerald-950 text-emerald-300 px-1 rounded">LLM Agent Runtime</span>{" "}
                        <span className="bg-emerald-950 text-emerald-300 px-1 rounded">Latency p95</span>{" "}
                        <span className="bg-emerald-950 text-emerald-300 px-1 rounded">Zero-Trust Sandbox</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-neutral-900/90 border border-emerald-500/40 space-y-1">
                      <div className="flex justify-between items-center text-[9px] text-emerald-400 font-bold">
                        <span>[SKILLS_INDEX] · 8 ENTITIES</span>
                        <span>LEVER_OK</span>
                      </div>
                      <div className="text-neutral-300 text-[9px]">
                        TypeScript, Python, PyTorch, Distributed Systems, Next.js, SOC 2
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[9px] text-neutral-400 border-t border-neutral-800">
                      <span className="text-emerald-400 font-bold">✔ ZERO PARSER ERRORS</span>
                      <span>100% SINGLE PAGE FIT</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Card Footer */}
              <div className="mt-auto pt-3 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  ● 100% ATS PARSER COMPLIANT
                </span>
                <span>SINGLE PAGE · FIT 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
