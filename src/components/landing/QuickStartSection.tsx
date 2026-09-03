"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkle,
  Lightning,
  Rocket,
  CheckCircle,
  FileText,
  Compass,
  Kanban,
  ChatCircleDots,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

export function QuickStartSection() {
  const { isZh } = useTranslation();

  return (
    <section id="quick-start" className="relative py-20 md:py-28 px-4 border-t border-[#EAEAEA]">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mb-12"
        >
          <div className="ds-pill-metallic mb-4">
            <div className="ds-pill-inner">
              <Sparkle weight="fill" className="w-3 h-3 text-[#C2410C]" />
              <span className="text-[10px] font-mono font-bold text-neutral-800 tracking-wider uppercase">
                {isZh ? "快速上手" : "GET STARTED"}
              </span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#111111] tracking-tight leading-tight font-sans">
            {isZh ? "即刻体验或开启完整工作台" : "Try it instantly or launch your workspace"}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 2xl:gap-8 items-stretch mb-12">
          {/* Card 1: Instant Quickstart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 350, damping: 25 }}
            className="ds-glass-card p-6 sm:p-8 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold text-[#C2410C] uppercase tracking-wider">
                  {isZh ? "快速体验 · 90秒针对性润色" : "QUICK START · 90S TAILORING"}
                </span>
                <Lightning weight="duotone" className="w-5 h-5 text-[#C2410C]" />
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2 font-sans">
                {isZh ? "快速体验岗位逆向解析" : "Instant Resume & JD Matcher"}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-sans mb-6">
                {isZh
                  ? "无需繁琐配置，直接粘贴目标职位链接或招聘需求文本，即可即时体验关键词提取与 ATS 98% 匹配优化。"
                  : "Paste any job description link to immediately preview ATS keyword extraction, single-page fit check, and bullet tailoring."}
              </p>
            </div>

            <div className="space-y-4">
              {/* Web UI Feature Snapshot Card */}
              <div className="p-4 rounded-xl bg-white/90 border border-neutral-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100 font-mono">
                  <span className="text-neutral-500 text-[11px] flex items-center gap-1.5 font-medium">
                    <FileText weight="bold" className="w-3.5 h-3.5 text-[#C2410C]" />
                    {isZh ? "目标职位: Staff Architect" : "TARGET: Staff Architect"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    ATS 98% MATCH
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Distributed Systems", "Inference Latency", "SOC 2"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 text-[10px] font-mono border border-neutral-200 ds-tag-interactive"
                    >
                      + {tag}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/preview-templates"
                className="ds-btn-primary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2"
              >
                <span>{isZh ? "浏览简历模板" : "Browse Templates"}</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Full Workspace */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 350, damping: 25 }}
            className="ds-glass-card p-6 sm:p-8 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                  {isZh ? "完整工作台 · 4 大核心引擎" : "FULL OS · ALL 4 ENGINES"}
                </span>
                <Rocket weight="duotone" className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2 font-sans">
                {isZh ? "开启个人专属求职操作系统" : "Personal Career Operating System"}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-sans mb-6">
                {isZh
                  ? "建立个人 Master Profile 履历底稿，同步 9 套 ATS 模板、激活名企官网职位雷达，并在看板中追踪全流程进展。"
                  : "Maintain your master career profile, sync across all 9 ATS templates, activate real-time enterprise radar, and manage interview pipelines."}
              </p>
            </div>

            <div className="space-y-4">
              {/* Workspace Capabilities Checklist */}
              <div className="p-4 rounded-xl bg-white/90 border border-neutral-200/80 shadow-xs grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="flex items-center gap-2 text-neutral-700">
                  <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium">{isZh ? "9 套 ATS 模板" : "9 ATS Templates"}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Compass weight="duotone" className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-medium">{isZh ? "官网直聘雷达" : "Direct Job Radar"}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Kanban weight="duotone" className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-medium">{isZh ? "求职看板管道" : "Kanban Pipeline"}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <ChatCircleDots weight="duotone" className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-[11px] font-medium">{isZh ? "STAR 模拟面试" : "STAR Mock Prep"}</span>
                </div>
              </div>

              <Link
                href="/register"
                className="ds-btn-secondary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2"
              >
                <span>{isZh ? "免费注册并开启工作台" : "Create Free Workspace"}</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── SaaS Platform Guarantees Strip ── */}
        <div className="pt-6 border-t border-[#EAEAEA] flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 font-sans">
          <div className="flex items-center gap-2">
            <CheckCircle weight="fill" className="w-4 h-4 text-emerald-600" />
            <span>{isZh ? "无需信用卡 · 免费功能即可上手" : "No credit card required · Free tier included"}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck weight="fill" className="w-4 h-4 text-emerald-600" />
            <span>{isZh ? "支持自带 API 密钥 (BYOK) 或托管算力" : "Bring Your Own Key (BYOK) or Managed AI"}</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText weight="duotone" className="w-4 h-4 text-[#C2410C]" />
            <span>{isZh ? "支持高精度 PDF & Word (DOCX) 导出" : "Pixel-perfect PDF & Word (DOCX) Export"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
