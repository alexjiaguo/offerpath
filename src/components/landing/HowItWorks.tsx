"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardText, Sparkle, Target } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

const STEP_ICONS: React.ComponentType<IconProps>[] = [ClipboardText, Sparkle, Target];

export function HowItWorks() {
  const reduce = useReducedMotion();
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-32 md:py-40 px-4 bg-white border-y border-surface-200/60">
      <div className="max-w-[90rem] mx-auto">
        <motion.div
          className="max-w-2xl mb-20"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="eyebrow-tag mb-6">{t.landing.howItWorksEyebrow}</div>
          <h2 className="text-5xl md:text-7xl font-light tracking-tighter mb-6 leading-none">
            {t.landing.howItWorksTitle}
            <span className="font-display italic font-semibold text-ember-600">{t.landing.howItWorksHighlight}</span>
          </h2>
          <p className="text-surface-300 text-xl font-light">
            {t.landing.howItWorksSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {t.landing.steps.map((s, i) => {
            const Icon = STEP_ICONS[i] || Target;
            return (
              <motion.div
                key={s.step}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.32, 0.72, 0, 1] }}
                className="relative card-cream flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold text-ember-700 bg-ember-50 px-2 py-0.5 rounded-md border border-ember-100">
                    {s.step} · {s.badge}
                  </span>
                  <div className="w-10 h-10 rounded-md bg-ember-50 border border-ember-100 flex items-center justify-center">
                    <Icon weight="light" className="w-5 h-5 text-ember-600" />
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl font-display tracking-tight text-surface-400 mb-3">
                  {s.title}
                </h3>
                <p className="text-surface-300 text-sm md:text-base leading-relaxed font-light flex-1">
                  {s.desc}
                </p>
                {i < t.landing.steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-md bg-white border border-surface-200 items-center justify-center text-surface-300">
                    <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
