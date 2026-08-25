"use client";

import type { ResumeData, ResumeTheme, SectionKey } from "@/types";
import type { TailorResult } from "@/lib/aiService";
import ResumePreview from "@/components/resume/ResumePreview";
import { AutoScaledPreview } from "@/components/resume/AutoScaledPreview";
import { EditProvider } from "@/components/resume/editable/EditContext";
import { FormatToolbar } from "@/components/resume/editable/FormatToolbar";
import { StylePanel } from "@/components/resume/editable/StylePanel";
import { StudioCanvasDock } from "@/components/resume/StudioCanvasDock";

interface ClickStudioLeftProps {
  theme: ResumeTheme;
  onThemeChange: (updates: Partial<ResumeTheme>) => void;
  resumeData: ResumeData;
  resumeId: string;
  profileSummary: string;
  onApplyTailor: (result: TailorResult) => void;
  saveToHistory: (id: string) => void;
}

export function ClickStudioLeft(props: ClickStudioLeftProps) {
  return <StylePanel {...props} />;
}

interface ClickStudioPreviewProps {
  resumeId: string;
  data: ResumeData;
  template: string;
  theme: ResumeTheme;
  sectionOrder: SectionKey[];
  sectionVisibility?: Record<SectionKey, boolean>;
  updateResume: (id: string, updates: { data: ResumeData }) => void;
  saveToHistory: (id: string) => void;
  toggleVisibility: (id: string, template: string, sectionKey: SectionKey) => void;
  undo: (id: string) => void;
  redo: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onFullscreen: () => void;
}

export function ClickStudioPreview({
  resumeId,
  data,
  template,
  theme,
  sectionOrder,
  sectionVisibility,
  updateResume,
  saveToHistory,
  toggleVisibility,
  undo,
  redo,
  canUndo,
  canRedo,
  onFullscreen,
}: ClickStudioPreviewProps) {
  return (
    <EditProvider
      editable
      data={data}
      resumeId={resumeId}
      updateResume={updateResume}
      saveToHistory={saveToHistory}
      toggleVisibility={toggleVisibility}
      template={template}
    >
      <div className="h-full min-h-0 flex flex-col">
        <FormatToolbar
          onUndo={() => undo(resumeId)}
          onRedo={() => redo(resumeId)}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <div
          data-live-preview
          className="relative flex-1 min-h-0 overflow-y-auto bg-surface-50 rounded-2xl p-3 sm:p-5 border border-surface-200 shadow-inner flex justify-center"
        >
          <StudioCanvasDock
            resumeData={data}
            onFullscreen={onFullscreen}
          />
          <AutoScaledPreview fit="width">
            <ResumePreview
              data={data}
              template={template}
              theme={theme}
              sectionOrder={sectionOrder}
              sectionVisibility={sectionVisibility}
              className="w-full shadow-2xl"
              fullScale
            />
          </AutoScaledPreview>
        </div>
      </div>
    </EditProvider>
  );
}
