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
            text: contactParts.join("  •  "),
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
            text: data.summary,
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
              text: `  |  ${exp.company}`,
              size: 22,
              font: "Calibri",
              color: "4b5563",
            }),
          ],
        })
      );

      // Date + Location line
      const dateParts: string[] = [];
      if (exp.start_date) dateParts.push(exp.start_date);
      dateParts.push(exp.current ? "Present" : exp.end_date || "");
      const dateStr = dateParts.join(" — ");
      const locStr = exp.location ? `  |  ${exp.location}` : "";

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
        if (bullet.trim()) {
          children.push(bulletItem(bullet));
        }
      }
    }
  }

  // ── Education ──
  if (data.education && data.education.length > 0) {
    children.push(sectionHeading("Education"));

    for (const edu of data.education) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.field}`,
              bold: true,
              size: 22,
              font: "Calibri",
              color: "111827",
            }),
          ],
        })
      );
      const eduDetails: string[] = [edu.institution];
      if (edu.end_date) eduDetails.push(edu.end_date);
      if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);

      children.push(
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({
              text: eduDetails.join("  |  "),
              size: 18,
              font: "Calibri",
              color: "6b7280",
            }),
          ],
        })
      );
    }
  }

  // ── Skills ──
  if (data.skills && data.skills.length > 0) {
    children.push(sectionHeading("Skills"));
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: data.skills.join("  •  "),
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
  const filename = title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");
  saveAs(blob, `${filename}.docx`);
}

// ── PDF Export (via browser print) ───────────────────

export function exportPDF() {
  window.print();
}
