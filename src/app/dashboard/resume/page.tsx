"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import {
  Briefcase, CaretRight, Clock, Copy, FileText, Plus,
  Star, Sparkle, UploadSimple, Check, Trash, Eye, Pen,
  CaretDown, CaretUp, ShieldCheck, DownloadSimple, Lightning, Layout, UserCheck
} from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { ATSScoreInline } from "@/components/pipeline/ATSScoreBadge";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";
import { mockResume } from "@/lib/mockResumeData";
import { motion } from "framer-motion";

/* ─── Persona: a sample render-of-record for each template ─── */
const TEMPLATE_PERSONAS: Record<string, { name: string; role: string; tag: string }> = {
  "classic-minimal":    { name: "Brian T. Wayne",  role: "Business Development Consultant", tag: "First-time / Career switch" },
  "ats-executive":      { name: "Margaret Holloway", role: "VP of Operations",          tag: "Senior leaders" },
  "premium-headshot":   { name: "Camila Rivera",   role: "Senior Sales Manager",            tag: "Client-facing" },
  "bold-engineer":      { name: "Rohan K. Patel",  role: "Project Engineer",                tag: "Engineering" },
  "clean-layout":       { name: "Priya Anand",     role: "Product Manager",                  tag: "Product" },
  "clean-professional": { name: "Daniel Whitford", role: "Finance Director",                 tag: "Senior finance" },
  "elegant-two-column": { name: "Isabella Moreau", role: "Brand Strategist",                 tag: "Creative / agency" },
  "photo-header":       { name: "Theo Nakamura",   role: "UX Designer",                       tag: "Design / portfolio" },
  "academic":           { name: "Dr. Aisha Khan",  role: "Postdoctoral Researcher",           tag: "Academic / research" },
};

/* ─── FlowCV 6-template categories ─── */
const TEMPLATE_FLOWCV_STYLE: Record<string, string> = {
  "classic-minimal":    "Simple",
  "ats-executive":      "Modern",
  "premium-headshot":   "Photo",
  "bold-engineer":      "Modern",
  "clean-layout":       "Simple",
  "clean-professional": "Modern",
  "elegant-two-column": "Creative",
  "photo-header":       "Photo",
  "academic":           "Compact",
};
const FLOWCV_CATEGORIES = ["All", "Simple", "Modern", "Creative", "Photo", "Compact"];

/* ─── FlowCV Free Plan Features ─── */
const FREE_PLAN_FEATURES = [
  {
    icon: Layout,
    title: "50+ Customizable Templates",
    desc: "Fully flexible layout presets designed for maximum readability and ATS compliance.",
  },
  {
    icon: DownloadSimple,
    title: "Unlimited PDF Downloads",
    desc: "Export high-resolution ATS-ready PDF files whenever you update your resume.",
  },
  {
    icon: Lightning,
    title: "AI Content Tailoring",
    desc: "Match your experience bullets against target job descriptions instantly.",
  },
  {
    icon: UploadSimple,
    title: "Import Content",
    desc: "Import existing PDF or JSON resumes to populate your profile in seconds.",
  },
  {
    icon: UserCheck,
    title: "Just You on Your Resume",
    desc: "Clean editorial presentation without third-party logos, watermarks, or branding.",
  },
  {
    icon: ShieldCheck,
    title: "Respect Your Privacy",
    desc: "Your data stays under your control with complete export and delete options.",
  },
];

/* ─── FlowCV Collapsible FAQ Items ─── */
const FAQ_ITEMS = [
  {
    q: "Is FlowCV really free to export PDFs?",
    a: "Yes. Core PDF exports, basic formatting, and custom section layouts are 100% free without hidden fees or forced subscriptions.",
  },
  {
    q: "Can I tailor different resume drafts for specific job descriptions?",
    a: "Absolutely. You can maintain multiple base resumes and duplicate them to tailor specific versions for different job applications.",
  },
  {
    q: "How does the AutoScaled A4 live preview work?",
    a: "The studio continuously calculates your screen dimensions using a dynamic observer to present an accurate A4 page preview without broken page breaks.",
  },
  {
    q: "Are my personal details and resume data stored securely?",
    a: "Yes, all data is stored securely using local browser storage and encrypted cloud synchronization.",
  },
  {
    q: "What formats can I import to get started quickly?",
    a: "You can import existing JSON schemas, plain text documents, or PDF resume files.",
  },
];

function ResumePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tailorForJobId = searchParams.get("tailorFor");

  const { getJobById: getPipelineJob } = usePipelineStore();
  const { getJobById: getDiscoveryJob } = useDiscoveryStore();
  const { resumes, addResume, getATSScore, duplicateResume, deleteResume } = useResumeStore();
  const searchQuery = usePipelineStore((s) => s.filters.search);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const categories = FLOWCV_CATEGORIES;
  
  const visibleTemplates = useMemo(
    () => activeCategory === "All"
      ? TEMPLATE_CONFIGS
      : TEMPLATE_CONFIGS.filter((t) => TEMPLATE_FLOWCV_STYLE[t.id] === activeCategory),
    [activeCategory]
  );

  const filteredResumes = resumes.filter(
    (r) => !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.data.personal?.name && r.data.personal.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pipelineJob = tailorForJobId ? getPipelineJob(tailorForJobId) : null;
  const discoveryJob = tailorForJobId ? getDiscoveryJob(tailorForJobId) : null;
  const tailorJob = pipelineJob
    ? { ...pipelineJob, source: "pipeline" as const }
    : discoveryJob
    ? { ...discoveryJob, company: { name: discoveryJob.company_name || "" }, source: "discovery" as const }
    : null;

  const handleUseAsBase = (resumeId: string) => {
    if (!tailorForJobId || !tailorJob) return;
    const copiedId = duplicateResume(resumeId, `Tailored — ${tailorJob.company?.name || ""} ${tailorJob.title}`.trim());
    if (copiedId) {
      router.push(`/dashboard/resume/${copiedId}`);
    }
  };

  const handleSelectTemplate = (tmplId: string, tmplName: string) => {
    const newId = addResume({
      title: `${tmplName} Resume`,
      template: tmplId,
      theme: mockResume.theme,
      data: mockResume.data,
      section_order: mockResume.section_order,
      section_visibility: {},
      is_base: !tailorForJobId,
    });
    router.push(`/dashboard/resume/${newId}`);
  };

  return (
    <div className="w-full pb-24 pt-2 max-w-6xl mx-auto px-2 sm:px-4">
      {/* ═════════════ STUDIO HEADER & TAILORING ALERT ═════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-surface-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-normal font-display text-brand-900 tracking-tight">
              Resume Studio
            </h1>
            <span className="eyebrow-tag">
              FlowCV Engine
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-surface-400 mt-1 font-normal">
            Select an existing draft to edit, or start building with a responsive modular layout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/resume/new"
            className="btn-editorial-secondary inline-flex items-center gap-2"
          >
            <UploadSimple weight="light" className="w-4 h-4" />
            Import File
          </Link>
        </div>
      </div>

      {tailorJob && (
        <div className="mb-8 p-4 rounded-md bg-brand-900 text-white flex items-center justify-between gap-4 border border-brand-900 shadow-none">
          <div className="flex items-center gap-3">
            <Sparkle weight="fill" className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-surface-300">Tailoring Active</div>
              <div className="text-xs sm:text-sm font-medium mt-0.5">
                Targeting: {tailorJob.title} at {tailorJob.company?.name}
              </div>
            </div>
          </div>
          <Link
            href="/dashboard/resume"
            className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-mono font-medium text-white transition-colors"
          >
            Cancel Tailoring
          </Link>
        </div>
      )}

      {/* ═════════════ SECTION 1: MY RESUME DRAFTS ═════════════ */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4 border-b border-surface-200 pb-2.5">
          <div>
            <h2 className="text-xs font-mono font-semibold text-brand-900 uppercase tracking-widest">
              {tailorJob ? "Select a Base to Tailor" : "My Resumes"}
            </h2>
            <p className="text-[12px] text-surface-400 mt-0.5">
              {tailorJob ? "Pick one of your existing resumes to duplicate and customize for this job." : "Click Open Editor to jump into the real-time modular editor."}
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-sm border border-surface-200 bg-surface-100 text-[10px] font-mono font-medium text-surface-400">
            {resumes.length} {resumes.length === 1 ? "draft" : "drafts"}
          </span>
        </div>

        {filteredResumes.length === 0 ? (
          <div className="rounded-md border border-dashed border-surface-200 p-8 text-center bg-surface-50">
            <FileText weight="light" className="w-7 h-7 text-surface-300 mx-auto mb-2" />
            <h3 className="text-xs font-semibold text-brand-900">No resume drafts</h3>
            <p className="text-xs text-surface-400 max-w-sm mx-auto mt-1 mb-4">
              Your studio is empty. Select any layout below to launch immediately into the live modular editor.
            </p>
            <a
              href="#template-gallery"
              className="btn-editorial-primary inline-flex items-center gap-2"
            >
              Browse Layouts
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResumes.map((resume, i) => {
              const atsScore = tailorForJobId ? getATSScore(resume.id, tailorForJobId) : null;
              return (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-md border border-surface-200 bg-surface-0 p-4 flex flex-col h-full hover:border-surface-300 transition-colors group relative shadow-none"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-md border flex items-center justify-center flex-shrink-0",
                      resume.is_base ? "bg-surface-100 border-surface-200" : "bg-surface-50 border-surface-200"
                    )}>
                      <FileText weight="light" className={cn("w-4 h-4", resume.is_base ? "text-brand-900" : "text-surface-400")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-brand-900 truncate tracking-tight">{resume.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={resume.is_base ? "tag-blue" : "tag-green"}>
                          {resume.is_base ? "Base" : "Tailored"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-surface-400 font-mono">
                          <Clock weight="light" className="w-3 h-3" />
                          {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Delete this resume draft?")) {
                          deleteResume(resume.id);
                        }
                      }}
                      title="Delete resume"
                      className="text-surface-300 hover:text-rose-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash weight="light" className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {atsScore !== null && (
                    <div className="mb-3 border-t border-surface-200 pt-2.5">
                      <ATSScoreInline score={atsScore} />
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto pt-3 border-t border-surface-200">
                    {tailorJob ? (
                      <button
                        onClick={() => handleUseAsBase(resume.id)}
                        className="btn-editorial-primary flex-1 flex items-center justify-center gap-1.5"
                      >
                        <Copy weight="bold" className="w-3.5 h-3.5" />
                        Select & Tailor
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/dashboard/resume/${resume.id}`}
                          className="btn-editorial-primary flex-1 flex items-center justify-center gap-1.5"
                        >
                          <Pen weight="bold" className="w-3.5 h-3.5" />
                          Open Editor
                        </Link>
                        <button
                          onClick={() => duplicateResume(resume.id, `${resume.title} (Copy)`)}
                          className="btn-editorial-secondary p-2"
                          title="Duplicate Resume"
                        >
                          <Copy weight="bold" className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═════════════ SECTION 2: TEMPLATE GALLERY (1-CLICK BUILD) ═════════════ */}
      <section id="template-gallery" className="scroll-mt-8 mb-12">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4 border-b border-surface-200 pb-2.5">
          <div>
            <h2 className="text-xs font-mono font-semibold text-brand-900 uppercase tracking-widest">
              FlowCV Category Gallery
            </h2>
            <p className="text-[12px] text-surface-400 mt-0.5">
              Click any layout card below to instantly start building a new resume with full live modular editing.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-sm border border-surface-200 bg-surface-100 text-[10px] font-mono font-medium text-surface-400">
            {visibleTemplates.length} layouts
          </span>
        </div>

        {/* 6 Category Gallery Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {categories.map((cat) => {
            const active = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-mono font-medium uppercase tracking-wider border transition-all",
                  active
                    ? "bg-brand-900 text-surface-0 border-brand-900"
                    : "bg-surface-0 text-surface-400 border-surface-200 hover:bg-surface-100 hover:text-brand-900"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {visibleTemplates.map((tmpl, i) => {
            const persona = TEMPLATE_PERSONAS[tmpl.id];
            const flowCategory = TEMPLATE_FLOWCV_STYLE[tmpl.id];
            return (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                className="group cursor-pointer rounded-md border border-surface-200 bg-surface-0 p-3 hover:border-surface-300 transition-colors shadow-none flex flex-col justify-between"
                onClick={() => handleSelectTemplate(tmpl.id, tmpl.name)}
              >
                <div>
                  <div className="mb-3 relative rounded-md border border-surface-200 overflow-hidden bg-surface-50 aspect-[816/1056]">
                    {tmpl.pro && (
                      <div className="absolute top-2.5 right-2.5 z-20">
                        <span className="tag-red flex items-center gap-1">
                          <Star weight="fill" className="w-2.5 h-2.5" />
                          Pro
                        </span>
                      </div>
                    )}
                    <img
                      src={`/images/templates/${tmpl.thumbnail || tmpl.id}.png`}
                      alt={`${tmpl.name} preview`}
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.01]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity btn-editorial-primary flex items-center gap-1.5">
                        <Plus weight="bold" className="w-3.5 h-3.5" />
                        Use Layout
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold text-brand-900 tracking-tight">{tmpl.name}</h3>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-surface-100 border border-surface-200 text-surface-400 font-mono uppercase tracking-wider">
                        {flowCategory || "Simple"}
                      </span>
                    </div>
                    {persona && (
                      <p className="text-[11px] font-medium text-surface-400 mt-1">
                        <span className="text-brand-900">{persona.name}</span> · {persona.role}
                      </p>
                    )}
                    <p className="text-[11px] text-surface-400 mt-1 leading-relaxed line-clamp-2">{tmpl.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═════════════ SECTION 3: FLOWCV FREE PLAN FEATURE GRID ═════════════ */}
      <section className="mb-12">
        <div className="mb-4 pb-2.5 border-b border-surface-200">
          <h2 className="text-xs font-mono font-semibold text-brand-900 uppercase tracking-widest">
            What's Included in FlowCV's Free Plan
          </h2>
          <p className="text-[12px] text-surface-400 mt-0.5">
            All essential modular resume building tools available with no paywalls or watermarks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {FREE_PLAN_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="rounded-md border border-surface-200 bg-surface-0 p-4 shadow-none hover:border-surface-300 transition-colors">
                <div className="w-7 h-7 rounded-md bg-surface-100 border border-surface-200 flex items-center justify-center mb-3 text-brand-900">
                  <Icon weight="light" className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-brand-900">{feat.title}</h3>
                <p className="text-[11px] text-surface-400 mt-1 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═════════════ SECTION 4: FREQUENTLY ASKED QUESTIONS (ACCORDION) ═════════════ */}
      <section>
        <div className="mb-4 pb-2.5 border-b border-surface-200">
          <h2 className="text-xs font-mono font-semibold text-brand-900 uppercase tracking-widest">
            Frequently Asked Questions
          </h2>
          <p className="text-[12px] text-surface-400 mt-0.5">
            Common questions about the FlowCV modular engine and studio features.
          </p>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={item.q}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="rounded-md border border-surface-200 bg-surface-0 p-4 transition-colors cursor-pointer hover:border-surface-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-brand-900">{item.q}</span>
                  {isOpen ? (
                    <CaretUp weight="light" className="w-4 h-4 text-surface-400 flex-shrink-0" />
                  ) : (
                    <CaretDown weight="light" className="w-4 h-4 text-surface-400 flex-shrink-0" />
                  )}
                </div>
                {isOpen && (
                  <p className="text-xs text-surface-400 mt-2.5 pt-2.5 border-t border-surface-200 leading-relaxed font-sans">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-surface-500 tracking-wider text-xs font-medium animate-pulse">Loading studio...</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
