"use client";

import { useState, useEffect } from "react";
import { User, FileText, Briefcase, GraduationCap, Wrench, Cpu, Translate, Certificate, FolderOpen } from "@phosphor-icons/react";
import type { ResumeData } from "@/types";

export type EditorMode = "form" | "richtext" | "markdown" | "preview";

export type SectionMeta = { key: string; label: string; icon: React.ComponentType<{ className?: string }> };

export const SECTION_META: SectionMeta[] = [
  { key: "personal", label: "Contact", icon: User },
  { key: "summary", label: "Summary", icon: FileText },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "technicalSkills", label: "Technical", icon: Cpu },
  { key: "languages", label: "Languages", icon: Translate },
  { key: "certifications", label: "Certifications", icon: Certificate },
  { key: "projects", label: "Projects", icon: FolderOpen },
];

export function metaFor(key: string): SectionMeta {
  return SECTION_META.find((m) => m.key === key) ?? SECTION_META[0];
}

/** Shared rich-text helpers (single source of truth — RichTextField and
 *  ResumeSectionEditors previously carried divergent copies). */
export function stripPTags(html: string): string {
  return html.replace(/<\/?p>/g, '');
}

export function ensureHtml(content: string): string {
  if (!content) return '<p></p>';
  if (content.startsWith('<')) return content;
  return `<p>${content}</p>`;
}

export function isResumeEmpty(data: ResumeData): boolean {
  const d = data ?? {};
  const has = (v: unknown) => {
    if (v == null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") {
      return Object.values(v as Record<string, unknown>).some(has);
    }
    return true;
  };
  // Check every content-bearing section — an education-only resume is NOT
  // empty (the old check looked at name/summary/experience only, so the
  // print path replaced real education data with placeholder).
  return !(
    has(d.personal) ||
    has(d.summary) ||
    has(d.experience) ||
    has(d.education) ||
    has(d.skills) ||
    has(d.technicalSkills) ||
    has(d.languages) ||
    has(d.certifications) ||
    has(d.projects)
  );
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}
