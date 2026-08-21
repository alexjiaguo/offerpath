"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";

export function PhilosophyPillars() {
  const { isZh } = useTranslation();

  const pillars = isZh
    ? [
        {
          title: "ATS 严苛排版内核",
          subtitle: "ATS ENGINE KERNEL",
          desc: "严苛单页排版数学算法与标准化数据结构。保证 100% 通过 Greenhouse、Lever、Workday 等主流 ATS 筛选系统，彻底告别意外换页与排版错乱。",
          icon: (
            <svg aria-hidden="true" width="64" height="64" viewBox="0 0 72 72" fill="none" className="text-[#6799fe]/80">
              <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="36" cy="36" r="1.5" fill="currentColor" />
              <ellipse cx="36" cy="36" rx="25" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.7" transform="rotate(90 36 36)" />
              <ellipse cx="36" cy="36" rx="25" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.7" transform="rotate(30 36 36)" />
              <ellipse cx="36" cy="36" rx="25" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.7" transform="rotate(150 36 36)" />
            </svg>
          ),
        },
        {
          title: "一体化求职工作台",
          subtitle: "MODULAR CAREER OS",
          desc: "打破传统求职工具碎片化痛点。简历逆向定制、官网职位雷达、可视化看板管道与 STAR 模拟面试无缝协同，形成飞轮效应。",
          icon: (
            <svg aria-hidden="true" width="64" height="64" viewBox="0 0 72 72" fill="none" className="text-[#6799fe]/80">
              <circle cx="36" cy="36" r="17" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 2.5" opacity="0.5" />
              <circle cx="36" cy="36" r="26" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
              <circle cx="36" cy="36" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="36" cy="10" r="2.6" fill="currentColor" />
              <circle cx="58.5" cy="23" r="2.6" fill="currentColor" />
              <circle cx="58.5" cy="49" r="2.6" fill="currentColor" />
              <circle cx="36" cy="62" r="2.6" fill="currentColor" />
              <circle cx="13.5" cy="49" r="2.6" fill="currentColor" />
              <circle cx="13.5" cy="23" r="2.6" fill="currentColor" />
            </svg>
          ),
        },
        {
          title: "本地优先与隐私安全",
          subtitle: "LOCAL-FIRST PRIVACY",
          desc: "求职履历是个人极其敏感的数字资产。OfferPath 采用本地优先架构，数据绝不用于第三方公开大模型预训练，保障绝对私密安全。",
          icon: (
            <svg aria-hidden="true" width="64" height="64" viewBox="0 0 72 72" fill="none" className="text-[#6799fe]/80">
              <rect x="18" y="22" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
              <rect x="18" y="41" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
              <rect x="37" y="41" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
              <rect x="37" y="22" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2.5 2.5" opacity="0.45" />
              <rect x="47" y="12" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="54.5" cy="19.5" r="1.4" fill="currentColor" />
            </svg>
          ),
        },
      ]
    : [
        {
          title: "ATS Engineering Kernel",
          subtitle: "ATS ENGINE KERNEL",
          desc: "Strict single-page fitting algorithms and standardized data structures. 100% compliant with Greenhouse, Lever, and Workday parser screening rules.",
          icon: (
            <svg aria-hidden="true" width="64" height="64" viewBox="0 0 72 72" fill="none" className="text-[#6799fe]/80">
              <circle cx="36" cy="36" r="4" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="36" cy="36" r="1.5" fill="currentColor" />
              <ellipse cx="36" cy="36" rx="25" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.7" transform="rotate(90 36 36)" />
              <ellipse cx="36" cy="36" rx="25" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.7" transform="rotate(30 36 36)" />
              <ellipse cx="36" cy="36" rx="25" ry="11" stroke="currentColor" strokeWidth="1" opacity="0.7" transform="rotate(150 36 36)" />
            </svg>
          ),
        },
        {
          title: "Modular Career OS",
          subtitle: "MODULAR CAREER OS",
          desc: "Eliminates fragmented spreadsheets and disconnected tools. Resume tailoring, company job radar, Kanban pipeline, and STAR mock prep work as one flywheel.",
          icon: (
            <svg aria-hidden="true" width="64" height="64" viewBox="0 0 72 72" fill="none" className="text-[#6799fe]/80">
              <circle cx="36" cy="36" r="17" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 2.5" opacity="0.5" />
              <circle cx="36" cy="36" r="26" stroke="currentColor" strokeWidth="0.9" opacity="0.7" />
              <circle cx="36" cy="36" r="4.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="36" cy="10" r="2.6" fill="currentColor" />
              <circle cx="58.5" cy="23" r="2.6" fill="currentColor" />
              <circle cx="58.5" cy="49" r="2.6" fill="currentColor" />
              <circle cx="36" cy="62" r="2.6" fill="currentColor" />
              <circle cx="13.5" cy="49" r="2.6" fill="currentColor" />
              <circle cx="13.5" cy="23" r="2.6" fill="currentColor" />
            </svg>
          ),
        },
        {
          title: "Local-First & Private",
          subtitle: "LOCAL-FIRST PRIVACY",
          desc: "Your candidate profile and master resume data stay securely in your local browser storage or private database. Zero model training on your private career data.",
          icon: (
            <svg aria-hidden="true" width="64" height="64" viewBox="0 0 72 72" fill="none" className="text-[#6799fe]/80">
              <rect x="18" y="22" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
              <rect x="18" y="41" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
              <rect x="37" y="41" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.1" opacity="0.85" />
              <rect x="37" y="22" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2.5 2.5" opacity="0.45" />
              <rect x="47" y="12" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="54.5" cy="19.5" r="1.4" fill="currentColor" />
            </svg>
          ),
        },
      ];

  return (
    <section className="relative py-20 md:py-28 px-4 border-t border-[#EAEAEA]">
      <div className="max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Centered Formula Badge & Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5 mb-16"
        >
          <div className="ds-pill-metallic">
            <div className="ds-pill-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
              <span className="text-[10px] font-mono font-bold text-neutral-800 tracking-wider uppercase">
                {isZh ? "职业操作系统 = 算法解析 + 实时雷达 + 模拟面试" : "CAREER ENGINE = ATS OPTIMIZATION + DIRECT RADAR + STAR PREP"}
              </span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-[#111111] tracking-tight leading-tight font-sans">
            {isZh ? (
              <>
                <span className="text-[#C2410C] font-mono uppercase tracking-wider text-xl md:text-2xl block mb-2 font-semibold">
                  系统级工程架构
                </span>
                专为真实商业招聘环境与面试管道打造
              </>
            ) : (
              <>
                <span className="text-[#C2410C] font-mono uppercase tracking-wider text-xl md:text-2xl block mb-2 font-semibold">
                  Architected for Success
                </span>
                Engineering tools for real-world hiring pipelines
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-[#666666] leading-relaxed font-sans max-w-2xl">
            {isZh
              ? "求职不是碰运气的概率游戏，而是一套可被系统优化的工程链路。OfferPath 将顶级猎头、ATS 筛选算法与名企面试官评估逻辑凝结为高效工具，助你从容拿到理想 Offer。"
              : "Job searching is an engineering optimization problem, not a lottery. OfferPath provides the technical runtime to parse, discover, track, and rehearse with surgical precision."}
          </p>
        </motion.div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 2xl:gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: 0.08 * i, duration: 0.5 }}
              className="ds-glass-card p-8 flex flex-col items-center text-center group"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 transition-transform duration-300 group-hover:scale-110 shadow-xs text-[#111111] group-hover:text-[#C2410C]">
                {p.icon}
              </div>

              <div className="text-[10px] font-mono uppercase tracking-widest text-[#C2410C] mb-2 font-semibold">
                {p.subtitle}
              </div>

              <h3 className="text-lg font-semibold text-[#111111] mb-3 tracking-tight font-sans">
                <span className="underline decoration-dashed decoration-neutral-300 underline-offset-4 transition-colors group-hover:text-[#C2410C] group-hover:decoration-[#C2410C]/40">
                  {p.title}
                </span>
              </h3>

              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-sans font-normal">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
