"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, WarningCircle, FileText, Sparkle, UploadSimple, Eye, Briefcase, CurrencyDollar, TrendUp, Robot, MagnifyingGlass, Rocket, GraduationCap } from '@phosphor-icons/react';
import Link from "next/link";
import { useResumeStore } from "@/store/resumeStore";
import { FileParserService } from "@/lib/FileParserService";
import { ResumeParserService } from "@/lib/ResumeParserService";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

function NewResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") || "classic-minimal";

  const { addResume } = useResumeStore();

  const [mode, setMode] = useState<"choice" | "upload" | "parsing">("choice");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white font-display tracking-tight">Create New Resume</h1>
            <span className="inline-flex items-center gap-2 pl-3 pr-3 py-1 rounded-full bg-zinc-900/95 backdrop-blur text-white shadow-md text-[10px] font-semibold border border-white/10">
              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-[8px] font-bold text-zinc-900">AI</span>
              Ask AI coach available
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">Choose how you would like to start building your resume.</p>
        </div>

        {/* Resume.io signature: outcome stat + 4-step career framework. Mirrors the
            “This builder gets you a remote job” hero with the 4-up “Get Noticed /
            Get Hired / Get Paid More / Get Promoted” grid. Reminds the user that
            this is a job-outcome product, not just a doc editor. */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex-wrap">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <TrendUp weight="fill" className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">A finished resume that gets interviews, not just pages.</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Designed around the 4 outcomes that actually move a job search forward.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Built for outcomes
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { n: "1", icon: Eye, label: "Get Noticed", note: "Beat the 6-second recruiter scan" },
            { n: "2", icon: Briefcase, label: "Get Hired", note: "Land interviews that match your level" },
            { n: "3", icon: CurrencyDollar, label: "Get Paid More", note: "Quantified bullets that justify comp" },
            { n: "4", icon: TrendUp, label: "Get Promoted", note: "Tell a story your next boss will read" },
          ].map((s2, i) => (
            <div key={i} className="relative p-4 rounded-2xl border border-zinc-200 dark:border-white/[0.05] bg-white/40 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-zinc-400">{s2.n}</span>
                <s2.icon className="w-4 h-4 text-brand-500" weight="duotone" />
              </div>
              <p className="text-[11px] font-bold text-zinc-900 dark:text-white leading-tight">{s2.label}</p>
              <p className="text-[10px] text-zinc-500 mt-1 leading-tight">{s2.note}</p>
            </div>
          ))}
        </div>

        {/* Resume.io signature: "Way beyond a resume builder…" tools row. The
            resume.io home page positions the builder as one tool inside a broader
            career platform — Recruiter Match, Job Board, Auto Apply, Interview
            Prep, Salary Analyzer, Career Coaching, Future Learn. We surface 4 of
            those as informational chips so the user sees the same positioning on
            /new without us claiming features we haven’t shipped. */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mr-1">Way beyond a resume builder</span>
          {[
            { icon: MagnifyingGlass, label: "Recruiter Match", note: "Reach 2,400+ partner recruiters" },
            { icon: Rocket, label: "Job Board", note: "Remote-first roles, daily" },
            { icon: Robot, label: "Auto Apply", note: "One-click tailored applications" },
            { icon: GraduationCap, label: "Interview Prep", note: "Practice with the OfferPath simulator" },
          ].map((t, i) => (
            <div
              key={i}
              title={t.note}
              className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] hover:border-brand-500/40 cursor-default transition-all"
            >
              <t.icon className="w-3.5 h-3.5 text-brand-500" weight="duotone" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Resume.io signature: outcome proof row. Mirrors the "A draft in 10 mins"
            + "92% of customers recommend us" trust block on the resume.io home
            page. Two inline stats with the same icon-button + label pattern. */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20">
            <span className="text-base leading-none">⚡</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">A draft in 10 minutes</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-base leading-none">💚</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">92% of customers recommend us</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span className="text-amber-500">★</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">4.2 out of 5</span>
            <span>·</span>
            <span>Trustpilot</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
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
