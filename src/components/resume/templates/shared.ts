'use client';

// NOTE: Resume templates use hardcoded hex colors (not design tokens) intentionally.
// Templates must be self-contained for PDF export and are not part of the app UI.

import React from 'react';
import DOMPurify from 'dompurify';
import { ResumeData, ResumeTheme, SectionKey, SkillItem, TechnicalSkillCategory, DEFAULT_SECTION_VISIBILITY } from '@/types';
import { markdownInlineToHtml } from "@/lib/markdownInline";

export { markdownInlineToHtml, unwrapMarkdownBold } from "@/lib/markdownInline";

const ALLOWED_TAGS = ['strong', 'em', 'u', 'b', 'i', 'br', 'span', 'mark', 'ul', 'ol', 'li', 'a', 'p', 's'];
const ALLOWED_ATTR: string[] = ['href', 'target', 'rel'];

export function sanitizeHtml(html: string): string {
 const withEmphasis = markdownInlineToHtml(html);
 if (typeof window === 'undefined') {
 return withEmphasis;
 }
 const purify = (DOMPurify as unknown as { default?: typeof DOMPurify }).default || DOMPurify;
 if (purify && typeof purify.sanitize === 'function') {
 return purify.sanitize(withEmphasis, { ALLOWED_TAGS, ALLOWED_ATTR });
 }
 return withEmphasis;
}

/* ─── Shared props for all templates ─── */
export interface TemplateProps {
 data: ResumeData;
 theme: ResumeTheme;
 sectionOrder: SectionKey[];
 sectionVisibility: Record<SectionKey, boolean>;
}


/* ─── Helper: ensure a returned element has a key (for map callbacks) ─── */
export function keyElement(node: React.ReactNode, fallbackKey: string): React.ReactElement | null {
 if (!React.isValidElement(node)) return null;
 if (node.key != null) return node;
 return React.cloneElement(node, { key: fallbackKey });
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
  if (data.personal?.location) items.push(data.personal.location);
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
 fontSize: `${ theme.baseFontSize ?? 10 }px`,
 lineHeight: theme.lineHeight ?? 1.3,
 color: theme.textColor || '#1a1a2e',
 backgroundColor: theme.backgroundColor || '#ffffff',
 padding: `${ theme.pagePadding ?? 36 }px`,
 width: '210mm',
 minHeight: '297mm',
 boxShadow: '0 2px 16px rgba(0, 0, 0, 0.1)',
 margin: '0 auto',
 };
}

export interface ContactFieldItem {
  key: string;
  field: string;
  value: string;
  icon: string;
  label: string;
}

/* ─── Helper: contact items with field paths (for editable mode) ─── */
export function getContactItemsWithFields(
  data: ResumeData,
  visibility: Record<SectionKey, boolean>
): { field: string; value: string }[] {
  const items: { field: string; value: string }[] = [];
  if (data.personal?.phone) items.push({ field: "personal.phone", value: data.personal.phone });
  if (data.personal?.email) items.push({ field: "personal.email", value: data.personal.email });
  if (data.personal?.linkedin) items.push({ field: "personal.linkedin", value: data.personal.linkedin });
  if (data.personal?.location) items.push({ field: "personal.location", value: data.personal.location });
  if (data.personal?.website) items.push({ field: "personal.website", value: data.personal.website });
  if (vis(visibility, "portfolio") && data.personal?.portfolio_url)
    items.push({ field: "personal.portfolio_url", value: data.personal.portfolio_url });
  if (vis(visibility, "visaStatus") && data.personal?.visa_status)
    items.push({ field: "personal.visa_status", value: data.personal.visa_status });
  return items;
}

/* ─── Helper: get categorized structured contact fields with icons ─── */
export function getStructuredContactItems(
  data: ResumeData,
  visibility: Record<SectionKey, boolean>
): ContactFieldItem[] {
  const items: ContactFieldItem[] = [];
  if (data.personal?.phone) {
    items.push({ key: "phone", field: "personal.phone", value: data.personal.phone, icon: "📞", label: "Phone" });
  }
  if (data.personal?.email) {
    items.push({ key: "email", field: "personal.email", value: data.personal.email, icon: "✉", label: "Email" });
  }
  if (data.personal?.linkedin) {
    items.push({ key: "linkedin", field: "personal.linkedin", value: data.personal.linkedin, icon: "🔗", label: "LinkedIn" });
  }
  if (data.personal?.website) {
    items.push({ key: "website", field: "personal.website", value: data.personal.website, icon: "💻", label: "Website" });
  }
  if (data.personal?.location) {
    items.push({ key: "location", field: "personal.location", value: data.personal.location, icon: "📍", label: "Location" });
  }
  if (vis(visibility, "portfolio") && data.personal?.portfolio_url) {
    items.push({ key: "portfolio", field: "personal.portfolio_url", value: data.personal.portfolio_url, icon: "🌐", label: "Portfolio" });
  }
  if (vis(visibility, "visaStatus") && data.personal?.visa_status) {
    items.push({ key: "visa", field: "personal.visa_status", value: data.personal.visa_status, icon: "🛂", label: "Visa" });
  }
  for (let i = 0; i < (data.personal?.custom_fields || []).length; i++) {
    const cf = data.personal!.custom_fields![i];
    if (cf.value) {
      items.push({ key: `custom_${i}`, field: `personal.custom_fields[${i}].value`, value: cf.value, icon: "🏷", label: cf.label || "Custom" });
    }
  }
  return items;
}

