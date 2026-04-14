"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Check,
  Sparkles,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   Billing Page — subscription management
   /dashboard/settings/billing
   ═══════════════════════════════════════════════════ */

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    highlight: false,
    features: [
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
    name: "Pro",
    price: "$15",
    period: "/month",
    highlight: true,
    features: [
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
    name: "Team",
    price: "$29",
    period: "/seat/mo",
    highlight: false,
    features: [
      "Everything in Pro",
      "Custom templates",
      "API access",
      "Team analytics view",
      "Managed key pool",
      "Priority support",
    ],
  },
];

export default function BillingPage() {
  const currentPlan = "free";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold">Billing</h1>
        </div>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Settings
        </Link>
      </div>

      {/* Current Plan Card */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 dark:text-gray-500 uppercase tracking-wider mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold capitalize">{currentPlan}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-200 text-zinc-600 dark:text-gray-400 font-medium">
                ACTIVE
              </span>
            </div>
          </div>
          <div className="text-right text-sm text-zinc-500 dark:text-gray-500">
            <p>Next renewal: —</p>
            <p className="text-xs mt-0.5">Free plan — no billing</p>
          </div>
        </div>

        {/* Usage Meters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "AI Uses", used: 1, limit: 3, unit: "/week" },
            { label: "Resumes", used: 2, limit: 2, unit: "" },
            { label: "Pipeline Jobs", used: 5, limit: 10, unit: "" },
            { label: "Mock Interviews", used: 0, limit: 1, unit: "/week" },
          ].map((meter) => {
            const pct = Math.min((meter.used / meter.limit) * 100, 100);
            const isNearLimit = pct >= 80;
            return (
              <div key={meter.label} className="p-3 rounded-xl bg-surface-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-600 dark:text-gray-400">{meter.label}</span>
                  <span className={cn("font-medium", isNearLimit ? "text-amber-400" : "text-zinc-700 dark:text-gray-300")}>
                    {meter.used}/{meter.limit}{meter.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-300 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isNearLimit ? "bg-amber-400" : "bg-brand-500"
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
      <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-400" />
        Choose Your Plan
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === currentPlan;
          return (
            <div
              key={plan.name}
              className={cn(
                "rounded-2xl p-6 relative transition-all",
                plan.highlight
                  ? "bg-gradient-to-b from-brand-500/10 to-purple-500/5 border-2 border-brand-500/30"
                  : "glass"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-500 text-[10px] font-bold text-white uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-5">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold">
                  {plan.price}
                  <span className="text-sm font-normal text-zinc-500 dark:text-gray-500">{plan.period}</span>
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-medium transition-all",
                  isCurrent
                    ? "bg-surface-200 text-zinc-600 dark:text-gray-400 cursor-default"
                    : plan.highlight
                    ? "gradient-brand text-white hover:opacity-90"
                    : "bg-surface-200 text-zinc-700 dark:text-gray-300 hover:text-zinc-900 dark:hover:text-white hover:bg-surface-300"
                )}
                disabled={isCurrent}
              >
                {isCurrent ? "Current Plan" : plan.highlight ? "Upgrade to Pro" : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="glass rounded-xl p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-xs text-zinc-500 dark:text-gray-500">
          Payments are securely processed by Stripe. We never store your card details.
          You can cancel or change your plan at any time.
        </p>
      </div>
    </div>
  );
}
