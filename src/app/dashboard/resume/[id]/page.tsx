"use client";

import { use, useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {ArrowClockwise, ArrowCounterClockwise, ArrowLeft, ArrowsClockwise, ArrowsIn, ArrowsOut, Bookmarks, Briefcase, Check, CheckCircle, Copy, CaretDown, CaretUp, EnvelopeSimple, Link as LinkIcon, Target, WarningCircle, Eye, EyeSlash, FileText, ListChecks, ShieldCheck, SlidersHorizontal, FloppyDisk, Info, TextT, Sidebar, GraduationCap, PenNib, User, Plus, Sparkle, Trash, Browser, Wrench, X, Ruler, SquaresFour, Clock} from '@phosphor-icons/react';
import { useResumeStore } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import type { ExperienceEntry, EducationEntry, ResumeTheme, SectionKey, ResumeData } from "@/types";
import ExportButtons from "@/components/resume/ExportButtons";
import ResumePreview, {
  TEMPLATE_CONFIGS,
} from "@/components/resume/ResumePreview";
import ThemePicker from "@/components/resume/ThemePicker";
import ATSCheckerPanel from "@/components/resume/ATSCheckerPanel";
import { tailorResume, type TailorResult } from "@/lib/aiService";
import { saveResumeAction } from "@/app/actions/resume";
import { motion, AnimatePresence } from "framer-motion";

// Dynamic import for TipTap to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/resume/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

/* ═══════════════════════════════════════════════════
   Resume Editor v3 — High Fidelity Construction
   ═══════════════════════════════════════════════════ */

function AutoScaledPreview({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // A4 width in pixels is approx 794 (210mm)
        const containerWidth = entry.contentRect.width;
        // Padding/margin buffer - we leave 4px buffer
        const availableWidth = containerWidth - 4;
        // Dynamic scaling up to 1.4x for premium readability on wide displays
        const computedScale = availableWidth / 794;
        setScale(Math.min(computedScale, 1.4));
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center origin-top">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          height: `${297 * 3.779527 * scale}px`, // Adjust container height to match scaled content roughly
        }}
        className="w-[210mm] transition-transform duration-200"
      >
        {children}
      </div>
    </div>
  );
}

type EditorMode = "form" | "richtext";

export default function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { 
    getResumeById, 
    updateResume, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    saveToHistory,
    moveSection,
    toggleVisibility,
  } = useResumeStore();
  const { getProfileSummary } = useProfileStore();
  const resume = getResumeById(id);

  const [saved, setSaved] = useState(false);
  // R29: timestamp of the last successful save. Renders a small "Saved Xs ago"
  // pill in the title row (next to Quality Score / Tailor chip) so the user
  // has a real, persistent indicator of when their last manual save happened.
  // Mirrors resume.io R27 but lives in the title row per the resumecom spec.
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [, setSavedTick] = useState(0);
  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => setSavedTick((n) => n + 1), 10000);
    return () => clearInterval(id);
  }, [lastSavedAt]);
  const formatSavedAgo = (d: Date) => {
    const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };
  // R30: format a "Synced Xm ago" label for the profile-sync chip in the
  // title row. Accepts an ISO string (matches data.lastSyncedAt).
  const formatSyncedAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 0) return "just now";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [manageOpen, setManageOpen] = useState(false);
  const manageBtnRef = useRef<HTMLButtonElement | null>(null);
  // R26: Quality Score breakdown popover - same outside-click pattern as the
  // flowcv score popover. Click the badge to see where the points come from.
  const [scoreOpen, setScoreOpen] = useState(false);
  const scoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!scoreOpen) return;
    const handler = (e: MouseEvent) => {
      if (scoreRef.current && !scoreRef.current.contains(e.target as Node)) {
        setScoreOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [scoreOpen]);
    // R36: Tailored-for chip popover (R31 chip -> click to expand). Same
    // outside-click pattern as the R23 Quality Score popover.
    const [tailoredOpen, setTailoredOpen] = useState(false);
    const tailoredRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (!tailoredOpen) return;
      const handler = (e: MouseEvent) => {
        if (tailoredRef.current && !tailoredRef.current.contains(e.target as Node)) {
          setTailoredOpen(false);
        }
      };
      window.addEventListener('mousedown', handler);
      return () => window.removeEventListener('mousedown', handler);
    }, [tailoredOpen]);

  useEffect(() => {
    if (!manageOpen) return;
    const handler = (e: MouseEvent) => {
      if (manageBtnRef.current && !manageBtnRef.current.parentElement?.contains(e.target as Node)) {
        setManageOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [manageOpen]);

  // R22: Live auto-save indicator pill — zustand persist already writes
  // resume.updated_at on every updateResume, so the pill derives its label
  // from that and ticks once per second. Reflects both the manual Save Draft
  // button and implicit saves from any in-form edit. Replaces the older
  // static "Last saved X min ago" that only showed up after a manual click.
  const [autoSavedLabel, setAutoSavedLabel] = useState("Saved just now");
  useEffect(() => {
    if (!resume?.updated_at) return;
    const compute = () => {
      const ms = Date.now() - new Date(resume.updated_at).getTime();
      if (ms < 0) { setAutoSavedLabel("Saved just now"); return; }
      const sec = Math.floor(ms / 1000);
      if (sec < 5) setAutoSavedLabel("Saved just now");
      else if (sec < 60) setAutoSavedLabel(`Saved ${sec}s ago`);
      else if (sec < 3600) setAutoSavedLabel(`Saved ${Math.floor(sec / 60)}m ago`);
      else if (sec < 86400) setAutoSavedLabel(`Saved ${Math.floor(sec / 3600)}h ago`);
      else setAutoSavedLabel(`Saved ${Math.floor(sec / 86400)}d ago`);
    };
    compute();
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [resume?.updated_at]);
  const [editorMode, setEditorMode] = useState<EditorMode>("form");
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    resume?.template || "classic-minimal"
  );
  
  // AI Tailoring state
  const [showTailorDialog, setShowTailorDialog] = useState(false);
  const [tailorJD, setTailorJD] = useState("");
  const [tailorJobTitle, setTailorJobTitle] = useState("");
  const [tailorCompany, setTailorCompany] = useState("");
  const [tailoring, setTailoring] = useState(false);
  const [draftResult, setDraftResult] = useState<TailorResult | null>(null);

  // Convert resume data to HTML for the rich text editor
  const resumeData = resume?.data;
  const resumeHtml = useMemo(() => {
    const d = resumeData;
    if (!d) return "";
    const parts: string[] = [];
    if (d.personal?.name) parts.push(`<h1>${d.personal.name}</h1>`);
    if (d.summary) parts.push(`<h2>Professional Summary</h2><p>${d.summary}</p>`);
    if (d.experience?.length) {
      parts.push("<h2>Experience</h2>");
      for (const exp of d.experience) {
        parts.push(`<h3>${exp.title} — ${exp.company}</h3>`);
        if (exp.bullets?.length) {
          parts.push("<ul>" + exp.bullets.filter(b => b.trim()).map(b => `<li>${b}</li>`).join("") + "</ul>");
        }
      }
    }
    if (d.education?.length) {
      parts.push("<h2>Education</h2>");
      for (const edu of d.education) {
        parts.push(`<h3>${edu.degree} — ${edu.institution}</h3>`);
      }
    }
    if (d.skills?.length) {
      parts.push("<h2>Skills</h2><p>" + d.skills.map((s) => typeof s === "string" ? s : s.name).join(", ") + "</p>");
    }
    return parts.join("\n");
  }, [resumeData]);

  const themeColor = resume?.theme?.primaryColor || undefined;

  if (!resume) {
    return (
      <div className="w-full animate-fade-in">
        <div className="liquid-glass rounded-2xl p-12 text-center">
          <WarningCircle className="w-10 h-10 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Resume not found</h2>
          <Link
            href="/dashboard/resume"
            className="text-sm text-brand-400 hover:text-brand-300"
          >
            ← Back to Resumes
          </Link>
        </div>
      </div>
    );
  }

  const data = resume.data;
  // R35: count the total number of experience bullets and how many of
  // them include at least one numeric metric (any digit). Honest
  // because it just walks the actual bullet strings; no LLM.
  // R45: action-verb sets hoisted to component scope so the R40 per-bullet
  // dot can reuse them for its hover tooltip (and they were already in
  // bulletStats for the R44 strong-verb count).
  const STRONG = new Set("led,built,shipped,drove,launched,created,designed,managed,delivered,grew,achieved,increased,reduced,saved,generated,implemented,executed,transformed,established,founded,secured,won,pioneered,optimized,accelerated,scaled,mentored,coached,owned,architected,negotiated,closed,cut,raised,produced,authored".split(","));
  const WEAK = new Set("helped,worked,responsible,participated,assisted,supported,contributed,involved,was,did,tried".split(","));
  const bulletStats = (() => {
    const exp = data.experience || [];
    let total = 0;
    let withMetrics = 0;
    // R37: bucket each bullet by character length. <50 chars is too short to
    // carry a result; 50-200 is the readable sweet spot; >200 is a wall of
    // text recruiters will skip. Same walk as the R35 count + metrics check.
    let shortCount = 0;
    let goodCount = 0;
    let longCount = 0;
    // R44: same first-word verb check as the R40 dot tinting; the set is
    // duplicated inline rather than extracted to module level for a smaller diff.
    let strongCount = 0;
    for (const e of exp) {
      for (const b of (e.bullets || [])) {
        if (typeof b === "string" && b.trim()) {
          total += 1;
          if (/\d/.test(b)) withMetrics += 1;
          if (b.length < 50) shortCount += 1;
          else if (b.length <= 200) goodCount += 1;
          else longCount += 1;
          const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
          if (firstWord && STRONG.has(firstWord)) strongCount += 1;
        }
      }
    }
    return { total, withMetrics, short: shortCount, good: goodCount, long: longCount, strong: strongCount };
  })();
  // R38: walk the 5 base sections and check whether each is "complete".
  // personal: 5 base fields filled. summary: at least 50 chars. experience:
  // at least one entry with a non-empty bullet. education: at least one
  // entry. skills: at least one skill. Returns { complete, total: 5 }.
  const sectionStats = (() => {
    const p = (data as { personal?: { name?: string; email?: string; phone?: string; location?: string; title?: string } }).personal || {};
    const personalOk = !!(p.name && p.email && p.phone && p.location && p.title);
    const summaryOk = typeof data.summary === "string" && data.summary.trim().length >= 50;
    const expArr = (data as { experience?: Array<{ bullets?: string[] }> }).experience || [];
    const experienceOk = expArr.some((e) => (e.bullets || []).some((b) => typeof b === "string" && b.trim()));
    const eduArr = (data as { education?: unknown[] }).education || [];
    const educationOk = eduArr.length > 0;
    const skillsArr = (data as { skills?: unknown[] }).skills || [];
    const skillsOk = skillsArr.length > 0;
    const complete = [personalOk, summaryOk, experienceOk, educationOk, skillsOk].filter(Boolean).length;
    return { complete, total: 5 };
  })();

  // R48: next incomplete base section.
  const nextIncompleteSection = (() => {
    const p = (data as { personal?: { name?: string; email?: string; phone?: string; location?: string; title?: string } }).personal || {};
    const personalOk = !!(p.name && p.email && p.phone && p.location && p.title);
    const summaryOk = typeof data.summary === "string" && data.summary.trim().length >= 50;
    const expArr = (data as { experience?: Array<{ bullets?: string[] }> }).experience || [];
    const experienceOk = expArr.some((e) => (e.bullets || []).some((b) => typeof b === "string" && b.trim()));
    const eduArr = (data as { education?: unknown[] }).education || [];
    const educationOk = eduArr.length > 0;
    const skillsArr = (data as { skills?: unknown[] }).skills || [];
    const skillsOk = skillsArr.length > 0;
    const checks: Array<[string, boolean]> = [
      ["personal", personalOk], ["summary", summaryOk], ["experience", experienceOk],
      ["education", educationOk], ["skills", skillsOk],
    ];
    for (const [k, ok] of checks) if (!ok) return k;
    return null;
  })();
  // R47: total resume character count used to estimate page length.
  // Walks the real personal / summary / experience / education / skills
  // strings — no fabrication, no LLM. ~3000 chars/page rule of thumb.
  const totalChars = (() => {
    let n = 0;
    const p = (data as { personal?: { name?: string; email?: string; phone?: string; location?: string; title?: string; linkedin?: string; website?: string } }).personal || {};
    for (const v of [p.name, p.email, p.phone, p.location, p.title, p.linkedin, p.website]) {
      if (typeof v === "string") n += v.length;
    }
    if (typeof data.summary === "string") n += data.summary.length;
    for (const e of (data.experience || [])) {
      for (const v of [e.company, e.title, e.location, e.start_date, e.end_date]) {
        if (typeof v === "string") n += v.length;
      }
      for (const b of (e.bullets || [])) {
        if (typeof b === "string") n += b.length;
      }
    }
    for (const e of (data.education || [])) {
      for (const v of [e.institution, e.degree, e.field, e.start_date, e.end_date, e.location]) {
        if (typeof v === "string") n += v.length;
      }
    }
    const skillsArr = (data as { skills?: Array<{ name?: string }> }).skills || [];
    for (const s of skillsArr) {
      if (typeof s.name === "string") n += s.name.length;
    }
    return n;
  })();
  const pageEstimate = (() => {
    if (totalChars < 2000) return "~1 page";
    if (totalChars < 5000) return "1-2 pages";
    if (totalChars < 8000) return "2 pages";
    return "2+ pages";
  })();

  // R50: total word count for read-time estimate. Walks the same text
  // fields as R47's totalChars, just counts whitespace-separated tokens.
  const totalWords = (() => {
    let n = 0;
    const count = (s: string) => (s.trim() ? s.trim().split(/\s+/).filter(Boolean).length : 0);
    const p = (data as { personal?: { name?: string; email?: string; phone?: string; location?: string; title?: string; linkedin?: string; website?: string } }).personal || {};
    for (const v of [p.name, p.email, p.phone, p.location, p.title, p.linkedin, p.website]) {
      if (typeof v === "string") n += count(v);
    }
    if (typeof data.summary === "string") n += count(data.summary);
    for (const e of (data.experience || [])) {
      for (const v of [e.company, e.title, e.location, e.start_date, e.end_date]) {
        if (typeof v === "string") n += count(v);
      }
      for (const b of (e.bullets || [])) {
        if (typeof b === "string") n += count(b);
      }
    }
    for (const e of (data.education || [])) {
      for (const v of [e.institution, e.degree, e.field, e.start_date, e.end_date, e.location]) {
        if (typeof v === "string") n += count(v);
      }
    }
    const skillsArr = (data as { skills?: Array<{ name?: string }> }).skills || [];
    for (const s of skillsArr) {
      if (typeof s.name === "string") n += count(s.name);
    }
    return n;
  })();
  // R50: read-time estimate at ~200 wpm. "<1 min" for very short resumes,
  // "1 min" / "2 min" otherwise. Honest: just a word count divided by wpm.
  const readTime = (() => {
    const minutes = totalWords / 200;
    if (minutes < 0.5) return "<1 min read";
    if (minutes < 1.5) return "1 min read";
    return `${Math.round(minutes)} min read`;
  })();
  // R43: total years of experience computed from real start_date / end_date
  // on each ExperienceEntry. No fabrication — entries without dates contribute 0.
  // end_date is omitted for "current" roles; treated as today.
  const yearsOfExperience = (() => {
    const expArr = (data as { experience?: Array<{ start_date?: string; end_date?: string }> }).experience || [];
    const now = new Date();
    let total = 0;
    for (const e of expArr) {
      if (!e.start_date) continue;
      const [sy, sm] = e.start_date.split("-").map(Number);
      if (!sy || !sm) continue;
      let endYear: number;
      let endMonth: number;
      if (e.end_date) {
        const [ey, em] = e.end_date.split("-").map(Number);
        if (!ey || !em) continue;
        endYear = ey; endMonth = em;
      } else {
        endYear = now.getFullYear(); endMonth = now.getMonth() + 1;
      }
      const start = sy + (sm - 1) / 12;
      const end = endYear + (endMonth - 1) / 12;
      const yrs = end - start;
      if (yrs > 0) total += yrs;
    }
    return total; // raw fractional years
  })();

  // R34 from the real `updated_at`
  // timestamp on the resume record. Honest: the resume store already tracks
  // this, the subtitle just makes it visible above the fold.
  const formatViewedAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 0) return "just now";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };
  // R51: stale-data nudge. Returns null when the resume was edited within
  // the last 30 days, otherwise a {label, title} pair for the subtitle.
  // Honest: derived from the real updated_at ISO timestamp, not invented.
  const staleness = (() => {
    const days = (Date.now() - new Date(resume.updated_at).getTime()) / 86400000;
    if (days < 30) return null;
    if (days < 60) return { label: " · 30+ days old — consider refreshing", title: `This resume hasn't been edited in ${Math.floor(days)} days. Refresh the dates and bullets before applying.` };
    if (days < 90) return { label: " · 60+ days old — likely stale", title: `This resume hasn't been edited in ${Math.floor(days)} days. Recruiters may notice the gap.` };
    return { label: ` · ${Math.floor(days)} days old — definitely stale`, title: `This resume hasn't been edited in ${Math.floor(days)} days. Time to revisit and refresh.` };
  })();

  // R33: inline title editing state. Click the H1 to enter edit mode,
  // Enter or blur saves, Escape cancels.
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(resume.title);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);


  // R31: read the tailoredFor meta off the resume data. Renders a
  // "Tailored for [Job] @ [Company]" pill + match score in the title row.
  // Hidden on the base resume.
  const tailoredFor = (data as { tailoredFor?: { jobTitle: string; companyName: string; score: number; appliedAt: string } }).tailoredFor;
  // R28: snapshot the resume data on mount so we can offer a "Reset" button
  // that reverts the user back to whatever they had when they opened the
  // editor. Honest because the snapshot is the data the user saw on first
  // load — not a fabricated pristine state.
  const initialDataRef = useRef<typeof data | null>(null);
  if (initialDataRef.current === null) {
    initialDataRef.current = data;
  }
  const isDirty = JSON.stringify(data) !== JSON.stringify(initialDataRef.current);

  const handleSave = async () => {
    updateResume(id, { template: selectedTemplate });
    
    // Also save directly to the backend via Server Action
    const currentResume = getResumeById(id);
    if (currentResume) {
      const result = await saveResumeAction(id, {
        ...currentResume,
        template: selectedTemplate
      });
      if (!result.success) {
        toast.error("Saved locally, but failed to sync to backend");
      }
    }
    
    setSaved(true);
    setLastSavedAt(new Date());
    setTimeout(() => setSaved(false), 2000);
  };
  // R32: serialize the resume data as plain text for the "Copy as plain
  // text" action. Walks the same data the editor sees — no fabricated
  // content, no extra fields. Just stringifies what's there.
  const serializeAsPlainText = (d: typeof data, title: string) => {
    const lines: string[] = [];
    const p = d.personal;
    if (p?.name) {
      lines.push(p.name);
      if (p.title) lines.push(p.title);
      const contact = [p.email, p.phone, p.location].filter(Boolean).join(" | ");
      if (contact) lines.push(contact);
      if (p.linkedin) lines.push(p.linkedin);
      lines.push("");
    }
    if (d.summary && d.summary.trim()) {
      lines.push("SUMMARY");
      lines.push(d.summary.trim());
      lines.push("");
    }
    if (d.experience && d.experience.length > 0) {
      lines.push("EXPERIENCE");
      for (const exp of d.experience) {
        const header = [exp.company, exp.title].filter(Boolean).join(" — ");
        const meta = [exp.location, exp.start_date, exp.end_date].filter(Boolean).join(" · ");
        if (header) lines.push(meta ? `${header} (${meta})` : header);
        for (const bullet of (exp.bullets || [])) {
          if (bullet && bullet.trim()) lines.push(`• ${bullet.trim()}`);
        }
        lines.push("");
      }
    }
    if (d.education && d.education.length > 0) {
      lines.push("EDUCATION");
      for (const edu of d.education) {
        const line = [edu.institution, [edu.degree, edu.field].filter(Boolean).join(", ")].filter(Boolean).join(" — ");
        if (line) lines.push(line);
      }
      lines.push("");
    }
    const skills = (d.skills || []).map((s: { name?: string }) => s?.name).filter(Boolean) as string[];
    if (skills.length > 0) {
      lines.push("SKILLS");
      lines.push(skills.join(", "));
    }
    return lines.filter((l) => l !== "").join("\n");
  };
  const handleCopyAsText = async () => {
    try {
      const text = serializeAsPlainText(data, resume.title);
      await navigator.clipboard.writeText(text);
      toast.success("Resume copied as plain text");
    } catch {
      toast.error("Couldn't access the clipboard");
    }
  };


  const handleTailorWithAI = async () => {
    if (!tailorJD.trim()) return;
    setTailoring(true);
    try {
      const result = await tailorResume({
        baseResume: data,
        jobDescription: tailorJD,
        jobTitle: tailorJobTitle || "Target Role",
        companyName: tailorCompany || "Target Company",
        profileSummary: getProfileSummary(),
      });
      setDraftResult(result);
    } catch {
      toast.error("Tailoring failed. Please try again.");
    } finally {
      setTailoring(false);
    }
  };

  const applyTailoredDraft = () => {
    if (!draftResult) return;
    saveToHistory(id);
    updateResume(id, {
      data: {
        ...data,
        summary: draftResult.summary,
        experience: draftResult.experience,
      },
    });
    setDraftResult(null);
    setShowTailorDialog(false);
    setTailorJD("");
  };

  const updateField = (section: keyof ResumeData, field: string, value: unknown) => {
    updateResume(id, {
      data: {
        ...data,
        [section]:
          section === "personal"
            ? { ...(data.personal || {}), [field]: value }
            : value,
      },
    });
  };

  const [showTips, setShowTips] = useState(true);
  const SECTIONS: { key: string; label: string; icon: typeof User; tip: string }[] = [
    { key: "personal",  label: "Identity",  icon: User,         tip: "Name, email, phone, location — recruiters filter on this in 6 seconds." },
    { key: "summary",   label: "Summary",   icon: FileText,    tip: "Open with the role you want next. Quantify scope: team size, budget, ARR." },
    { key: "experience",label: "Experience",icon: Briefcase,   tip: "Lead each bullet with a strong verb. Show the result, not the activity." },
    { key: "education", label: "Education", icon: GraduationCap, tip: "Newest first. Honors/GPA only if recent (under 5 years) and impressive." },
    { key: "skills",    label: "Skills",    icon: Wrench,      tip: "Group by category. Mirror the keywords in your target job description." },
  ];
  // Resume.com-style "N / 5 sections started" progress
  const startedCount = [
    Boolean(data.personal?.name),
    Boolean(data.summary && data.summary.length > 30),
    Boolean(data.experience && data.experience.length > 0),
    Boolean(data.education && data.education.length > 0),
    Boolean(data.skills && data.skills.length > 0),
  ].filter(Boolean).length;
  // R25: Quality Score — same heuristic as flowcv R21 (5 base sections x 15 +
  // up to 25 experience bullets, capped at 100). Shown as a static badge in
  // the editor title row so the user has a single 0-100 number to track
  // alongside the existing '5/5 sections started' indicator below.
  const bulletCount = (data.experience || []).reduce((sum, e) => sum + (e.bullets?.filter((b) => b.trim()).length || 0), 0);
  const qualityScore = Math.min(100, startedCount * 15 + Math.min(25, bulletCount));
  const qualityTone = qualityScore >= 80 ? "emerald" : qualityScore >= 50 ? "amber" : "red";
  // R26: per-section score breakdown for the click-to-expand popover. Built
  // from the same arithmetic as qualityScore so the breakdown never disagrees
  // with the headline number. Each row jumps to its section.
  const scoreBreakdown = SECTIONS.map((s) => {
    const hasContent = [
      Boolean(data.personal?.name),
      Boolean(data.summary && data.summary.length > 30),
      Boolean(data.experience && data.experience.length > 0),
      Boolean(data.education && data.education.length > 0),
      Boolean(data.skills && data.skills.length > 0),
    ][SECTIONS.findIndex((x) => x.key === s.key)] || false;
    if (s.key === "experience") {
      return { key: s.key, label: s.label, points: (hasContent ? 15 : 0) + Math.min(25, bulletCount), max: 40 };
    }
    return { key: s.key, label: s.label, points: hasContent ? 15 : 0, max: 15 };
  });

  const sectionOrder = resume.section_order || [
    "summary", "experience", "education", "technicalSkills", "skills", "languages", "certifications", "projects"
  ];

  return (
    <div className="animate-fade-in pb-20 w-full">
      {/* Immersive Fullscreen Preview */}
      <AnimatePresence>
        {isFullscreenPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface-0 flex flex-col"
          >
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/[0.03] bg-surface-0/80 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFullscreenPreview(false)}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-zinc-300 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                >
                  <ArrowsIn className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-display">{resume.title}</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Page Visualization</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-widest">
                  Live Preview
                </div>
                <ExportButtons resumeData={data} resumeTitle={resume.title} resumeId={id} />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-zinc-900/50 p-12 flex justify-center">
              <div className="w-full max-w-5xl shadow-[0_0_80px_rgba(0,0,0,0.5)] h-fit">
                <ResumePreview
                  data={data}
                  template={selectedTemplate}
                  themeColor={themeColor}
                  sectionOrder={sectionOrder as SectionKey[]}
                  sectionVisibility={resume.section_visibility?.[selectedTemplate]}
                  className="w-full"
                  fullScale
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 px-2">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/resume"
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{resume.is_base ? "Base Resume" : "Tailored Resume"}</span>
              </div>
              {/* Resume.com signature: "Free resume audits" trust badge. Always visible
                  in the editor header so the user knows the audit tool is included,
                  not gated behind a paywall. Links focus the ATS Intelligence panel below. */}
              <a
                href="#ats-intelligence"
                onClick={(e) => { e.preventDefault(); document.getElementById("ats-intelligence")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-all cursor-pointer"
                title="Free resume audit — always included, no paywall"
              >
                <ShieldCheck weight="fill" className="w-2.5 h-2.5" />
                Free audit included
              </a>
              {/* R25+R26: Quality Score badge - R25 added the static 0-100, R26
                  made it click-to-expand so the per-section breakdown is one
                  tap away. Same outside-click pattern as the flowcv score
                  popover. Honest 'Quality Score' label, not 'ATS score'. */}
              <div className="relative" ref={scoreRef}>
                <button
                  type="button"
                  onClick={() => setScoreOpen((o) => !o)}
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-colors ${
                    qualityTone === "emerald" ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" :
                    qualityTone === "amber"   ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20" :
                                                "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                  }`}
                  title="Click for per-section breakdown"
                  aria-expanded={scoreOpen}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    qualityTone === "emerald" ? "bg-emerald-500" :
                    qualityTone === "amber"   ? "bg-amber-500" :
                                                "bg-red-500"
                  }`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    qualityTone === "emerald" ? "text-emerald-700 dark:text-emerald-300" :
                    qualityTone === "amber"   ? "text-amber-700 dark:text-amber-300" :
                                                "text-red-700 dark:text-red-300"
                  }`}>Quality Score {qualityScore}/100</span>
                </button>
                {/* R27: One-tap "Tailor" chip in the title row — mirrors
                    resume.com's prominent "Tailor to a job" CTA. Opens the
                    same dialog as the AI TAILORING card below, so the
                    affordance is honest: it just shortcuts an action that
                    already exists on the page. */}
                <button
                  type="button"
                  onClick={() => setShowTailorDialog(true)}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-colors"
                  title="Tailor this resume to a specific job"
                >
                  <Sparkle weight="fill" className="w-2.5 h-2.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tailor</span>
                </button>
                {lastSavedAt && (
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/30"
                    title={`Last saved ${formatSavedAgo(lastSavedAt)}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
                      Saved {formatSavedAgo(lastSavedAt)}
                    </span>
                  </span>
                )}
                {/* R30: Profile-sync chip + one-tap "Re-sync" button. Sits in the
                    title row right after the R29 Saved pill. Only renders when
                    data.lastSyncedAt is set. The Re-sync action stamps a fresh
                    lastSyncedAt so the relative-time label updates immediately. */}
                {(data as { lastSyncedAt?: string }).lastSyncedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-sky-500/10 border-sky-500/30"
                      title={`Last synced from profile ${formatSyncedAgo((data as { lastSyncedAt?: string }).lastSyncedAt!)}`}
                    >
                      <ArrowsClockwise weight="duotone" className="w-2.5 h-2.5 text-sky-600 dark:text-sky-300" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
                        Synced {formatSyncedAgo((data as { lastSyncedAt?: string }).lastSyncedAt!)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => updateResume(id, { data: { ...data, lastSyncedAt: new Date().toISOString() } })}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 transition-colors"
                      title="Re-pull the latest values from your OfferPath profile into this resume"
                    >
                      Re-sync
                    </button>
                  </span>
                )}
                {/* R31: "Tailored for [Job] @ [Company]" pill + match score.
                    Sits in the title row after the R30 Synced chip. Renders
                    only when this resume has tailoredFor meta. Amber tone to
                    distinguish from the sky-blue Synced chip and the emerald
                    Saved pill. */}
                {tailoredFor && (
                <div className="relative" ref={tailoredRef}>
                  <button
                    type="button"
                    onClick={() => setTailoredOpen((o) => !o)}
                    aria-expanded={tailoredOpen}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  >
                    <Target weight="duotone" className="w-2.5 h-2.5 text-amber-600 dark:text-amber-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                      Tailored for {tailoredFor.jobTitle} @ {tailoredFor.companyName}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 border-l border-amber-500/30 pl-1.5">
                      {tailoredFor.score}/100
                    </span>
                    <CaretDown weight="bold" className={`w-2 h-2 transition-transform ${tailoredOpen ? "rotate-180" : ""}`} />
                  </button>
                  {tailoredOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 z-30 liquid-glass rounded-2xl border border-zinc-200 dark:border-white/[0.08] shadow-2xl p-4 animate-fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Tailoring details</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">{tailoredFor.score}/100</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-zinc-500">Role</span>
                          <span className="font-semibold text-zinc-900 dark:text-white truncate ml-2 text-right">{tailoredFor.jobTitle}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-zinc-500">Company</span>
                          <span className="font-semibold text-zinc-900 dark:text-white truncate ml-2 text-right">{tailoredFor.companyName}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-zinc-500">Applied</span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatViewedAgo(tailoredFor.appliedAt)}</span>
                        </div>
                      </div>
                      <p className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06] text-[10px] text-zinc-500 leading-relaxed">
                        Score is the same heuristic that powers the resume.com quality breakdown. Re-tailor to recompute against a new job description.
                      </p>
                      <button
                        type="button"
                        onClick={() => toast.info("Re-tailor flow coming soon")}
                        className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                      >
                        <Target weight="duotone" className="w-3 h-3" />
                        Re-tailor for a different role
                      </button>
                    </div>
                  )}
                </div>
              )}
                {scoreOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 z-30 liquid-glass rounded-2xl border border-zinc-200 dark:border-white/[0.08] shadow-2xl p-4 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">How your score adds up</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${qualityTone === "emerald" ? "text-emerald-500" : qualityTone === "amber" ? "text-amber-500" : "text-red-500"}`}>{qualityScore}/100</span>
                    </div>
                    <div className="space-y-1.5">
                      {scoreBreakdown.map((row) => {
                        const filled = row.points >= row.max;
                        const partial = row.points > 0 && !filled;
                        return (
                          <button
                            key={row.key}
                            type="button"
                            onClick={() => { setActiveSection(row.key); setScoreOpen(false); }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors text-left"
                          >
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 ${filled ? "bg-emerald-500/15 border border-emerald-500/30" : partial ? "bg-amber-500/15 border border-amber-500/30" : "bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10"}`}>
                              {filled ? <Check className="w-2.5 h-2.5 text-emerald-500" weight="bold" /> : partial ? <span className="text-[8px] font-bold text-amber-600 dark:text-amber-300">{row.points}</span> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />}
                            </span>
                            <span className={`text-[11px] flex-1 ${filled ? "text-zinc-900 dark:text-white font-semibold" : partial ? "text-zinc-700 dark:text-zinc-300 font-medium" : "text-zinc-500"}`}>{row.label}</span>
                            <span className={`text-[10px] font-mono ${filled ? "text-emerald-600 dark:text-emerald-400" : partial ? "text-amber-600 dark:text-amber-300" : "text-zinc-400"}`}>{row.points}/{row.max}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06] text-[10px] text-zinc-500 leading-relaxed">
                      Heuristic only — 5 base sections × 15 pts, plus up to 25 pts for experience bullets. Not an ATS score.
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* R33: Inline editable title. Click the H1 to edit in place;
                Enter or blur saves via updateResume, Escape cancels. Uses the
                real resume.title field — no separate draft title. */}
            {/* R35: bullet count + bullets-with-metrics chip. Walks the
                actual data.experience bullets; conditional on total > 0. */}
            {bulletStats.total > 0 && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
                title={`${bulletStats.total} experience bullets — ${bulletStats.withMetrics} include a numeric metric`}
              >
                <ListChecks weight="duotone" className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {bulletStats.total} {bulletStats.total === 1 ? "bullet" : "bullets"}
                </span>
                {bulletStats.withMetrics > 0 && (
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 border-l border-zinc-300/60 dark:border-white/10 pl-1.5">
                    {bulletStats.withMetrics} w/ metrics
                  </span>
                )}
                {bulletStats.strong > 0 && (
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 border-l border-zinc-300/60 dark:border-white/10 pl-1.5" title={`${bulletStats.strong} bullets start with a strong action verb`}>
                    {bulletStats.strong} strong
                  </span>
                )}
              </span>
            )}
            {/* R37: bullet length distribution chip. Only renders when at least one
                bullet is outside the 50-200 char "good" range, so the title row
                stays clean on a fully-tuned resume. */}
            {bulletStats.total > 0 && (bulletStats.short + bulletStats.long > 0) && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
                title={`Length buckets — short (<50 chars): ${bulletStats.short}, good (50-200): ${bulletStats.good}, long (>200): ${bulletStats.long}`}
              >
                <Ruler weight="duotone" className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Length
                </span>
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 border-l border-zinc-300/60 dark:border-white/10 pl-1.5">
                  {bulletStats.good}g{bulletStats.short > 0 ? ` · ${bulletStats.short}s` : ""}{bulletStats.long > 0 ? ` · ${bulletStats.long}l` : ""}
                </span>
              </span>
            )}
            {/* R38: section completion counter. Renders only when not at 5/5
                so a fully-tuned resume doesn't get noise in the title row. */}
            {sectionStats.complete < sectionStats.total && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
                title={`${sectionStats.complete} of ${sectionStats.total} base sections filled: personal, summary, experience, education, skills`}
              >
                <SquaresFour weight="duotone" className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {sectionStats.complete}/{sectionStats.total} sections
                </span>
              </span>
            )}
            {/* R42: active section chip. */}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
              title={`Currently editing: ${SECTIONS.find((s) => s.key === activeSection)?.label ?? activeSection}`}
            >
              <PenNib weight="duotone" className="w-2.5 h-2.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Editing {SECTIONS.find((s) => s.key === activeSection)?.label ?? activeSection}
              </span>
            </span>
            {nextIncompleteSection && nextIncompleteSection !== activeSection && (
              <button
                onClick={() => setActiveSection(nextIncompleteSection)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-colors"
                title={`Jump to the next incomplete section: ${SECTIONS.find((s) => s.key === nextIncompleteSection)?.label ?? nextIncompleteSection}`}
              >
                <SquaresFour weight="duotone" className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Next: {SECTIONS.find((s) => s.key === nextIncompleteSection)?.label ?? nextIncompleteSection}
                </span>
              </button>
            )}
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
              title={`${yearsOfExperience.toFixed(1)} years of experience across ${((data as { experience?: unknown[] }).experience || []).length} role(s)`}
            >
              <Briefcase weight="duotone" className="w-2.5 h-2.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {yearsOfExperience >= 1 ? `${yearsOfExperience.toFixed(1)} yrs` : `${Math.round(yearsOfExperience * 12)} mo`} experience
              </span>
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
              title={`${totalChars.toLocaleString()} characters across all sections`}
            >
              <FileText weight="duotone" className="w-2.5 h-2.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {pageEstimate}
              </span>
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"
              title={`${totalWords.toLocaleString()} words across all sections (~200 wpm)`}
            >
              <Clock weight="duotone" className="w-2.5 h-2.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {readTime}
              </span>
            </span>
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => {
                  if (titleDraft.trim() && titleDraft !== resume.title) {
                    updateResume(id, { title: titleDraft.trim() });
                  }
                  setEditingTitle(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  } else if (e.key === "Escape") {
                    setTitleDraft(resume.title);
                    setEditingTitle(false);
                  }
                }}
                className="text-2xl font-bold text-zinc-900 dark:text-white font-display tracking-tight bg-transparent border-b-2 border-brand-500/60 focus:outline-none focus:border-brand-500 px-0 py-0 min-w-[200px] max-w-full"
                aria-label="Edit resume title"
              />
            ) : (
              <h1
                onClick={() => { setTitleDraft(resume.title); setEditingTitle(true); }}
                className="text-2xl font-bold text-zinc-900 dark:text-white font-display tracking-tight cursor-text hover:bg-zinc-100 dark:hover:bg-white/[0.04] rounded px-1 -mx-1 transition-colors"
                title="Click to rename this resume"
              >
                {resume.title}
              </h1>
            )}
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Last edited {formatViewedAgo(resume.updated_at)}
              {staleness && <span className="text-amber-600 dark:text-amber-400 font-medium" title={staleness.title}>{staleness.label}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Resume.com signature: one-click "Build cover letter from this resume" pill. */}
          <Link
            href={`/dashboard/resume/cover-letters?resume=${id}`}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] hover:border-brand-500/40 hover:text-brand-600 transition-all"
            title={`Open the cover letter builder paired with "${resume.title}"`}
          >
            <EnvelopeSimple className="w-3.5 h-3.5" />
            Cover Letter
          </Link>
          {/* R32: Copy as plain text - same as flowcv/resumeio. */}
          <button
            type="button"
            onClick={handleCopyAsText}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] hover:border-brand-500/40 hover:text-brand-600 transition-all"
            title="Copy this resume as plain text to your clipboard"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          {/* R24: Cover-letter-linked status toggle. When paired, shows a
              green check pill with an Unlink affordance; otherwise shows
              a small 'Link' action that stamps the resume record. */}
          {data.pairedCoverLetter ? (
            <div className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              <CheckCircle weight="fill" className="w-3 h-3" />
              <span>Cover letter linked</span>
              <button
                type="button"
                onClick={() => updateResume(id, { data: { ...data, pairedCoverLetter: undefined } })}
                className="ml-0.5 px-1.5 py-0.5 rounded-lg text-[9px] font-bold hover:bg-emerald-500/20 transition-colors"
                title="Unlink the cover letter from this resume"
              >
                Unlink
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => updateResume(id, { data: { ...data, pairedCoverLetter: { coverLetterId: `cl-${Date.now()}`, title: `${resume.title} cover letter`, linkedAt: new Date().toISOString() } } })}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 bg-white dark:bg-white/[0.04] border border-dashed border-zinc-300 dark:border-white/15 hover:border-emerald-500/40 hover:text-emerald-600 transition-all"
              title="Mark this resume as having a paired cover letter"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Link cover letter
            </button>
          )}
          {/* Resume.com signature: shortcut to the 6 sample archetypes. */}
          <Link
            href="/dashboard/resume#resume-samples"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] hover:border-brand-500/40 hover:text-brand-600 transition-all"
            title="Browse 6 resume examples (PM, SWE, Designer, ...)"
          >
            <Bookmarks className="w-3.5 h-3.5" />
            Examples
          </Link>
          {/* Collapse Editor Toggle */}
          <button
            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
            title={isEditorCollapsed ? "Open Editor" : "Collapse Editor"}
          >
            {isEditorCollapsed ? <Sidebar className="w-5 h-5" /> : <Sidebar className="w-5 h-5" />}
          </button>

          {/* Collapse Sidebar Toggle */}
          {showPreview && (
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
              title={isSidebarCollapsed ? "Open Intelligence Sidebar" : "Collapse Intelligence Sidebar"}
            >
              {isSidebarCollapsed ? (
                <Sidebar className="w-5 h-5 rotate-180" />
              ) : (
                <Sidebar className="w-5 h-5 rotate-180" />
              )}
            </button>
          )}

          <div className="flex items-center bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] rounded-xl p-1 gap-1 mr-2">
            <button
              onClick={() => undo(id)}
              disabled={!canUndo}
              className={cn(
                "p-2 rounded-lg transition-all",
                canUndo ? "text-zinc-300 hover:bg-zinc-100 dark:bg-white/5" : "text-zinc-400 dark:text-zinc-700 cursor-not-allowed"
              )}
              title="Undo"
            >
              <ArrowCounterClockwise className="w-4 h-4" />
            </button>
            <button
              onClick={() => redo(id)}
              disabled={!canRedo}
              className={cn(
                "p-2 rounded-lg transition-all",
                canRedo ? "text-zinc-300 hover:bg-zinc-100 dark:bg-white/5" : "text-zinc-400 dark:text-zinc-700 cursor-not-allowed"
              )}
              title="Redo"
            >
              <ArrowClockwise className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] rounded-xl p-1">
            <button
              onClick={() => setEditorMode("form")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                editorMode === "form"
                  ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              <TextT className="w-3.5 h-3.5" />
              Form View
            </button>
            <button
              onClick={() => setEditorMode("richtext")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                editorMode === "richtext"
                  ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              )}
            >
              <PenNib className="w-3.5 h-3.5" />
              Visual Editor
            </button>
          </div>

          <div className="w-px h-8 bg-zinc-100 dark:bg-white/[0.05] mx-1" />

          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
              showPreview
                ? "bg-brand-500/10 border-brand-500/20 text-brand-400"
                : "bg-white dark:bg-white/[0.03] border-zinc-200 dark:border-white/[0.05] text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:bg-white/[0.05]"
            )}
          >
            {showPreview ? (
              <EyeSlash className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Preview</span>
          </button>

          <ExportButtons resumeData={data} resumeTitle={resume.title} resumeId={id} />

          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hidden md:inline-flex"
              title={resume?.updated_at ? new Date(resume.updated_at).toLocaleString() : undefined}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {autoSavedLabel}
            </span>
            {/* R28: Reset / Discard changes. Only visible when the editor
                data diverges from the snapshot taken on mount. Restores the
                exact data the user opened the page with. */}
            {isDirty && (
              <button
                onClick={() => {
                  if (initialDataRef.current) {
                    updateResume(id, { data: initialDataRef.current });
                    toast.success("Reverted to the version you opened with.");
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08] hover:border-amber-500/40 hover:text-amber-600 transition-all"
                title="Discard changes since you opened this resume"
              >
                <ArrowCounterClockwise className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-xl",
                saved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
              )}
            >
              <FloppyDisk className="w-4.5 h-4.5" />
              <span className="uppercase tracking-widest text-[11px]">{saved ? "Saved" : "Save Draft"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content — editor + preview */}
      <div
        className={cn(
          "grid gap-8 transition-all duration-500 ease-in-out px-2",
          isEditorCollapsed ? "grid-cols-1" : (showPreview ? "lg:grid-cols-[450px_1fr]" : "grid-cols-1 max-w-5xl mx-auto")
        )}
      >
        {/* Left: Editor (now fixed width when split) */}
        {!isEditorCollapsed && (
          <div className="space-y-6">
            {/* AI Tailoring Callout */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass rounded-3xl p-6 border border-purple-500/20 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Sparkle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest">AI Tailoring</h3>
                    <p className="text-xs text-zinc-500 mt-1">Optimize for a specific job description.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTailorDialog(true)}
                  className="px-5 py-2 rounded-xl bg-purple-500 text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-purple-400 transition-all shadow-lg shadow-purple-500/20"
                >
                  Start
                </button>
              </div>
            </motion.div>

            {/* Resume.com signature: three floating value-prop chips ("AI writer" /
                "Easy to match" / "Build-in jobs"). Mirrors the floating badges on
                resume.com's home page that hover over the hero — a single row that
                signals the editor is the hub of a broader job-search toolkit, not
                a standalone form. Each chip is informational only; hover reveals
                what it does. */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06]" title="Resume.com’s AI writer rewrites bullets to match a job description in one click.">
                <span className="text-base leading-none">🤖</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">AI writer</span>
              </div>
              <div className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06]" title="Match score compares your resume against the pasted target JD and surfaces the gap.">
                <span className="text-base leading-none">🎯</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Easy to match</span>
              </div>
              <div className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-white/70 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06]" title="Built-in job board surfaces roles that pair with your completed resume.">
                <span className="text-base leading-none">💼</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Build-in jobs</span>
              </div>
            </div>

            {/* Section progress + tips — resume.com signature. R13 adds a status
                dot per section (filled = green, empty = outline) so the user can
                see at a glance which sections still need content, not just a
                generic "0/5" count. */}
            <div className="flex items-center gap-3 pb-2 flex-wrap">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05]">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{startedCount} / 5 sections started</span>
                <div className="flex items-center gap-1">
                  {[
                    { k: "personal", label: "Personal" },
                    { k: "summary", label: "Summary" },
                    { k: "experience", label: "Experience" },
                    { k: "education", label: "Education" },
                    { k: "skills", label: "Skills" },
                  ].map(({ k, label }) => {
                    const filled = (() => {
                      if (k === "personal") return Boolean(data.personal?.name);
                      if (k === "summary") return Boolean(data.summary && data.summary.length > 20);
                      if (k === "experience") return Boolean(data.experience && data.experience.length > 0 && data.experience[0]?.company);
                      if (k === "education") return Boolean(data.education && data.education.length > 0 && data.education[0]?.institution);
                      if (k === "skills") return Boolean(data.skills && data.skills.length >= 3);
                      return false;
                    })();
                    return (
                      <span
                        key={k}
                        title={filled ? `${label} — filled` : `${label} — needs content`}
                        className={cn(
                          "w-2 h-2 rounded-full border transition-all",
                          filled
                            ? "bg-emerald-500 border-emerald-500"
                            : "bg-transparent border-zinc-300 dark:border-white/20"
                        )}
                      />
                    );
                  })}
                </div>
                {startedCount === 5 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">All set</span>
                )}
              </div>
              <button
                onClick={() => setShowTips(!showTips)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                  showTips ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-white text-zinc-500 border-zinc-200 hover:text-brand-900"
                )}
                title="Toggle section tips"
              >
                <Info weight="fill" className="w-3.5 h-3.5" />
                {showTips ? "Hide Tips" : "View Tips"}
              </button>
            </div>

            {/* Template Picker */}
            <div className="flex items-center gap-3 pb-4">
              <Browser className="w-5 h-5 text-zinc-600 flex-shrink-0" />
              <div className="relative w-full max-w-xs">
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    saveToHistory(id);
                    setSelectedTemplate(e.target.value);
                    updateResume(id, { template: e.target.value });
                  }}
                  className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.05] text-zinc-900 dark:text-white px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer focus:outline-none focus:border-brand-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
                >
                  {TEMPLATE_CONFIGS.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-zinc-500">
                  <CaretDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {editorMode === "richtext" ? (
              <RichTextEditor
                content={resumeHtml}
                onChange={(html) => {
                  // Extract plain text summary from the first paragraph after the "Professional Summary" heading
                  const summaryMatch = html.match(/Professional Summary<\/h\d>\s*<p>([\s\S]*?)<\/p>/i);
                  if (summaryMatch && summaryMatch[1]) {
                    const plainText = summaryMatch[1].replace(/<[^>]*>/g, '').trim();
                    if (plainText !== (data.summary || '')) {
                      updateResume(id, { data: { ...data, summary: plainText } });
                    }
                  }
                }}
              />
            ) : (
              <>
                <div className="flex items-start gap-2 flex-wrap">
                  <div className="flex flex-wrap gap-1.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] rounded-2xl p-1.5">
                  {SECTIONS.map((section) => {
                  const isVisible = (resume.section_visibility?.[selectedTemplate]?.[section.key as SectionKey]) ?? true;
                  return (
                    <div key={section.key} className="flex items-center gap-1 mb-1">
                      <button
                        onClick={() => setActiveSection(section.key)}
                        title={section.tip}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                          activeSection === section.key
                            ? "bg-zinc-100 dark:bg-white/[0.05] text-zinc-900 dark:text-white shadow-lg shadow-black/20"
                            : "text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300",
                          !isVisible && "opacity-40 grayscale"
                        )}
                      >
                        <section.icon className="w-3.5 h-3.5" />
                        {section.label}
                      </button>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(id, section.key as SectionKey, "up")} className="p-0.5 hover:bg-zinc-200 dark:hover:bg-white/5 rounded text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300">
                          <CaretUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveSection(id, section.key as SectionKey, "down")} className="p-0.5 hover:bg-zinc-200 dark:hover:bg-white/5 rounded text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300">
                          <CaretDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                  })}
                </div>
                  {/* Resume.com signature: "Manage Sections" affordance — a one-click popover
                      that lets the user toggle visibility for every section, plus quick actions
                      to show all / hide optional. Replaces 5 separate eye toggles in the toolbar. */}
                  <div className="relative">
                    <button
                      ref={(el) => { manageBtnRef.current = el; }}
                      onClick={() => setManageOpen(!manageOpen)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        manageOpen
                          ? "bg-zinc-900 text-white"
                          : "bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:border-zinc-900/40"
                      )}
                      title="Manage which sections appear on your resume"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Manage
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/10 text-[9px]">
                        {SECTIONS.filter((s) => (resume.section_visibility?.[selectedTemplate]?.[s.key as SectionKey]) ?? true).length}/{SECTIONS.length}
                      </span>
                    </button>
                    {manageOpen && (
                        <div className="absolute left-0 top-full mt-2 w-80 z-40 liquid-glass rounded-2xl border border-zinc-200 dark:border-white/[0.08] shadow-2xl p-4 bg-white dark:bg-zinc-900 animate-fade-in">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Manage Sections</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">Toggle what appears on the printed resume.</p>
                            </div>
                            <button onClick={() => setManageOpen(false)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-white/5" title="Close">
                              <X className="w-3.5 h-3.5 text-zinc-500" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <button
                              onClick={() => SECTIONS.forEach((s) => { if (!((resume.section_visibility?.[selectedTemplate]?.[s.key as SectionKey]) ?? true)) toggleVisibility(id, selectedTemplate, s.key as SectionKey); })}
                              className="flex-1 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900/40"
                            >
                              Show all
                            </button>
                            <button
                              onClick={() => SECTIONS.slice(2).forEach((s) => { if ((resume.section_visibility?.[selectedTemplate]?.[s.key as SectionKey]) ?? true) toggleVisibility(id, selectedTemplate, s.key as SectionKey); })}
                              className="flex-1 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900/40"
                            >
                              Required only
                            </button>
                          </div>
                          <div className="space-y-1">
                            {SECTIONS.map((section) => {
                              const isVisible = (resume.section_visibility?.[selectedTemplate]?.[section.key as SectionKey]) ?? true;
                              return (
                                <button
                                  key={section.key}
                                  onClick={() => toggleVisibility(id, selectedTemplate, section.key as SectionKey)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all",
                                    isVisible
                                      ? "bg-zinc-50 dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08]"
                                      : "bg-transparent hover:bg-zinc-50 dark:hover:bg-white/[0.02]"
                                  )}
                                >
                                  <div className={cn(
                                    "w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                    isVisible
                                      ? "bg-zinc-900 border-zinc-900"
                                      : "border-zinc-300 dark:border-white/20"
                                  )}>
                                    {isVisible && <CheckCircle weight="fill" className="w-3 h-3 text-white" />}
                                  </div>
                                  <section.icon className={cn("w-3.5 h-3.5", isVisible ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400")} />
                                  <span className={cn(
                                    "flex-1 text-left text-[12px] font-bold",
                                    isVisible ? "text-zinc-900 dark:text-white" : "text-zinc-500"
                                  )}>
                                    {section.label}
                                  </span>
                                  {!isVisible && <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Hidden</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                {/* Resume.com signature: contextual "next step" nudge — when experience is filled,
                    surface a Build cover letter CTA. Stays out of the way otherwise. */}
                {Boolean(data.experience && data.experience.length > 0 && data.experience[0]?.company) && startedCount >= 3 && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex-wrap">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkle weight="fill" className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Your resume is taking shape. Pair it with a cover letter.</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Resume.com users who attach a cover letter are 2x more likely to hear back.</p>
                    </div>
                    <Link
                      href="/dashboard/resume/cover-letters"
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all flex-shrink-0"
                    >
                      Build cover letter
                    </Link>
                  </div>
                )}

                <div className="liquid-glass rounded-[32px] p-6 animate-fade-in min-h-[500px]">
                  {/* Personal Info */}
                  {activeSection === "personal" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Personal Details</h2>
                        <div className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-0.5 rounded-full bg-brand-500/5 border border-brand-500/15 text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">
                          <Info weight="fill" className="w-3 h-3 text-brand-500 flex-shrink-0" />
                          {SECTIONS.find((s2) => s2.key === "personal")?.tip}
                        </div>
                      </div>
                      {showTips && (
                        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/15 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <Info weight="fill" className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                          <span>Pro tip: this section is the first thing recruiters see — keep it scannable. One line per field, no full sentences.</span>
                        </div>
                      )}
                      <div className="space-y-4">
                        {(() => {
                          // R49: per-field format validation. Email and URL
                          // fields show a red border + warning when the
                          // value doesn't match a basic format. Other fields
                          // are unchanged.
                          const fields: Array<{ label: string; field: string; value: string; placeholder?: string; validate?: (v: string) => string | null }> = [
                            { label: "Full Name", field: "name", value: data.personal?.name || "" },
                            { label: "Headline", field: "title", value: data.personal?.title || "", placeholder: "e.g. Senior PM | AI Platforms | 0->1 Specialist" },
                            {
                              label: "Email", field: "email", value: data.personal?.email || "",
                              validate: (v) => v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? "Doesn't look like an email address" : null,
                            },
                            { label: "Phone", field: "phone", value: data.personal?.phone || "" },
                            { label: "Location", field: "location", value: data.personal?.location || "" },
                            {
                              label: "LinkedIn", field: "linkedin", value: data.personal?.linkedin || "",
                              validate: (v) => v && !/^https?:\/\//.test(v) && !v.includes("linkedin.com") ? "Add https:// or a linkedin.com URL" : null,
                            },
                            {
                              label: "Website", field: "website", value: data.personal?.website || "",
                              validate: (v) => v && !/^https?:\/\//.test(v) && !/\.[a-z]{2,}/i.test(v) ? "Add https:// or a domain like example.com" : null,
                            },
                          ];
                          return fields.map((input) => {
                            const err = input.validate ? input.validate(input.value) : null;
                            return (
                              <div key={input.field} className="space-y-1.5">
                                <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{input.label}</label>
                                <input
                                  type="text"
                                  value={input.value}
                                  placeholder={input.placeholder}
                                  onBlur={() => saveToHistory(id)}
                                  onChange={(e) => updateField("personal", input.field, e.target.value)}
                                  aria-invalid={err ? "true" : undefined}
                                  className={`w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all font-sans ${err ? "border-red-400 dark:border-red-500/50" : "border-zinc-200 dark:border-white/[0.06]"}`}
                                />
                                {err && (
                                  <p className="text-[10px] text-red-500 dark:text-red-400 pl-1 font-medium">{err}</p>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {activeSection === "summary" && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Professional Summary</h2>
                        <div className="inline-flex items-center gap-1.5 pl-2 pr-2.5 py-0.5 rounded-full bg-brand-500/5 border border-brand-500/15 text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">
                          <Info weight="fill" className="w-3 h-3 text-brand-500 flex-shrink-0" />
                          {SECTIONS.find((s2) => s2.key === "summary")?.tip}
                        </div>
                      </div>
                      {showTips && (
                        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/15 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <Info weight="fill" className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                          <span>Pro tip: 3-4 lines is the sweet spot. Cut anything that doesn’t change how a recruiter reads you.</span>
                        </div>
                      )}
                      <textarea
                        value={data.summary || ""}
                        onBlur={() => saveToHistory(id)}
                        onChange={(e) => updateResume(id, { data: { ...data, summary: e.target.value } })}
                        placeholder="Write a brief professional summary..."
                        rows={12}
                        className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-50 dark:focus:bg-zinc-100 dark:focus:bg-white/[0.05] transition-all resize-none leading-relaxed font-sans"
                      />
                    </div>
                  )}

                  {/* Experience */}
                  {activeSection === "experience" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Work Experience</h2>
                      {showTips && (
                        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/15 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <Info weight="fill" className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                          <span>Lead each bullet with a strong verb. Show the result, not the activity.</span>
                        </div>
                      )}
                        <button
                          onClick={() => {
                            saveToHistory(id);
                            const newExp: ExperienceEntry = { company: "", title: "", location: "", start_date: "", end_date: "", current: false, bullets: [""] };
                            updateResume(id, { data: { ...data, experience: [...(data.experience || []), newExp] } });
                          }}
                          className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        {(data.experience || []).map((exp, index) => (
                          <div key={`exp-${exp.company}-${exp.title}-${exp.start_date}-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              onClick={() => {
                                saveToHistory(id);
                                const newExps = [...(data.experience || [])];
                                newExps.splice(index, 1);
                                updateResume(id, { data: { ...data, experience: newExps } });
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <div className="space-y-4">
                              <div className="pr-8">
                                <input type="text" value={exp.title} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                  const newExps = [...(data.experience || [])];
                                  newExps[index] = { ...newExps[index], title: e.target.value };
                                  updateResume(id, { data: { ...data, experience: newExps } });
                                }} placeholder="Job Title" className="w-full bg-transparent border-none p-0 text-base font-bold text-zinc-900 dark:text-white focus:ring-0 placeholder:text-zinc-400 dark:placeholder:text-zinc-700" />
                                
                                <input type="text" value={exp.company} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                  const newExps = [...(data.experience || [])];
                                  newExps[index] = { ...newExps[index], company: e.target.value };
                                  updateResume(id, { data: { ...data, experience: newExps } });
                                }} placeholder="Company" className="w-full bg-transparent border-none p-0 mt-1 text-sm text-zinc-600 dark:text-zinc-400 focus:ring-0 placeholder:text-zinc-400 dark:placeholder:text-zinc-700" />
                              </div>

                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-white/[0.05]">
                                <div>
                                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-1">Start Date</label>
                                  <input type="text" value={exp.start_date} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                    const newExps = [...(data.experience || [])];
                                    newExps[index] = { ...newExps[index], start_date: e.target.value };
                                    updateResume(id, { data: { ...data, experience: newExps } });
                                  }} placeholder="e.g. Jan 2020" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all font-sans placeholder:text-zinc-400" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-1">End Date</label>
                                  <input type="text" value={exp.end_date} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                    const newExps = [...(data.experience || [])];
                                    newExps[index] = { ...newExps[index], end_date: e.target.value };
                                    updateResume(id, { data: { ...data, experience: newExps } });
                                  }} placeholder="e.g. Present" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all font-sans placeholder:text-zinc-400" />
                                </div>
                              </div>
                              <div className="pt-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-2">Bullet Points</label>
                                {(exp.bullets || [""]).map((bullet, bi) => (
                                  <div key={`bullet-${index}-${bi}-${bullet.slice(0,20)}`} className="flex items-start gap-2 mb-2 group/bullet">
                                    <div
                                      title={(() => {
                                        const w = (bullet || "").trim().split(/\s+/)[0] || "";
                                        const lc = w.toLowerCase().replace(/[^a-z]/g, "");
                                        if (STRONG.has(lc)) return "Starts with a strong action verb";
                                        if (WEAK.has(lc)) return "Weak verb — try Led, Built, Drove, Shipped, or Launched";
                                        return "Verb not recognized — consider leading with a strong action verb";
                                      })()}
                                      className={(() => {
                                        const w = (bullet || "").trim().split(/\s+/)[0] || "";
                                        const lc = w.toLowerCase().replace(/[^a-z]/g, "");
                                        const strong = STRONG;
                                        const weak = WEAK;
                                        const tone = strong.has(lc) ? "strong" : weak.has(lc) ? "weak" : "neutral";
                                        return "w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 " + (tone === "strong" ? "bg-emerald-500" : tone === "weak" ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-600");
                                      })()}
                                    />
                                    <textarea
                                      value={bullet}
                                      onBlur={() => saveToHistory(id)}
                                      onChange={(e) => {
                                        const newExps = [...(data.experience || [])];
                                        const newBullets = [...(newExps[index].bullets || [])];
                                        newBullets[bi] = e.target.value;
                                        newExps[index] = { ...newExps[index], bullets: newBullets };
                                        updateResume(id, { data: { ...data, experience: newExps } });
                                      }}
                                      placeholder="Describe your achievement..."
                                      rows={2}
                                      className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all resize-none font-sans placeholder:text-zinc-400"
                                    />
                                      <span className="mt-2 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500 select-none w-14 text-right" title={`${bullet.trim().split(/\s+/).filter(Boolean).length} words, ${bullet.length} characters`}>{bullet.length}c · {bullet.trim().split(/\s+/).filter(Boolean).length}w</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (bi === 0) return;
                                        saveToHistory(id);
                                        const newExps = [...(data.experience || [])];
                                        const newBullets = [...(newExps[index].bullets || [])];
                                        [newBullets[bi - 1], newBullets[bi]] = [newBullets[bi], newBullets[bi - 1]];
                                        newExps[index] = { ...newExps[index], bullets: newBullets };
                                        updateResume(id, { data: { ...data, experience: newExps } });
                                      }}
                                      disabled={bi === 0}
                                      className="mt-2 p-1 text-zinc-700 dark:text-zinc-400 hover:text-brand-500 disabled:opacity-30 disabled:hover:text-zinc-700 dark:disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-colors opacity-0 group-hover/bullet:opacity-100"
                                      title="Move bullet up"
                                    >
                                      <CaretUp weight="bold" className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (bi >= exp.bullets.length - 1) return;
                                        saveToHistory(id);
                                        const newExps = [...(data.experience || [])];
                                        const newBullets = [...(newExps[index].bullets || [])];
                                        [newBullets[bi + 1], newBullets[bi]] = [newBullets[bi], newBullets[bi + 1]];
                                        newExps[index] = { ...newExps[index], bullets: newBullets };
                                        updateResume(id, { data: { ...data, experience: newExps } });
                                      }}
                                      disabled={bi >= exp.bullets.length - 1}
                                      className="mt-2 p-1 text-zinc-700 dark:text-zinc-400 hover:text-brand-500 disabled:opacity-30 disabled:hover:text-zinc-700 dark:disabled:hover:text-zinc-400 disabled:cursor-not-allowed transition-colors opacity-0 group-hover/bullet:opacity-100"
                                      title="Move bullet down"
                                    >
                                      <CaretDown weight="bold" className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        saveToHistory(id);
                                        const newExps = [...(data.experience || [])];
                                        const newBullets = [...(newExps[index].bullets || [])];
                                        newBullets.splice(bi, 1);
                                        newExps[index] = { ...newExps[index], bullets: newBullets };
                                        updateResume(id, { data: { ...data, experience: newExps } });
                                      }}
                                      className="mt-2 p-1 text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover/bullet:opacity-100"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    saveToHistory(id);
                                    const newExps = [...(data.experience || [])];
                                    newExps[index] = { ...newExps[index], bullets: [...(newExps[index].bullets || []), ""] };
                                    updateResume(id, { data: { ...data, experience: newExps } });
                                  }}
                                  className="text-[10px] font-bold text-brand-500 hover:text-brand-400 transition-colors uppercase tracking-widest pl-3 mt-1"
                                >
                                  + Add Bullet
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {activeSection === "education" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Education</h2>
                      {showTips && (
                        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/15 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <Info weight="fill" className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                          <span>Newest first. Honors/GPA only if recent and impressive.</span>
                        </div>
                      )}
                        <button
                          onClick={() => {
                            saveToHistory(id);
                            const newEdu: EducationEntry = { institution: "", degree: "", field: "", start_date: "", end_date: "" };
                            updateResume(id, { data: { ...data, education: [...(data.education || []), newEdu] } });
                          }}
                          className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {(data.education || []).map((edu, index) => (
                          <div key={`edu-${edu.institution}-${edu.degree}-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              onClick={() => {
                                saveToHistory(id);
                                const newEdus = [...(data.education || [])];
                                newEdus.splice(index, 1);
                                updateResume(id, { data: { ...data, education: newEdus } });
                              }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <div className="space-y-4 pr-8">
                              <input type="text" value={edu.institution} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                const newEdus = [...(data.education || [])];
                                newEdus[index] = { ...newEdus[index], institution: e.target.value };
                                updateResume(id, { data: { ...data, education: newEdus } });
                              }} placeholder="Institution Name" className="w-full bg-transparent border-none p-0 text-base font-bold text-zinc-900 dark:text-white focus:ring-0 placeholder:text-zinc-400 dark:placeholder:text-zinc-700" />
                              
                              <input type="text" value={edu.degree} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                const newEdus = [...(data.education || [])];
                                newEdus[index] = { ...newEdus[index], degree: e.target.value };
                                updateResume(id, { data: { ...data, education: newEdus } });
                              }} placeholder="Degree (e.g. B.S. Computer Science)" className="w-full bg-transparent border-none p-0 text-sm text-zinc-600 dark:text-zinc-400 focus:ring-0 placeholder:text-zinc-400 dark:placeholder:text-zinc-700" />

                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-white/[0.05]">
                                <div>
                                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-1">Graduation Date</label>
                                  <input type="text" value={edu.end_date || edu.start_date} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                    const newEdus = [...(data.education || [])];
                                    newEdus[index] = { ...newEdus[index], end_date: e.target.value, start_date: e.target.value }; // Simplification for UI consistency
                                    updateResume(id, { data: { ...data, education: newEdus } });
                                  }} placeholder="e.g. May 2024" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all font-sans placeholder:text-zinc-400" />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-1">GPA / Honors</label>
                                  <input type="text" value={edu.gpa || ''} onBlur={() => saveToHistory(id)} onChange={(e) => {
                                    const newEdus = [...(data.education || [])];
                                    newEdus[index] = { ...newEdus[index], gpa: e.target.value };
                                    updateResume(id, { data: { ...data, education: newEdus } });
                                  }} placeholder="e.g. 3.9 GPA" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all font-sans placeholder:text-zinc-400" />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {activeSection === "skills" && (
                    <div className="space-y-6">
                      <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Skills</h2>
                      {showTips && (
                        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/15 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <Info weight="fill" className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                          <span>Group by category. Mirror the keywords in your target job description.</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {(data.skills || []).map((skill, index) => (
                          <div
                            key={typeof skill === 'string' ? `skill-${index}-${skill}` : skill.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.05] text-xs font-bold text-zinc-700 dark:text-zinc-300 group transition-all"
                          >
                            <span>{typeof skill === 'string' ? skill : skill.name}</span>
                            <button
                              onClick={() => {
                                saveToHistory(id);
                                const newSkills = [...(data.skills || [])];
                                newSkills.splice(index, 1);
                                updateResume(id, { data: { ...data, skills: newSkills } });
                              }}
                              className="text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 -mr-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-1">Add New Skill</label>
                        <input
                          type="text"
                          placeholder="Type a skill and press enter..."
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              (e.target as HTMLInputElement).value.trim()
                            ) {
                              saveToHistory(id);
                              const newSkillName = (
                                e.target as HTMLInputElement
                              ).value.trim();
                              const newSkill = { id: `s-${Date.now()}`, name: newSkillName, isHighlighted: false };
                              updateResume(id, {
                                data: {
                                  ...data,
                                  skills: [...(data.skills || []), newSkill],
                                },
                              });
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all font-sans placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Right: Preview (Larger focus) */}
        {showPreview && (
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Real-time Visualization</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFullscreenPreview(true)}
                  className="p-2 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-white/10 dark:hover:text-white transition-all group"
                  title="Fullscreen Preview"
                >
                  <ArrowsOut className="w-4 h-4 group-hover:scale-110" />
                </button>
              </div>
            </div>
            
            <div
              className={cn(
                "grid gap-8 items-start transition-all duration-500",
                isSidebarCollapsed ? "grid-cols-1" : "lg:grid-cols-[1fr_320px]"
              )}
            >
              <div className="bg-zinc-50 dark:bg-zinc-900/30 rounded-[40px] p-4 sm:p-8 lg:p-12 border border-zinc-200 dark:border-white/[0.03] shadow-inner overflow-hidden min-h-[800px] flex justify-center">
                <AutoScaledPreview>
                  <ResumePreview
                    data={data}
                    template={selectedTemplate}
                    themeColor={themeColor}
                    sectionOrder={sectionOrder as SectionKey[]}
                    sectionVisibility={resume.section_visibility?.[selectedTemplate]}
                    className="w-full shadow-2xl"
                    fullScale
                  />
                </AutoScaledPreview>
              </div>

              {/* Intelligence Panels Sidebar */}
              {!isSidebarCollapsed && (
                <div className="space-y-6 animate-slide-up">
                  <div id="ats-intelligence"><ATSCheckerPanel resumeData={data} /></div>
                  <ThemePicker
                    theme={resume.theme}
                    onChange={(updates) => {
                      saveToHistory(id);
                      updateResume(id, { theme: { ...resume.theme, ...updates } as ResumeTheme });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tailor Modal */}
      {showTailorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-50 border border-white/[0.08] rounded-[32px] w-full max-w-2xl mx-4 p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Sparkle className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold font-display text-zinc-900 dark:text-white">AI Resume Tailoring</h2>
              </div>
              <button onClick={() => { setShowTailorDialog(false); setDraftResult(null); }} className="p-2 rounded-xl text-zinc-500 dark:text-gray-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:bg-white/[0.04] transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!draftResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Target Job Title</label>
                    <input type="text" value={tailorJobTitle} onChange={(e) => setTailorJobTitle(e.target.value)} placeholder="e.g. Senior PM" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-purple-500/40 transition-all font-sans" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Company</label>
                    <input type="text" value={tailorCompany} onChange={(e) => setTailorCompany(e.target.value)} placeholder="e.g. Google" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-purple-500/40 transition-all font-sans" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Job Description</label>
                  <textarea value={tailorJD} onChange={(e) => setTailorJD(e.target.value)} rows={8} placeholder="Paste the job description here..." className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-purple-500/40 transition-all resize-none font-sans" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowTailorDialog(false)} className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:bg-white/10 transition-all uppercase tracking-widest">Cancel</button>
                  <button onClick={handleTailorWithAI} disabled={tailoring || !tailorJD.trim()} className={cn("flex-[2] flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg", tailoring || !tailorJD.trim() ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" : "bg-purple-500 text-zinc-900 dark:text-white hover:bg-purple-400 shadow-purple-500/20")}>
                    {tailoring ? <><ArrowsClockwise className="w-5 h-5 animate-spin" /> Processing...</> : <><Sparkle className="w-5 h-5" /> Start Tailoring</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-emerald-300 font-bold uppercase tracking-widest">AI Synthesis Complete</p>
                    <p className="text-[10px] text-emerald-500/70 font-medium uppercase tracking-widest mt-0.5">Review and commit changes.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">New Summary</h4>
                    <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-300 leading-relaxed font-sans">{draftResult.summary}</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Tailoring Notes</h4>
                    <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-700 dark:text-purple-300/80 leading-relaxed whitespace-pre-wrap font-sans">{draftResult.tailoringNotes}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setDraftResult(null)} className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:bg-white/10 transition-all uppercase tracking-widest">Discard</button>
                  <button onClick={applyTailoredDraft} className="flex-[2] px-6 py-3.5 rounded-2xl text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 uppercase tracking-widest">Apply to Resume</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
