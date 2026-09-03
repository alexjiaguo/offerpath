/* ═══════════════════════════════════════════════════
 exportDocx — Convert ResumeData → DOCX
 Uses the `docx` package to generate a .docx file
 ═══════════════════════════════════════════════════ */

import {
 Document,
 Paragraph,
 TextRun,
 HeadingLevel,
 AlignmentType,
 Packer,
} from "docx";
import { saveAs } from "file-saver";
import type { ResumeData } from "@/types";

/**
 * Bullets/summaries edited in the rich-text studio carry inline HTML
 * (<strong>, <em>, ...). DOCX TextRun takes plain text — strip tags (and
 * decode common entities) so literal "<strong>$50M+ ARR</strong>" never
 * lands in the exported document.
 */
export function stripHtmlForDocx(value: string | undefined | null): string {
 if (!value) return "";
 return value
 .replace(/<br\s*\/?>/gi, " ")
 .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
 .replace(/<[^>]*>/g, "")
 .replace(/&nbsp;/g, " ")
 .replace(/&amp;/g, "&")
 .replace(/&lt;/g, "<")
 .replace(/&gt;/g, ">")
 .replace(/&quot;/g, '"')
 .replace(/&#39;/g, "'")
 .replace(/\s+/g, " ")
 .trim();
}

// ── Section Heading ──────────────────────────────────

function sectionHeading(text: string): Paragraph {
 return new Paragraph({
 heading: HeadingLevel.HEADING_2,
 spacing: { before: 240, after: 120 },
 border: {
 bottom: { color: "4f46e5", size: 1, space: 4, style: "single" as const },
 },
 children: [
 new TextRun({
 text: text.toUpperCase(),
 bold: true,
 size: 22,
 font: "Calibri",
 color: "1f2937",
 }),
 ],
 });
}

// ── Bullet Point ─────────────────────────────────────

function bulletItem(text: string): Paragraph {
 return new Paragraph({
 bullet: { level: 0 },
 spacing: { after: 40 },
 children: [
 new TextRun({
 text,
 size: 20,
 font: "Calibri",
 color: "374151",
 }),
 ],
 });
}

// ── Generate DOCX ────────────────────────────────────

export async function generateDocx(data: ResumeData, title: string) {
 const children: Paragraph[] = [];

 // ── Header: Name ──
 if (data.personal?.name) {
 children.push(
 new Paragraph({
 alignment: AlignmentType.CENTER,
 spacing: { after: 80 },
 children: [
 new TextRun({
 text: data.personal.name,
 bold: true,
 size: 32,
 font: "Calibri",
 color: "111827",
 }),
 ],
 })
 );
 }

 // ── Contact line ──
 const contactParts: string[] = [];
 if (data.personal?.email) contactParts.push(data.personal.email);
 if (data.personal?.phone) contactParts.push(data.personal.phone);
 if (data.personal?.location) contactParts.push(data.personal.location);
 if (data.personal?.linkedin) contactParts.push(data.personal.linkedin);
 if (data.personal?.website) contactParts.push(data.personal.website);

 if (contactParts.length > 0) {
 children.push(
 new Paragraph({
 alignment: AlignmentType.CENTER,
 spacing: { after: 200 },
 children: [
 new TextRun({
 text: contactParts.join(" • "),
 size: 18,
 font: "Calibri",
 color: "6b7280",
 }),
 ],
 })
 );
 }

 // ── Summary ──
 if (data.summary) {
 children.push(sectionHeading("Professional Summary"));
  children.push(
  new Paragraph({
  spacing: { after: 120 },
  children: [
  new TextRun({
  text: stripHtmlForDocx(data.summary),
  size: 20,
  font: "Calibri",
  color: "374151",
  }),
  ],
  })
  );
 }

 // ── Experience ──
 if (data.experience && data.experience.length > 0) {
 children.push(sectionHeading("Professional Experience"));

 for (const exp of data.experience) {
 // Title + Company line
 children.push(
 new Paragraph({
 spacing: { before: 120, after: 40 },
 children: [
 new TextRun({
 text: exp.title,
 bold: true,
 size: 22,
 font: "Calibri",
 color: "111827",
 }),
 new TextRun({
 text: ` | ${exp.company}`,
 size: 22,
 font: "Calibri",
 color: "4b5563",
 }),
 ],
 })
 );

  // Date + Location line (omit the end part when empty — no trailing dash)
  const dateParts: string[] = [];
  if (exp.start_date) dateParts.push(exp.start_date);
  const endPart = exp.current ? "Present" : exp.end_date || "";
  if (endPart) dateParts.push(endPart);
  const dateStr = dateParts.join(" — ");
 const locStr = exp.location ? ` | ${exp.location}` : "";

 children.push(
 new Paragraph({
 spacing: { after: 60 },
 children: [
 new TextRun({
 text: dateStr + locStr,
 italics: true,
 size: 18,
 font: "Calibri",
 color: "9ca3af",
 }),
 ],
 })
 );

  // Bullets
  for (const bullet of exp.bullets || []) {
  const plain = stripHtmlForDocx(bullet);
  if (plain) {
  children.push(bulletItem(plain));
  }
  }
 }
 }

 // ── Education ──
 if (data.education && data.education.length > 0) {
 children.push(sectionHeading("Education"));

 for (const edu of data.education) {
 const degreeText = [edu.degree, edu.field].filter(Boolean).join(" in ") || edu.degree || "Degree";
 children.push(
 new Paragraph({
 spacing: { before: 120, after: 40 },
 children: [
 new TextRun({
 text: degreeText,
 bold: true,
 size: 22,
 font: "Calibri",
 color: "111827",
 }),
 ],
 })
 );
 const eduDetails: string[] = [edu.institution].filter(Boolean);
 if (edu.end_date) eduDetails.push(edu.end_date);
 if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);

 if (eduDetails.length > 0) {
 children.push(
 new Paragraph({
 spacing: { after: 80 },
 children: [
 new TextRun({
 text: eduDetails.join(" | "),
 size: 18,
 font: "Calibri",
 color: "6b7280",
 }),
 ],
 })
 );
 }
 }
 }

 // ── Technical Skills ──
 if (data.technicalSkills && data.technicalSkills.length > 0) {
 children.push(sectionHeading("Technical Skills"));
 for (const cat of data.technicalSkills) {
 children.push(
 new Paragraph({
 spacing: { after: 60 },
 children: [
 new TextRun({
 text: `${cat.category}: `,
 bold: true,
 size: 20,
 font: "Calibri",
 color: "111827",
 }),
 new TextRun({
 text: cat.skills,
 size: 20,
 font: "Calibri",
 color: "374151",
 }),
 ],
 })
 );
 }
 }

 // ── Skills ──
 if (data.skills && data.skills.length > 0) {
 const skillNames = data.skills
 .map((s) => (typeof s === "string" ? s : s.name))
 .filter(Boolean);

 if (skillNames.length > 0) {
 children.push(sectionHeading("Skills"));
 children.push(
 new Paragraph({
 spacing: { after: 120 },
 children: [
 new TextRun({
 text: skillNames.join(" • "),
 size: 20,
 font: "Calibri",
 color: "374151",
 }),
 ],
 })
 );
 }
 }

 // ── Projects ──
 if (data.projects && data.projects.length > 0) {
 children.push(sectionHeading("Projects"));
 for (const proj of data.projects) {
 const headerRuns: TextRun[] = [
 new TextRun({
 text: proj.name,
 bold: true,
 size: 22,
 font: "Calibri",
 color: "111827",
 }),
 ];
 if (proj.url) {
 headerRuns.push(
 new TextRun({
 text: ` | ${proj.url}`,
 size: 18,
 font: "Calibri",
 color: "6b7280",
 })
 );
 }
 children.push(
 new Paragraph({
 spacing: { before: 120, after: 40 },
 children: headerRuns,
 })
 );

  if (proj.description) {
  children.push(
  new Paragraph({
  spacing: { after: 60 },
  children: [
  new TextRun({
  text: stripHtmlForDocx(proj.description),
  size: 20,
  font: "Calibri",
  color: "374151",
  }),
  ],
  })
  );
  }
 }
 }

 // ── Languages ──
 if (data.languages && data.languages.length > 0) {
 children.push(sectionHeading("Languages"));
 children.push(
 new Paragraph({
 spacing: { after: 120 },
 children: [
 new TextRun({
 text: data.languages.join(" • "),
 size: 20,
 font: "Calibri",
 color: "374151",
 }),
 ],
 })
 );
 }

 // ── Certifications ──
 if (data.certifications && data.certifications.length > 0) {
 children.push(sectionHeading("Certifications"));
 children.push(
 new Paragraph({
 spacing: { after: 120 },
 children: [
 new TextRun({
 text: data.certifications.join(" • "),
 size: 20,
 font: "Calibri",
 color: "374151",
 }),
 ],
 })
 );
 }

 // ── Build Document ──
 const doc = new Document({
 sections: [
 {
 properties: {
 page: {
 margin: {
 top: 720,
 right: 720,
 bottom: 720,
 left: 720,
 },
 },
 },
 children,
 },
 ],
 });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  // \p{L} / \p{N} keep CJK (and other Unicode) letters — the old
  // [a-zA-Z0-9] class stripped Chinese titles down to "_.docx".
  const filename = (title || "resume")
  .replace(/[^\p{L}\p{N}\s-]/gu, "")
  .trim()
  .replace(/\s+/g, "_") || "resume";
  saveAs(blob, `${filename}.docx`);
}

// ── PDF Export (via browser print) ───────────────────

export function exportPDF() {
 window.print();
}
