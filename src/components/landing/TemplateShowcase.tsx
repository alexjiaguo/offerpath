"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkle } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";

export function TemplateShowcase() {
  const { isZh, t } = useTranslation();
  const [selectedId, setSelectedId] = useState(TEMPLATE_CONFIGS[0].id);

  const featured = TEMPLATE_CONFIGS.slice(0, 6);
  const activeTemplate = TEMPLATE_CONFIGS.find((c) => c.id === selectedId) || featured[0];

  return (
    <section id="templates" className="py-24 md:py-32 px-4 bg-white border-t border-surface-200/60">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="eyebrow-tag mb-4">
              <Sparkle weight="light" className="text-ember-600 w-3 h-3" />
              {t.landing.templatesEyebrow || (isZh ? "实战验证排版" : "Proven Formatting")}
            </div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-brand-900 leading-tight">
              {t.landing.templatesTitle || (isZh ? "9 套 ATS 专属简历模板，" : "9 ATS-engineered resume templates,")} <br />
              <span className="font-display font-semibold text-ember-600">
                {t.landing.templatesHighlight || (isZh ? "专为高面试回复率打造。" : "crafted for high callback rates.")}
              </span>
            </h2>
          </div>
          <div>
            <Link
              href="/preview-templates"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ember-600 hover:text-ember-700 transition-colors group"
            >
              <span>{t.landing.templatesViewAll || (isZh ? "浏览全部 9 套模板" : "View All 9 Templates")}</span>
              <ArrowRight weight="bold" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Template selector tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {featured.map((tmpl) => {
            const isActive = tmpl.id === selectedId;
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedId(tmpl.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-brand-900 text-white shadow-sm"
                    : "bg-surface-100/80 text-surface-400 hover:bg-surface-200/80"
                }`}
              >
                <span>{tmpl.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded ${
                    isActive ? "bg-white/20 text-white" : "bg-surface-200 text-surface-300"
                  }`}
                >
                  {tmpl.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active template card preview */}
        <div className="bg-surface-50 border border-surface-200/80 rounded-2xl p-6 md:p-8 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 space-y-4">
            <div className="inline-block px-2.5 py-1 rounded-md bg-ember-100/60 text-ember-700 text-[11px] font-semibold uppercase tracking-wider">
              {activeTemplate.tag}
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-brand-900">
              {activeTemplate.name}
            </h3>
            <p className="text-surface-300 text-sm leading-relaxed">
              {activeTemplate.desc}
            </p>

            <ul className="space-y-2 pt-2 text-xs text-surface-400 font-medium">
              <li className="flex items-center gap-2">
                <Check weight="bold" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{isZh ? "100% 通过主流 ATS 解析器 (Greenhouse, Lever, Workday)" : "100% ATS Parser Compliant (Greenhouse, Lever, Workday)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check weight="bold" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{isZh ? "严苛单页排版算法，告别多余空白与意外换页" : "Strict single-page fitting algorithm without accidental overflow"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check weight="bold" className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{isZh ? "所见即所得双向编辑，一键导出高清 PDF / Word" : "Real-time dual editor with instant PDF and Word export"}</span>
              </li>
            </ul>

            <div className="pt-4 flex items-center gap-3">
              <Link
                href={`/preview-templates#template-${activeTemplate.id}`}
                className="btn-ember text-xs py-2.5 px-5 font-semibold inline-flex items-center gap-2"
              >
                <span>{isZh ? "预览此模板" : "Preview This Template"}</span>
                <ArrowRight weight="bold" className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register"
                className="btn-secondary text-xs py-2.5 px-4 font-medium"
              >
                {isZh ? "立即免费创建" : "Use Free"}
              </Link>
            </div>
          </div>

          <div className="md:col-span-7 flex justify-center">
            <div className="relative w-full max-w-md aspect-[1/1.3] bg-white rounded-xl shadow-md border border-surface-200 overflow-hidden flex flex-col p-6 pointer-events-none select-none">
              {/* Abstract miniature representation of the selected template */}
              <div className="border-b border-surface-100 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <div className="h-4 w-28 bg-brand-900/80 rounded mb-1.5" />
                  <div className="h-2 w-36 bg-ember-600/70 rounded" />
                </div>
                {activeTemplate.tag === "Photo" && (
                  <div className="w-10 h-10 rounded-full bg-surface-200 border border-surface-300" />
                )}
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <div className="h-2.5 w-20 bg-brand-900/40 rounded mb-2" />
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-surface-100 rounded" />
                    <div className="h-2 w-5/6 bg-surface-100 rounded" />
                  </div>
                </div>

                <div>
                  <div className="h-2.5 w-24 bg-brand-900/40 rounded mb-2" />
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="h-2.5 w-32 bg-surface-200 rounded" />
                      <div className="h-2 w-16 bg-surface-100 rounded" />
                    </div>
                    <div className="h-2 w-full bg-surface-100 rounded" />
                    <div className="h-2 w-4/5 bg-surface-100 rounded" />
                  </div>
                </div>

                <div>
                  <div className="h-2.5 w-16 bg-brand-900/40 rounded mb-2" />
                  <div className="flex gap-1.5 flex-wrap">
                    <div className="h-3 w-12 bg-surface-100 rounded" />
                    <div className="h-3 w-16 bg-surface-100 rounded" />
                    <div className="h-3 w-14 bg-surface-100 rounded" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-surface-100 flex items-center justify-between text-[10px] text-surface-300 font-mono">
                <span>ATS COMPLIANT</span>
                <span>SINGLE PAGE · 100% FIT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
