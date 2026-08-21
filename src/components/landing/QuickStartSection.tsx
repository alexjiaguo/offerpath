"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Copy, Check, Sparkle, Lightning, Rocket } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

export function QuickStartSection() {
  const { isZh } = useTranslation();
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  function handleCopy(text: string, setFn: (v: boolean) => void) {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  }

  const snippet1 = "npx offerpath-ai scan --target-jd ./sample-job.md";
  const snippet2 = "npx offerpath-ai init --workspace career-os-2026";

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 2xl:gap-8 items-stretch">
          {/* Card 1: Instant Quickstart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="ds-glass-card p-6 sm:p-8 flex flex-col justify-between"
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
                  ? "无需繁琐注册，直接粘贴目标职位链接或招聘需求文本，即可即时体验关键词提取与 ATS 98% 匹配优化。"
                  : "Paste any job description link to immediately preview ATS keyword extraction, single-page fit check, and bullet tailoring."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#11131A] border border-black/10 flex items-center justify-between font-mono text-xs text-white">
                <code className="text-xs truncate mr-2">
                  <span className="text-[#C2410C]">$ </span>
                  {snippet1}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(snippet1, setCopied1)}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1 shrink-0 text-[11px]"
                >
                  {copied1 ? (
                    <Check weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy weight="bold" className="w-3.5 h-3.5" />
                  )}
                  <span>{copied1 ? (isZh ? "已复制" : "Copied") : (isZh ? "复制" : "Copy")}</span>
                </button>
              </div>

              <Link
                href="/register"
                className="ds-btn-primary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2"
              >
                <span>{isZh ? "立即在线极速体验" : "Launch Web Studio"}</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Full Workspace */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="ds-glass-card p-6 sm:p-8 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                  {isZh ? "完整工作台 · 全流程管理" : "FULL OS · END-TO-END SUITE"}
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
              <div className="p-3.5 rounded-xl bg-[#11131A] border border-black/10 flex items-center justify-between font-mono text-xs text-white">
                <code className="text-xs truncate mr-2">
                  <span className="text-[#C2410C]">$ </span>
                  {snippet2}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(snippet2, setCopied2)}
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1 shrink-0 text-[11px]"
                >
                  {copied2 ? (
                    <Check weight="bold" className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy weight="bold" className="w-3.5 h-3.5" />
                  )}
                  <span>{copied2 ? (isZh ? "已复制" : "Copied") : (isZh ? "复制" : "Copy")}</span>
                </button>
              </div>

              <Link
                href="/register"
                className="ds-btn-secondary w-full text-xs font-semibold py-3 flex items-center justify-center gap-2"
              >
                <span>{isZh ? "创建免费账户并同步数据" : "Create Free Workspace"}</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
