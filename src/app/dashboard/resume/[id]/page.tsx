"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ArrowClockwise, ArrowCounterClockwise, ArrowLeft, ArrowsClockwise, ArrowsIn, ArrowsOut, Briefcase, Camera, CheckCircle, CaretDown, WarningCircle, Eye, EyeSlash, FileText, FloppyDisk, TextT, SidebarSimple, GraduationCap, PenNib, User, Plus, Sparkle, Trash, Browser, Wrench, Cpu, Translate, Certificate, FolderOpen, X } from '@phosphor-icons/react';
import { useResumeStore, PLACEHOLDER_RESUME_DATA } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import type { ExperienceEntry, EducationEntry, ResumeTheme, SectionKey, ResumeData, ProjectEntry, TechnicalSkillCategory } from "@/types";
import ExportButtons from "@/components/resume/ExportButtons";
import ResumePreview, {
  TEMPLATE_CONFIGS,
} from "@/components/resume/ResumePreview";
import ThemePicker from "@/components/resume/ThemePicker";
import ATSCheckerPanel from "@/components/resume/ATSCheckerPanel";
import { tailorResume, type TailorResult } from "@/lib/aiService";
import { saveResumeAction } from "@/app/actions/resume";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

// Debounce a value so the heavy ResumePreview only re-renders after typing pauses.
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

type SectionMeta = { key: string; label: string; icon: React.ComponentType<{ className?: string }> };

const SECTION_META: SectionMeta[] = [
  { key: "personal", label: "Identity", icon: User },
  { key: "summary", label: "Summary", icon: FileText },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "technicalSkills", label: "Tech Skills", icon: Cpu },
  { key: "languages", label: "Languages", icon: Translate },
  { key: "certifications", label: "Certs", icon: Certificate },
  { key: "projects", label: "Projects", icon: FolderOpen },
];

function metaFor(key: string): SectionMeta {
  return SECTION_META.find((m) => m.key === key) ?? SECTION_META[0];
}

// Resume is "empty" when the user has not entered anything substantial. We still
// show a rich preview by swapping in placeholder mock data so the user can
// compare templates before typing.
function isResumeEmpty(data: ResumeData): boolean {
  const noName = !data.personal?.name?.trim();
  const noSummary = !data.summary?.trim();
  const noExperience = !data.experience || data.experience.length === 0;
  return noName && noSummary && noExperience;
}

function SortableSectionTab({
  tabId, label, Icon, isActive, isVisible, canToggle, onClick, onToggleVisibility, disabled,
}: {
  tabId: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isVisible: boolean;
  canToggle: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tabId, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      className={cn(
        "group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-grab active:cursor-grabbing select-none",
        isActive
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
          : "text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/[0.06] hover:text-zinc-900 dark:hover:text-zinc-200",
        !isVisible && "opacity-45"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {canToggle && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          onPointerDown={(e) => e.stopPropagation()}
          title={isVisible ? "Hide section" : "Show section"}
          className={cn(
            "p-0.5 rounded transition-opacity",
            isActive
              ? "text-white/60 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900"
              : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300",
            isVisible ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}
        >
          {isVisible ? <Eye className="w-3 h-3" /> : <EyeSlash className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}


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
    toggleVisibility,
  } = useResumeStore();
  const { getProfileSummary } = useProfileStore();
  const resume = getResumeById(id);

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [editorMode, setEditorMode] = useState<EditorMode>("form");
  const [showPreview, setShowPreview] = useState(true);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  // Editor column width in px; user can drag the resize handle to change it.
  const [editorWidth, setEditorWidth] = useState(450);
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  // Pointer-based resize: capture pointer on the handle, then track movement.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      const delta = e.clientX - dragStateRef.current.startX;
      // Clamp between 280px and 65% of viewport so the preview always has room.
      const max = Math.max(280, Math.floor(window.innerWidth * 0.65));
      setEditorWidth(Math.min(max, Math.max(280, dragStateRef.current.startWidth + delta)));
    };
    const onUp = () => { dragStateRef.current = null; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);
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

  // Pending destructive deletion (experience / education) awaiting confirmation.
  const [confirmDelete, setConfirmDelete] = useState<null | { type: "experience" | "education"; index: number }>(null);

  // Debounced snapshot so the heavy ResumePreview only re-renders after typing pauses.
  const previewData = useDebouncedValue(resume?.data, 200);

  // Fullscreen preview: ESC to close + lock body scroll.
  useEffect(() => {
    if (!isFullscreenPreview) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFullscreenPreview(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isFullscreenPreview]);

  // Tailor modal: ESC to close + lock body scroll.
  useEffect(() => {
    if (!showTailorDialog) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setShowTailorDialog(false); setDraftResult(null); } };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [showTailorDialog]);

  // Drag sensors for section reordering (5px movement distinguishes drag from click).
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
  const resumeIsEmpty = isResumeEmpty(data);
  // For an empty resume we show the placeholder in the preview so the user
  // can see what each template looks like before filling in their details.
  const effectiveData: ResumeData = resumeIsEmpty ? PLACEHOLDER_RESUME_DATA : data;

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

  // Section tabs are derived from sectionOrder + SECTION_META (module scope).

  const sectionOrder = resume.section_order || [
    "summary", "experience", "education", "technicalSkills", "skills", "languages", "certifications", "projects"
  ];

  // Tabs = personal (fixed, non-draggable) + editable sections in their current order.
  const editableOrder: string[] = sectionOrder.filter((k): boolean => SECTION_META.some((m) => m.key === k));
  const tabItems = ["personal", ...editableOrder];

  const handleSectionDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = editableOrder.indexOf(String(active.id));
    const newIndex = editableOrder.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(editableOrder, oldIndex, newIndex);
    saveToHistory(id);
    updateResume(id, { section_order: newOrder as SectionKey[] });
  };

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
                  data={previewData ?? effectiveData}
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
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/resume"
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{resume.is_base ? "Base Resume" : "Tailored Resume"}</span>
              </div>
              {resumeIsEmpty && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400/80">· Sample preview</span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white font-display tracking-tight leading-tight">{resume.title}</h1>
          </div>

          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-zinc-200 dark:border-white/[0.06] max-sm:ml-[52px] max-sm:pl-0 max-sm:border-l-0">
          {/* Collapse Editor Toggle */}
          <button
            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
            className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
            title={isEditorCollapsed ? "Open Editor" : "Collapse Editor"}
          >
            <SidebarSimple className="w-5 h-5" weight={isEditorCollapsed ? "fill" : "regular"} />
          </button>

          {/* Undo/Redo grouped with Save; Download after; AI Tailoring sits in the top-right slot */}
          <div className="flex items-center bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] rounded-xl p-1 gap-0.5">
            <button
              onClick={() => undo(id)}
              disabled={!canUndo}
              className={cn(
                "p-2 rounded-lg transition-all",
                canUndo ? "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10" : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
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
                canRedo ? "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10" : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
              )}
              title="Redo"
            >
              <ArrowClockwise className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-zinc-200 dark:bg-white/[0.08] mx-0.5" />
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
                saved
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
              )}
            >
              <FloppyDisk className="w-3.5 h-3.5" />
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          <ExportButtons resumeData={data} resumeTitle={resume.title} />
          </div>
        </div>

        {/* AI Tailoring — sits in the top-right slot where Download+Save used to be */}
        <button
          onClick={() => setShowTailorDialog(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-purple-400 transition-all shadow-lg shadow-purple-500/20"
          title="Open AI tailoring"
        >
          <Sparkle weight="fill" className="w-3.5 h-3.5" />
          AI Tailoring
        </button>
      </div>

      {/* Main Content — editor + preview */}
      <div
        className={cn(
          "grid gap-5 transition-all duration-500 ease-in-out",
          isEditorCollapsed
            ? "grid-cols-1"
            : showPreview
              ? `grid-cols-[${editorWidth}px_minmax(0,1fr)]`
              : "grid-cols-1 max-w-5xl mx-auto"
        )}
      >
        {/* Left: Editor (now fixed width when split) */}
        {!isEditorCollapsed && (
          <div className="space-y-4">
            {/* Intelligence Panels (ATS + Theme) — grouped compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ATSCheckerPanel resumeData={data} />
              <ThemePicker
                theme={resume.theme}
                onChange={(updates) => {
                  saveToHistory(id);
                  updateResume(id, { theme: { ...resume.theme, ...updates } as ResumeTheme });
                }}
                preview={<ResumePreview data={previewData ?? effectiveData} template={selectedTemplate} themeColor={themeColor} sectionOrder={sectionOrder as SectionKey[]} sectionVisibility={resume.section_visibility?.[selectedTemplate]} />}
              />
            </div>

            {/* Template Picker + Form/Rich Text toggle (same row) */}
            <div className="flex items-center gap-2 flex-wrap">
              <Browser className="w-4 h-4 text-zinc-500 flex-shrink-0" />
              <div className="relative w-full max-w-[200px]">
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    saveToHistory(id);
                    setSelectedTemplate(e.target.value);
                    updateResume(id, { template: e.target.value });
                  }}
                  className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.05] text-zinc-900 dark:text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer focus:outline-none focus:border-brand-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all truncate"
                >
                  {TEMPLATE_CONFIGS.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none text-zinc-500">
                  <CaretDown className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] rounded-lg p-0.5 ml-auto">
                <button
                  onClick={() => setEditorMode("form")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                    editorMode === "form"
                      ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  )}
                >
                  <TextT className="w-3 h-3" />
                  Form
                </button>
                <button
                  onClick={() => setEditorMode("richtext")}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                    editorMode === "richtext"
                      ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  )}
                >
                  <PenNib className="w-3 h-3" />
                  Rich Text
                </button>
              </div>
            </div>

            {editorMode === "richtext" ? (
              <RichTextEditor
                content={data.summary ? `<p>${data.summary}</p>` : "<p></p>"}
                onChange={(html) => {
                  const plainText = html.replace(/<[^>]*>/g, "").trim();
                  if (plainText !== (data.summary || "")) {
                    updateResume(id, { data: { ...data, summary: plainText } });
                  }
                }}
              />
            ) : (
              <>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                  <SortableContext items={tabItems} strategy={rectSortingStrategy}>
                    <div className="flex flex-wrap gap-1 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] rounded-xl p-1">
                      {tabItems.map((tabId) => {
                        const meta = metaFor(tabId);
                        const isVisible = (resume.section_visibility?.[selectedTemplate]?.[tabId as SectionKey]) ?? true;
                        const isPersonal = tabId === "personal";
                        return (
                          <SortableSectionTab
                            key={tabId}
                            tabId={tabId}
                            label={meta.label}
                            Icon={meta.icon}
                            isActive={activeSection === tabId}
                            isVisible={isVisible}
                            canToggle={!isPersonal}
                            disabled={isPersonal}
                            onClick={() => setActiveSection(tabId)}
                            onToggleVisibility={() => toggleVisibility(id, selectedTemplate, tabId as SectionKey)}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="liquid-glass rounded-2xl p-5 animate-fade-in min-h-[500px]">
                  {/* Personal Info */}
                  {activeSection === "personal" && (
                    <div className="space-y-6">
                      <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Personal Details</h2>

                      {/* Headshot — used by photo-based templates (Premium Headshot, Photo Header, etc.) */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] flex-shrink-0">
                          {data.personal?.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element -- data URLs cannot be optimized by next/image
                            <img src={data.personal.photo_url} alt="Headshot" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <User className="w-7 h-7" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Headshot <span className="text-zinc-400 normal-case font-medium">· used by photo templates</span></p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10 cursor-pointer transition-all">
                              <Camera className="w-3.5 h-3.5" />
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error("Image must be under 2MB");
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    saveToHistory(id);
                                    updateField("personal", "photo_url", String(reader.result || ""));
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                            {data.personal?.photo_url && (
                              <button
                                onClick={() => { saveToHistory(id); updateField("personal", "photo_url", ""); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {[
                          { label: "Full Name", field: "name", value: data.personal?.name || "" },
                          { label: "Email", field: "email", value: data.personal?.email || "" },
                          { label: "Phone", field: "phone", value: data.personal?.phone || "" },
                          { label: "Location", field: "location", value: data.personal?.location || "" },
                          { label: "LinkedIn", field: "linkedin", value: data.personal?.linkedin || "" },
                          { label: "Website", field: "website", value: data.personal?.website || "" },
                        ].map((input) => (
                          <div key={input.field} className="space-y-1.5">
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{input.label}</label>
                            <input
                              type="text"
                              value={input.value as string}
                              onBlur={() => saveToHistory(id)}
                              onChange={(e) => updateField("personal", input.field, e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 focus:bg-zinc-100 dark:bg-white/[0.05] transition-all font-sans"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {activeSection === "summary" && (
                    <div className="space-y-6">
                      <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Professional Summary</h2>
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
                          <div key={`exp-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              onClick={() => setConfirmDelete({ type: "experience", index })}
                              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 opacity-70 group-hover/item:opacity-100 transition-all"
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
                                  <div key={`bullet-${index}-${bi}`} className="flex items-start gap-2 mb-2 group/bullet">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 mt-2 flex-shrink-0" />
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
                                    <button
                                      onClick={() => {
                                        saveToHistory(id);
                                        const newExps = [...(data.experience || [])];
                                        const newBullets = [...(newExps[index].bullets || [])];
                                        newBullets.splice(bi, 1);
                                        newExps[index] = { ...newExps[index], bullets: newBullets };
                                        updateResume(id, { data: { ...data, experience: newExps } });
                                        toast("Bullet removed", { action: { label: "Undo", onClick: () => undo(id) } });
                                      }}
                                      className="mt-2 p-1 text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-colors opacity-70 group-hover/bullet:opacity-100"
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
                          <div key={`edu-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              onClick={() => setConfirmDelete({ type: "education", index })}
                              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 opacity-70 group-hover/item:opacity-100 transition-all"
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
                      
                      <div className="flex flex-wrap gap-2">
                        {(data.skills || []).map((skill, index) => (
                          <div
                            key={`skill-${index}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.05] text-xs font-bold text-zinc-700 dark:text-zinc-300 group transition-all"
                          >
                            <span>{typeof skill === 'string' ? skill : skill.name}</span>
                            <button
                              onClick={() => {
                                saveToHistory(id);
                                const newSkills = [...(data.skills || [])];
                                newSkills.splice(index, 1);
                                updateResume(id, { data: { ...data, skills: newSkills } });
                                toast("Skill removed", { action: { label: "Undo", onClick: () => undo(id) } });
                              }}
                              className="text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-colors opacity-70 group-hover:opacity-100 -mr-1"
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
                  {/* Languages */}
                  {activeSection === "languages" && (
                    <div className="space-y-6">
                      <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Languages</h2>
                      <div className="flex flex-wrap gap-2">
                        {(data.languages || []).map((lang, index) => (
                          <div key={`lang-${index}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.05] text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            <span>{lang}</span>
                            <button
                              onClick={() => { saveToHistory(id); const next = [...(data.languages || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, languages: next } }); toast("Language removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
                              className="text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-colors opacity-70"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Type a language and press enter..."
                        onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) { saveToHistory(id); const val = (e.target as HTMLInputElement).value.trim(); updateResume(id, { data: { ...data, languages: [...(data.languages || []), val] } }); (e.target as HTMLInputElement).value = ""; } }}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-zinc-400"
                      />
                    </div>
                  )}

                  {/* Certifications */}
                  {activeSection === "certifications" && (
                    <div className="space-y-6">
                      <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Certifications</h2>
                      <div className="flex flex-wrap gap-2">
                        {(data.certifications || []).map((cert, index) => (
                          <div key={`cert-${index}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.05] text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            <span>{cert}</span>
                            <button
                              onClick={() => { saveToHistory(id); const next = [...(data.certifications || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, certifications: next } }); toast("Certification removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
                              className="text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-colors opacity-70"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Type a certification and press enter..."
                        onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) { saveToHistory(id); const val = (e.target as HTMLInputElement).value.trim(); updateResume(id, { data: { ...data, certifications: [...(data.certifications || []), val] } }); (e.target as HTMLInputElement).value = ""; } }}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-zinc-400"
                      />
                    </div>
                  )}

                  {/* Projects */}
                  {activeSection === "projects" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Projects</h2>
                        <button
                          onClick={() => { saveToHistory(id); const newProj: ProjectEntry = { name: "", description: "" }; updateResume(id, { data: { ...data, projects: [...(data.projects || []), newProj] } }); }}
                          className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        {(data.projects || []).map((proj, index) => (
                          <div key={`proj-${index}`} className="p-4 sm:p-6 rounded-[24px] bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              onClick={() => { saveToHistory(id); const next = [...(data.projects || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, projects: next } }); toast("Project removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
                              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-all opacity-70 group-hover/item:opacity-100"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <div className="space-y-4 pr-8">
                              <input type="text" value={proj.name} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], name: e.target.value }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="Project Name" className="w-full bg-transparent border-none p-0 text-base font-bold text-zinc-900 dark:text-white focus:ring-0 placeholder:text-zinc-400" />
                              <textarea value={proj.description} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], description: e.target.value }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="Short description..." rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all resize-none font-sans placeholder:text-zinc-400" />
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-200 dark:border-white/[0.05]">
                                <input type="text" value={proj.url || ""} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], url: e.target.value }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="URL (optional)" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-zinc-400" />
                                <input type="text" value={(proj.tech || []).join(", ")} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.projects || [])]; next[index] = { ...next[index], tech: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) }; updateResume(id, { data: { ...data, projects: next } }); }} placeholder="Tech (comma separated)" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-zinc-400" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Skills */}
                  {activeSection === "technicalSkills" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold font-display text-zinc-900 dark:text-white uppercase tracking-widest">Technical Skills</h2>
                        <button
                          onClick={() => { saveToHistory(id); const newCat: TechnicalSkillCategory = { id: `ts-${Date.now()}`, category: "", skills: "" }; updateResume(id, { data: { ...data, technicalSkills: [...(data.technicalSkills || []), newCat] } }); }}
                          className="p-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(data.technicalSkills || []).map((cat, index) => (
                          <div key={cat.id || `ts-${index}`} className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] group/item relative">
                            <button
                              onClick={() => { saveToHistory(id); const next = [...(data.technicalSkills || [])]; next.splice(index, 1); updateResume(id, { data: { ...data, technicalSkills: next } }); toast("Category removed", { action: { label: "Undo", onClick: () => undo(id) } }); }}
                              className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 hover:text-red-500 transition-all opacity-70 group-hover/item:opacity-100"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-[1fr_2fr] gap-3 pr-8">
                              <input type="text" value={cat.category} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.technicalSkills || [])]; next[index] = { ...next[index], category: e.target.value }; updateResume(id, { data: { ...data, technicalSkills: next } }); }} placeholder="Category" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm font-bold text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-zinc-400" />
                              <input type="text" value={cat.skills} onBlur={() => saveToHistory(id)} onChange={(e) => { const next = [...(data.technicalSkills || [])]; next[index] = { ...next[index], skills: e.target.value }; updateResume(id, { data: { ...data, technicalSkills: next } }); }} placeholder="Skills (comma separated)" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all font-sans placeholder:text-zinc-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Drag handle — only when both panels are visible */}
        {!isEditorCollapsed && showPreview && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor panel"
            onPointerDown={(e) => {
              e.preventDefault();
              dragStateRef.current = { startX: e.clientX, startWidth: editorWidth };
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            className="hidden md:flex w-1.5 -mx-2.5 self-stretch items-center justify-center cursor-col-resize group"
            title="Drag to resize"
          >
            <div className="w-px h-full bg-zinc-200 dark:bg-white/[0.05] group-hover:bg-brand-500/60 transition-colors" />
          </div>
        )}

        {/* Right: Preview (Larger focus) */}
        {showPreview && (
          <div className="flex-1 min-w-0">
            <div className="relative bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl p-3 sm:p-5 border border-zinc-200 dark:border-white/[0.03] shadow-inner overflow-hidden min-h-[600px] flex justify-center">
              <button
                onClick={() => setIsFullscreenPreview(true)}
                className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all group"
                title="Fullscreen Preview"
              >
                <ArrowsOut className="w-4 h-4 group-hover:scale-110" />
              </button>
                <AutoScaledPreview>
                  <ResumePreview
                    data={previewData ?? effectiveData}
                    template={selectedTemplate}
                    themeColor={themeColor}
                    sectionOrder={sectionOrder as SectionKey[]}
                    sectionVisibility={resume.section_visibility?.[selectedTemplate]}
                    className="w-full shadow-2xl"
                    fullScale
                  />
                </AutoScaledPreview>
              </div>

          </div>
        )}
      </div>

      {/* Tailor Modal */}
      {/* Print-only full-scale preview for faithful PDF export */}
      <div className="print-resume hidden print:block">
        <ResumePreview
          data={effectiveData}
          template={selectedTemplate}
          themeColor={themeColor}
          sectionOrder={sectionOrder as SectionKey[]}
          sectionVisibility={resume.section_visibility?.[selectedTemplate]}
          fullScale
        />
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-surface-50 border border-white/[0.08] rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Delete this entry?</h3>
            <p className="text-sm text-zinc-500 mb-6">This can be undone with the undo button.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveToHistory(id);
                  if (confirmDelete.type === "experience") {
                    const next = [...(data.experience || [])];
                    next.splice(confirmDelete.index, 1);
                    updateResume(id, { data: { ...data, experience: next } });
                  } else {
                    const next = [...(data.education || [])];
                    next.splice(confirmDelete.index, 1);
                    updateResume(id, { data: { ...data, education: next } });
                  }
                  setConfirmDelete(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all uppercase tracking-widest"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showTailorDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => { setShowTailorDialog(false); setDraftResult(null); }}
        >
          <div
            className="bg-surface-50 border border-white/[0.08] rounded-[32px] w-full max-w-2xl mx-4 p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Experience Changes</h4>
                    <div className="space-y-3">
                      {draftResult.experience.map((exp, i) => {
                        const old = data.experience?.[i];
                        return (
                          <div key={i} className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 truncate">{old?.title || old?.company || `Entry ${i + 1}`} · Before</p>
                              <ul className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed list-disc pl-4 space-y-0.5">
                                {(old?.bullets || []).map((b, bi) => <li key={bi}>{b.replace(/<[^>]*>/g, "")}</li>)}
                              </ul>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 truncate">{exp.title || exp.company || `Entry ${i + 1}`} · After</p>
                              <ul className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed list-disc pl-4 space-y-0.5">
                                {(exp.bullets || []).map((b, bi) => <li key={bi}>{b.replace(/<[^>]*>/g, "")}</li>)}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
