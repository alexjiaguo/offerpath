"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Star, TrendUp } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";

/* ═══════════════════════════════════════════════════
   Bento Card Previews - Real, populated feature mockups
   ═══════════════════════════════════════════════════ */

interface Job {
  initials: string;
  hue?: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  tags: string[];
}

export function JobDiscoveryPreview() {
  const { isZh } = useTranslation();

  const jobs: Job[] = isZh ? [
    { initials: "VC", title: "资深前端工程师 (Senior Frontend)", company: "Vercel", location: "远程办公 · 全球", salary: "$180k-$240k", match: 94, tags: ["React", "Next.js"] },
    { initials: "AN", title: "AI 产品工程师 (Product Engineer)", company: "Anthropic", location: "旧金山 / 远程", salary: "$200k-$290k", match: 90, tags: ["大模型", "TypeScript"] },
    { initials: "LN", title: "产品体验设计师 (Product Designer)", company: "Linear", location: "纽约 · 混合办公", salary: "$160k-$210k", match: 88, tags: ["Figma", "设计系统"] },
    { initials: "FG", title: "设计工程师 (Design Engineer)", company: "Figma", location: "旧金山", salary: "$170k-$230k", match: 85, tags: ["动效原型"] },
    { initials: "ST", title: "主任软件工程师 (Staff Engineer)", company: "Stripe", location: "旧金山 / 远程", salary: "$220k-$310k", match: 81, tags: ["分布式架构"] },
    { initials: "NO", title: "工程研发主管 (Eng Manager)", company: "Notion", location: "远程办公", salary: "$200k-$280k", match: 76, tags: ["技术管理"] },
    { initials: "DD", title: "后端高并发工程师 (Backend)", company: "Datadog", location: "纽约", salary: "$175k-$240k", match: 72, tags: ["Go语言", "高并发"] },
  ] : [
    { initials: "VC", title: "Senior Frontend Engineer", company: "Vercel", location: "Remote · US", salary: "$180k-$240k", match: 94, tags: ["React", "Next.js"] },
    { initials: "AN", title: "Product Engineer", company: "Anthropic", location: "Remote · Global", salary: "$200k-$290k", match: 90, tags: ["AI", "TypeScript"] },
    { initials: "LN", title: "Product Designer", company: "Linear", location: "New York · Hybrid", salary: "$160k-$210k", match: 88, tags: ["Figma", "Systems"] },
    { initials: "FG", title: "Design Engineer", company: "Figma", location: "San Francisco", salary: "$170k-$230k", match: 85, tags: ["Prototyping"] },
    { initials: "ST", title: "Staff Software Engineer", company: "Stripe", location: "San Francisco", salary: "$220k-$310k", match: 81, tags: ["Ruby", "Distributed"] },
    { initials: "NO", title: "Engineering Manager", company: "Notion", location: "Remote · Global", salary: "$200k-$280k", match: 76, tags: ["Leadership"] },
    { initials: "DD", title: "Backend Engineer", company: "Datadog", location: "New York", salary: "$175k-$240k", match: 72, tags: ["Go", "Scale"] },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="px-2.5 py-1 rounded-md bg-brand-900 text-white text-[10px] font-semibold uppercase tracking-widest">
          {isZh ? "全部高匹配" : "All Matches"}
        </span>
        <span className="px-2.5 py-1 rounded-md bg-surface-50 border border-surface-200/50 text-[10px] font-semibold uppercase tracking-widest text-surface-300">
          {isZh ? "远程办公" : "Remote"}
        </span>
        <span className="px-2.5 py-1 rounded-md bg-surface-50 border border-surface-200/50 text-[10px] font-semibold uppercase tracking-widest text-surface-300">
          $150k+
        </span>
        <span className="ml-auto text-[10px] font-medium text-surface-300 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-ember-500" />
          {isZh ? "今日新增 142 个新职位" : "142 new today"}
        </span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-1.5">
        {jobs.map((job, i) => {
          const featured = job.match >= 90;
          return (
            <motion.div
              key={job.company}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              className="group flex items-center gap-3 p-2.5 rounded-lg bg-white border border-surface-200/50 hover:border-surface-300 transition-all"
            >
              <div
                className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-wider ${
                  featured ? "bg-gradient-to-br from-ember-500 to-ember-700" : "bg-surface-400"
                }`}
              >
                {job.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[13px] text-surface-400 truncate">{job.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-ember-50 text-ember-700 text-[9px] font-bold uppercase tracking-wider shrink-0">
                    {job.match}%
                  </span>
                </div>
                <div className="text-[11px] text-surface-300 truncate">
                  {job.company} · {job.location} · {job.salary}
                </div>
              </div>
              <div className="hidden lg:flex gap-1 shrink-0">
                {job.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded-md bg-surface-50 text-[9px] font-medium uppercase tracking-wider text-surface-300 border border-surface-200/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3 pt-2.5 border-t border-surface-200/50 flex items-center justify-between text-[10px] text-surface-300">
        <span>{isZh ? "显示 7 / 142 个高匹配机会" : "Showing 7 of 142 matches"}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-ember-700">
          {isZh ? "查看完整列表" : "View feed"}
          <ArrowRight weight="bold" className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

export function JobTrackerPreview() {
  const { isZh } = useTranslation();

  const columns = [
    {
      name: isZh ? "已投递" : "Applied",
      count: 8,
      cards: [
        { company: "Vercel", role: isZh ? "资深前端" : "Sr. Frontend", hue: "from-surface-400 to-surface-300" },
        { company: "Linear", role: isZh ? "体验设计" : "Designer", hue: "from-surface-400 to-surface-300" },
      ],
    },
    {
      name: isZh ? "面试中" : "Interview",
      count: 3,
      cards: [
        { company: "Stripe", role: isZh ? "架构专家" : "Staff Eng", hue: "from-surface-400 to-surface-300" },
      ],
    },
    {
      name: isZh ? "Offer" : "Offer",
      count: 1,
      cards: [
        { company: "Anthropic", role: isZh ? "AI 工程师" : "AI Eng", hue: "from-ember-500 to-ember-700" },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">
          {isZh ? "实时看板管道" : "Your Pipeline"}
        </span>
        <span className="text-[10px] font-medium text-ember-700 flex items-center gap-1">
          <TrendUp weight="bold" className="w-3 h-3" />
          {isZh ? "本周推进 +23%" : "+23% this week"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 flex-1">
        {columns.map((col) => (
          <div
            key={col.name}
            className="bg-surface-50/70 rounded-lg p-1.5 border border-surface-200/40 flex flex-col"
          >
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-surface-300 truncate">
                {col.name}
              </span>
              <span className="text-[9px] font-semibold text-surface-400 bg-white px-1.5 py-0.5 rounded-md border border-surface-200/50">
                {col.count}
              </span>
            </div>
            <div className="space-y-1.5 flex-1">
              {col.cards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                  className="bg-white rounded-md p-1.5 border border-surface-200/50 shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-4 h-4 rounded bg-gradient-to-br ${card.hue}`} />
                    <span className="text-[9px] font-bold text-surface-400 truncate">
                      {card.company}
                    </span>
                  </div>
                  <div className="text-[8px] text-surface-300 truncate mt-0.5 pl-5.5 ml-0">
                    {card.role}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThumbGlyph({ kind }: { kind: string }) {
  if (kind === "two-col")
    return (
      <div className="flex gap-1 h-full">
        <div className="w-1/3 flex flex-col gap-1">
          <div className="h-1.5 w-full bg-surface-300 rounded-full" />
          <div className="h-1 w-full bg-surface-200 rounded-full" />
          <div className="h-1 w-2/3 bg-surface-200 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1 w-full bg-surface-100 rounded-full" />
          <div className="h-1 w-11/12 bg-surface-100 rounded-full" />
          <div className="h-1 w-10/12 bg-surface-100 rounded-full" />
          <div className="h-1 w-full bg-surface-100 rounded-full" />
        </div>
      </div>
    );
  if (kind === "single-col")
    return (
      <div className="flex flex-col gap-1 h-full">
        <div className="h-1.5 w-1/2 bg-surface-300 rounded-full" />
        <div className="h-1 w-full bg-surface-100 rounded-full" />
        <div className="h-1 w-11/12 bg-surface-100 rounded-full" />
        <div className="h-1 w-10/12 bg-surface-100 rounded-full" />
        <div className="mt-auto h-1 w-full bg-surface-100 rounded-full" />
      </div>
    );
  return (
    <div className="flex flex-col gap-1 h-full">
      <div className="h-2 w-full bg-surface-300 rounded-md" />
      <div className="flex gap-1 flex-1">
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1 w-full bg-surface-100 rounded-full" />
          <div className="h-1 w-10/12 bg-surface-100 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1 w-full bg-surface-100 rounded-full" />
          <div className="h-1 w-9/12 bg-surface-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ResumeBuilderPreview() {
  const { isZh } = useTranslation();

  const templates = isZh ? [
    { name: "典雅双栏", tag: "双栏布局", glyph: "two-col" },
    { name: "ATS 极简", tag: "单栏标准", glyph: "single-col" },
    { name: "现代科技", tag: "顶栏强调", glyph: "header" },
  ] : [
    { name: "Elegant", tag: "Two-column", glyph: "two-col" },
    { name: "ATS Exec", tag: "Single-col", glyph: "single-col" },
    { name: "Bold Eng", tag: "Header bar", glyph: "header" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300">
          {isZh ? "9 套经过 ATS 验证的模板" : "9 ATS-tested templates"}
        </span>
        <span className="text-[10px] font-medium text-ember-700 inline-flex items-center gap-1">
          <CheckCircle weight="fill" className="w-3 h-3 text-ember-500" />
          {isZh ? "平均 ATS 分数 96" : "Avg 96 ATS"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {templates.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="group rounded-lg border border-surface-200/50 bg-white p-2 flex flex-col hover:border-surface-300 transition-all"
          >
            <div className="flex-1 min-h-0 rounded-md bg-surface-50 border border-surface-200/40 p-2 mb-2">
              <ThumbGlyph kind={t.glyph} />
            </div>
            <div className="text-[9px] font-semibold text-surface-400 truncate">{t.name}</div>
            <div className="text-[8px] text-surface-300 uppercase tracking-wider">{t.tag}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function InterviewPackPreview() {
  const { isZh } = useTranslation();

  const features = isZh ? [
    { label: "全真模拟对练", desc: "行为 + 专业技术" },
    { label: "STAR 故事库", desc: "可复用高光案例" },
    { label: "企业深度背调", desc: "业务与技术栈速查" },
    { label: "定制化考题", desc: "针对 JD 精准命中" },
  ] : [
    { label: "Mock Sessions", desc: "Behavioral + technical" },
    { label: "STAR stories", desc: "Reusable stories" },
    { label: "Company Research", desc: "Auto-briefing" },
    { label: "Custom Questions", desc: "Tailored to JD" },
  ];

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
      <div className="md:col-span-2 flex flex-col gap-3 justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-surface-50 rounded-2xl rounded-tl-sm p-4 border border-surface-200/50 max-w-md"
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-ember-700 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ember-500" />
            {isZh ? "AI 面试官" : "AI Interviewer"}
          </div>
          <p className="text-xs text-surface-400 leading-relaxed">
            {isZh
              ? "“请分享一次你在没有直接职权的情况下，成功推动跨团队业务落地的经历？最终取得了什么成效？”"
              : "“Walk me through a time you influenced a cross-functional team without authority. What was the outcome?”"}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-brand-900 text-white rounded-2xl rounded-tl-sm p-4 ml-8 md:ml-16 max-w-md"
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1.5">
            {isZh ? "候选人回答" : "You"}
          </div>
          <p className="text-xs leading-relaxed">
            {isZh
              ? "“在上一家公司，我需要推动产研和设计重构新用户引导流程。我组织了用户旅程痛点研讨会，用数据对齐共识，并主导了敏捷原型冲刺，最终成功赢得了全员支持...”"
              : "“At my last role, I needed product and design aligned on a new onboarding flow. I set up a working session where we mapped user friction together, then led the prototype sprint that won buy-in...”"}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-surface-50 rounded-2xl rounded-tl-sm p-4 border border-surface-200/50 max-w-md flex items-start gap-3"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-ember-400 to-ember-600 flex items-center justify-center shrink-0 mt-0.5">
            <Star weight="fill" className="w-3 h-3 text-white" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-ember-700 mb-1.5">
              {isZh ? "AI 教练即时反馈" : "Coach Feedback"}
            </div>
            <p className="text-xs text-surface-400 leading-relaxed">
              {isZh
                ? "STAR 框架清晰完整。建议在 Result 部分强化量化指标：激活率具体提升了多少百分比？"
                : "Strong STAR structure. Try quantifying the impact: how did activation move?"}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col justify-center gap-3 md:border-l md:border-surface-200/50 md:pl-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-300 mb-1">
          {isZh ? "您将获得" : "What you get"}
        </div>
        {features.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="flex items-start gap-2.5"
          >
            <div className="w-7 h-7 shrink-0 rounded-lg bg-surface-50 border border-surface-200/50 flex items-center justify-center">
              <ArrowRight weight="bold" className="w-3.5 h-3.5 text-brand-900" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-surface-400">
                {item.label}
              </div>
              <div className="text-[10px] text-surface-300">{item.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
