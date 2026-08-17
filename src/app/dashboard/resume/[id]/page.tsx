"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowsClockwise,
  ArrowsIn,
  WarningCircle,
  PencilSimple,
  Check,
  FloppyDisk,
  ArrowCounterClockwise,
  NotePencil,
  CursorClick,
  Palette,
} from "@phosphor-icons/react";
import { useResumeStore, PLACEHOLDER_RESUME_DATA } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { cn } from "@/lib/utils";
import type { ResumeTheme, SectionKey, ResumeData, ResumeStudioMode } from "@/types";
import ResumePreview from "@/components/resume/ResumePreview";
import type { TailorResult } from "@/lib/aiService";
import { saveResumeAction } from "@/app/actions/resume";
import { motion, AnimatePresence } from "framer-motion";
import { PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { useDebouncedValue, isResumeEmpty, SECTION_META } from "@/components/resume/editor-helpers";
import { AutoScaledPreview } from "@/components/resume/AutoScaledPreview";
import { generateAtsPlainText } from "@/lib/atsTextLayer";
import {
  clampEditorWidth,
  DEFAULT_EDITOR_WIDTH,
  EDITOR_MIN_WIDTH,
  EDITOR_WIDTH_STORAGE_KEY,
} from "@/lib/editorSplit";
import { useTranslation } from "@/i18n";
import { FormStudio } from "@/components/resume/FormStudio";
import { ClickStudioLeft, ClickStudioPreview } from "@/components/resume/ClickStudio";
import ExportButtons from "@/components/resume/ExportButtons";
import { StudioCanvasDock } from "@/components/resume/StudioCanvasDock";
import TemplateDropdownPicker from "@/components/resume/TemplateDropdownPicker";
import ThemePicker from "@/components/resume/ThemePicker";

export default function ResumeEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslation();
  const { id } = use(params);
  const {
    getResumeById,
    updateResume,
    undo,
    redo,
    saveToHistory,
    toggleVisibility,
    canUndo,
    canRedo,
  } = useResumeStore();
  const { getProfileSummary } = useProfileStore();
  const resume = getResumeById(id);

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [editorWidth, setEditorWidth] = useState(DEFAULT_EDITOR_WIDTH);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume?.title || t("resumeStudio.untitledResume"));
  const titleInputRef = useRef<HTMLInputElement>(null);

  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const splitRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [widthHydrated, setWidthHydrated] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resume?.title) {
      setTitleInput(resume.title);
    }
  }, [resume?.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSubmit = async () => {
    const trimmed = titleInput.trim();
    if (!trimmed || trimmed === resume?.title) {
      setIsEditingTitle(false);
      return;
    }
    updateResume(id, { title: trimmed });
    setIsEditingTitle(false);
    toast.success(t("resumeStudio.titleUpdated"));
    const currentResume = getResumeById(id);
    if (currentResume) {
      const { editorMode: _mode, ...persistable } = currentResume;
      void _mode;
      await saveResumeAction(id, { ...persistable, title: trimmed });
    }
  };

  const clampToSplit = useCallback((width: number) => {
    const containerWidth = splitRef.current?.clientWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1200);
    return clampEditorWidth(width, containerWidth);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(EDITOR_WIDTH_STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed)) setEditorWidth(clampToSplit(parsed));
    }
    setWidthHydrated(true);
  }, [clampToSplit]);

  useEffect(() => {
    if (!widthHydrated) return;
    window.localStorage.setItem(EDITOR_WIDTH_STORAGE_KEY, String(editorWidth));
  }, [editorWidth, widthHydrated]);

  useEffect(() => {
    const el = splitRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setEditorWidth((width) => clampToSplit(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [clampToSplit, mounted]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      const delta = e.clientX - dragStateRef.current.startX;
      setEditorWidth(clampToSplit(dragStateRef.current.startWidth + delta));
    };
    const onUp = () => {
      dragStateRef.current = null;
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [clampToSplit]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>(resume?.template || "classic-minimal");
  const previewData = useDebouncedValue(resume?.data, 200);

  useEffect(() => {
    if (!isFullscreenPreview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreenPreview(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isFullscreenPreview]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="w-full animate-fade-in">
        <div className="card-editorial rounded-2xl p-12 text-center">
          <WarningCircle className="w-10 h-10 text-surface-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">{t.resumeStudio.resumeNotFound}</h2>
          <Link href="/dashboard/resume" className="text-sm text-brand-400 hover:text-brand-300">
            ← {t.resumeStudio.backToResumes}
          </Link>
        </div>
      </div>
    );
  }

  const data = resume.data;
  const resumeIsEmpty = isResumeEmpty(data);
  const effectiveData: ResumeData = resumeIsEmpty ? PLACEHOLDER_RESUME_DATA : data;
  const editorMode: ResumeStudioMode = resume.editorMode === "studio" ? "studio" : "form";

  const handleSave = async () => {
    updateResume(id, { template: selectedTemplate });
    const currentResume = getResumeById(id);
    if (currentResume) {
      const { editorMode: _mode, ...persistable } = currentResume;
      void _mode;
      const result = await saveResumeAction(id, { ...persistable, template: selectedTemplate });
      if (!result.success) {
        toast.error(t("resumeStudio.header.savedSyncError"));
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleApplyTailor = (result: TailorResult) => {
    updateResume(id, {
      data: { ...data, summary: result.summary, experience: result.experience },
    });
    toast.success(t("resumeStudio.header.tailorSuccess"));
  };

  const sectionOrder = resume.section_order || [
    "summary",
    "experience",
    "education",
    "technicalSkills",
    "skills",
    "languages",
    "certifications",
    "projects",
  ];

  const editableOrder: string[] = sectionOrder.filter((k): boolean => SECTION_META.some((m) => m.key === k));
  const tabItems = ["personal", ...editableOrder];

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = editableOrder.indexOf(String(active.id));
    const newIndex = editableOrder.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(editableOrder, oldIndex, newIndex);
    saveToHistory(id);
    updateResume(id, { section_order: newOrder as SectionKey[] });
  };

  const handleResetLayout = () => {
    setEditorWidth(clampToSplit(DEFAULT_EDITOR_WIDTH));
  };

  const handleSplitKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setEditorWidth((w) => clampToSplit(w - 16));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setEditorWidth((w) => clampToSplit(w + 16));
    } else if (e.key === "Home") {
      e.preventDefault();
      setEditorWidth(clampToSplit(EDITOR_MIN_WIDTH));
    } else if (e.key === "End") {
      e.preventDefault();
      setEditorWidth(clampToSplit(Number.POSITIVE_INFINITY));
    }
  };

  const setEditorMode = (mode: ResumeStudioMode) => {
    updateResume(id, { editorMode: mode });
  };

  const compactTabs = editorWidth < 360;
  const splitMax = splitRef.current
    ? Math.max(EDITOR_MIN_WIDTH, splitRef.current.clientWidth - 320 - 20)
    : EDITOR_MIN_WIDTH;
  const previewShared = {
    data: previewData ?? effectiveData,
    template: selectedTemplate,
    theme: resume.theme,
    sectionOrder: sectionOrder as SectionKey[],
    sectionVisibility: resume.section_visibility?.[selectedTemplate],
  };

  return (
    <div className="animate-fade-in w-full flex flex-col flex-1 min-h-0 md:overflow-hidden">
      <AnimatePresence>
        {isFullscreenPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface-0 flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b border-surface-200 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFullscreenPreview(false)}
                  className="p-2 rounded-xl bg-surface-50 border border-surface-200 text-surface-300 hover:text-surface-400 transition-all"
                  title={t("resumeStudio.header.closeFullscreen")}
                >
                  <ArrowsIn className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-surface-400 font-display">{resume.title}</h2>
                  <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">{t("resumeStudio.header.fullPagePreview")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExportButtons resumeData={data} resumeTitle={resume.title} />
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-900/40 p-8 sm:p-12 flex justify-center">
              <div className="w-full max-w-4xl shadow-[0_20px_70px_rgba(0,0,0,0.35)] h-fit">
                <ResumePreview {...previewShared} className="w-full" fullScale />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modernized Unified Studio Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0 pb-3 border-b border-surface-200">
        {/* Left: Back + Title & Rename + Status Pill */}
        {/* Left: Navigation, Title & Resume Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-shrink">
          <Link
            href="/dashboard/resume"
            className="p-2 rounded-xl bg-white border border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-50 transition-all shrink-0 shadow-2xs"
            aria-label={t("resumeStudio.backToResumes")}
            title={t("resumeStudio.backToResumes")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0 max-w-[170px] sm:max-w-[240px] md:max-w-[320px]">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-surface-300 truncate">
                {resume.is_base ? t("resumeStudio.header.masterResume") : t("resumeStudio.header.jobTailored")}
              </span>
              {resumeIsEmpty && editorMode === "form" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded shrink-0">
                  {t("resumeStudio.header.sampleBadge")}
                </span>
              )}
            </div>

            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSubmit();
                    if (e.key === "Escape") {
                      setTitleInput(resume.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="px-2 py-0.5 rounded-md border border-brand-500 bg-white text-sm sm:text-base font-bold text-surface-400 font-display focus:outline-none shadow-xs w-full max-w-xs"
                />
                <button
                  type="button"
                  onClick={handleTitleSubmit}
                  className="p-1 text-brand-600 hover:text-brand-700 shrink-0 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="group/title flex items-center gap-1.5 text-left min-w-0 max-w-full cursor-pointer"
                title={t("resumeStudio.header.clickToRename")}
              >
                <h1 className="text-sm sm:text-base font-bold text-surface-400 font-display tracking-tight truncate group-hover/title:text-brand-600 transition-colors">
                  {resume.title}
                </h1>
                <PencilSimple className="w-3.5 h-3.5 text-surface-300 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
              </button>
            )}
          </div>
        </div>

        {/* Center: Shared Global Template Selector + Content/Design Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-36 sm:w-44 shrink-0">
            <TemplateDropdownPicker
              selectedTemplate={selectedTemplate}
              onSelect={(tmplId) => {
                setSelectedTemplate(tmplId);
                updateResume(id, { template: tmplId });
              }}
            />
          </div>

          <div
            role="group"
            aria-label="Editor mode"
            className="flex items-center rounded-xl border border-surface-200 bg-surface-50 p-1 shadow-xs shrink-0"
          >
            <button
              type="button"
              onClick={() => setEditorMode("form")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                editorMode === "form"
                  ? "bg-white text-surface-400 shadow-sm"
                  : "text-surface-300 hover:text-surface-400"
              )}
              title={`${t("resumeStudio.contentMode")} (Form)`}
            >
              <NotePencil className="w-3.5 h-3.5" />
              <span>{t("resumeStudio.contentMode")}</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode("studio")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                editorMode === "studio"
                  ? "bg-white text-surface-400 shadow-sm"
                  : "text-surface-300 hover:text-surface-400"
              )}
              title={`${t("resumeStudio.designMode")} (Style)`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{t("resumeStudio.designMode")}</span>
            </button>
          </div>
        </div>

        {/* Right: History Actions + Save & Export */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-0.5 rounded-lg border border-surface-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => undo(id)}
              disabled={!canUndo}
              className="p-1.5 rounded-md text-surface-300 hover:text-surface-400 hover:bg-surface-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title={t("resumeStudio.undo")}
            >
              <ArrowCounterClockwise className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => redo(id)}
              disabled={!canRedo}
              className="p-1.5 rounded-md text-surface-300 hover:text-surface-400 hover:bg-surface-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title={t("resumeStudio.redo")}
            >
              <ArrowsClockwise className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetLayout}
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-surface-200 bg-white text-[11px] font-semibold text-surface-300 hover:text-surface-400 hover:bg-surface-50 transition-all shadow-xs"
            title={t("resumeStudio.header.resetSplit")}
          >
            <ArrowsClockwise className="w-3.5 h-3.5" />
            <span>{t("resumeStudio.reset")}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-xs",
              saved
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "bg-brand-500 border-brand-500 text-white hover:bg-brand-600 hover:border-brand-600"
            )}
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <FloppyDisk className="w-3.5 h-3.5" />}
            <span>{saved ? t("resumeStudio.saved") : t("resumeStudio.save")}</span>
          </button>

          <ExportButtons resumeData={data} resumeTitle={resume.title} />
        </div>
      </header>

      <div ref={splitRef} className="flex w-full flex-col md:flex-row md:flex-1 md:min-h-0">
        <div className="space-y-3 w-full max-md:!w-full md:shrink-0 min-w-0 overflow-y-auto" style={{ width: editorWidth }}>
          {editorMode === "form" ? (
            <FormStudio
              resume={resume}
              resumeId={id}
              data={data}
              previewShared={previewShared}
              selectedTemplate={selectedTemplate}
              compactTabs={compactTabs}
              mounted={mounted}
              tabItems={tabItems}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              saved={saved}
              sensors={sensors}
              profileSummary={getProfileSummary()}
              onTemplateChange={(tmplId) => {
                saveToHistory(id);
                setSelectedTemplate(tmplId);
                updateResume(id, { template: tmplId });
              }}
              onThemeChange={(updates) => {
                saveToHistory(id);
                updateResume(id, { theme: { ...resume.theme, ...updates } as ResumeTheme });
              }}
              onApplyTailor={handleApplyTailor}
              onSave={handleSave}
              onSectionDragEnd={handleSectionDragEnd}
              updateResume={updateResume}
              saveToHistory={saveToHistory}
              undo={undo}
              toggleVisibility={toggleVisibility}
            />
          ) : (
            <ClickStudioLeft
              theme={resume.theme}
              onThemeChange={(updates) => {
                saveToHistory(id);
                updateResume(id, { theme: { ...resume.theme, ...updates } as ResumeTheme });
              }}
              selectedTemplate={selectedTemplate}
              onTemplateChange={(tmplId) => {
                saveToHistory(id);
                setSelectedTemplate(tmplId);
                updateResume(id, { template: tmplId });
              }}
              resumeData={data}
              resumeId={id}
              resumeTitle={resume.title}
              profileSummary={getProfileSummary()}
              onApplyTailor={handleApplyTailor}
              saveToHistory={saveToHistory}
              onSave={handleSave}
              saved={saved}
              preview={
                <AutoScaledPreview fit="width">
                  <ResumePreview {...previewShared} />
                </AutoScaledPreview>
              }
            />
          )}
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor panel"
          aria-valuenow={editorWidth}
          aria-valuemin={EDITOR_MIN_WIDTH}
          aria-valuemax={splitMax}
          aria-valuetext={`${editorWidth} pixels`}
          tabIndex={0}
          onKeyDown={handleSplitKeyDown}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture(e.pointerId);
            dragStateRef.current = { startX: e.clientX, startWidth: editorWidth };
            setIsResizing(true);
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
          onDoubleClick={handleResetLayout}
          className="relative hidden md:flex w-5 mx-0.5 self-stretch items-center justify-center cursor-col-resize group touch-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm"
          title="Drag to resize — double-click or Reset layout to restore"
        >
          <div
            className={cn(
              "w-1 h-full rounded-full transition-colors",
              isResizing ? "bg-brand-500" : "bg-surface-200 group-hover:bg-brand-500/60"
            )}
          />
          {isResizing && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-1.5 py-0.5 rounded-md bg-surface-400 text-white text-[10px] font-bold tabular-nums pointer-events-none shadow-lg">
              {editorWidth}px
            </div>
          )}
        </div>

        {editorMode === "form" ? (
          <div className="flex-1 min-w-0 md:min-w-[320px] overflow-hidden">
            <div className="relative bg-slate-100/90 dark:bg-slate-950/60 rounded-2xl p-3 sm:p-5 border border-surface-200 shadow-inner overflow-hidden min-h-[400px] md:min-h-0 md:h-full flex justify-center">
              <StudioCanvasDock
                resumeData={data}
                onFullscreen={() => setIsFullscreenPreview(true)}
              />
              <AutoScaledPreview isResizing={isResizing}>
                <ResumePreview {...previewShared} className="w-full shadow-[0_10px_35px_rgba(0,0,0,0.15)]" fullScale />
              </AutoScaledPreview>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 md:min-w-[320px] min-h-0">
            <ClickStudioPreview
              resumeId={id}
              data={data}
              template={selectedTemplate}
              theme={resume.theme}
              sectionOrder={sectionOrder as SectionKey[]}
              sectionVisibility={resume.section_visibility?.[selectedTemplate]}
              updateResume={updateResume}
              saveToHistory={saveToHistory}
              toggleVisibility={toggleVisibility}
              undo={undo}
              redo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onFullscreen={() => setIsFullscreenPreview(true)}
            />
          </div>
        )}
      </div>

      <div className="print-resume hidden print:block">
        <ResumePreview {...previewShared} data={effectiveData} fullScale />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            fontSize: "1px",
            lineHeight: 0,
            color: "#ffffff",
            overflow: "hidden",
            pointerEvents: "none",
            opacity: 0.01,
            zIndex: -1,
          }}
        >
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, padding: 0 }}>
            {generateAtsPlainText(effectiveData)}
          </pre>
        </div>
      </div>
    </div>
  );
}
