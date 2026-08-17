"use client";

import type { ResumeData } from "@/types";
import type { TailorResult } from "@/lib/aiService";
import AITailoringCard from "@/components/resume/AITailoringCard";

export interface EditorChromeProps {
  data: ResumeData;
  resumeId: string;
  profileSummary: string;
  onApplyTailor: (result: TailorResult) => void;
  saveToHistory: (id: string) => void;
}

export function EditorChrome({
  data,
  resumeId,
  profileSummary,
  onApplyTailor,
  saveToHistory,
}: EditorChromeProps) {
  return (
    <div className="space-y-2.5">
      <AITailoringCard
        resumeData={data}
        resumeId={resumeId}
        profileSummary={profileSummary}
        onApply={onApplyTailor}
        saveToHistory={saveToHistory}
      />
    </div>
  );
}
