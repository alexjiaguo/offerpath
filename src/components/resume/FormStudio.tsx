"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { DndContext, closestCenter, type DragEndEvent, type DndContextProps } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { Resume, ResumeData, ResumeTheme, SectionKey } from "@/types";
import type { TailorResult } from "@/lib/aiService";
import ResumePreview from "@/components/resume/ResumePreview";
import { metaFor } from "@/components/resume/editor-helpers";
import { SortableSectionTab } from "@/components/resume/SortableSectionTab";
import { AutoScaledPreview } from "@/components/resume/AutoScaledPreview";
import { ResumeSectionEditors } from "@/components/resume/ResumeSectionEditors";
import { EditorChrome } from "@/components/resume/EditorChrome";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n";

export type PreviewShared = {
  data: ResumeData;
  template: string;
  theme: ResumeTheme;
  sectionOrder: SectionKey[];
  sectionVisibility?: Record<SectionKey, boolean>;
};

interface FormStudioProps {
  resume: Resume;
  resumeId: string;
  data: ResumeData;
  previewShared: PreviewShared;
  selectedTemplate: string;
  compactTabs: boolean;
  mounted: boolean;
  tabItems: string[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  saved: boolean;
  sensors: DndContextProps["sensors"];
  profileSummary: string;
  onTemplateChange: (tmplId: string) => void;
  onThemeChange: (updates: Partial<ResumeTheme>) => void;
  onApplyTailor: (result: TailorResult) => void;
  onSave: () => void;
  onSectionDragEnd: (event: DragEndEvent) => void;
  updateResume: (id: string, updates: { data: ResumeData }) => void;
  saveToHistory: (id: string) => void;
  undo: (id: string) => void;
  toggleVisibility: (id: string, template: string, sectionKey: SectionKey) => void;
}

export function FormStudio({
  resume,
  resumeId,
  data,
  previewShared,
  selectedTemplate,
  compactTabs,
  mounted,
  tabItems,
  activeSection,
  setActiveSection,
  saved,
  sensors,
  profileSummary,
  onTemplateChange,
  onThemeChange,
  onApplyTailor,
  onSave,
  onSectionDragEnd,
  updateResume,
  saveToHistory,
  undo,
  toggleVisibility,
}: FormStudioProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState<null | { type: "experience" | "education"; index: number }>(null);

  const getSectionLabel = (tabId: string, fallback: string) => {
    const key = `resumeStudio.sections.${tabId}` as const;
    try {
      const val = t(key);
      if (val && val !== key) return val;
    } catch {
      // fallback
    }
    return fallback;
  };

  const getSectionCount = (key: string): number | undefined => {
    switch (key) {
      case "experience":
        return data.experience?.length || 0;
      case "education":
        return data.education?.length || 0;
      case "technicalSkills":
        return data.technicalSkills?.length || 0;
      case "skills":
        return data.skills?.length || 0;
      case "projects":
        return data.projects?.length || 0;
      case "languages":
        return data.languages?.length || 0;
      case "certifications":
        return data.certifications?.length || 0;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-3">
      <EditorChrome
        data={data}
        resumeId={resumeId}
        profileSummary={profileSummary}
        onApplyTailor={onApplyTailor}
        saveToHistory={saveToHistory}
      />

      {mounted ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionDragEnd}>
          <SortableContext items={tabItems} strategy={rectSortingStrategy}>
            <div className="flex flex-wrap items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-xl p-1.5">
              {tabItems.map((tabId) => {
                const meta = metaFor(tabId);
                const isVisible = resume.section_visibility?.[selectedTemplate]?.[tabId as SectionKey] ?? true;
                const isPersonal = tabId === "personal";
                const count = getSectionCount(tabId);
                const label = getSectionLabel(tabId, meta.label);
                return (
                  <SortableSectionTab
                    key={tabId}
                    tabId={tabId}
                    label={label}
                    Icon={meta.icon}
                    isActive={activeSection === tabId}
                    isVisible={isVisible}
                    canToggle={!isPersonal}
                    disabled={isPersonal}
                    compact={compactTabs}
                    count={count}
                    onClick={() => setActiveSection(tabId)}
                    onToggleVisibility={() => toggleVisibility(resumeId, selectedTemplate, tabId as SectionKey)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-50 border border-surface-200 rounded-xl p-1.5">
          {tabItems.map((tabId) => {
            const meta = metaFor(tabId);
            const isVisible = resume.section_visibility?.[selectedTemplate]?.[tabId as SectionKey] ?? true;
            const isPersonal = tabId === "personal";
            const count = getSectionCount(tabId);
            const label = getSectionLabel(tabId, meta.label);
            return (
              <div
                key={tabId}
                role="tab"
                aria-selected={activeSection === tabId}
                title={label}
                onClick={() => setActiveSection(tabId)}
                className={cn(
                  "group flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap select-none",
                  activeSection === tabId ? "bg-surface-400 text-white shadow-sm" : "text-surface-300 hover:bg-surface-100 hover:text-surface-400",
                  !isVisible && "opacity-45"
                )}
              >
                <meta.icon className="w-3.5 h-3.5" />
                {!compactTabs && <span>{label}</span>}
                {count !== undefined && count > 0 && !compactTabs && (
                  <span
                    className={cn(
                      "text-[9px] px-1 py-0.2 rounded-full font-bold tabular-nums",
                      activeSection === tabId ? "bg-white/20 text-white" : "bg-surface-200 text-surface-400"
                    )}
                  >
                    {count}
                  </span>
                )}
                {!isPersonal && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(resumeId, selectedTemplate, tabId as SectionKey);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    title={isVisible ? t("resumeStudio.inlineControls.hideSection") : t("resumeStudio.inlineControls.showSection")}
                    className={cn(
                      "p-0.5 rounded transition-opacity ml-0.5",
                      activeSection === tabId ? "text-white/60 hover:text-white" : "text-surface-300 hover:text-surface-400"
                    )}
                  >
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeSlash className="w-3 h-3" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ResumeSectionEditors
        activeSection={activeSection}
        data={data}
        resumeId={resumeId}
        updateResume={updateResume}
        saveToHistory={saveToHistory}
        undo={undo}
        setConfirmDelete={setConfirmDelete}
      />

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-surface-50 border border-white/[0.08] rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-surface-400 mb-2">{t("resumeStudio.dialogs.deleteTitle")}</h3>
            <p className="text-sm text-surface-300 mb-6">{t("resumeStudio.dialogs.deleteDesc")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-surface-300 bg-surface-100 border border-surface-200 hover:bg-surface-200 transition-all uppercase tracking-widest"
              >
                {t("resumeStudio.dialogs.cancel")}
              </button>
              <button
                onClick={() => {
                  saveToHistory(resumeId);
                  if (confirmDelete.type === "experience") {
                    const next = [...(data.experience || [])];
                    next.splice(confirmDelete.index, 1);
                    updateResume(resumeId, { data: { ...data, experience: next } });
                  } else {
                    const next = [...(data.education || [])];
                    next.splice(confirmDelete.index, 1);
                    updateResume(resumeId, { data: { ...data, education: next } });
                  }
                  setConfirmDelete(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all uppercase tracking-widest"
              >
                {t("resumeStudio.dialogs.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
