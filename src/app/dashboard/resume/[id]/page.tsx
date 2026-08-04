"use client";

import { use, useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {Info, ArrowClockwise, ArrowCounterClockwise, ArrowLeft, ArrowsClockwise, ArrowsIn, ArrowsLeftRight, ArrowsOut, Briefcase, Check, CheckCircle, CaretDown, CaretUp, Copy, IdentificationCard, ListChecks, Printer, Target, WarningCircle, Eye, EyeSlash, FileText, FloppyDisk, TextT, Sidebar, GraduationCap, PenNib, User, Plus, Sparkle, Trash, Browser, Wrench, X, Ruler, SquaresFour, Clock, DotsSixVertical, ArrowRight, Star} from '@phosphor-icons/react';
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
  const router = useRouter();
  const {
    getResumeById,
    updateResume,
    undo,
    redo,
    canUndo,
    canRedo,
    saveToHistory,
    moveSection,
    duplicateResume,
    resetToSample,
  } = useResumeStore();
  const { getProfileSummary } = useProfileStore();
  const resume = getResumeById(id);

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("personal");
  // R23: Quality Score breakdown popover — opens on badge click, closes on
    // outside click. Surfaces the per-section contribution so users can see
    // exactly which section is dragging the score down (and jump to it).
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
      window.addEventListener("mousedown", handler);
      return () => window.removeEventListener("mousedown", handler);
    }, [tailoredOpen]);

    // R26: word count breakdown popover - same outside-click pattern as the
    // Quality Score popover so the two badges feel consistent.
    const [wordsOpen, setWordsOpen] = useState(false);
    const wordsRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      if (!wordsOpen) return;
      const handler = (e: MouseEvent) => {
        if (wordsRef.current && !wordsRef.current.contains(e.target as Node)) {
          setWordsOpen(false);
        }
      };
      window.addEventListener("mousedown", handler);
      return () => window.removeEventListener("mousedown", handler);
    }, [wordsOpen]);
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


  // R30: profile-sync timestamp + tick. Reads lastSyncedAt off the resume
  // data and refreshes the "Synced Xm ago" label every 10s. Hidden when
  // lastSyncedAt is unset so non-profile-linked resumes stay clean.
  const syncedAt = (data as { lastSyncedAt?: string }).lastSyncedAt;
  const [, setSyncTick] = useState(0);
  useEffect(() => {
    if (!syncedAt) return;
    const id = setInterval(() => setSyncTick((n) => n + 1), 10000);
    return () => clearInterval(id);
  }, [syncedAt]);
  const formatSyncedAgo = (iso: string) => {
    const ms = Date.now() - new Date(iso).getTime();
    if (ms < 0) return "just now";
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };
  // R31: read the tailoredFor meta off the resume data. Renders a small
  // "Tailored for [Job]" chip in the title row when this resume was generated
  // for a specific job. Hidden on the base resume (which has no tailoredFor).
  const tailoredFor = (data as { tailoredFor?: { jobTitle: string; companyName: string; score: number; appliedAt: string } }).tailoredFor;

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

  const SECTIONS: Array<{ key: string; label: string; icon: typeof User; tip: string }> = [
    { key: "personal",   label: "Identity",   icon: User,         tip: "Name, email, phone, location — recruiters filter on this in 6 seconds." },
    { key: "summary",    label: "Summary",    icon: FileText,     tip: "Open with the role you want next. Quantify scope: team size, budget, ARR." },
    { key: "experience", label: "Experience", icon: Briefcase,    tip: "Lead each bullet with a strong verb. Show the result, not the activity." },
    { key: "education",  label: "Education",  icon: GraduationCap, tip: "Newest first. Honors/GPA only if recent (under 5 years) and impressive." },
    { key: "skills",     label: "Skills",     icon: Wrench,       tip: "Group by category. Mirror the keywords in your target job description." },
  ];

  // Flowcv-style persona detection: if the resume was created from the
  // /new "Start from sample" hook, the title is "Brian T. Wayne — Sample".
  // We surface that as a banner so the user knows they're editing sample data.
  const PERSONA_BY_TEMPLATE: Record<string, { name: string; role: string }> = {
    "classic-minimal":    { name: "Brian T. Wayne",    role: "Business Development Consultant" },
    "ats-executive":      { name: "Margaret Holloway", role: "VP of Operations" },
    "premium-headshot":   { name: "Camila Rivera",     role: "Senior Sales Manager" },
    "bold-engineer":      { name: "Rohan K. Patel",    role: "Project Engineer" },
    "clean-layout":       { name: "Priya Anand",       role: "Product Manager" },
    "clean-professional": { name: "Daniel Whitford",   role: "Finance Director" },
    "elegant-two-column": { name: "Isabella Moreau",   role: "Brand Strategist" },
    "photo-header":       { name: "Theo Nakamura",     role: "UX Designer" },
    "academic":           { name: "Dr. Aisha Khan",    role: "Postdoctoral Researcher" },
  };
  const personaMatch = resume.title.match(/^(.+) — Sample$/);
  const personaSample = personaMatch
    ? { name: personaMatch[1], template: resume.template, role: PERSONA_BY_TEMPLATE[resume.template]?.role || "" }
    : null;
  const [personaDismissed, setPersonaDismissed] = useState(false);
  const [personaSwapOpen, setPersonaSwapOpen] = useState(false);

  // Persona data for the "Try a different persona" popover. Mirrors /new/page.tsx.
  // Only the 3 personas with full data are listed; the other templates have no sample to swap to.
  const PERSONA_SAMPLE_DATA: Record<string, typeof PERSONA_BY_TEMPLATE[string] & {
    email: string; phone: string; location: string;
    summary: string;
    experience: Array<{ company: string; title: string; location: string; start_date: string; end_date: string; current: boolean; bullets: string[] }>;
    education: Array<{ institution: string; degree: string; field: string; start_date: string; end_date: string; gpa?: string }>;
    skills: string[];
  }> = {
    "classic-minimal": {
      name: "Brian T. Wayne", role: "Business Development Consultant", email: "brian.wayne@example.com", phone: "+1 415 555 0142", location: "San Francisco, CA",
      summary: "Business Development Consultant with 7+ years driving revenue growth for early-stage SaaS companies. Specialized in cross-functional team leadership, partner enablement, and quantified pipeline generation.",
      experience: [
        { company: "Northwind Dynamics", title: "Senior Business Development Consultant", location: "San Francisco, CA", start_date: "2021-03", end_date: "", current: true, bullets: [
          "Built and managed a 12-person cross-functional pod that closed $4.2M in new ARR across 38 enterprise accounts in 12 months.",
          "Designed partner enablement curriculum that lifted channel-sourced revenue 38% YoY.",
          "Coached 6 junior BDRs to promotion; team NPS rose from 32 to 71 in 9 months.",
        ] },
        { company: "Aperture Labs", title: "Business Development Manager", location: "San Francisco, CA", start_date: "2018-06", end_date: "2021-02", current: false, bullets: [
          "Owned outbound motion for the West Coast; sourced 240+ SQLs per quarter, 18% close rate.",
          "Built reporting dashboards in Looker that exposed $1.1M of pipeline risk to leadership.",
        ] },
      ],
      education: [{ institution: "UC Berkeley, Haas School of Business", degree: "MBA", field: "Marketing & Entrepreneurship", start_date: "2014", end_date: "2016", gpa: "3.8" }],
      skills: ["Enterprise sales", "Pipeline forecasting", "Salesforce + HubSpot", "Looker", "Cross-functional leadership", "Channel partner enablement"],
    },
    "premium-headshot": {
      name: "Camila Rivera", role: "Senior Sales Manager", email: "camila.rivera@example.com", phone: "+1 305 555 0193", location: "Miami, FL",
      summary: "Senior Sales Manager with 9 years of enterprise SaaS experience. Track record of building high-performing LATAM-aligned sales teams and growing accounts from $50K to $2M+ ARR.",
      experience: [
        { company: "Cobalt Industries", title: "Senior Sales Manager — LATAM", location: "Miami, FL", start_date: "2020-08", end_date: "", current: true, bullets: [
          "Lead 8-person LATAM sales pod; overdelivered on quota by 142% in FY23 ($8.4M vs $5.9M target).",
          "Closed largest single deal in company history: $1.6M 3-year enterprise agreement with MercadoLibre.",
          "Built Spanish-language enablement library; ramp time for new AEs fell from 12 weeks to 6.",
        ] },
      ],
      education: [{ institution: "Universidad de los Andes", degree: "BBA", field: "International Business", start_date: "2012", end_date: "2016" }],
      skills: ["Enterprise SaaS sales", "LATAM market expansion", "Salesforce", "Outreach + Salesloft", "Negotiation", "Bilingual EN/ES"],
    },
    "bold-engineer": {
      name: "Rohan K. Patel", role: "Project Engineer", email: "rohan.patel@example.com", phone: "+1 408 555 0210", location: "San Jose, CA",
      summary: "Project Engineer with 6+ years in hardware and embedded systems. Strong in cross-functional collaboration with manufacturing, firmware, and design teams.",
      experience: [
        { company: "Quantum Devices", title: "Project Engineer", location: "San Jose, CA", start_date: "2020-01", end_date: "", current: true, bullets: [
          "Led PCB bring-up on 3 product lines, reducing time-to-prototype by 38%.",
          "Owned DFM handoff to contract manufacturer; first-pass yield rose from 78% to 94%.",
          "Wrote internal tooling in Python that cut weekly QA reporting from 4 hours to 18 minutes.",
        ] },
      ],
      education: [{ institution: "University of Michigan", degree: "B.S.", field: "Electrical & Computer Engineering", start_date: "2014", end_date: "2018" }],
      skills: ["Altium Designer", "Embedded C", "Python", "JTAG debugging", "Signal integrity", "I2C / SPI / UART"],
    },
  };

  const handleSwapPersona = (templateId: string) => {
    const swap = PERSONA_SAMPLE_DATA[templateId];
    if (!swap) return;
    saveToHistory(id);
    updateResume(id, {
      title: `${swap.name} — Sample`,
      template: templateId,
      data: {
        personal: { name: swap.name, email: swap.email, phone: swap.phone, location: swap.location },
        summary: swap.summary,
        experience: swap.experience as any,
        education: swap.education as any,
        skills: swap.skills.map((name, i) => ({ id: `s${i}`, name, isHighlighted: i < 2 })),
      },
    });
    setSelectedTemplate(templateId);
    setPersonaSwapOpen(false);
    toast.success(`Swapped to ${swap.name} — ${swap.role}`);
  };

  // Per-section completion check — flowcv shows a tick in the section nav when a section has content.
  const sectionHasContent: Record<string, boolean> = {
    personal:   Boolean(data.personal?.name && data.personal?.email),
    summary:    Boolean(data.summary && data.summary.length > 30),
    experience: Boolean(data.experience && data.experience.length > 0 && data.experience[0]?.company),
    education:  Boolean(data.education && data.education.length > 0 && data.education[0]?.institution),
    skills:     Boolean(data.skills && data.skills.length > 0),
  };
  const completedCount = Object.values(sectionHasContent).filter(Boolean).length;
  // R21: Resume Quality Score — deterministic 0-100 from sections + bullet density.
  // Heuristic only; honest about it via the "Quality Score" label (not "ATS").
  // 5 base sections × 15 = 75 baseline, +1 per experience bullet (cap 25) to reward
  // quantified detail. Recomputes on every render since data changes.
  const bulletCount = (data.experience || []).reduce((sum, e) => sum + (e.bullets?.filter((b) => b.trim()).length || 0), 0);
  const qualityScore = Math.min(100, completedCount * 15 + Math.min(25, bulletCount));
  const qualityTone = qualityScore >= 80 ? "emerald" : qualityScore >= 50 ? "amber" : "red";
  // R25: live word count across the resume's body text. Same sweep style as
  // resume.io's R19 length widget, but kept inline so the editor title row
  // can show it as a single stat without a sidebar panel.
  // R26: per-section word counts so the 'X words' pill can show a breakdown
  // popover (mirrors the R23 Quality Score popover). Each row jumps to its
  // section. Total is summed from the same parts so the headline and the
  // breakdown never disagree.
  const wordBreakdown = (() => {
    const count = (text: string) => text.split(/\s+/).filter(Boolean).length;
    const summaryPart = data.summary || "";
    const summaryWords = count(summaryPart);
    const summaryParts = summaryPart ? 1 : 0;
    const experienceWords = (data.experience || []).reduce(
      (sum, e) => sum + (e.bullets || []).reduce((s, b) => s + count(b), 0), 0);
    const experienceParts = (data.experience || []).reduce(
      (sum, e) => sum + (e.bullets || []).filter((b) => b.trim()).length, 0);
    const educationText = (data.education || [])
      .map((e) => [e.institution, e.degree, e.field].filter(Boolean).join(" "))
      .filter(Boolean).join(" ");
    const educationWords = count(educationText);
    const educationParts = (data.education || []).filter(
      (e) => e.institution || e.degree || e.field).length;
    const skillsText = (data.skills || [])
      .map((s) => (s && s.name) || "")
      .filter(Boolean).join(" ");
    const skillsWords = count(skillsText);
    const skillsParts = (data.skills || []).filter((s) => Boolean(s && s.name)).length;
    return [
      { key: "personal",   label: "Identity",   words: 0, parts: 0 },
      { key: "summary",    label: "Summary",    words: summaryWords,    parts: summaryParts },
      { key: "experience", label: "Experience", words: experienceWords, parts: experienceParts },
      { key: "education",  label: "Education",  words: educationWords,  parts: educationParts },
      { key: "skills",     label: "Skills",     words: skillsWords,     parts: skillsParts },
    ];
  })();
  const wordCount = wordBreakdown.reduce((sum, row) => sum + row.words, 0);
  // R23: per-section contributions shown in the badge popover. Kept in sync
    // with the same heuristic so the breakdown never disagrees with the
    // headline number.
    const scoreBreakdown: { key: string; label: string; points: number; max: number }[] = [
      { key: "personal",   label: "Identity",  points: sectionHasContent.personal   ? 15 : 0, max: 15 },
      { key: "summary",    label: "Summary",   points: sectionHasContent.summary    ? 15 : 0, max: 15 },
      { key: "experience", label: "Experience",points: (sectionHasContent.experience ? 15 : 0) + Math.min(25, bulletCount), max: 40 },
      { key: "education",  label: "Education", points: sectionHasContent.education  ? 15 : 0, max: 15 },
      { key: "skills",     label: "Skills",    points: sectionHasContent.skills     ? 15 : 0, max: 15 },
    ];

  const handleClearPersonaSample = () => {
    saveToHistory(id);
    updateResume(id, { title: "New Resume" });
    setPersonaDismissed(true);
    toast.success("Sample cleared. Start with your own info.");
  };

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
                <ExportButtons resumeData={data} resumeTitle={resume.title} />
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

      {/* Persona sample banner — flowcv "Brian T. Wayne" signature. Only shown for sample resumes. */}
      {personaSample && !personaDismissed && (
        <div className="mb-4 liquid-glass rounded-2xl p-4 border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-transparent relative z-30">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="flex items-center justify-between gap-4 flex-wrap relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <IdentificationCard weight="duotone" className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">Working from sample</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">·</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{personaSample.template}</span>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {personaSample.name}
                  {personaSample.role && <span className="text-zinc-500 font-normal"> — {personaSample.role}</span>}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Edit each section to replace the sample with your own info.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setPersonaSwapOpen(!personaSwapOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:bg-indigo-500/20 transition-all"
              >
                <ArrowsLeftRight className="w-3.5 h-3.5" />
                Try a different persona
              </button>
              <button
                onClick={handleClearPersonaSample}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-indigo-600 hover:border-indigo-500/30 transition-all"
              >
                Start fresh
              </button>
              {personaSwapOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 z-50 liquid-glass rounded-2xl border border-indigo-500/20 shadow-2xl p-2 animate-fade-in">
                  <div className="px-3 py-2 border-b border-zinc-200/30 dark:border-white/[0.05]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Swap to a different sample persona</p>
                  </div>
                  <div className="space-y-1 py-1">
                    {Object.entries(PERSONA_SAMPLE_DATA).map(([tid, p]) => (
                      <button
                        key={tid}
                        onClick={() => handleSwapPersona(tid)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-indigo-500/10 transition-all group",
                          personaSample?.template === tid && "bg-indigo-500/10"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-blue-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-300 flex-shrink-0">
                          {p.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{p.role}</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-indigo-500">{tid}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setPersonaDismissed(true)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section completion bar — flowcv "complete each section" affordance */}
      {personaSample && !personaDismissed && (
        <div className="mb-4 flex items-center gap-3 px-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sample progress</span>
            <div className="flex items-center gap-1">
              {SECTIONS.map((sec) => (
                <span
                  key={sec.key}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    sectionHasContent[sec.key] ? "bg-indigo-500" : "bg-zinc-300 dark:bg-white/10"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">{completedCount} / 5 replaced</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/resume"
              className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
              title="Back to layout gallery"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard/resume#template-gallery"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-surface-500 bg-white border border-surface-200/50 hover:border-brand-200/50 hover:text-brand-900 transition-all"
            >
              Try another layout
            </Link>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{resume.is_base ? "Base Resume" : "Tailored Resume"}</span>
              </div>
              {/* R21+R23: Quality Score badge — click to expand the per-section
                  breakdown. Same heuristic as before; R23 just surfaces the
                  contribution of each section so the user can see what is
                  dragging the score down. */}
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
            {/* R25+R26: live word count - R25 added the pill, R26 made it
                click-to-expand so the per-section breakdown is one tap away.
                Same outside-click pattern as the Quality Score popover. */}
            <div className="relative" ref={wordsRef}>
              <button
                type="button"
                onClick={() => setWordsOpen((o) => !o)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-white/[0.08] transition-colors"
                title="Click for per-section word breakdown"
                aria-expanded={wordsOpen}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">{wordCount.toLocaleString()} words</span>
              </button>
              {wordsOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 z-30 liquid-glass rounded-2xl border border-zinc-200 dark:border-white/[0.08] shadow-2xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Word count by section</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">{wordCount.toLocaleString()} total</span>
                  </div>
                  <div className="space-y-1.5">
                    {wordBreakdown.filter((row) => row.key !== "personal").map((row) => {
                      const hasContent = row.parts > 0;
                      return (
                        <button
                          key={row.key}
                          type="button"
                          onClick={() => { setActiveSection(row.key); setWordsOpen(false); }}
                          disabled={!hasContent}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${hasContent ? "hover:bg-zinc-100 dark:hover:bg-white/[0.04]" : "opacity-50 cursor-not-allowed"}`}
                          title={hasContent ? `Jump to ${row.label}` : `${row.label} is empty`}
                        >
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border ${hasContent ? "bg-brand-500/10 border-brand-500/30" : "bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/10"}`}>
                            {hasContent ? <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> : <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />}
                          </span>
                          <span className={`text-[11px] flex-1 ${hasContent ? "text-zinc-900 dark:text-white font-semibold" : "text-zinc-500"}`}>{row.label}</span>
                          <span className={`text-[10px] font-mono ${hasContent ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}`}>
                            {row.words.toLocaleString()}{row.parts > 0 ? ` · ${row.parts}` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06] text-[10px] text-zinc-500 leading-relaxed">
                    Counts summary, experience bullets, education, and skills. Identity (name/email) is excluded since it isn&apos;t body prose.
                  </p>
                </div>
              )}
            </div>
            {/* R29: Sample persona chip - small, persistent indicator that
                this title row belongs to a sample persona. Mirrors the
                "Working from sample" banner below but stays in the title
                row so users always know which template's data they're
                looking at, even after dismissing the banner. */}
            {personaSample && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300"
                title={`Sample persona: ${personaSample.name}${personaSample.role ? ` — ${personaSample.role}` : ""}`}
              >
                <IdentificationCard weight="duotone" className="w-2.5 h-2.5" />
                Sample · {personaSample.template}
              </span>
            )}
            {/* R30: Profile-sync chip. Sits in the title row next to the
                Quality Score badge and the R29 persona chip. Renders only when
                data.lastSyncedAt is set, so resumes that were never linked to
                the profile stay clean. */}
            {syncedAt && (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-sky-500/10 border-sky-500/30"
                title={`Last synced from profile ${formatSyncedAgo(syncedAt)}`}
              >
                <ArrowsClockwise weight="duotone" className="w-2.5 h-2.5 text-sky-600 dark:text-sky-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
                  Synced {formatSyncedAgo(syncedAt)}
                </span>
              </span>
            )}
            {/* R31: "Tailored for [Job]" chip. Renders only when this resume
                has tailoredFor meta (i.e. it was AI-tailored for a specific
                role). Hidden on the base resume. Amber tone so it's clearly
                distinct from the sky-blue "Synced" chip. */}
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
                    Tailored for {tailoredFor.jobTitle} · {tailoredFor.score}/100
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
                      Score is the same heuristic that powers the flowcv quality breakdown. Re-tailor to recompute against a new job description.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setShowTailorDialog(true); setScoreOpen(false); }}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                    >
                      <Target weight="duotone" className="w-3 h-3" />
                      Re-tailor for a different role
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* R33: Inline editable title. Click the H1 to edit in place;
                Enter or blur saves via updateResume, Escape cancels. Uses the
                real resume.title field — no separate draft title. */}
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
                {bulletStats.total >= 3 && (
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 border-l border-zinc-300/60 dark:border-white/10 pl-1.5" title={`${bulletStats.verbDiversity} unique first-words across ${bulletStats.total} bullets`}>
                    {bulletStats.verbDiversity} verbs
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
            {/* R42: active section chip. Shows which section the user is
                currently editing, so the title row mirrors the right-rail tabs. */}
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
            {skillsCount.total > 0 && (
              /* R79: switch to amber + warning marker when the user
                 has 20+ skills (ATS sweet spot is 8-15). */
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${skillsCount.total > 20 ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400" : "bg-zinc-100 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.06] text-zinc-600 dark:text-zinc-400"}`}
                title={skillsCount.total > 20 ? `${skillsCount.total} skills is a lot — ATS sweet spot is 8-15. Trim to your target JD.` : `${skillsCount.total} skills total, ${skillsCount.highlighted} marked as highlighted`}
              >
                <Wrench weight="duotone" className="w-2.5 h-2.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {skillsCount.total} skill{skillsCount.total === 1 ? "" : "s"}{skillsCount.highlighted > 0 ? ` · ${skillsCount.highlighted}★` : ""}{skillsCount.total > 20 ? " · trim" : ""}
                </span>
              </span>
            )}
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

          {/* R27: Print button - one-tap browser print dialog. PDF/DOCX
              still route through ExportButtons; this is for users who just
              want a quick print without re-rendering. */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-all"
            title="Print this resume"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Print</span>
          </button>
          {/* R32: Copy as plain text - one-tap clipboard write of the
              same content Print/PDF would render, as plain text. */}
          <button
            type="button"
            onClick={handleCopyAsText}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-all"
            title="Copy this resume as plain text to your clipboard"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Copy</span>
          </button>

          {/* R28: Duplicate button - one-tap copy of this resume. Uses the
              existing duplicateResume from the store, then navigates to the
              new copy. */}
          <button
            onClick={() => {
              const newId = duplicateResume(id);
              if (newId) {
                toast.success("Duplicated. Editing the copy now.");
                router.push(`/dashboard/resume/${newId}`);
              } else {
                toast.error("Could not duplicate this resume.");
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/[0.12] transition-all"
            title="Create an editable copy of this resume"
          >
            <ArrowsLeftRight className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest text-[11px]">Duplicate</span>
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
                          {sectionHasContent[section.key] && (
                            <Check weight="bold" className="w-3 h-3 text-indigo-500" />
                          )}
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
