"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import {
  ArrowRight, Briefcase, CaretRight, CheckCircle, Clock, Copy, FileText,
  GraduationCap, Plus, Star, Sparkle, Target, User, Wrench,
} from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import { TEMPLATE_CONFIGS } from "@/components/resume/templates/config";
import { motion } from "framer-motion";

/* ─── Role-based template grouping — resume.io's "by role" examples ─── */
const TEMPLATE_ROLE: Record<string, { role: string; why: string; color: string }> = {
  "classic-minimal":    { role: "Career switchers",   why: "Universal, recruiter-friendly default.",            color: "from-slate-500/10 to-slate-500/0" },
  "ats-executive":      { role: "Senior leaders",     why: "Executive-grade ATS, clean left rail.",              color: "from-amber-500/10 to-amber-500/0" },
  "premium-headshot":   { role: "Client-facing",      why: "Photo-forward, premium dark sidebar.",               color: "from-rose-500/10 to-rose-500/0" },
  "bold-engineer":      { role: "Engineers",          why: "Bold header, contact badges, tech-feel.",            color: "from-emerald-500/10 to-emerald-500/0" },
  "clean-layout":       { role: "Product managers",   why: "Centered header, clear sections, growth narrative.", color: "from-violet-500/10 to-violet-500/0" },
  "clean-professional": { role: "Finance / consulting", why: "Refined spacing for senior-track roles.",         color: "from-sky-500/10 to-sky-500/0" },
  "elegant-two-column": { role: "Designers / strategists", why: "Playfair header, two-column rhythm.",           color: "from-pink-500/10 to-pink-500/0" },
  "photo-header":       { role: "Designers / portfolio", why: "Banner header, sidebar, story-led.",            color: "from-fuchsia-500/10 to-fuchsia-500/0" },
  "academic":           { role: "Researchers / faculty", why: "Serif, traditional, publications-friendly.",   color: "from-indigo-500/10 to-indigo-500/0" },
};

const OUTCOMES = [
  { n: 1, t: "Get Noticed",   d: "Beat the 6-second scan with recruiter-tested layouts.", icon: CheckCircle },
  { n: 2, t: "Get Hired",     d: "Tailor to a JD in one click. Match keywords, lift your score.", icon: Target },
  { n: 3, t: "Get Paid More", d: "Quantified bullets surface in salary reviews and offers.", icon: Briefcase },
  { n: 4, t: "Get Promoted",  d: "A live document tracks your impact, ready when promo season comes.", icon: ArrowRight },
];

const FAQ = [
  { q: "How does the AI score my resume?",
    a: "We score on three axes: ATS keyword match, recruiter-readability, and quantified impact. Anything below 80 surfaces concrete suggestions you can apply in one click." },
  { q: "Is OfferPath really free?",
    a: "Yes — your first resume is free forever with unlimited PDF and Word exports. Pro adds recruiter-match, auto-apply, and salary analyzer." },
  { q: "Can I tailor to a specific job?",
    a: "Paste a JD link or text and we'll rewrite your bullets to match keywords, lift your score, and surface missing sections — in under a minute." },
  { q: "What if I already have a resume?",
    a: "Upload it as a base. We parse your structure, then re-skin it across all 9 templates in one click." },
];

/* ─── Score ring — the resume.io signature on the hero card ─── */
function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold text-sm" style={{ color }}>{score}</div>
    </div>
  );
}

function ResumePageContent() {
  const searchParams = useSearchParams();
  const tailorForJobId = searchParams.get("tailorFor");

  const { getJobById: getPipelineJob } = usePipelineStore();
  const { getJobById: getDiscoveryJob } = useDiscoveryStore();
  const { resumes, getATSScore, duplicateResume } = useResumeStore();
  const searchQuery = usePipelineStore((s) => s.filters.search);

  const [activeRole, setActiveRole] = useState<string>("All");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const roles = useMemo(() => {
    const r = Array.from(new Set(Object.values(TEMPLATE_ROLE).map((v) => v.role)));
    return ["All", ...r];
  }, []);
  const visibleTemplates = useMemo(() => {
    if (activeRole === "All") return TEMPLATE_CONFIGS;
    return TEMPLATE_CONFIGS.filter((t) => TEMPLATE_ROLE[t.id]?.role === activeRole);
  }, [activeRole]);

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
    duplicateResume(resumeId, `Tailored — ${tailorJob.company?.name || ""} ${tailorJob.title}`.trim());
  };

  return (
    <div className="w-full pb-20">
      {/* ═════════════ HERO — resume.io's outcome-led hero ═════════════ */}
      <section className="mb-12">
        <div className="grid md:grid-cols-[1.05fr_1fr] gap-10 items-center max-w-6xl mx-auto px-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-5">
              <Sparkle weight="fill" className="w-3 h-3" />
              39% more likely to land the job
            </div>
            <h1 className="text-3xl md:text-5xl font-light text-brand-900 font-display tracking-tight leading-[1.05]">
              This resume builder<br />gets you <span className="font-medium text-brand-900">a job offer</span>.
            </h1>
                          <p className="mt-3 text-[13px] md:text-sm font-bold text-emerald-600 uppercase tracking-widest">
                Only 2% of resumes win. Yours will be one of them.
              </p>
              <p className="mt-5 text-surface-500 text-[15px] md:text-base font-medium max-w-md leading-relaxed">
              Every tool you need is here. ATS-aware templates, JD-tailoring AI, score tracking, and unlimited PDF + Word exports.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="#template-gallery"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-md transition-all"
              >
                <Plus weight="bold" className="w-4 h-4" />
                Create my resume
              </Link>
              <Link
                href="/dashboard/resume/new"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-brand-900 bg-white border border-surface-200/50 hover:bg-surface-50 transition-all"
              >
                Upload existing
              </Link>
            </div>

            {/* Trust strip — resume.io's stats row: 92% + Trustpilot + step-by-step */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-surface-400 uppercase tracking-widest">
              <span className="inline-flex items-center gap-1.5 text-emerald-600">
                <CheckCircle weight="fill" className="w-3.5 h-3.5" /> 92% recommend us
              </span>
              <span className="text-surface-300">|</span>
              <span className="inline-flex items-center gap-1.5">
                <Star weight="fill" className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-surface-700">Trustpilot</span>
                <span className="inline-flex items-center gap-0.5">
                  {[0,1,2,3,4].map((i) => <Star key={i} weight="fill" className="w-2.5 h-2.5 text-emerald-500" />)}
                </span>
                <span className="text-surface-700 normal-case tracking-normal">4.2 / 5 · 55,896 reviews</span>
              </span>
              <span className="text-surface-300">|</span>
              <span>Step-by-step guidance</span>
            </div>
          </div>

          {/* Hero preview card — the resume.io signature: score + persona + AI coach pill */}
          <div className="relative">
            <div className="doppel-shell">
              <div className="doppel-core bg-white p-5 relative z-10">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center text-white font-bold text-sm">
                    JL
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-bold text-brand-900">Jordan Lee</div>
                    <div className="text-[10px] text-surface-400 font-semibold uppercase tracking-widest mt-0.5">Senior Product Manager</div>
                  </div>
                  <ScoreRing score={81} size={48} />
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Skills</span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">+ Add skill</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Product strategy", "A/B testing", "SQL", "Roadmapping"].map((s) => (
                      <span key={s} className="px-2 py-1 rounded-md bg-brand-50 border border-brand-200/50 text-[9px] font-bold text-brand-900 uppercase tracking-widest">{s}</span>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-surface-200/50">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                      <Sparkle weight="fill" className="w-2.5 h-2.5" /> ATS Perfect
                    </span>
                  </div>
                </div>

                {/* Floating AI coach pill — anchored bottom-left of the preview, resume.io style */}
                <div className="absolute -bottom-3 left-5 z-20">
                  <button className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-zinc-900 text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all text-[11px] font-semibold">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-[10px] font-bold text-zinc-900">AI</span>
                    Ask AI coach anything...
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome narrative — 4 steps that map to user life outcomes, not wizard steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto px-2 mt-10">
          {OUTCOMES.map(({ n, t, d, icon: Icon }) => (
            <div key={n} className="doppel-shell">
              <div className="doppel-core bg-white p-4 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-brand-900 text-white flex items-center justify-center text-[10px] font-bold">{n}</div>
                  <Icon weight="bold" className="w-4 h-4 text-brand-900" />
                </div>
                <div className="text-[12px] font-bold text-brand-900 uppercase tracking-widest">{t}</div>
                <p className="text-[10px] text-surface-400 font-medium mt-1.5 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═════════════ ACTIVE RESUMES with prominent score rings ═════════════ */}
      {resumes.length > 0 && (
        <section className="max-w-6xl mx-auto px-2 mb-12">
          <div className="flex items-end justify-between mb-5 border-b border-surface-200/50 pb-3">
            <div>
              <h2 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                {tailorJob ? "Deployment Ready Bases" : "Your Career Assets"}
              </h2>
              <p className="text-[12px] text-surface-400/80 mt-1">
                {tailorJob ? "Select a base to deconstruct and re-tailor." : "Each card shows the live ATS score against your last job context."}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white border border-surface-200/50 text-[10px] font-bold text-brand-900">
              {resumes.length} {resumes.length === 1 ? "asset" : "assets"}
            </span>
          </div>

          {filteredResumes.length === 0 ? (
            <div className="doppel-shell p-12 text-center">
              <p className="text-sm font-medium text-surface-400">No resumes matching &ldquo;{searchQuery}&rdquo; found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResumes.map((resume, i) => {
                // Compute or use stored score — resume.io shows this prominently
                const computedScore = (() => {
                  const d = resume.data;
                  let s = 0;
                  if (d.personal?.name) s += 20;
                  if (d.summary && d.summary.length > 100) s += 20;
                  if (d.experience && d.experience.length >= 2) s += 20;
                  if (d.education && d.education.length > 0) s += 20;
                  if (d.skills && d.skills.length >= 3) s += 20;
                  return Math.min(100, s);
                })();
                const atsScore = tailorForJobId ? getATSScore(resume.id, tailorForJobId) : computedScore;
                return (
                  <motion.div key={resume.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="doppel-shell group hover:-translate-y-1 hover:shadow-lg transition-all">
                    <div className="doppel-core p-5 flex flex-col h-full bg-white relative z-10">
                      <div className="flex items-start gap-4 mb-5">
                        <div className={cn(
                          "w-11 h-11 rounded-[0.7rem] border flex items-center justify-center flex-shrink-0 shadow-sm",
                          resume.is_base ? "bg-brand-50 border-brand-200/50" : "bg-surface-50 border-surface-200/50"
                        )}>
                          <FileText weight="light" className={cn("w-5 h-5", resume.is_base ? "text-brand-900" : "text-surface-400")} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <h4 className="text-[14px] font-semibold text-brand-900 truncate tracking-tight">{resume.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn(
                              "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border",
                              resume.is_base ? "bg-brand-50 text-brand-900 border-brand-200/50" : "bg-surface-50 text-surface-400 border-surface-200/50"
                            )}>
                              {resume.is_base ? "Base" : "Tailored"}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-surface-400 uppercase tracking-widest">
                              <Clock weight="light" className="w-3 h-3" />
                              {new Date(resume.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                        {/* Big score ring on the card — the resume.io signature */}
                        <ScoreRing score={atsScore} size={56} />
                      </div>

                      <div className="mt-auto pt-4 border-t border-surface-200/50 flex gap-2.5">
                        {tailorJob ? (
                          <button onClick={() => handleUseAsBase(resume.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-900 text-white hover:bg-brand-800 transition-all">
                            <Copy weight="bold" className="w-3.5 h-3.5" /> Select base
                          </button>
                        ) : (
                          <>
                            <Link href={`/dashboard/resume/${resume.id}`} className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-surface-500 bg-surface-50 border border-surface-200/50 hover:bg-white transition-all">Edit</Link>
                            <Link href={`/dashboard/resume/${resume.id}`} className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-brand-900 hover:bg-brand-800 transition-all shadow-sm">Preview</Link>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═════════════ ROLE-BASED TEMPLATE GALLERY ═════════════ */}
      <section id="template-gallery" className="max-w-6xl mx-auto px-2 scroll-mt-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-5 border-b border-surface-200/50 pb-3">
          <div>
            <h2 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
              {resumes.length === 0 ? "Choose by Role" : "Add Another Asset"}
            </h2>
            <p className="text-[12px] text-surface-400/80 mt-1">
              {resumes.length === 0
                ? "Pick the layout that matches your target role. The editor opens pre-tuned for that archetype."
                : "Each layout is calibrated for a specific role type. Switch any time."}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-white border border-surface-200/50 text-[10px] font-bold text-brand-900">
            {visibleTemplates.length} / {TEMPLATE_CONFIGS.length} layouts
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-6">
          {roles.map((r) => {
            const active = r === activeRole;
            return (
              <button key={r} onClick={() => setActiveRole(r)} className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                active ? "bg-brand-900 text-white shadow-sm" : "bg-white text-surface-400 border border-surface-200/50 hover:border-surface-300 hover:text-brand-900"
              )}>{r}</button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleTemplates.map((tmpl, i) => {
            const r = TEMPLATE_ROLE[tmpl.id];
            return (
              <motion.div key={tmpl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }} className="group">
                <Link href={`/dashboard/resume/new?template=${tmpl.id}`} className="block">
                  <div className={cn("rounded-2xl bg-gradient-to-br p-[1px] hover:shadow-lg transition-all", r?.color || "from-surface-200/50 to-surface-200/0")}>
                    <div className="rounded-2xl bg-white p-4">
                      <div className="mb-3 relative rounded-lg overflow-hidden">
                        <div className="w-full aspect-[816/1056] border border-surface-200/50">
                          <img src={`/images/templates/${tmpl.thumbnail || tmpl.id}.png`} alt={tmpl.name} className="w-full h-full object-cover object-top" loading="lazy" />
                        </div>
                        {tmpl.pro && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-brand-900 text-white shadow-md">
                            <Star weight="fill" className="w-2.5 h-2.5" />
                            <span className="text-[8px] font-bold uppercase tracking-widest">Pro</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-[12px] font-bold text-brand-900 uppercase tracking-widest">{tmpl.name}</h3>
                        {tmpl.tag && !tmpl.pro && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-surface-50 border border-surface-200/50 text-surface-400 font-bold uppercase tracking-widest">{tmpl.tag}</span>
                        )}
                      </div>
                      {r && (
                        <p className="text-[10px] font-semibold text-brand-900 uppercase tracking-widest mt-2">
                          For {r.role}
                        </p>
                      )}
                      <p className="text-[11px] text-surface-400 mt-1 leading-relaxed line-clamp-2">{r?.why || tmpl.desc}</p>
                      <div className="mt-3 pt-3 border-t border-surface-200/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-brand-900 uppercase tracking-widest">Use template</span>
                        <CaretRight weight="light" className="w-4 h-4 text-brand-900 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═════════════ FAQ — resume.io's signature accordion ═════════════ */}
      <section className="max-w-3xl mx-auto px-2 mt-16 mb-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-light font-display text-brand-900 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-[12px] text-surface-400 font-semibold uppercase tracking-widest mt-2">
            Everything you need to know before you start
          </p>
        </div>
        <div className="doppel-shell">
          <div className="doppel-core bg-white relative z-10 divide-y divide-surface-200/50">
            {FAQ.map((item, i) => {
              const open = openFaq === i;
              return (
                <button
                  key={i}
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-surface-50/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-brand-900">{item.q}</div>
                    {open && (
                      <p className="text-[12px] text-surface-500 mt-2 leading-relaxed font-medium">
                        {item.a}
                      </p>
                    )}
                  </div>
                  <CaretRight
                    weight="bold"
                    className={cn("w-4 h-4 text-surface-400 transition-transform flex-shrink-0 mt-0.5", open && "rotate-90 text-brand-900")}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-surface-400 uppercase tracking-widest text-[10px] font-bold animate-pulse">Loading studio...</div>}>
      <ResumePageContent />
    </Suspense>
  );
}
