"use client";

import { use, useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {Info, ArrowClockwise, ArrowCounterClockwise, ArrowLeft, ArrowRight, ArrowsClockwise, ArrowsIn, ArrowsOut, Briefcase, CalendarBlank, CheckCircle, Check, CaretDown, CaretUp, Clock, Copy, Lightbulb, MagicWand, WarningCircle, Eye, EyeSlash, FileText, FloppyDisk, ListChecks, TextT, Sidebar, GraduationCap, PenNib, Printer, User, Plus, Sparkle, Trash, Browser, Wrench, X, Target, Ruler, SquaresFour, DotsSixVertical, Star} from '@phosphor-icons/react';
import { useResumeStore } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import type { ExperienceEntry, EducationEntry, ResumeTheme, SectionKey, ResumeData } from "@/types";
import { DEFAULT_SECTION_VISIBILITY } from "@/types";
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
    history,
    toggleVisibility,
    resetToSample,
  } = useResumeStore();
  const { getProfileSummary } = useProfileStore();
  const resume = getResumeById(id);

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("personal");
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
  // R35: count the total number of experience bullets and how many include a
  // numeric metric. Walks the real `data.experience[*].bullets[*]` strings —
  // honest, no LLM.
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
    // R44: same first-word verb check as the R40 dot tinting.
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
    const verbSet = new Set<string>();
    for (const e of exp) {
      for (const b of (e.bullets || [])) {
        if (typeof b === "string" && b.trim()) {
          const fw = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
          if (fw) verbSet.add(fw);
        }
      }
    }
    return { total, withMetrics, short: shortCount, good: goodCount, long: longCount, strong: strongCount, verbDiversity: verbSet.size };
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

  // R70: latest role summary. Picks the experience entry with the most
  // recent start_date (YYYY-MM format) and surfaces title + company +
  // start-end range for the Experience section heading.
  const latestRole = (() => {
    const arr = (data as { experience?: Array<{ start_date?: string; end_date?: string; title?: string; company?: string }> }).experience || [];
    const parsed = arr
      .map((e) => ({ ...e, _key: (e.start_date || "") }))
      .filter((e) => /\d{4}-\d{2}/.test(e._key))
      .sort((a, b) => b._key.localeCompare(a._key));
    const top = parsed[0];
    if (!top) return null;
    const start = top.start_date || "";
    const end = top.end_date || "now";
    return { title: top.title || "Role", company: top.company || "Company", start, end };
  })();

  // R57: per-section completion map. Each base section is 0..1 based on
  // the same checks R38 uses. Lets the right-rail tab show a tiny progress
  // bar under the label so users see at a glance which sections are weak.
  const sectionProgress = (() => {
    const p = (data as { personal?: { name?: string; email?: string; phone?: string; location?: string; title?: string; linkedin?: string; website?: string } }).personal || {};
    const personalFields = [p.name, p.email, p.phone, p.location, p.title];
    const personalDone = personalFields.filter((v) => typeof v === "string" && v.trim()).length;
    const personalPct = personalDone / 5;
    const summaryLen = typeof data.summary === "string" ? data.summary.trim().length : 0;
    const summaryPct = Math.min(1, summaryLen / 200);
    const expArr = (data as { experience?: Array<{ bullets?: string[] }> }).experience || [];
    const expFilled = expArr.filter((e) => (e.bullets || []).some((b) => typeof b === "string" && b.trim())).length;
    const experiencePct = expArr.length === 0 ? 0 : Math.min(1, expFilled / expArr.length);
    const eduArr = (data as { education?: unknown[] }).education || [];
    const eduFilled = eduArr.filter((e) => {
      const inst = (e as { institution?: string }).institution;
      return typeof inst === "string" && inst.trim();
    }).length;
    const educationPct = eduArr.length === 0 ? 0 : Math.min(1, eduFilled / eduArr.length);
    const skillsArr = (data as { skills?: unknown[] }).skills || [];
    const skillsPct = Math.min(1, skillsArr.length / 8);
    return {
      personal: personalPct,
      summary: summaryPct,
      experience: experiencePct,
      education: educationPct,
      skills: skillsPct,
    } as Record<string, number>;
  })();

  // R48: next incomplete base section. Walks the same checks as
  // sectionStats in order, returns the first key that is not yet complete
  // (or null if all 5 are done).
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
      ["personal", personalOk],
      ["summary", summaryOk],
      ["experience", experienceOk],
      ["education", educationOk],
      ["skills", skillsOk],
    ];
    for (const [k, ok] of checks) {
      if (!ok) return k;
    }
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

  // R54: skills count. Walks the real skills array; isHighlighted is a
  // per-skill flag surfaced in the editor as the star toggle.
  const skillsCount = (() => {
    const arr = (data as { skills?: Array<{ isHighlighted?: boolean }> }).skills || [];
    return { total: arr.length, highlighted: arr.filter((s) => s.isHighlighted).length };
  })();

  // R67: skills used in bullets. Counts how many skills appear in at
  // least one experience bullet (case-insensitive whole-word match).
  const skillsUsage = (() => {
    const arr = (data as { skills?: Array<{ name?: string }> }).skills || [];
    const names = arr.map((s) => (s.name || "").trim()).filter(Boolean);
    if (names.length === 0) return null;
    const expArr = (data as { experience?: Array<{ bullets?: string[] }> }).experience || [];
    const allText = expArr
      .flatMap((e) => (e.bullets || []).map((b) => (typeof b === "string" ? b.toLowerCase() : "")))
      .join(" ");
    let used = 0;
    for (const name of names) {
      const re = new RegExp("\\b" + name.toLowerCase().replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&") + "\\b");
      if (re.test(allText)) used += 1;
    }
    return { used, total: names.length };
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

  // R33: inline title editing state. Click the H1 to enter edit mode,
  // Enter or blur saves, Escape cancels.
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(resume.title);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  // R61: brief "Saved" pulse. Tracks data identity; flips to true for
  // 1.6s whenever data changes, then back to false. The H1 renders a
  // small "Saved" badge while true. No fake timestamps; the effect
  // only fires on real data changes.
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    if (!resume.id) return;
    setJustSaved(true);
    const t = setTimeout(() => setJustSaved(false), 1600);
    return () => clearTimeout(t);
  }, [data, resume.id]);

  // R64: keyboard 1-5 to switch sections. R66: '?' opens a shortcut
  // popover. Both ignored when focus is in an input/textarea.
  const [showShortcuts, setShowShortcuts] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const map: Record<string, string> = { "1": "personal", "2": "summary", "3": "experience", "4": "education", "5": "skills" };
      const next = map[e.key];
      if (next) {
        e.preventDefault();
        setActiveSection(next);
        return;
      }
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowShortcuts((s) => !s);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);


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
  // R78: Cmd/Ctrl+S triggers the Save button. Stored in a ref so
  // the keyboard listener can stay stable (one registration) while
  // still always invoking the latest handleSave closure.
  const handleSaveRef = useRef<() => void>(() => {});
  handleSaveRef.current = handleSave;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleSaveRef.current();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);


  // R32: serialize the resume data as plain text for the "Copy as plain
  // text" action. Walks the same data the editor sees — no fabricated
  // content, no extra fields.
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
        // R22: record what this resume was tailored for so the sidebar widget
        // can show the targeted role + match score. Score is the current
        // completeness snapshot — deterministic, no fabricated AI number.
        tailoredFor: {
          jobTitle: tailorJobTitle || "Target Role",
          companyName: tailorCompany || "",
          score: completeness,
          appliedAt: new Date().toISOString(),
        },
      },
    });
    setDraftResult(null);
    setShowTailorDialog(false);
    setTailorJD("");
    toast.success("Tailored resume applied");
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

  const SECTIONS: Array<{ key: string; label: string; icon: typeof User; tip: string }> = [
    { key: "personal",   label: "Identity",   icon: User,         tip: "Name, email, phone, location — recruiters filter on this in 6 seconds." },
    { key: "summary",    label: "Summary",    icon: FileText,     tip: "Open with the role you want next. Quantify scope: team size, budget, ARR." },
    { key: "experience", label: "Experience", icon: Briefcase,    tip: "Lead each bullet with a strong verb. Show the result, not the activity." },
    { key: "education",  label: "Education",  icon: GraduationCap, tip: "Newest first. Honors/GPA only if recent (under 5 years) and impressive." },
    { key: "skills",     label: "Skills",     icon: Wrench,       tip: "Group by category. Mirror the keywords in your target job description." },
  ];

  // Content-only completeness score (resume.io's "ATS-friendly" promise, made visible).
  // We never call a model — this is just a fast count of filled fields, so the badge is honest.
  // Returns per-category points too, so the score ring can render a breakdown.
  const scoreBreakdown = useMemo(() => {
    let personal = 0;
    if (data.personal?.name) personal += 10;
    if (data.personal?.email) personal += 5;
    if (data.personal?.phone) personal += 5;
    let content = 0;
    if (data.summary && data.summary.length > 60) content += 15;
    if (data.experience && data.experience.length > 0) {
      const filled = data.experience.filter((e) => e.company && e.title && e.bullets && e.bullets.some((b) => b.trim().length > 10));
      content += Math.min(30, filled.length * 10);
    }
    if (data.education && data.education.length > 0 && data.education[0]?.institution) content += 15;
    let skills = 0;
    if (data.skills && data.skills.length >= 5) skills += 20;
    else if (data.skills && data.skills.length > 0) skills += 10;
    return { personal, content, skills, total: Math.min(100, personal + content + skills) };
  }, [data.personal, data.summary, data.experience, data.education, data.skills]);
  const completeness = scoreBreakdown.total;
  // R26: live body-text word count for the R23 meta footer. Same sweep as
  // flowcv R25: summary + experience bullets + education + skills, no
  // fabricated target. Typecast because ResumeData has a [key: string]: unknown
  // index signature that narrows the typed access.
  const wordCount = useMemo(() => {
    const d = data as {
      summary?: string;
      experience?: { bullets?: string[] }[];
      education?: { institution?: string; degree?: string; field?: string }[];
      skills?: { name?: string }[] | string[];
    };
    const count = (text: string) => text.split(/\s+/).filter(Boolean).length;
    let total = 0;
    if (d.summary) total += count(d.summary);
    (d.experience || []).forEach((e) => (e.bullets || []).forEach((b) => total += count(b)));
    (d.education || []).forEach((e) => {
      const text = [e.institution, e.degree, e.field].filter(Boolean).join(" ");
      if (text) total += count(text);
    });
    (d.skills || []).forEach((s) => {
      const name = typeof s === "string" ? s : s && s.name;
      if (name) total += count(name);
    });
    return total;
  }, [data.summary, data.experience, data.education, data.skills]);
  const completenessLabel = completeness >= 80 ? "ATS-friendly" : completeness >= 50 ? "Getting there" : "Needs content";
  const completenessColor = completeness >= 80 ? "text-emerald-400" : completeness >= 50 ? "text-amber-400" : "text-zinc-500";

  // Time-to-draft timer — resume.io's "A draft in 10 mins" promise, made visible.
  // Captures mount time in a ref so it doesn't reset on re-render; ticks every second
  // while the page is open so the editor pill stays fresh.
  const startedAtRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  // R27: timestamp of the last successful save. Used by the "Saved Xs ago"
  // pill in the title row so the user has a real, honest "last saved"
  // indicator next to the elapsed time-to-draft pill.
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  // Tick to refresh the relative-time label every 10s when lastSavedAt is set.
  const [, setSavedTick] = useState(0);
  useEffect(() => {
    if (!lastSavedAt) return;
    const id = setInterval(() => setSavedTick((n) => n + 1), 10000);
    return () => clearInterval(id);
  }, [lastSavedAt]);
  // R30: tick to refresh the "Synced Xm ago" label every 10s when lastSyncedAt is set.
  const syncedAt = (data as { lastSyncedAt?: string }).lastSyncedAt;
  const [, setSyncTick] = useState(0);
  useEffect(() => {
    if (!syncedAt) return;
    const id = setInterval(() => setSyncTick((n) => n + 1), 10000);
    return () => clearInterval(id);
  }, [syncedAt]);
  // R31: tick to refresh the "Last viewed Xm ago" label every 30s.
  const [, setViewedTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setViewedTick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const formatSavedAgo = (d: Date) => {
    const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };
  // R30: format a "Synced Xm ago" label for the profile-sync line in the
  // meta footer. Accepts an ISO string (matches data.lastSyncedAt).
  const formatSyncedAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 0) return "just now";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };
  // R31: format a "Last viewed Xm ago" label from the real `updated_at`
  // timestamp on the resume record. Honest because it uses the actual
  // last-saved timestamp — not a fabricated viewing event.
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
  useEffect(() => {
    const id = setInterval(() => setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const formatElapsed = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  // R24: live 'Xh ago' label for the meta footer's 'Last export' line.
  const [, setExportTick] = useState(0);
  useEffect(() => {
    if (!data.lastExportedAt) return;
    const id = setInterval(() => setExportTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, [data.lastExportedAt]);
  const formatLastExported = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 0) return "just now";
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    return `${day}d ago`;
  };
  // Draft-ready milestone — true once the user has been editing for 10+ minutes AND
  // the resume is at least 80% complete. The pill swaps to "Draft ready" in green.
  const draftReady = elapsedSec >= 600 && completeness >= 80;

  // AI coach popover state + canned suggestions. Same heuristics as the Quick Wins panel,
  // but rendered in a 'coach voice' that previews what the real model will say.
  const [coachOpen, setCoachOpen] = useState(false);

  // Skills auto-suggest — resume.io's signature affordance: scan experience bullets
  // + job titles for known tool/skill keywords and offer them as 1-click adds to the
  // skills list. No model call — just a curated keyword bank + case-insensitive match.
  // A real model-backed version can replace this later without changing the UI shape.
  const SKILL_BANK = [
    "JavaScript", "TypeScript", "Python", "Go", "Rust", "Java", "Kotlin", "Swift",
    "React", "Next.js", "Vue", "Svelte", "Node.js", "Django", "Flask", "FastAPI",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Snowflake", "BigQuery",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform",
    "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
    "Salesforce", "HubSpot", "Looker", "Tableau", "Mixpanel", "Amplitude",
    "Jira", "Asana", "Notion", "Linear", "Confluence",
    "SQL", "ETL", "A/B Testing", "SEO", "SEM", "CRO",
  ];
  const suggestedSkills = useMemo(() => {
    if (activeSection !== "skills") return [] as string[];
    const corpus = [
      data.summary || "",
      ...((data.experience || []).flatMap((e) => [e.title || "", e.company || "", ...(e.bullets || [])])),
    ].join(" ").toLowerCase();
    const existing = new Set((data.skills || []).map((s) => (typeof s === "string" ? s : s.name).toLowerCase()));
    return SKILL_BANK
      .filter((skill) => !existing.has(skill.toLowerCase()) && corpus.includes(skill.toLowerCase()))
      .slice(0, 5);
  }, [activeSection, data.summary, data.experience, data.skills]);
  const addSuggestedSkill = (skill: string) => {
    saveToHistory(id);
    updateResume(id, {
      data: {
        ...data,
        skills: [...(data.skills || []), { id: `s-${Date.now()}`, name: skill, isHighlighted: false }],
      },
    });
    toast.success(`Added "${skill}" to skills`);
  };
  const coachTips: { emoji: string; line: string; detail: string }[] = useMemo(() => {
    const tips: { emoji: string; line: string; detail: string }[] = [];
    if (!data.personal?.name) tips.push({ emoji: "✍️", line: "Add your name first", detail: "Recruiters filter by name. Without it, your resume is invisible." });
    else if (!data.personal?.email) tips.push({ emoji: "✉️", line: "Add an email", detail: "ATS systems need a way to contact you." });
    else if (!data.personal?.linkedin) tips.push({ emoji: "🔗", line: "Add your LinkedIn", detail: "Profiles with LinkedIn get 12% more recruiter views." });
    if (!data.summary || data.summary.length < 60) tips.push({ emoji: "📝", line: "Write a 60+ char summary", detail: "Open with the role you want next. Quantify scope." });
    if (!data.experience || data.experience.length === 0) tips.push({ emoji: "💼", line: "Add an experience entry", detail: "The experience block is the heart of every resume." });
    else {
      const noNumbers = data.experience.every((e) => !e.bullets || !e.bullets.some((b) => /\d|%|$|k\b|m\b/i.test(b)));
      if (noNumbers) tips.push({ emoji: "📊", line: "Add a number to one bullet", detail: "Quantified bullets (%, $, count) lift interview rates by 40%." });
    }
    if (!data.skills || data.skills.length < 5) tips.push({ emoji: "🎯", line: `Add ${5 - (data.skills?.length || 0)} more skills`, detail: "Resumes with 5+ skills get 27% more callbacks." });
    return tips.slice(0, 4);
  }, [data.personal, data.summary, data.experience, data.skills]);

  // Resume.io's "Quick Wins" — content-based, actionable suggestions with a section jump.
  // We cap at 3 items so the panel stays scannable. Each item has the section key the
  // "Fix" button jumps to.
  type QuickWin = { key: string; section: string; title: string; detail: string; points: number };
  const quickWins: QuickWin[] = useMemo(() => {
    const wins: QuickWin[] = [];
    if (!data.personal?.name) {
      wins.push({ key: "name", section: "personal", title: "Add your name", detail: "Recruiters filter by name first — keep it front and center.", points: 10 });
    } else if (!data.personal?.email) {
      wins.push({ key: "email", section: "personal", title: "Add an email", detail: "ATS systems and recruiters need a way to contact you.", points: 5 });
    } else if (!data.personal?.linkedin) {
      wins.push({ key: "linkedin", section: "personal", title: "Add your LinkedIn URL", detail: "Profiles with LinkedIn get 12% more recruiter views.", points: 4 });
    }
    if (!data.summary || data.summary.length < 60) {
      wins.push({ key: "summary", section: "summary", title: "Write a 60+ char summary", detail: "Open with the role you want next. Quantify scope: team size, budget, ARR.", points: 8 });
    }
    if (!data.experience || data.experience.length === 0) {
      wins.push({ key: "experience", section: "experience", title: "Add at least 1 experience entry", detail: "Even a short internship counts — the experience block is the heart of every resume.", points: 15 });
    } else {
      const weakBullets = data.experience.some((e) => !e.bullets || e.bullets.every((b) => !b.trim() || b.trim().length < 25));
      const noNumbers = data.experience.every((e) => !e.bullets || !e.bullets.some((b) => /\d|%|$|k\b|m\b/i.test(b)));
      if (weakBullets) {
        wins.push({ key: "bullets", section: "experience", title: "Strengthen your bullets", detail: "Lead with a strong verb. Show the result, not the activity.", points: 6 });
      } else if (noNumbers) {
        wins.push({ key: "numbers", section: "experience", title: "Add a number to one bullet", detail: "Quantified bullets (%, $, count) lift interview rates by 40%.", points: 5 });
      }
    }
    if (!data.skills || data.skills.length < 5) {
      const have = data.skills?.length || 0;
      wins.push({ key: "skills", section: "skills", title: `Add ${5 - have} more skills`, detail: "Resumes with 5+ skills get 27% more callbacks.", points: 5 });
    }
    return wins.slice(0, 3);
  }, [data.personal, data.summary, data.experience, data.skills]);
  const quickWinsScore = quickWins.reduce((sum, w) => sum + w.points, 0);

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
                <ExportButtons resumeData={data} resumeTitle={resume.title} onExport={(fmt) => updateResume(id, { data: { ...data, lastExportedAt: new Date().toISOString(), lastExportFormat: fmt } })} />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-zinc-900/50 p-12 flex justify-center relative">
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
              {/* Floating "Ask AI coach" pill — resume.io's signature */}
              <div className="sticky bottom-6 left-6 self-end z-30">
                <button className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-zinc-900/95 backdrop-blur text-white shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-[12px] font-semibold border border-white/10">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-[10px] font-bold text-zinc-900">AI</span>
                  Ask AI coach anything...
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible "Ask AI coach" pill — resume.io's signature, surfaced outside fullscreen. */}
      {!isFullscreenPreview && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
          {/* R15: ATS Perfect badge — surfaces the resume.io home-page "ATS Perfect"
              callout inline in the editor. Shows when completeness is at or above
              90%, which is the bar resume.io uses for its ATS-perfect claim. The
              pill mirrors the same emerald-500/10 styling as the AI coach's amber
              pill so the two read as a paired pair. */}
          {completeness >= 90 && (
            <div className="flex items-center gap-2 pl-3 pr-3.5 py-2 rounded-full bg-emerald-500/10 backdrop-blur border border-emerald-500/30 shadow-lg" title="Your resume passes the standard ATS readability bar.">
              <Target weight="fill" className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">ATS Perfect</span>
            </div>
          )}
          <button
            onClick={() => setCoachOpen(!coachOpen)}
            className="group flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-zinc-900/95 backdrop-blur text-white shadow-2xl hover:scale-[1.03] active:scale-95 transition-all text-[12px] font-semibold border border-white/10 hover:border-amber-300/40"
          >
            <span className="relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-zinc-900">
              <MagicWand weight="fill" className="w-3.5 h-3.5" />
              <span className="absolute inset-0 rounded-full bg-amber-300/40 animate-ping" />
            </span>
            Ask AI coach anything...
            <span className="hidden md:inline text-[9px] font-bold uppercase tracking-widest text-amber-300/80 ml-1 px-1.5 py-0.5 rounded bg-amber-300/10 border border-amber-300/20">Beta</span>
          </button>
          {coachOpen && (
            <div className="w-80 liquid-glass rounded-2xl border border-amber-500/20 shadow-2xl p-4 animate-fade-in bg-zinc-900/95 backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">AI coach — live preview</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Canned suggestions. Real model coming soon.</p>
                </div>
                <button onClick={() => setCoachOpen(false)} className="p-1 rounded text-zinc-500 hover:text-zinc-300" title="Close">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {coachTips.length === 0 ? (
                <div className="px-1 py-2 flex items-center gap-2 text-[11px] text-emerald-400">
                  <CheckCircle weight="fill" className="w-4 h-4" />
                  <span>Your resume looks great — nothing to coach on right now.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {coachTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-amber-500/30 transition-all">
                      <span className="text-base leading-none mt-0.5">{tip.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-white">{tip.line}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{tip.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
              {/* Time-to-draft pill — resume.io's "draft in 10 mins" claim, made honest. */}
              <span className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border",
                draftReady
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                  : elapsedSec >= 600
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300"
                    : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500"
              )}>
                {draftReady ? (
                  <>
                    <CheckCircle weight="fill" className="w-2.5 h-2.5" />
                    Draft ready · {formatElapsed(elapsedSec)}
                  </>
                ) : elapsedSec >= 600 ? (
                  <>
                    <WarningCircle weight="fill" className="w-2.5 h-2.5" />
                    Still polishing · {formatElapsed(elapsedSec)}
                  </>
                ) : (
                  <>
                    <Clock weight="regular" className="w-2.5 h-2.5" />
                    Editing · {formatElapsed(elapsedSec)}
                  </>
                )}
              </span>
              {/* R27: "Saved Xs ago" pill — real, computed from the
                  lastSavedAt timestamp set inside handleSave. Hidden
                  until the first save so we don't show a fabricated
                  timestamp. */}
              {lastSavedAt && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
                  title={lastSavedAt.toLocaleString()}
                >
                  <FloppyDisk weight="fill" className="w-2.5 h-2.5" />
                  Saved {formatSavedAgo(lastSavedAt)}
                </span>
              )}
            </div>
            {/* R33: Inline editable title. Click the H1 to edit in place;
                Enter or blur saves via updateResume, Escape cancels. Uses the
                real resume.title field — no separate draft title. */}
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
                {justSaved && (
                  <span role="status" aria-live="polite" className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest animate-fade-in" title="Changes saved">
                    <Check weight="bold" className="w-2.5 h-2.5" />
                    Saved
                  </span>
                )}
              </h1>
            )}
            {sectionStats.complete === sectionStats.total && sectionStats.total > 0 && (
              <div
                role="status"
                aria-live="polite"
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest"
                title="All 5 base sections have content"
              >
                <CheckCircle weight="duotone" className="w-3 h-3" />
                All 5 sections complete — ready to export
              </div>
            )}
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Last edited {formatViewedAgo(resume.updated_at)}
              {staleness && <span role="status" aria-live="polite" className="text-amber-600 dark:text-amber-400 font-medium" title={staleness.title}>{staleness.label}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
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

          <ExportButtons resumeData={data} resumeTitle={resume.title} />

          {/* R28: Print button - one-tap browser print dialog. PDF/DOCX/TXT
              still route through ExportButtons; this is for users who just
              want a quick print without re-rendering. Mirror of flowcv R27. */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-all"
            title="Print this resume"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Print</span>
          </button>
          {/* R32: Copy as plain text - one-tap clipboard write. */}
          <button
            type="button"
            onClick={handleCopyAsText}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-all"
            title="Copy this resume as plain text to your clipboard"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Copy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm("Reset this resume to the original sample data? Your current edits will be lost.")) {
                saveToHistory(id);
                resetToSample(id);
                toast.success("Reset to the original sample data.");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-all"
            title="Restore the original sample data \u2014 your current changes will be lost"
          >
            <ArrowCounterClockwise className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Reset</span>
          </button>
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
            <span className="uppercase tracking-widest text-[11px]">{saved ? "Saved" : "Save"}</span>
          </button>
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
                <div className="flex flex-wrap gap-1.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] rounded-2xl p-1.5">
                  {SECTIONS.map((section) => {
                    const isVisible = (resume.section_visibility?.[selectedTemplate]?.[section.key as SectionKey]) ?? true;
                    return (
                      <div key={section.key} className="flex items-center gap-1 mb-1">
                        <button
                          onClick={() => setActiveSection(section.key)}
                          title={section.tip}
                          aria-current={activeSection === section.key ? "page" : undefined}
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
                          {/* R57: 1px progress bar under the label. */}
                          <span
                            className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-zinc-200 dark:bg-white/[0.06] overflow-hidden rounded-full"
                            aria-hidden="true"
                          >
                            <span
                              className="block h-full bg-indigo-500 dark:bg-indigo-400 transition-all"
                              style={{ width: `${Math.round((sectionProgress[section.key] ?? 0) * 100)}%` }}
                            />
                          </span>
                        </button>
                        <div className="flex items-center gap-0.5">
                          <div className="flex flex-col gap-0.5">
                            <button onClick={() => moveSection(id, section.key as SectionKey, "up")} className="p-0.5 hover:bg-zinc-200 dark:hover:bg-white/5 rounded text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300">
                              <CaretUp className="w-3 h-3" />
                            </button>
                            <button onClick={() => moveSection(id, section.key as SectionKey, "down")} className="p-0.5 hover:bg-zinc-200 dark:hover:bg-white/5 rounded text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300">
                              <CaretDown className="w-3 h-3" />
                            </button>
                          </div>
                          {/* R69: drag grip — visual cue only. */}
                          <span className="p-0.5 text-zinc-300 dark:text-zinc-700 cursor-grab select-none" title="Section is reorderable — use the arrows above or wait for drag-and-drop" aria-hidden="true">
                            <DotsSixVertical weight="bold" className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="liquid-glass rounded-[32px] p-6 animate-fade-in min-h-[500px]">
                  {/* Personal Info */}
                  {activeSection === "personal" && (
                    <div className="space-y-6" role="region" aria-labelledby="sec-personal">
                      <h2 id="sec-personal" className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Personal Details</h2>
                      {!(data.personal?.name || data.personal?.email) && (
                        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-white/[0.1] p-5 space-y-3 bg-zinc-50/50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-500" weight="duotone" />
                            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Start with name and email</h3>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">Recruiters filter on these in the first 6 seconds. Add your phone and location once you have name + email in.</p>
                        </div>
                      )}
                      <div className="space-y-4">
                        {(() => {
                          // R49: per-field format validation. Email and URL
                          // fields show a red border + warning when the
                          // value doesn't match a basic format. Other fields
                          // are unchanged.
                          const fields: Array<{ label: string; field: string; value: string; validate?: (v: string) => string | null }> = [
                            { label: "Full Name", field: "name", value: data.personal?.name || "" },
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
                    <div className="space-y-6" role="region" aria-labelledby="sec-summary">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 id="sec-summary" className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Professional Summary</h2>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] text-[10px] text-zinc-600 dark:text-zinc-400" title={SECTIONS.find((s) => s.key === "summary")?.tip ?? ""}>
                          <Info weight="fill" className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                          <span className="max-w-xs truncate">{SECTIONS.find((s) => s.key === "summary")?.tip ?? ""}</span>
                        </span>
                      </div>
                      {!data.summary && (
                        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-white/[0.1] p-5 space-y-3 bg-zinc-50/50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-zinc-500" weight="duotone" />
                            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">No summary yet — try one of these</h3>
                          </div>
                          <div className="space-y-2">
                            {[
                              'Senior product leader with 8+ years shipping AI/ML platforms and ad-tech at scale. Led teams of 12+ to launch products reaching 40M MAU. Ex-TikTok, ex-Meta.',
                              'Staff PM with deep ad-tech chops. Owned a $200M revenue line, grew it 3x in 18 months. Strong on ML platform products and cross-functional execution.',
                              'Engineering leader turned PM. 10 years building infra, last 5 in product. Specializes in taking 0→1 products to PMF with data-driven iteration.',
                            ].map((ex, i) => (
                              <button
                                key={'ex-' + i}
                                type="button"
                                onClick={() => updateResume(id, { data: { ...data, summary: ex } })}
                                className="block w-full text-left text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 px-3 py-2 rounded-lg border border-zinc-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-brand-500/40 hover:text-zinc-900 dark:hover:text-white transition-all"
                                title="Click to use this example"
                              >
                                {ex}
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Click an example to drop it in, then edit it. Or just start typing — your real voice is the goal.</p>
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
                    <div className="space-y-6" role="region" aria-labelledby="sec-experience">
                      <div className="flex items-center justify-between">
                        <h2 id="sec-experience" className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Work Experience</h2>{latestRole && (<span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] text-[10px] text-zinc-600 dark:text-zinc-400 normal-case tracking-normal font-medium" title={`${latestRole.title} at ${latestRole.company} (${latestRole.start} - ${latestRole.end})`}> <ArrowRight weight="duotone" className="w-3 h-3" /> Latest: {latestRole.title} @ {latestRole.company} ({latestRole.start} - {latestRole.end}) </span>)}
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
                        {(data.experience || []).length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-white/[0.1] p-8 text-center space-y-3 bg-zinc-50/50 dark:bg-white/[0.02]">
                            <Briefcase className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto" weight="duotone" />
                            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No work experience yet</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">Add your most recent role first. Lead each bullet with a strong verb and quantify the result.</p>
                            <button
                              type="button"
                              onClick={() => {
                                saveToHistory(id);
                                const newExp: ExperienceEntry = { company: "", title: "", location: "", start_date: "", end_date: "", current: false, bullets: [""] };
                                updateResume(id, { data: { ...data, experience: [...(data.experience || []), newExp] } });
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Add your first role
                            </button>
                          </div>
                        ) : (
                          (data.experience || []).map((exp, index) => (
                          <div key={`exp-${exp.company}-${exp.title}-${exp.start_date}-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              type="button"
                              onClick={() => {
                                saveToHistory(id);
                                const newExps = [...(data.experience || [])];
                                const cloned = JSON.parse(JSON.stringify(exp));
                                newExps.splice(index + 1, 0, cloned);
                                updateResume(id, { data: { ...data, experience: newExps } });
                                toast.success("Duplicated. Edit the copy below.");
                              }}
                              className="absolute top-4 right-12 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-400 opacity-0 group-hover/item:opacity-100 transition-all"
                              title="Duplicate this experience entry \u2014 a deep copy appears below"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
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
                                  {/* R76: "current role" toggle. When
                                      on, the end_date is treated as "now"
                                      and the input is locked. */}
                                  <label className="mt-1.5 flex items-center gap-2 pl-1 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={!!exp.current}
                                      onChange={(e) => {
                                        saveToHistory(id);
                                        const newExps = [...(data.experience || [])];
                                        newExps[index] = { ...newExps[index], current: e.target.checked };
                                        updateResume(id, { data: { ...data, experience: newExps } });
                                      }}
                                      className="w-3.5 h-3.5 rounded border-zinc-300 text-brand-500 focus:ring-brand-500/30"
                                    />
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Role</span>
                                  </label>
                              </div>
                              {(() => {
                                // R58: date sanity check. Only fires when
                                // both dates match the YYYY-MM pattern so
                                // free-text inputs (e.g. "Present") are
                                // never flagged.
                                const sm = /^(\d{4})-(\d{2})$/.exec(exp.start_date || "");
                                const em = /^(\d{4})-(\d{2})$/.exec(exp.end_date || "");
                                if (!sm || !em) return null;
                                const s = Number(sm[1]) * 12 + Number(sm[2]);
                                const e = Number(em[1]) * 12 + Number(em[2]);
                                if (s >= e) return null;
                                return (
                                  <p className="mt-1 text-[10px] text-red-500 dark:text-red-400 pl-1 font-medium" title="Start date is after end date">Start date is after end date — please check</p>
                                );
                              })()}
                              <div className="pt-2">
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-2">
                                  Bullet Points
                                  {((exp.bullets || []).filter((b) => typeof b === "string" && b.trim()).length > 6) && (
                                    <span className="ml-2 text-amber-600 dark:text-amber-400 normal-case tracking-normal font-medium" title="Recruiters spend ~6 seconds on a resume; 5-6 bullets is the sweet spot">· {(exp.bullets || []).filter((b) => typeof b === "string" && b.trim()).length} bullets — consider trimming</span>
                                  )}
                                </label>
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
                                    {(() => {
                                      // R59: bullet-typo check. Flag a bullet
                                      // whose first non-whitespace character is
                                      // a lowercase letter — common resume typo
                                      // ("managed" instead of "Managed").
                                      const first = (bullet || "").trim().charAt(0);
                                      if (!first || !/[a-z]/.test(first)) return null;
                                      return <span className="mt-2 flex-shrink-0" title="Starts with a lowercase letter — capitalize the first word for a polished look"><PenNib weight="duotone" className="w-3 h-3 text-amber-500" aria-hidden="true" /></span>;
                                    })()}
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
                                      aria-label="Delete bullet"
                                      title="Delete bullet"
                                      className="mt-2 p-1 text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover/bullet:opacity-100"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                                <div className="flex items-center gap-3 mt-1 pl-3">
                                  <button
                                    onClick={() => {
                                      saveToHistory(id);
                                      const newExps = [...(data.experience || [])];
                                      const oldBullets = newExps[index].bullets || [];
                                      // R65: capitalize first letter of each non-empty bullet.
                                      const cap = (s: string) => {
                                        const t = s.trimStart();
                                        if (!t) return s;
                                        return s.slice(0, s.length - t.length) + t.charAt(0).toUpperCase() + t.slice(1);
                                      };
                                      newExps[index] = { ...newExps[index], bullets: oldBullets.map(cap) };
                                      updateResume(id, { data: { ...data, experience: newExps } });
                                    }}
                                    className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-brand-500 transition-colors uppercase tracking-widest"
                                    title="Capitalize the first letter of every bullet in this role"
                                  >
                                    Capitalize all
                                  </button>
                                  <button
                                    onClick={() => {
                                      saveToHistory(id);
                                      const newExps = [...(data.experience || [])];
                                      newExps[index] = { ...newExps[index], bullets: [...(newExps[index].bullets || []), ""] };
                                      updateResume(id, { data: { ...data, experience: newExps } });
                                    }}
                                    className="text-[10px] font-bold text-brand-500 hover:text-brand-400 transition-colors uppercase tracking-widest"
                                  >
                                    + Add Bullet
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {activeSection === "education" && (
                    <div className="space-y-6" role="region" aria-labelledby="sec-education">
                      <div className="flex items-center justify-between">
                        <h2 id="sec-education" className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Education</h2>
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
                        {(data.education || []).length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-white/[0.1] p-8 text-center space-y-3 bg-zinc-50/50 dark:bg-white/[0.02]">
                            <GraduationCap className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto" weight="duotone" />
                            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No education yet</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">Add your highest degree first. Honors or GPA only if recent and impressive.</p>
                            <button
                              type="button"
                              onClick={() => {
                                saveToHistory(id);
                                const newEdu: EducationEntry = { institution: "", degree: "", field: "" };
                                updateResume(id, { data: { ...data, education: [...(data.education || []), newEdu] } });
                              }}
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                              Add your first school
                            </button>
                          </div>
                        ) : (
                          (data.education || []).map((edu, index) => (
                          <div key={`edu-${edu.institution}-${edu.degree}-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              type="button"
                              onClick={() => {
                                saveToHistory(id);
                                const newEdus = [...(data.education || [])];
                                const cloned = JSON.parse(JSON.stringify(edu));
                                newEdus.splice(index + 1, 0, cloned);
                                updateResume(id, { data: { ...data, education: newEdus } });
                                toast.success("Duplicated. Edit the copy below.");
                              }}
                              className="absolute top-4 right-12 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 hover:text-brand-500 dark:hover:text-brand-400 opacity-0 group-hover/item:opacity-100 transition-all"
                              title="Duplicate this education entry \u2014 a deep copy appears below"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
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
                        ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {activeSection === "skills" && (
                    <div className="space-y-6" role="region" aria-labelledby="sec-skills">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                        <h2 id="sec-skills" className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Skills</h2>
                        {skillsUsage && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.06] text-[10px] text-zinc-600 dark:text-zinc-400"
                            title={`${skillsUsage.used} of ${skillsUsage.total} skills appear in at least one experience bullet`}
                          >
                            <Wrench weight="duotone" className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                            <span className="font-bold">{skillsUsage.used}/{skillsUsage.total} used in bullets</span>
                          </span>
                        )}
                      </div>
                      </div>
                      {/* Auto-suggest strip — resume.io's "extract skills from your experience" affordance.
                          Scans the user's bullets and offers 1-click adds for any matches. */}
                      {suggestedSkills.length > 0 && (
                        <div className="p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                          <div className="flex items-center gap-2">
                            <Sparkle weight="fill" className="w-3.5 h-3.5 text-amber-500" />
                            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">
                              {suggestedSkills.length} suggested from your experience
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {suggestedSkills.map((s) => (
                              <button
                                key={s}
                                onClick={() => addSuggestedSkill(s)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-white/[0.04] border border-amber-500/30 text-zinc-700 dark:text-zinc-300 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-all"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {(data.skills || []).length === 0 && (
                          <div className="w-full rounded-2xl border border-dashed border-zinc-300 dark:border-white/[0.1] p-8 text-center space-y-3 bg-zinc-50/50 dark:bg-white/[0.02]">
                            <Wrench className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto" weight="duotone" />
                            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No skills yet</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">List 8-12 skills. Mirror the keywords in your target job description. Star the ones you want to emphasize.</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Type or paste below — comma or new-line separated lists work too.</p>
                          </div>
                        )}
                        {(data.skills || []).map((skill, index) => {
                          const isHighlighted = typeof skill !== 'string' && !!skill.isHighlighted;
                          const name = typeof skill === 'string' ? skill : skill.name;
                          return (
                          <div
                            key={typeof skill === 'string' ? `skill-${index}-${skill}` : skill.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold group transition-all ${isHighlighted ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300" : "bg-zinc-100 dark:bg-white/[0.05] border-zinc-200 dark:border-white/[0.05] text-zinc-700 dark:text-zinc-300"}`}
                          >
                            {/* R75: star toggle for highlight */}
                            <button
                              type="button"
                              onClick={() => {
                                saveToHistory(id);
                                const newSkills = [...(data.skills || [])];
                                if (typeof newSkills[index] === 'string') {
                                  newSkills[index] = { id: `s-${Date.now()}-${index}`, name: newSkills[index] as string, isHighlighted: true };
                                } else {
                                  newSkills[index] = { ...(newSkills[index] as { id: string; name: string; isHighlighted?: boolean }), isHighlighted: !isHighlighted };
                                }
                                updateResume(id, { data: { ...data, skills: newSkills } });
                              }}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                              title={isHighlighted ? "Unmark as highlighted" : "Mark as a highlight skill"}
                            >
                              <Star weight={isHighlighted ? "fill" : "regular"} className={`w-3.5 h-3.5 ${isHighlighted ? "text-amber-500" : "text-zinc-500 dark:text-zinc-400"}`} />
                            </button>
                            <span>{name}</span>
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
                          );
                        })}
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 mb-1">Add New Skill</label>
                        <input
                          type="text"
                          placeholder="Type or paste skills, separate with commas or new lines..."
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              (e.target as HTMLInputElement).value.trim()
                            ) {
                              saveToHistory(id);
                              // R74: accept comma- or newline-separated
                              // lists so the user can paste a long skill
                              // inventory in one go.
                              const raw = (e.target as HTMLInputElement).value.trim();
                              const parts = raw.split(/[,\n]+/).map((p) => p.trim()).filter(Boolean);
                              if (parts.length === 0) return;
                              const now = Date.now();
                              const newSkills = parts.map((name, i) => ({
                                id: `s-${now}-${i}`,
                                name,
                                isHighlighted: false,
                              }));
                              updateResume(id, {
                                data: {
                                  ...data,
                                  skills: [...(data.skills || []), ...newSkills],
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
                {/* Resume.io-style score ring — visualizes the "ATS-friendly" promise. */}
                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-zinc-200 dark:border-white/10">
                  <div className="relative w-9 h-9 flex items-center justify-center">
                    <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-white/10" />
                      <circle
                        cx="18" cy="18" r="15" fill="none"
                        stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${(completeness / 100) * 94.25} 94.25`}
                        className={cn(completenessColor, "transition-all duration-500")}
                      />
                    </svg>
                    <span className={cn("absolute text-[9px] font-bold", completenessColor)}>{completeness}</span>
                  </div>
                  <div className="hidden sm:flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[9px] font-bold uppercase tracking-widest", completenessColor)}>{completenessLabel}</span>
                      <span className="text-[9px] text-zinc-500">content completeness</span>
                    </div>
                    {/* Category breakdown — 3-segment bar so the score isn't a black box. */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { key: "personal", label: "Personal", points: scoreBreakdown.personal, max: 20, color: "bg-sky-400" },
                        { key: "content",  label: "Content",  points: scoreBreakdown.content,  max: 60, color: "bg-indigo-400" },
                        { key: "skills",   label: "Skills",   points: scoreBreakdown.skills,   max: 20, color: "bg-violet-400" },
                      ].map((seg) => {
                        const pct = Math.min(100, (seg.points / seg.max) * 100);
                        return (
                          <div key={seg.key} className="flex flex-col gap-0.5" title={`${seg.label}: ${seg.points}/${seg.max}`}>
                            <div className="w-10 h-1 rounded-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
                              <div className={cn("h-full transition-all duration-500", seg.color)} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
                  {/* R20: "Boost your score" — the single highest-impact quick win
                      promoted to its own CTA card above the Quick Wins panel. Mirrors
                      resume.io's "magic resume" callout but stays deterministic
                      (just picks the top points earner from the existing quickWins). */}
                  {quickWins.length > 0 && (() => {
                    const top = [...quickWins].sort((a, b) => b.points - a.points)[0];
                    return (
                      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-5">
                        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                        <div className="relative flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                            <Sparkle weight="fill" className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">Boost your score</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                +{top.points} pts
                              </span>
                            </div>
                            <p className="text-[12px] font-bold text-zinc-900 dark:text-white mt-1.5 leading-snug">{top.title}</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{top.detail}</p>
                            <button
                              onClick={() => setActiveSection(top.section)}
                              className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors"
                            >
                              Fix now
                              <ArrowRight className="w-3 h-3" weight="bold" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  {/* R21: Section Visibility — resume.io signature: per-template toggle
                      for each of the 11 sections. Reads from
                      resume.section_visibility[template] (defaulting to all-true
                      for templates that have no override), and writes back via
                      the store's toggleVisibility action. Visual: green eye icon
                      when visible, dimmed EyeSlash when hidden. */}
                  <div className="liquid-glass rounded-3xl border border-zinc-200 dark:border-white/[0.05] overflow-hidden">
                    <div className="w-full flex items-center justify-between p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Eye weight="duotone" className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white block">Section Visibility</span>
                          <span className="text-[10px] text-zinc-500">
                            {Object.values(resume.section_visibility?.[selectedTemplate] || DEFAULT_SECTION_VISIBILITY).filter(Boolean).length} of 11 visible
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 pb-3 grid grid-cols-2 gap-1">
                      {(["summary", "experience", "education", "skills", "technicalSkills", "languages", "certifications", "projects", "photo", "portfolio", "visaStatus"] as SectionKey[]).map((sk) => {
                        const isVisible = (resume.section_visibility?.[selectedTemplate]?.[sk] ?? true);
                        const labels: Record<SectionKey, string> = {
                          summary: "Summary", experience: "Experience", education: "Education",
                          skills: "Skills", technicalSkills: "Tech Skills", languages: "Languages",
                          certifications: "Certifications", projects: "Projects", photo: "Photo",
                          portfolio: "Portfolio", visaStatus: "Visa",
                        };
                        return (
                          <button
                            key={sk}
                            onClick={() => toggleVisibility(id, selectedTemplate, sk)}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] transition-colors ${isVisible ? "text-zinc-700 dark:text-zinc-200 hover:bg-emerald-500/5" : "text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/[0.03]"}`}
                            title={isVisible ? `Hide ${labels[sk]} from this template` : `Show ${labels[sk]} on this template`}
                          >
                            {isVisible
                              ? <Eye weight="regular" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              : <EyeSlash weight="regular" className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />}
                            <span className={`truncate ${isVisible ? "font-semibold" : "font-medium line-through"}`}>{labels[sk]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                                    {/* R22: Last tailored job — only renders when the user has actually
                      run the AI Tailor flow on this resume. Shows the targeted
                      job + company, a deterministic match score, and a one-click
                      Re-tailor shortcut. Sits above Quick Wins so the sidebar
                      reads top-to-bottom: visibility -> target role -> actions
                      -> your assets -> score. */}
                  {(data as { tailoredFor?: { jobTitle: string; companyName: string; score: number; appliedAt: string } }).tailoredFor && (() => {
                    const tf = (data as { tailoredFor: { jobTitle: string; companyName: string; score: number; appliedAt: string } }).tailoredFor;
                    return (
                      <div className="liquid-glass rounded-3xl border border-zinc-200 dark:border-white/[0.05] overflow-hidden">
                        <div className="p-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                            <Target weight="duotone" className="w-4 h-4 text-fuchsia-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white block">Tailored For</span>
                            <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                              {tf.jobTitle}{tf.companyName ? ` · ${tf.companyName}` : ""}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border border-fuchsia-500/30 flex-shrink-0">
                            {tf.score}%
                          </span>
                        </div>
                        <div className="px-5 pb-5 space-y-3">
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                            <Clock weight="regular" className="w-3 h-3" />
                            <span>Last applied {formatViewedAgo(tf.appliedAt)}</span>
                          </div>
                          <button
                            onClick={() => setShowTailorDialog(true)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/20 hover:bg-fuchsia-500/20 transition-all"
                          >
                            <Sparkle weight="fill" className="w-3 h-3" />
                            Re-tailor for a new role
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                                    {/* Resume.io signature: Quick Wins — 3 specific, actionable improvements. */}
                  <div className="liquid-glass rounded-3xl border border-zinc-200 dark:border-white/[0.05] overflow-hidden">
                    <div className="w-full flex items-center justify-between p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Lightbulb weight="fill" className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white block">Quick Wins</span>
                          <span className="text-[10px] text-zinc-500">+{quickWinsScore} points if you fix all</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{quickWins.length} open</span>
                    </div>
                    {quickWins.length === 0 ? (
                      <div className="px-5 pb-5 flex items-center gap-2 text-[11px] text-emerald-400">
                        <CheckCircle weight="fill" className="w-4 h-4" />
                        <span>All caught up — your resume looks great.</span>
                      </div>
                    ) : (
                      <div className="px-5 pb-5 space-y-2">
                        {quickWins.map((win) => (
                          <div key={win.key} className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.04] hover:border-amber-500/30 transition-all group">
                            <ListChecks weight="bold" className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-zinc-900 dark:text-white">{win.title}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{win.detail}</p>
                            </div>
                            <button
                              onClick={() => setActiveSection(win.section)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                            >
                              Fix
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* R18: Top Skills auto-tagged — resume.io's "skills radar".
                      Reads the resume's existing skills array (deterministic — no
                      LLM), shows top 8 with rank numbers, and links into the Skills
                      section for editing. Sits between Quick Wins and ATS so the
                      sidebar reads top-to-bottom: actions -> your assets -> score. */}
                  <div className="liquid-glass rounded-3xl border border-zinc-200 dark:border-white/[0.05] overflow-hidden">
                    <div className="w-full flex items-center justify-between p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <Sparkle weight="fill" className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white block">Top Skills</span>
                          <span className="text-[10px] text-zinc-500">{Math.min(8, (data.skills || []).length)} of {(data.skills || []).length} auto-tagged</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveSection("skills")}
                        className="text-[10px] font-bold uppercase tracking-widest text-violet-500 hover:text-violet-400 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="px-5 pb-5 space-y-1.5">
                      {(data.skills || []).slice(0, 8).map((sk, i) => (
                        <div
                          key={sk.id}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-white/[0.02] transition-colors group"
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${sk.isHighlighted ? "bg-violet-500/15 text-violet-500 border border-violet-500/30" : "bg-zinc-100 dark:bg-white/[0.04] text-zinc-500 border border-zinc-200 dark:border-white/[0.06]"}`}>
                            {i + 1}
                          </span>
                          <span className={`text-[12px] flex-1 truncate ${sk.isHighlighted ? "font-bold text-zinc-900 dark:text-white" : "font-medium text-zinc-700 dark:text-zinc-300"}`}>
                            {sk.name}
                          </span>
                          {sk.isHighlighted && (
                            <CheckCircle weight="fill" className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                      {(data.skills || []).length === 0 && (
                        <div className="text-[11px] text-zinc-500 text-center py-3">
                          No skills yet — add a few in the Skills section.
                        </div>
                      )}
                    </div>
                  </div>
                  {/* R19: Resume Length — body-text word count + page estimate.
                      Deterministic walk of the resume data; no model call. Sits
                      between Top Skills and ATS so the sidebar reads
                      actions -> your assets -> size -> score. */}
                  {(() => {
                    const parts: string[] = [];
                    if (data.summary) parts.push(data.summary);
                    (data.experience || []).forEach((e) => (e.bullets || []).forEach((b) => parts.push(b)));
                    (data.projects || []).forEach((p) => { if (p.description) parts.push(p.description); });
                    const bodyWords = parts.join(" ").split(/\s+/).filter(Boolean).length;
                    // 1 page ≈ 450 body words; 2 pages ≈ 1000. Source: typical US resume norms.
                    const pages = bodyWords < 200 ? "Under 1 page" : bodyWords <= 600 ? "1 page" : bodyWords <= 1100 ? "2 pages" : "2+ pages";
                    const pct = Math.min(100, Math.round((bodyWords / 1100) * 100));
                    return (
                      <div className="liquid-glass rounded-3xl border border-zinc-200 dark:border-white/[0.05] overflow-hidden">
                        <div className="w-full flex items-center justify-between p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                              <FileText weight="duotone" className="w-4 h-4 text-sky-400" />
                            </div>
                            <div>
                              <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white block">Resume Length</span>
                              <span className="text-[10px] text-zinc-500">{bodyWords.toLocaleString()} body words · {pages}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500">{pct}%</span>
                        </div>
                        <div className="px-5 pb-5 space-y-2">
                          <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-white/[0.04] overflow-hidden">
                            <div
                              className={`h-full transition-all ${bodyWords <= 600 ? "bg-emerald-500" : bodyWords <= 1100 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">
                            {bodyWords < 200
                              ? "Add a summary and 1–2 bullets per role to fill a single page."
                              : bodyWords <= 600
                              ? "Right in the 1-page sweet spot for industry roles."
                              : bodyWords <= 1100
                              ? "Reads as 2 pages — fine for senior ICs and execs."
                              : "Long. Trim the oldest or least-relevant role to get under 2 pages."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                  <ATSCheckerPanel resumeData={data} />
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

        {/* R25: Edit history panel — last few saveToHistory snapshots with
            a Restore button per row that calls the existing undo(id) action.
            Hidden when no edits yet. Sits between the main content and the
            R23 meta footer. */}
        {history.past.length > 0 && (
          <div className="liquid-glass rounded-3xl border border-zinc-200 dark:border-white/[0.05] overflow-hidden mt-6">
            <div className="w-full flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Clock weight="duotone" className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white block">Edit history</span>
                  <span className="text-[10px] text-zinc-500">{history.past.length} {history.past.length === 1 ? "snapshot" : "snapshots"} · click Restore to revert</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{history.past.length}</span>
            </div>
            <div className="px-5 pb-5 space-y-1.5 max-h-48 overflow-y-auto">
              {history.past.slice(-5).reverse().map((snap, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.04] hover:border-amber-500/30 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-zinc-900 dark:text-white truncate">
                      {snap.timestamp ? new Date(snap.timestamp).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "earlier edit"}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {snap.template} · {Object.keys(snap.data || {}).filter((k) => Array.isArray((snap.data as Record<string, unknown>)[k]) ? ((snap.data as Record<string, unknown[]>)[k] as unknown[]).length > 0 : Boolean((snap.data as Record<string, unknown>)[k])).length} sections
                    </p>
                  </div>
                  <button
                    onClick={() => undo(id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                    title="Restore to this snapshot (undo back to it)"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* R23: Resume meta footer — surfaces created / updated / template fields
            that already live on the resume record. No new data, no fabricated
            counters. */ }
        <div className="liquid-glass rounded-2xl border border-zinc-200 dark:border-white/[0.05] px-5 py-3 mt-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CalendarBlank weight="duotone" className="w-4 h-4 text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resume meta</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap text-[10px] text-zinc-500">
            <span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Created</span>
              {new Date(resume.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Updated</span>
              {new Date(resume.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>
              <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Template</span>
              {TEMPLATE_CONFIGS.find((t) => t.id === selectedTemplate)?.name ?? selectedTemplate}
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span title="Body word count across summary, experience bullets, education, and skills">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Words</span>
              {wordCount.toLocaleString()}
            </span>
            {/* R30: "Last synced" line shows when the base data was pulled from
                the OfferPath profile. Hidden on resumes that were never
                profile-linked (e.g. fully custom ones). */}
            {/* R31: "Last viewed" line derived from the real `updated_at`
                timestamp. Honest — uses the same field that's already
                displayed as the "Updated" date in the footer. Renders always
                (every resume has an updated_at), unlike the conditional
                Synced/Saved/Export lines around it. */}
            {bulletStats.total > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span title={`${bulletStats.total} experience bullets — ${bulletStats.withMetrics} with a metric, length ${bulletStats.good} good / ${bulletStats.short} short / ${bulletStats.long} long`}>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Bullets</span>
                  {bulletStats.total} · {bulletStats.withMetrics} w/ metrics · {bulletStats.strong} strong · {bulletStats.verbDiversity} verbs · {bulletStats.good}g{bulletStats.short > 0 ? ` · ${bulletStats.short}s` : ""}{bulletStats.long > 0 ? ` · ${bulletStats.long}l` : ""}
                </span>
              </>
            )}
            <>
            {sectionStats.complete < sectionStats.total && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span title={`${sectionStats.complete} of ${sectionStats.total} base sections filled: personal, summary, experience, education, skills`}>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Sections</span>
                  {sectionStats.complete}/{sectionStats.total}
                </span>
              </>
            )}
            {/* R42: active section line in the meta footer. */}
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span title={`Currently editing: ${SECTIONS.find((s) => s.key === activeSection)?.label ?? activeSection}`}>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Editing</span>
                {SECTIONS.find((s) => s.key === activeSection)?.label ?? activeSection}
              </span>
            </>
            {nextIncompleteSection && nextIncompleteSection !== activeSection && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <button
                  onClick={() => setActiveSection(nextIncompleteSection)}
                  className="inline-flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                  title={`Jump to the next incomplete section: ${SECTIONS.find((s) => s.key === nextIncompleteSection)?.label ?? nextIncompleteSection}`}
                >
                  <span className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest mr-1">Next</span>
                  {SECTIONS.find((s) => s.key === nextIncompleteSection)?.label ?? nextIncompleteSection}
                </button>
              </>
            )}
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span title={`${yearsOfExperience.toFixed(1)} years of experience across ${((data as { experience?: unknown[] }).experience || []).length} role(s)`}>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Experience</span>
                {yearsOfExperience >= 1 ? `${yearsOfExperience.toFixed(1)} yrs` : `${Math.round(yearsOfExperience * 12)} mo`}
              </span>
            </>
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span title={`${totalChars.toLocaleString()} characters across all sections`}>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Length</span>
                {pageEstimate}
              </span>
            </>
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span title={`${totalWords.toLocaleString()} words across all sections (~200 wpm)`}>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Read</span>
                {readTime}
              </span>
            </>
            {skillsCount.total > 0 && (
              /* R79: switch to amber + warning marker when the user
                 has 20+ skills (ATS sweet spot is 8-15). */
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span
                  className={skillsCount.total > 20 ? "text-amber-700 dark:text-amber-400" : ""}
                  title={skillsCount.total > 20 ? `${skillsCount.total} skills is a lot — ATS sweet spot is 8-15. Trim to your target JD.` : `${skillsCount.total} skills total, ${skillsCount.highlighted} marked as highlighted`}
                >
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Skills</span>
                  {skillsCount.total}{skillsCount.highlighted > 0 ? ` · ${skillsCount.highlighted}★` : ""}{skillsCount.total > 20 ? " · trim" : ""}
                </span>
              </>
            )}
              <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span title={`Last viewed ${formatViewedAgo(resume.updated_at)}`}>
                <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Last viewed</span>
                {formatViewedAgo(resume.updated_at)}
              </span>
            </>
            {syncedAt && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span title={`Profile sync was ${formatSyncedAgo(syncedAt)}`}>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Last synced</span>
                  {formatSyncedAgo(syncedAt)}
                </span>
              </>
            )}
            {lastSavedAt && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span title={`Last manual save was ${formatSavedAgo(lastSavedAt)}`}>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Last saved</span>
                  {formatSavedAgo(lastSavedAt)}
                </span>
              </>
            )}
            {((data as { lastExportedAt?: string; lastExportFormat?: "pdf" | "docx" | "txt" }).lastExportedAt) && (
              <>
                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest mr-1">Last export</span>
                  {((data as { lastExportedAt?: string; lastExportFormat?: "pdf" | "docx" | "txt" }).lastExportFormat ?? "file").toUpperCase()} · {formatLastExported((data as { lastExportedAt?: string }).lastExportedAt!)}
                </span>
              </>
            )}
          </div>
        </div>
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
      {showShortcuts && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-white/[0.08] p-6 w-[420px] max-w-[92vw] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="shortcuts-title" className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts" className="p-1 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.04]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2 text-[12px] text-zinc-700 dark:text-zinc-300">
              {[
                ["1", "Personal section"],
                ["2", "Summary section"],
                ["3", "Experience section"],
                ["4", "Education section"],
                ["5", "Skills section"],
                ["?", "Toggle this shortcuts panel"],
              ].map(([key, label]) => (
                <li key={key} className="flex items-center justify-between gap-3">
                  <span>{label}</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{key}</kbd>
                </li>
              ))}
            </ul>
            <p className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/[0.06] text-[10px] text-zinc-500">Press <kbd className="px-1 rounded bg-zinc-100 dark:bg-white/[0.06] font-mono">?</kbd> anywhere outside a text field to toggle.</p>
          </div>
        </div>
      )}
    </div>
  );
}
