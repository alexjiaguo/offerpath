import { useState, useEffect } from "react";
import { User, FileText, Briefcase, GraduationCap, Wrench, Cpu, Translate, Certificate, FolderOpen } from "@phosphor-icons/react";
import type { ResumeData } from "@/types";

export type EditorMode = "form" | "richtext" | "markdown" | "preview";

export type SectionMeta = { key: string; label: string; icon: React.ComponentType<{ className?: string }> };

export const SECTION_META: SectionMeta[] = [
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

export function metaFor(key: string): SectionMeta {
  return SECTION_META.find((m) => m.key === key) ?? SECTION_META[0];
}

export function isResumeEmpty(data: ResumeData): boolean {
  const noName = !data.personal?.name?.trim();
  const noSummary = !data.summary?.trim();
  const noExperience = !data.experience || data.experience.length === 0;
  return noName && noSummary && noExperience;
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
