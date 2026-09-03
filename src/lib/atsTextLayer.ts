import type { ResumeData } from "@/types";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

/**
 * Generates a linear plaintext version of the resume for ATS parsers.
 * This text is injected as a near-invisible layer in the print/PDF output
 * so that ATS systems (pdf-parse, pdftotext) can extract structured content
 * even from two-column visual layouts.
 */
export function generateAtsPlainText(data: ResumeData): string {
  const lines: string[] = [];
  const p = data.personal;

  if (p?.name) lines.push(p.name);
  if (p?.title) lines.push(p.title);

  const contactParts: string[] = [];
  if (p?.phone) contactParts.push(p.phone);
  if (p?.email) contactParts.push(p.email);
  if (p?.location) contactParts.push(p.location);
  if (p?.linkedin) contactParts.push(p.linkedin);
  if (p?.website) contactParts.push(p.website);
  if (p?.portfolio_url) {
    contactParts.push(p.portfolio_label ? `${p.portfolio_label}: ${p.portfolio_url}` : p.portfolio_url);
  }
  if (p?.visa_status) {
    contactParts.push(p.visa_label ? `${p.visa_label}: ${p.visa_status}` : p.visa_status);
  }
  for (const field of p?.custom_fields ?? []) {
    if (field?.value) {
      contactParts.push(field.label ? `${field.label}: ${field.value}` : String(field.value));
    }
  }
  if (contactParts.length) lines.push(contactParts.join(" | "));

  if (data.summary) {
    lines.push("");
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(stripHtml(data.summary));
  }

  if (data.experience?.length) {
    lines.push("");
    lines.push("PROFESSIONAL EXPERIENCE");
    for (const exp of data.experience) {
      lines.push("");
      if (exp.title) lines.push(exp.title);
      if (exp.company) {
        const companyLine = exp.location
          ? `${exp.company} - ${exp.location}`
          : exp.company;
        const dates = [exp.start_date, exp.current ? "Present" : exp.end_date]
          .filter(Boolean)
          .join(" - ");
        lines.push(dates ? `${companyLine} | ${dates}` : companyLine);
      }
      for (const bullet of exp.bullets || []) {
        const plain = stripHtml(bullet);
        if (plain) lines.push(`- ${plain}`);
      }
    }
  }

  if (data.education?.length) {
    lines.push("");
    lines.push("EDUCATION");
    for (const edu of data.education) {
      const parts: string[] = [];
      if (edu.institution) parts.push(edu.institution);
      if (edu.degree) parts.push(edu.degree);
      if (edu.field) parts.push(edu.field);
      if (edu.location) parts.push(edu.location);
      if (edu.gpa) parts.push(`GPA: ${edu.gpa}`);
      const dates = [edu.start_date, edu.end_date].filter(Boolean).join(" - ");
      if (dates) parts.push(dates);
      if (parts.length) lines.push(parts.join(", "));
    }
  }

  if (data.skills?.length) {
    lines.push("");
    lines.push("KEY SKILLS");
    lines.push(
      data.skills
        .map((s) => (typeof s === "string" ? s : s.name))
        .join(", ")
    );
  }

  if (data.technicalSkills?.length) {
    lines.push("");
    lines.push("TECHNICAL SKILLS");
    for (const cat of data.technicalSkills) {
      lines.push(`${cat.category}: ${cat.skills}`);
    }
  }

  if (data.projects?.length) {
    lines.push("");
    lines.push("PROJECTS");
    for (const proj of data.projects) {
      const parts: string[] = [];
      if (proj.name) parts.push(proj.name);
      if (proj.description) parts.push(stripHtml(proj.description));
      if (proj.url) parts.push(proj.url);
      if (proj.tech?.length) parts.push(proj.tech.join(", "));
      if (parts.length) lines.push(parts.join(" - "));
    }
  }

  if (data.languages?.length) {
    lines.push("");
    lines.push("LANGUAGES");
    lines.push(data.languages.join(", "));
  }

  if (data.certifications?.length) {
    lines.push("");
    lines.push("CERTIFICATIONS");
    lines.push(data.certifications.join(", "));
  }

  return lines.join("\n");
}
