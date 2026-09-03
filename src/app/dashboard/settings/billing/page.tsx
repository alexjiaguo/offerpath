"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  CreditCard,
  Key,
  Shield,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";
import { useMemo } from "react";
import { useProfileStore } from "@/store/profileStore";
import { useResumeStore } from "@/store/resumeStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import {
  PRO_TIER_MONTHLY_AI_USES,
  ULTRA_TIER_MONTHLY_AI_USES,
  getTierQuotaLimit,
} from "@/lib/aiQuota";
import type { Tier } from "@/types";

/* ═══════════════════════════════════════════════════
   Billing Page — subscription management
   /dashboard/settings/billing
   ═══════════════════════════════════════════════════ */

export default function BillingPage() {
  const { t, isZh } = useTranslation();
  const { profile, apiKeys } = useProfileStore();

  const currentPlan = (profile.tier ?? "free").toLowerCase() as Tier;
  const isFree = currentPlan === "free";
  const isPro = currentPlan === "pro";

  const aiLimit = getTierQuotaLimit(currentPlan);
  const aiUsed = profile.aiUsesThisMonth ?? 0;
  const isAiExhausted = !isFree && aiUsed >= aiLimit;

  // Real usage counts from the stores — meters must reflect actual data,
  // never hardcoded demo numbers.
  const resumeCount = useResumeStore((s) => s.resumes.length);
  const pipelineCount = usePipelineStore((s) => s.jobs.length);
  const mocksThisWeek = useInterviewStore((s) =>
    s.mockSessions.filter((m) => {
      const created = new Date(m.created_at).getTime();
      return Number.isFinite(created) && Date.now() - created < 7 * 24 * 60 * 60 * 1000;
    }).length
  );
  const FREE_RESUME_LIMIT = 2;
  const FREE_PIPELINE_LIMIT = 10;
  const FREE_MOCK_WEEKLY_LIMIT = 1;

  const hasActiveByok = apiKeys.some(
    (k) =>
      k.status === "active" &&
      (Boolean(k.key?.trim()) || k.provider === "ollama" || k.provider === "lmstudio")
  );
  const activeByok = apiKeys.find((k) => k.status === "active");

  const plans = useMemo(
    () => [
      {
        id: "free",
        name: t.billing.freePlan,
        price: "$0",
        period: isZh ? "永久免费" : "forever",
        highlight: false,
        features: isZh
          ? [
              "自带 API Key (BYOK) 无限使用 AI 功能",
              "无自带 Key 时使用默认基础功能",
              "支持 2 份主简历",
              "全部 9 套 ATS 精选模板",
              "10 个在途求职岗位看板",
              "每周 1 次模拟面试",
              "5 个 STAR 故事存储",
              "PDF 导出支持",
            ]
          : [
              "Unlimited AI with your own API key (BYOK)",
              "Standard non-AI features without key",
              "2 resumes",
              "All 9 ATS templates",
              "10 pipeline jobs",
              "1 mock interview/week",
              "5 STAR stories",
              "PDF export only",
            ],
      },
      {
        id: "pro",
        name: t.billing.proPlan,
        price: "$15",
        period: isZh ? "/月" : "/month",
        highlight: true,
        features: isZh
          ? [
              `每月 ${PRO_TIER_MONTHLY_AI_USES} 次内置托管 AI 深度分析额度`,
              "额度用尽后可无缝接入自带 Key (BYOK) 继续使用",
              "无限份定制针对性简历",
              "全部 9 套经过 ATS 验证的精选模板",
              "无限在途求职岗位追踪看板",
              "无限全真模拟面试与 AI 专家复盘",
              "无限 STAR 经历故事库",
              "支持 PDF + DOCX 导出",
              "完整求职漏斗数据分析",
            ]
          : [
              `${PRO_TIER_MONTHLY_AI_USES} Managed AI credits/month`,
              "Seamless BYOK fallback when quota is reached",
              "Unlimited tailored resumes",
              "All 9 ATS premium templates",
              "Unlimited pipeline jobs",
              "Unlimited mock interviews & scoring",
              "Unlimited STAR stories",
              "PDF + DOCX export",
              "Full funnel analytics",
            ],
      },
      {
        id: "ultra",
        name: t.billing.ultraPlan,
        price: "$29",
        period: isZh ? "/月" : "/month",
        highlight: false,
        features: isZh
          ? [
              `每月 ${ULTRA_TIER_MONTHLY_AI_USES} 次托管 AI 额度 (Pro 的 5 倍)`,
              "包含 Pro 版本的全部功能与权益",
              "额度用尽后支持自带 Key (BYOK) 无限调用",
              "高并发大模型加速通道",
              "开放开放平台 API 访问与 Webhooks",
              "猎头与团队招聘协作看板",
              "1 对 1 求职顾问专属通道",
              "API 速率限额提升",
            ]
          : [
              `${ULTRA_TIER_MONTHLY_AI_USES} Managed AI credits/month (5x Pro quota)`,
              "Everything in Pro included",
              "Seamless BYOK fallback for unlimited usage",
              "High-concurrency model acceleration pool",
              "API access & webhooks",
              "Team recruiter collaboration view",
              "Priority career advisor channel",
              "API rate limit boost",
            ],
      },
    ],
    [t, isZh]
  );

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

      {/* Quota & Action Reminders */}
      {isFree && !hasActiveByok && (
        <div className="card-editorial rounded-2xl p-5 bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <WarningCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-surface-400">
                {isZh ? "免费计划未包含托管 AI 额度" : "Free Plan: No Managed AI Credits"}
              </p>
              <p className="text-xs text-surface-300 mt-1 leading-relaxed">
                {isZh
                  ? "当前运行于基础模式。您可以自带 API 密钥 (BYOK) 免费解锁全功能 AI，或升级至 Pro / Ultra 计划使用内置托管算力。"
                  : "Currently running in standard mode. Connect your own API key (BYOK) in Settings for unlimited AI, or upgrade to Pro / Ultra for built-in managed credits."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/settings/api-keys"
              className="btn-editorial-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Key className="w-4 h-4" />
              {isZh ? "添加 API Key" : "Connect API Key"}
            </Link>
          </div>
        </div>
      )}

      {isFree && hasActiveByok && (
        <div className="card-editorial rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" weight="fill" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {isZh ? "已启用自带密钥 (BYOK)" : "BYOK Mode Active"}
              </p>
              <p className="text-xs text-surface-300 mt-0.5">
                {isZh
                  ? `正在使用您的 ${activeByok?.label || activeByok?.provider || "自定义"} Key，无额度限制享受完整 AI 体验。`
                  : `Using your ${activeByok?.label || activeByok?.provider || "custom"} key for all AI features with zero quota limits.`}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/settings/api-keys"
            className="btn-editorial-secondary text-xs px-3 py-1.5 flex-shrink-0 w-full sm:w-auto text-center"
          >
            {isZh ? "管理密钥" : "Manage Keys"}
          </Link>
        </div>
      )}

      {isAiExhausted && (
        <div className="card-editorial rounded-2xl p-5 bg-red-500/10 border border-red-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <WarningCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                {isZh ? "本月托管 AI 额度已用尽" : "Monthly Managed AI Quota Exhausted"}
              </p>
              <p className="text-xs text-surface-300 mt-1 leading-relaxed">
                {isPro
                  ? isZh
                    ? `您本月的 ${PRO_TIER_MONTHLY_AI_USES} 次 Pro 托管额度已耗尽。可升级至 Ultra 计划获取 5 倍额度 (${ULTRA_TIER_MONTHLY_AI_USES} 次)，或接入自带 API Key 继续使用。`
                    : `Your ${PRO_TIER_MONTHLY_AI_USES} monthly Pro credits are exhausted. Upgrade to Ultra for 5x quota (${ULTRA_TIER_MONTHLY_AI_USES} credits) or connect your own API key in Settings.`
                  : isZh
                    ? `您本月的 ${ULTRA_TIER_MONTHLY_AI_USES} 次 Ultra 托管额度已耗尽。可接入自带 API Key 继续使用。`
                    : `Your ${ULTRA_TIER_MONTHLY_AI_USES} monthly Ultra credits are exhausted. Connect your own API key in Settings to continue without limits.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <Link
              href="/dashboard/settings/api-keys"
              className="btn-editorial-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Key className="w-4 h-4" />
              {isZh ? "添加 API Key" : "Connect API Key"}
            </Link>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="card-editorial rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-surface-300 uppercase tracking-wider mb-1 font-mono">
              {t.billing.currentPlan}
            </p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold capitalize font-display">{currentPlan}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-200 text-surface-400 font-bold font-mono">
                {t.billing.statusActive}
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-surface-300">
            <p>{t.billing.nextRenewal}: —</p>
            <p className="text-xs mt-0.5">
              {isFree
                ? isZh
                  ? "当前为免费计划 — 无需账单"
                  : "Free plan — no billing"
                : isZh
                  ? "按月自动续期"
                  : "Renews monthly"}
            </p>
          </div>
        </div>

        {/* Usage Meters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            {
              label: isZh ? "AI 托管额度" : "Managed AI Quota",
              used: isFree ? 0 : aiUsed,
              limit: aiLimit,
              display: isFree
                ? hasActiveByok
                  ? isZh
                    ? "BYOK 已连接"
                    : "BYOK Active"
                  : isZh
                    ? "0 / 0 (仅限 BYOK)"
                    : "0 / 0 (BYOK Only)"
                : `${aiUsed}/${aiLimit}`,
              unit: isFree ? "" : isZh ? "/月" : "/mo",
              isByok: isFree,
            },
            {
              label: isZh ? "简历份数" : "Resumes",
              used: resumeCount,
              limit: isFree ? FREE_RESUME_LIMIT : 999,
              display: isFree ? `${resumeCount}/${FREE_RESUME_LIMIT}` : isZh ? `${resumeCount} · 无限` : `${resumeCount} · Unlimited`,
              unit: "",
            },
            {
              label: isZh ? "在途求职岗位" : "Pipeline Jobs",
              used: pipelineCount,
              limit: isFree ? FREE_PIPELINE_LIMIT : 999,
              display: isFree ? `${pipelineCount}/${FREE_PIPELINE_LIMIT}` : isZh ? `${pipelineCount} · 无限` : `${pipelineCount} · Unlimited`,
              unit: "",
            },
            {
              label: isZh ? "模拟面试" : "Mock Interviews",
              used: mocksThisWeek,
              limit: isFree ? FREE_MOCK_WEEKLY_LIMIT : 999,
              display: isFree ? `${mocksThisWeek}/${FREE_MOCK_WEEKLY_LIMIT}` : isZh ? `${mocksThisWeek} · 无限` : `${mocksThisWeek} · Unlimited`,
              unit: isFree ? (isZh ? "/周" : "/wk") : "",
            },
          ].map((meter) => {
            const isUnlimited = meter.limit >= 999;
            const pct = meter.isByok
              ? hasActiveByok
                ? 100
                : 0
              : isUnlimited
                // No quota on paid plans: show a neutral full track, the
                // count in the label above is the real signal.
                ? 100
                : Math.min((meter.used / Math.max(1, meter.limit)) * 100, 100);
            const isNearLimit = !meter.isByok && !isUnlimited && pct >= 80;

            return (
              <div
                key={meter.label}
                className="p-3 rounded-xl bg-surface-100 border border-surface-200"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-surface-300">{meter.label}</span>
                  <span
                    className={cn(
                      "font-medium",
                      meter.isByok && hasActiveByok
                        ? "text-emerald-600 font-bold"
                        : isNearLimit
                          ? "text-amber-600 font-bold"
                          : "text-surface-400"
                    )}
                  >
                    {meter.display}
                    {meter.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-200 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      meter.isByok && hasActiveByok
                        ? "bg-emerald-600"
                        : isUnlimited
                          ? "bg-surface-300"
                          : isNearLimit
                            ? "bg-amber-500"
                            : "bg-ember-600"
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
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl p-6 relative transition-all flex flex-col justify-between",
                plan.highlight
                  ? "bg-gradient-to-b from-ember-500/10 to-surface-0 border-2 border-ember-600/30 shadow-sm"
                  : "card-editorial"
              )}
            >
              <div>
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
              </div>

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

      {/* Checkout status — honest: no payment provider is connected yet */}
      <p className="text-xs text-surface-300 text-center -mt-4 mb-8">
        {isZh
          ? "在线支付尚未接入 — 在此之前，连接自带 API Key 即可无限制使用全部 AI 功能。"
          : "Online checkout isn't connected yet — until then, a BYOK key unlocks all AI features with no limits."}{" "}
        <Link href="/dashboard/settings/api-keys" className="text-ember-700 hover:text-ember-700 font-medium underline">
          {isZh ? "去连接密钥" : "Connect a key"}
        </Link>
      </p>

      {/* Security & BYOK Note */}
      <div className="card-editorial rounded-xl p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <p className="text-xs text-surface-300 leading-relaxed">
          {isZh
            ? "OfferPath 采用端到端加密与安全代理。自带 API Key (BYOK) 仅存储于本地浏览器并在发起请求时直接与供应商通信，我们绝不会存储您的密钥或训练您的个人数据。"
            : "OfferPath uses end-to-end security and encrypted proxies. Bring Your Own Key (BYOK) credentials stay stored securely in your browser and are never saved on our servers or used for model training."}
        </p>
      </div>
    </div>
  );
}
