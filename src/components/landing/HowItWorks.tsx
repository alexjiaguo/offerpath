"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ClipboardText, Sparkle, Target } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

const STEP_ICONS: React.ComponentType<IconProps>[] = [ClipboardText, Sparkle, Target];

export function HowItWorks() {
  const reduce = useReducedMotion();
  const { t, isZh } = useTranslation();

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-4 border-t border-[#EAEAEA]">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <motion.div
          className="max-w-2xl mb-16"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ds-pill-metallic mb-4">
            <div className="ds-pill-inner">
              <Sparkle weight="fill" className="w-3 h-3 text-[#C2410C]" />
              <span className="text-[10px] font-mono font-bold text-neutral-800 tracking-wider uppercase">
                {t.landing.howItWorksEyebrow || (isZh ? "工作流" : "Workflow")}
              </span>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#111111] tracking-tight leading-tight mb-4 font-sans">
            {t.landing.howItWorksTitle}{" "}
            <span className="font-semibold text-[#C2410C]">{t.landing.howItWorksHighlight}</span>
          </h2>
          <p className="text-[#666666] text-sm sm:text-base leading-relaxed font-sans">
            {t.landing.howItWorksSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 2xl:gap-8">
          {t.landing.steps.map((s, i) => {
            const Icon = STEP_ICONS[i] || Target;
            return (
              <motion.div
                key={s.step}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative ds-glass-card p-6 md:p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono font-bold text-[#C2410C] bg-[#C2410C]/10 px-2.5 py-1 rounded-md border border-[#C2410C]/20 uppercase tracking-wider">
                      {s.step} · {s.badge}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-white/60 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-xs">
                      <Icon weight="duotone" className="w-5 h-5 text-[#C2410C]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-sans tracking-tight text-[#111111] mb-3">
                    {s.title}
                  </h3>
                  <p className="text-[#666666] text-xs sm:text-sm leading-relaxed font-sans font-normal">
                    {s.desc}
                  </p>
                </div>

                {i < t.landing.steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#EAEAEA] items-center justify-center text-[#111111] shadow-sm">
                    <ArrowRight weight="bold" className="w-3 h-3 text-[#C2410C]" />
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
