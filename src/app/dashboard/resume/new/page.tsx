"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, WarningCircle, FileText, Sparkle, SquaresFour, UploadSimple, ListChecks, EnvelopeSimple } from '@phosphor-icons/react';
import Link from "next/link";
import { toast } from "sonner";
import { useResumeStore } from "@/store/resumeStore";
import { FileParserService } from "@/lib/FileParserService";
import { ResumeParserService } from "@/lib/ResumeParserService";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Sample data per persona — the flowcv "Brian T. Wayne" hook ───
   When a user lands on /new?template=X, the matching persona's pre-filled
   resume data is offered so they can hit the ground running instead of staring at
   a blank page. Mirrors the flowcv.com experience where each template has a
   canonical real-world sample render. */
const PERSONA_SAMPLE: Record<string, {
  name: string; role: string; email: string; phone: string; location: string;
  summary: string; experience: Array<{ company: string; title: string; location: string; start_date: string; end_date: string; current: boolean; bullets: string[] }>;
  education: Array<{ school: string; degree: string; field: string; start_date: string; end_date: string; gpa?: string }>;
  skills: string[];
}> = {
  "classic-minimal": {
    name: "Brian T. Wayne", role: "Business Development Consultant", email: "brian.wayne@example.com", phone: "+1 415 555 0142", location: "San Francisco, CA",
    summary: "Business Development Consultant with 7+ years driving revenue growth for early-stage SaaS companies. Specialized in cross-functional team leadership, partner enablement, and quantified pipeline generation.",
    experience: [
      { company: "Northwind Dynamics", title: "Senior Business Development Consultant", location: "San Francisco, CA", start_date: "2021-03", end_date: "", current: true,
        bullets: [
          "Built and managed a 12-person cross-functional pod that closed $4.2M in new ARR across 38 enterprise accounts in 12 months.",
          "Designed partner enablement curriculum that lifted channel-sourced revenue 38% YoY.",
          "Coached 6 junior BDRs to promotion; team NPS rose from 32 to 71 in 9 months.",
        ] },
      { company: "Aperture Labs", title: "Business Development Manager", location: "San Francisco, CA", start_date: "2018-06", end_date: "2021-02", current: false,
        bullets: [
          "Owned outbound motion for the West Coast; sourced 240+ SQLs per quarter, 18% close rate.",
          "Built reporting dashboards in Looker that exposed $1.1M of pipeline risk to leadership.",
        ] },
    ],
    education: [
      { school: "UC Berkeley, Haas School of Business", degree: "MBA", field: "Marketing & Entrepreneurship", start_date: "2014", end_date: "2016", gpa: "3.8" },
    ],
    skills: ["Enterprise sales", "Pipeline forecasting", "Salesforce + HubSpot", "Looker", "Cross-functional leadership", "Channel partner enablement"],
  },
  "premium-headshot": {
    name: "Camila Rivera", role: "Senior Sales Manager", email: "camila.rivera@example.com", phone: "+1 305 555 0193", location: "Miami, FL",
    summary: "Senior Sales Manager with 9 years of enterprise SaaS experience. Track record of building high-performing LATAM-aligned sales teams and growing accounts from $50K to $2M+ ARR.",
    experience: [
      { company: "Cobalt Industries", title: "Senior Sales Manager — LATAM", location: "Miami, FL", start_date: "2020-08", end_date: "", current: true,
        bullets: [
          "Lead 8-person LATAM sales pod; overdelivered on quota by 142% in FY23 ($8.4M vs $5.9M target).",
          "Closed largest single deal in company history: $1.6M 3-year enterprise agreement with MercadoLibre.",
          "Built Spanish-language enablement library; ramp time for new AEs fell from 12 weeks to 6.",
        ] },
    ],
    education: [
      { school: "Universidad de los Andes", degree: "BBA", field: "International Business", start_date: "2012", end_date: "2016" },
    ],
    skills: ["Enterprise SaaS sales", "LATAM market expansion", "Salesforce", "Outreach + Salesloft", "Negotiation", "Bilingual EN/ES"],
  },
  "clean-layout": {
    name: "Priya Anand", role: "Senior Product Manager", email: "priya.anand@example.com", phone: "+1 650 555 0287", location: "Mountain View, CA",
    summary: "Senior Product Manager with 8+ years driving B2B SaaS and developer-tooling products from 0→1 to scale. Track record of unblocking engineering velocity through ruthless prioritization, customer research depth, and tight feedback loops with sales and design.",
    experience: [
      { company: "Lattice Analytics", title: "Senior Product Manager — Platform", location: "Mountain View, CA", start_date: "2021-09", end_date: "", current: true,
        bullets: [
          "Led 0→1 launch of Lattice Insights (usage-based pricing tier); reached \.4M ARR in 9 months against \.5M target.",
          "Cut average query p95 latency from 4.1s to 1.3s by re-architecting the metrics pipeline with the platform team.",
          "Ran a 24-customer discovery round that re-scoped the v2 roadmap; net retention rose 11pts in 2 quarters.",
        ] },
      { company: "Plural Insights", title: "Product Manager — Growth", location: "Remote", start_date: "2018-04", end_date: "2021-08", current: false,
        bullets: [
          "Owned activation funnel; improved D7 retention 18% by replacing the onboarding wizard with a 3-step guided setup.",
          "Shipped 14 A/B tests in 6 months, statistically significant on 9; cumulative lift to free→paid conversion: +24%.",
        ] },
    ],
    education: [
      { school: "Carnegie Mellon University", degree: "M.S.", field: "Information Systems", start_date: "2014", end_date: "2016" },
      { school: "BITS Pilani", degree: "B.E.", field: "Computer Science", start_date: "2010", end_date: "2014" },
    ],
    skills: ["0→1 product strategy", "User research & JTBD", "Product analytics (Mixpanel, Amplitude)", "SQL", "Pricing & packaging", "Cross-functional leadership"],
  },
  "bold-engineer": {
    name: "Rohan K. Patel", role: "Project Engineer", email: "rohan.patel@example.com", phone: "+1 408 555 0210", location: "San Jose, CA",
    summary: "Project Engineer with 6+ years in hardware and embedded systems. Strong in cross-functional collaboration with manufacturing, firmware, and design teams.",
    experience: [
      { company: "Quantum Devices", title: "Project Engineer", location: "San Jose, CA", start_date: "2020-01", end_date: "", current: true,
        bullets: [
          "Led PCB bring-up on 3 product lines, reducing time-to-prototype by 38%.",
          "Owned DFM handoff to contract manufacturer; first-pass yield rose from 78% to 94%.",
          "Wrote internal tooling in Python that cut weekly QA reporting from 4 hours to 18 minutes.",
        ] },
    ],
    education: [
      { school: "University of Michigan", degree: "B.S.", field: "Electrical & Computer Engineering", start_date: "2014", end_date: "2018" },
    ],
    skills: ["Altium Designer", "Embedded C", "Python", "JTAG debugging", "Signal integrity", "I2C / SPI / UART"],
  },
};

function getPersonaForTemplate(templateId: string) {
  return PERSONA_SAMPLE[templateId] || null;
}

function NewResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "classic-minimal";

  const { addResume } = useResumeStore();

  const [mode, setMode] = useState<"choice" | "upload" | "browse" | "parsing">("choice");
  // Resume vs CV — flowcv's signature distinction. CVs are longer, more academic,
  // and include a publications / research / coursework section. Resumes are 1-2 pages,
  // bullet-heavy, and aimed at industry roles.
  const [format, setFormat] = useState<"resume" | "cv">("resume");
  const [levelFilter, setLevelFilter] = useState<"All" | "Senior" | "Mid" | "Lead">("All");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persona = getPersonaForTemplate(templateId);
  // flowcv "find a persona at your level" affordance. Seniority + industry
  // are the two filters a job-seeker uses first; both are inferred from the
  // role itself so we don't have to keep a separate metadata table.
  const TEMPLATE_PERSONAS: Record<string, { name: string; role: string; level: "Senior" | "Mid" | "Entry" | "Lead"; industry: string }> = {
    "classic-minimal":    { name: "Brian T. Wayne",  role: "Business Development Consultant", level: "Senior", industry: "SaaS" },
    "ats-executive":      { name: "Margaret Holloway", role: "VP of Operations",              level: "Lead",   industry: "Operations" },
    "premium-headshot":   { name: "Camila Rivera",   role: "Senior Sales Manager",            level: "Senior", industry: "Enterprise Sales" },
    "bold-engineer":      { name: "Rohan K. Patel",  role: "Project Engineer",                level: "Mid",    industry: "Hardware" },
    "clean-layout":       { name: "Priya Anand",     role: "Product Manager",                 level: "Senior", industry: "Product" },
    "clean-professional": { name: "Daniel Whitford", role: "Finance Director",                level: "Lead",   industry: "Finance" },
    "elegant-two-column": { name: "Isabella Moreau", role: "Brand Strategist",                level: "Mid",    industry: "Marketing" },
    "photo-header":       { name: "Theo Nakamura",   role: "UX Designer",                     level: "Mid",    industry: "Design" },
    "academic":           { name: "Dr. Aisha Khan",  role: "Postdoctoral Researcher",         level: "Senior", industry: "Academia" },
  };
  const personaMeta = TEMPLATE_PERSONAS[templateId];

  const handleBrowsePersona = (tid: string) => {
    const p = PERSONA_SAMPLE[tid];
    if (!p) { toast.error("That persona doesn't have a full sample yet — try Brian, Camila, or Rohan."); return; }
    const id = addResume({
      title: `${p.name} — Sample`,
      template: tid,
      data: {
        personal: { name: p.name, email: p.email, phone: p.phone, location: p.location },
        summary: p.summary,
        experience: p.experience as any,
        education: p.education.map((e) => ({ institution: (e as any).school || (e as any).institution, degree: e.degree, field: e.field, start_date: e.start_date, end_date: e.end_date, gpa: e.gpa })),
        skills: p.skills.map((name, i) => ({ id: `s${i}`, name, isHighlighted: i < 2 })),
      },
      theme: { primaryColor: "#2c3e50", accentColor: "#7f8c8d", backgroundColor: "#ffffff", textColor: "#1a1a2e", fontFamily: "'Inter', sans-serif", baseFontSize: 11, headerFontSize: 24, sectionTitleSize: 11, companyFontSize: 11, lineHeight: 1.4, pagePadding: 30, sectionSpacing: 12, itemSpacing: 6 },
      section_order: ["summary","experience","education","technicalSkills","skills","languages","certifications","projects"],
      section_visibility: {},
      is_base: true,
    });
    router.push(`/dashboard/resume/${id}`);
  };

  const handleStartFromPersona = () => {
    if (!persona) { handleCreateEmpty(); return; }
    const id = addResume({
      title: `${persona.name} — Sample`,
      template: templateId,
      data: {
        personal: { name: persona.name, email: persona.email, phone: persona.phone, location: persona.location },
        summary: persona.summary,
        experience: persona.experience as any,
        education: persona.education.map((e) => ({ institution: (e as any).school || (e as any).institution, degree: e.degree, field: e.field, start_date: e.start_date, end_date: e.end_date, gpa: e.gpa })),
        skills: persona.skills.map((name, i) => ({ id: `s${i}`, name, isHighlighted: i < 2 })),
      },
      theme: { primaryColor: "#2c3e50", accentColor: "#7f8c8d", backgroundColor: "#ffffff", textColor: "#1a1a2e", fontFamily: "'Inter', sans-serif", baseFontSize: 11, headerFontSize: 24, sectionTitleSize: 11, companyFontSize: 11, lineHeight: 1.4, pagePadding: 30, sectionSpacing: 12, itemSpacing: 6 },
      section_order: ["summary","experience","education","technicalSkills","skills","languages","certifications","projects"],
      section_visibility: {},
      is_base: true,
    });
    router.push(`/dashboard/resume/${id}`);
  };

  const handleCreateEmpty = () => {
    const id = addResume({
      title: "New Resume",
      template: templateId,
      data: {
        personal: { name: "" },
        experience: [],
        education: [],
        skills: [],
      },
      theme: { 
        primaryColor: "#2c3e50", 
        accentColor: "#7f8c8d", 
        backgroundColor: "#ffffff", 
        textColor: "#1a1a2e", 
        fontFamily: "'Inter', sans-serif", 
        baseFontSize: 11, 
        headerFontSize: 24, 
        sectionTitleSize: 11, 
        companyFontSize: 11, 
        lineHeight: 1.4, 
        pagePadding: 30, 
        sectionSpacing: 12, 
        itemSpacing: 6 
      },
      section_order: [
        "summary", "experience", "education", "technicalSkills", "skills", "languages", "certifications", "projects"
      ],
      section_visibility: {},
      is_base: true,
    });
    router.push(`/dashboard/resume/${id}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setMode("parsing");
    setLoading(true);
    setError(null);

    try {
      const text = await FileParserService.parseFile(selectedFile);
      const extension = selectedFile.name.split(".").pop() || "txt";
      const parsedData = ResumeParserService.parse(text, extension);

      const id = addResume({
        title: selectedFile.name.replace(/\.[^/.]+$/, ""),
        template: templateId,
        data: parsedData,
        theme: { 
          primaryColor: "#2c3e50", 
          accentColor: "#7f8c8d", 
          backgroundColor: "#ffffff", 
          textColor: "#1a1a2e", 
          fontFamily: "'Inter', sans-serif", 
          baseFontSize: 11, 
          headerFontSize: 24, 
          sectionTitleSize: 11, 
          companyFontSize: 11, 
          lineHeight: 1.4, 
          pagePadding: 30, 
          sectionSpacing: 12, 
          itemSpacing: 6 
        },
        section_order: [
          "summary", "experience", "education", "technicalSkills", "skills", "languages", "certifications", "projects"
        ],
        section_visibility: {},
        is_base: true,
      });

      setTimeout(() => {
        router.push(`/dashboard/resume/${id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parsing failed.");
      setLoading(false);
      setMode("upload");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <Link
        href="/dashboard/resume"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Studio
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white font-display tracking-tight">Create New {format === "cv" ? "CV" : "Resume"}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Choose how you would like to start building your {format === "cv" ? "curriculum vitae" : "resume"}.
          </p>
          {/* flowcv signature affordance: explicit Resume / CV toggle with a one-line
              explanation of the difference. Most other builders conflate the two;
              flowcv positions itself as supporting both formats natively. */}
          <div className="mt-4 inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
            <button
              onClick={() => setFormat("resume")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                format === "resume" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              Resume
            </button>
            <button
              onClick={() => setFormat("cv")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                format === "cv" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              )}
            >
              CV
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 max-w-xl">
            {format === "resume"
              ? "1–2 pages. Bullet-heavy. Industry roles. The default for most job applications in the US."
              : "Multi-page. Includes publications, research, coursework, and a longer academic history. Common in academia, research, and some international markets."}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap pt-1">
          <div className="flex -space-x-2">
            {[ { i: "BT", bg: "from-amber-200 to-amber-400" }, { i: "CR", bg: "from-rose-200 to-rose-400" }, { i: "RP", bg: "from-sky-200 to-sky-400" }, { i: "MA", bg: "from-emerald-200 to-emerald-400" }, { i: "DW", bg: "from-violet-200 to-violet-400" } ].map((a, i) => (
              <div key={i} className={cn("w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white", a.bg)}>{a.i}</div>
            ))}
          </div>
          <p className="text-xs text-zinc-500">Real resumes, real people — used by PMs, engineers, operators, and founders worldwide.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[ { icon: FileText, label: "Tested resume templates", note: "Reviewed by recruiters" }, { icon: ListChecks, label: "Step-by-step guidance", note: "Inline tips per section" }, { icon: Sparkle, label: "AI writes for you", note: "Bullet & summary drafts" }, { icon: EnvelopeSimple, label: "Instant cover letters", note: "Pair with any resume" } ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-2xl border border-zinc-200 dark:border-white/[0.05] bg-white/40 dark:bg-white/[0.02]">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-4 h-4 text-brand-500" weight="duotone" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-zinc-900 dark:text-white leading-tight">{f.label}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{f.note}</p>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <button
                onClick={() => setMode("upload")}
                className="liquid-glass rounded-[32px] p-8 text-left border border-zinc-200 dark:border-white/[0.05] hover:border-brand-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <UploadSimple className="w-7 h-7 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-display mb-2">Import Existing Resume</h3>
                <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed mb-8">
                  Upload your current PDF or DOCX resume. Our parser will automatically extract your information into the editor.
                </p>
                <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest mt-auto">
                  Upload File <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={handleCreateEmpty}
                className="liquid-glass rounded-[32px] p-8 text-left border border-zinc-200 dark:border-white/[0.05] hover:bg-zinc-100 dark:hover:border-white/10 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-7 h-7 text-zinc-700 dark:text-zinc-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-display mb-2">Start from Scratch</h3>
                <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed mb-8">
                  Begin with a blank template and fill in your details manually. Best for total career pivots.
                </p>
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mt-auto">
                  Create Empty <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {persona && personaMeta && (
                <button
                  onClick={handleStartFromPersona}
                  className="liquid-glass rounded-[32px] p-8 text-left border-2 border-brand-500/30 hover:border-brand-500/50 transition-all group relative overflow-hidden"
                >
                  <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-brand-500 text-white text-[9px] font-bold uppercase tracking-widest">
                    Flowcv signature
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-white font-bold text-sm">
                      {persona.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-display mb-2">Start from {persona.name.split(' ')[0]}'s sample</h3>
                  <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed mb-8">
                    Pre-filled with {personaMeta.role} experience, education, and skills. Edit anything.
                  </p>
                  <div className="flex items-center gap-2 text-brand-500 text-xs font-bold uppercase tracking-widest mt-auto">
                    Use sample <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              )}

              <button
                onClick={() => setMode("browse")}
                className="liquid-glass rounded-[32px] p-8 text-left border border-zinc-200 dark:border-white/[0.05] hover:border-indigo-500/30 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <SquaresFour weight="duotone" className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-display mb-2">Browse all 9 samples</h3>
                <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed mb-8">
                  See every persona in our library. {Object.keys(PERSONA_SAMPLE).length} are fully filled today; the rest are coming this quarter.
                </p>
                <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-widest mt-auto">
                  See gallery <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          )}

          {mode === "browse" && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <button onClick={() => setMode("choice")} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-indigo-600 transition-all mb-2">
                  ← Back to options
                </button>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display tracking-tight">9 sample personas</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">{Object.keys(PERSONA_SAMPLE).length} are fully filled today. The rest are coming — but you can already see what each role looks like.</p>
              </div>
              {/* Career-level filter chips — narrows the 9-persona grid by seniority so users
                  can scan for a persona at their career stage. Click a chip to filter. */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filter by level</span>
                {(["All", "Senior", "Mid", "Lead"] as const).map((lvl) => {
                  const count = lvl === "All"
                    ? Object.keys(TEMPLATE_PERSONAS).length
                    : Object.values(TEMPLATE_PERSONAS).filter((m) => m.level === lvl).length;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setLevelFilter(lvl)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                        levelFilter === lvl
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white dark:bg-white/[0.04] border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-indigo-300"
                      )}
                    >
                      {lvl}
                      <span className={cn(
                        "text-[9px] px-1 py-0.5 rounded",
                        levelFilter === lvl ? "bg-white/20" : "bg-zinc-100 dark:bg-white/10"
                      )}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(TEMPLATE_PERSONAS)
                  .filter(([_, meta]) => levelFilter === "All" || meta.level === levelFilter)
                  .map(([tid, meta]) => {
                  const hasData = Boolean(PERSONA_SAMPLE[tid]);
                  return (
                    <button
                      key={tid}
                      onClick={() => hasData ? handleBrowsePersona(tid) : toast.info(`${meta.name} sample data is coming soon — try Brian, Camila, Rohan, or Priya for now.`)}
                      className={cn(
                        "liquid-glass rounded-2xl p-5 text-left border transition-all group relative",
                        hasData
                          ? "border-zinc-200 dark:border-white/[0.05] hover:border-indigo-500/40"
                          : "border-zinc-200/40 dark:border-white/[0.02] opacity-60 cursor-not-allowed"
                      )}
                      disabled={!hasData}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold",
                          hasData ? "bg-gradient-to-br from-indigo-500/30 to-blue-500/30 text-indigo-300" : "bg-zinc-200/40 dark:bg-white/5 text-zinc-500"
                        )}>
                          {meta.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        {hasData ? (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">Ready</span>
                        ) : (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Coming soon</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{meta.name}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{meta.role}</p>
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border",
                          hasData
                            ? "border-indigo-500/30 text-indigo-600 bg-indigo-500/5"
                            : "border-zinc-200 dark:border-white/10 text-zinc-500 bg-white/40"
                        )}>
                          {meta.level}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-white/10 text-zinc-500 bg-white/40">
                          {meta.industry}
                        </span>
                      </div>
                      <p className="text-[9px] font-mono text-zinc-400 mt-2">{tid}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {mode === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="liquid-glass rounded-[40px] p-12 border-2 border-dashed border-zinc-200 dark:border-white/10 text-center relative group"
            >
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="relative z-0">
                <div className="w-20 h-20 rounded-[24px] bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-700">
                  <UploadSimple className="w-10 h-10 text-brand-400" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display mb-3">Upload Your Resume</h2>
                <p className="text-zinc-600 dark:text-zinc-500 max-w-sm mx-auto mb-8">
                  Drop your file here or click to browse. Supports PDF, DOCX, MD, and TXT.
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                  <span>Secure Parsing</span>
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span>Private & Local</span>
                </div>
              </div>
              
              {error && (
                <div className="mt-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-left">
                  <WarningCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-300 font-medium">{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {mode === "parsing" && (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="liquid-glass rounded-[40px] p-16 text-center"
            >
              <div className="relative w-24 h-24 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin" />
                <div className="absolute inset-4 rounded-full border-4 border-purple-500/10 border-b-purple-500 animate-spin-slow" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkle className="w-8 h-8 text-brand-400 animate-pulse" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-display mb-3">Parsing Resume...</h2>
              <p className="text-zinc-600 dark:text-zinc-500 max-w-xs mx-auto mb-10">
                Extracting information from {file?.name}. Identifying experience, education, and skills.
              </p>
              
              <div className="space-y-3 max-w-xs mx-auto">
                {[
                  { label: "Reading Document Content", done: true },
                  { label: "Identifying Sections", done: loading },
                  { label: "Formatting Experience", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                    {step.done ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400"  weight="fill" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-800" />
                    )}
                    <span className={cn(step.done ? "text-zinc-300" : "text-zinc-600")}>{step.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NewResumePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-500 uppercase tracking-widest text-xs font-bold">Syncing...</div>}>
      <NewResumeContent />
    </Suspense>
  );
}
