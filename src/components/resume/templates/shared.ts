'use client';

import React from 'react';
import { ResumeData, ResumeTheme, SectionKey, SkillItem, TechnicalSkillCategory, DEFAULT_SECTION_VISIBILITY } from '@/types';

/* ─── Shared props for all templates ─── */
export interface TemplateProps {
  data: ResumeData;
  theme: ResumeTheme;
  sectionOrder: SectionKey[];
  sectionVisibility: Record<SectionKey, boolean>;
}

/* ─── Helper: check if a section is visible ─── */
export function vis(visibility: Record<SectionKey, boolean>, key: SectionKey): boolean {
  return visibility[key] ?? DEFAULT_SECTION_VISIBILITY[key] ?? true;
}

/* ─── Helper: format date range ─── */
export function formatDates(start?: string, end?: string, current?: boolean): string {
  if (!start) return '';
  const endStr = current ? 'Present' : (end || '');
  return endStr ? `${start} – ${endStr}` : start;
}

/* ─── Helper: get skills as SkillItem[] ─── */
export function getSkills(data: ResumeData): SkillItem[] {
  if (!data.skills) return [];
  // Handle both string[] (legacy) and SkillItem[] formats
  return data.skills.map((s, i) => {
    if (typeof s === 'string') {
      return { id: `skill-${i}`, name: s, isHighlighted: false };
    }
    return s as SkillItem;
  });
}

/* ─── Helper: get technical skills ─── */
export function getTechSkills(data: ResumeData): TechnicalSkillCategory[] {
  return data.technicalSkills || [];
}

/* ─── Helper: paper container style ─── */
export function paperStyle(theme: ResumeTheme): React.CSSProperties {
  return {
    fontFamily: theme.fontFamily || "'Inter', sans-serif",
    fontSize: `${theme.baseFontSize || 11}px`,
    lineHeight: theme.lineHeight || 1.4,
    color: theme.textColor || '#1a1a2e',
    backgroundColor: theme.backgroundColor || '#ffffff',
    padding: `${theme.pagePadding || 30}px`,
    width: '210mm',
    minHeight: '297mm',
    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
  };
}
