"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, Sparkle, Kanban, ChatCircleDots } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

const STEP_ICONS: React.ComponentType<IconProps>[] = [Compass, Sparkle, Kanban, ChatCircleDots];

export function HowItWorks() {
  const reduce = useReducedMotion();
  const { t, isZh } = useTranslation();

  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-4 border-t border-[#EAEAEA]">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <motion.div
          className="max-w-2xl mb-14 md:mb-16"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 2xl:gap-6 items-stretch">
          {t.landing.steps.map((s, i) => {
            const Icon = STEP_ICONS[i] || Compass;
            return (
              <motion.div
                key={s.step}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ duration: 0.5, delay: i * 0.08, type: "spring", stiffness: 350, damping: 25 }}
                className="relative ds-glass-card p-6 flex flex-col justify-between h-full group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-mono font-bold text-[#C2410C] bg-[#C2410C]/10 px-2.5 py-1 rounded-md border border-[#C2410C]/20 uppercase tracking-wider group-hover:bg-[#C2410C]/15 transition-colors">
                      {s.step} · {s.badge}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-white/70 backdrop-blur-md border border-white/80 flex items-center justify-center shadow-xs text-[#C2410C] group-hover:scale-110 group-hover:shadow-md transition-all">
                      <Icon weight="duotone" className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold font-sans tracking-tight text-[#111111] mb-2.5">
                    {s.title}
                  </h3>
                  <p className="text-[#666666] text-xs leading-relaxed font-sans font-normal">
                    {s.desc}
                  </p>
                </div>

                {i < t.landing.steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-[#EAEAEA] items-center justify-center text-[#111111] shadow-md">
                    <ArrowRight weight="bold" className="w-3.5 h-3.5 text-[#C2410C]" />
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
