'use client';

// NOTE: Resume templates use hardcoded hex colors (not design tokens) intentionally.
// Templates must be self-contained for PDF export and are not part of the app UI.

import React from 'react';
import DOMPurify from 'dompurify';
import { ResumeData, ResumeTheme, SectionKey, SkillItem, TechnicalSkillCategory, DEFAULT_SECTION_VISIBILITY } from '@/types';

const ALLOWED_TAGS = ['strong', 'em', 'u', 'b', 'i', 'br', 'span', 'mark', 'ul', 'ol', 'li', 'a', 'p', 's'];
const ALLOWED_ATTR: string[] = ['href', 'target', 'rel'];

export function sanitizeHtml(html: string): string {
 if (typeof window === 'undefined') {
 return html;
 }
 const purify = (DOMPurify as unknown as { default?: typeof DOMPurify }).default || DOMPurify;
 if (purify && typeof purify.sanitize === 'function') {
 return purify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
 }
 return html;
}

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

/* ─── Helper: get custom fields from personal info ─── */
export function getCustomFields(data: ResumeData): { label: string; value: string }[] {
  return data.personal?.custom_fields || [];
}

/* ─── Helper: get all contact items for header ─── */
export function getContactItems(data: ResumeData, visibility: Record<SectionKey, boolean>): string[] {
  const items: string[] = [];
  if (data.personal?.phone) items.push(data.personal.phone);
  if (data.personal?.email) items.push(data.personal.email);
  if (data.personal?.linkedin) items.push(data.personal.linkedin);
  if (data.personal?.website) items.push(data.personal.website);
  if (vis(visibility, 'portfolio') && data.personal?.portfolio_url) items.push(data.personal.portfolio_url);
  if (vis(visibility, 'visaStatus') && data.personal?.visa_status) items.push(data.personal.visa_status);
  for (const cf of getCustomFields(data)) {
    if (cf.value) items.push(cf.value);
  }
  return items;
}

/* ─── Helper: paper container style ─── */
export function paperStyle(theme: ResumeTheme): React.CSSProperties {
 return {
 fontFamily: theme.fontFamily || "'Inter', sans-serif",
 fontSize: `${theme.baseFontSize || 10}px`,
 lineHeight: theme.lineHeight || 1.3,
 color: theme.textColor || '#1a1a2e',
 backgroundColor: theme.backgroundColor || '#ffffff',
 padding: `${theme.pagePadding || 36}px`,
 width: '210mm',
 minHeight: '297mm',
 boxShadow: '0 2px 16px rgba(0, 0, 0, 0.1)',
 margin: '0 auto',
 };
}
