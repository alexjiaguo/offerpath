"use client";

import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Shield, Sparkle } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { useMemo } from "react";

/* ═══════════════════════════════════════════════════
   Billing Page — subscription management
   /dashboard/settings/billing
   ═══════════════════════════════════════════════════ */

export default function BillingPage() {
  const { t, isZh } = useTranslation();
  const currentPlan = "free";

  const plans = useMemo(() => [
    {
      name: t.billing.freePlan,
      price: "$0",
      period: isZh ? "永久免费" : "forever",
      highlight: false,
      features: isZh ? [
        "支持 2 份主简历",
        "3 套基础模板",
        "每周 3 次 AI 针对性分析",
        "10 个在途求职岗位看板",
        "每周 1 次全真模拟面试",
        "5 个 STAR 故事存储",
        "PDF 导出支持",
      ] : [
        "2 resumes",
        "3 basic templates",
        "3 AI uses/week",
        "10 pipeline jobs",
        "1 mock interview/week",
        "5 STAR stories",
        "PDF export only",
      ],
    },
    {
      name: t.billing.proPlan,
      price: "$15",
      period: isZh ? "/月" : "/month",
      highlight: true,
      features: isZh ? [
        "无限份定制针对性简历",
        "全部 9 套经过 ATS 验证的精选模板",
        "无限次 AI 深度润色与考题生成",
        "无限在途求职岗位追踪看板",
        "无限全真模拟面试与 AI 专家复盘",
        "无限 STAR 经历故事库",
        "支持 PDF + DOCX 导出",
        "完整求职漏斗数据分析",
        "支持自带 (BYO) 或托管 API 密钥",
      ] : [
        "Unlimited resumes",
        "All 9 premium templates",
        "Unlimited AI uses",
        "Unlimited pipeline jobs",
        "Unlimited mock interviews",
        "Unlimited stories",
        "PDF + DOCX export",
        "Full analytics",
        "BYO + managed API keys",
      ],
    },
    {
      name: t.billing.ultraPlan,
      price: "$29",
      period: isZh ? "/月" : "/month",
      highlight: false,
      features: isZh ? [
        "包含 Pro 版本的全部功能",
        "专属定制简历排版模板",
        "开放开放平台 API 访问",
        "猎头与团队招聘协作看板",
        "高并发大模型调用通道",
        "1 对 1 求职顾问专属通道",
        "支持 CLI 命令行与 MCP 智能代理接入",
        "API 速率限额提升",
      ] : [
        "Everything in Pro",
        "Custom templates",
        "API access",
        "Team analytics view",
        "Managed key pool",
        "Priority support",
        "CLI and MCP support",
        "API rate boost",
      ],
    },
  ], [t, isZh]);

  return (
    <div className="w-full animate-fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold font-display">{t.billing.title}</h1>
        </div>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 text-sm text-surface-300 hover:text-surface-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.apiKeys.backToSettings}
        </Link>
      </div>

      {/* Current Plan Card */}
      <div className="card-editorial rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-surface-300 uppercase tracking-wider mb-1 font-mono">{t.billing.currentPlan}</p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold capitalize font-display">{currentPlan}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-200 text-surface-400 font-bold font-mono">
                {t.billing.statusActive}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-surface-300">
            <p>{t.billing.nextRenewal}: —</p>
            <p className="text-xs mt-0.5">{isZh ? "当前为免费体验计划 — 无需账单" : "Free plan — no billing"}</p>
          </div>
        </div>

        {/* Usage Meters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: isZh ? "AI 使用次数" : "AI Uses", used: 1, limit: 3, unit: isZh ? "/周" : "/week" },
            { label: isZh ? "简历份数" : "Resumes", used: 2, limit: 2, unit: "" },
            { label: isZh ? "看板在途岗位" : "Pipeline Jobs", used: 5, limit: 10, unit: "" },
            { label: isZh ? "模拟面试" : "Mock Interviews", used: 0, limit: 1, unit: isZh ? "/周" : "/week" },
          ].map((meter) => {
            const pct = Math.min((meter.used / meter.limit) * 100, 100);
            const isNearLimit = pct >= 80;
            return (
              <div key={meter.label} className="p-3 rounded-xl bg-surface-100 border border-surface-200">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-surface-300">{meter.label}</span>
                  <span className={cn("font-medium", isNearLimit ? "text-amber-600" : "text-surface-400")}>
                    {meter.used}/{meter.limit}{meter.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isNearLimit ? "bg-amber-500" : "bg-ember-600"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Comparison */}
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2 font-display">
        <Sparkle className="w-4 h-4 text-ember-600" />
        {t.billing.choosePlan}
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan || (isZh && plan.name === "免费版");
          return (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl p-6 relative transition-all",
                plan.highlight
                  ? "bg-gradient-to-b from-ember-500/10 to-surface-0 border-2 border-ember-600/30"
                  : "card-editorial"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-md bg-ember-600 text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                  {t.billing.mostPopular}
                </div>
              )}

              <div className="text-center mb-5">
                <h3 className="text-lg font-bold mb-1 font-display">{plan.name}</h3>
                <p className="text-3xl font-bold font-display">
                  {plan.price}
                  <span className="text-sm font-normal text-surface-300">{plan.period}</span>
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-surface-400">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-medium transition-all",
                  isCurrent
                    ? "bg-surface-100 text-surface-300 cursor-default border border-surface-200"
                    : "bg-surface-100 text-surface-400 cursor-not-allowed border border-surface-200"
                )}
                disabled
                title={t.billing.notAvailableYet}
              >
                {isCurrent ? t.billing.currentPlanBtn : t.billing.notAvailableYet}
              </button>
            </div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="card-editorial rounded-xl p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-surface-300">
          {t.billing.sampleLimitsNote}
        </p>
      </div>
    </div>
  );
}
