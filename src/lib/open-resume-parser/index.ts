// Ported from OpenResume (https://github.com/xitanggg/open-resume)
// MIT License - adapted for OfferPath's ResumeData types

import type { ResumeData, ExperienceEntry, EducationEntry, SkillItem, ProjectEntry, PersonalInfo } from "@/types";
import { readPdfFromFile } from "./pdf-reader";
import { groupTextItemsIntoLines, groupLinesIntoSections } from "./pdf-reader";
import { extractResumeFromSections } from "./extractors";

/**
 * Parses a PDF resume file into structured ResumeData using OpenResume's
 * feature-scoring pipeline. No API key required - works entirely locally.
 *
 * Pipeline:
 * 1. Read PDF into text items (with x/y positions, font names, bold detection)
 * 2. Group text items into lines
 * 3. Group lines into sections (by heading heuristics)
 * 4. Extract structured resume data from sections (by feature scoring)
 * 5. Map OpenResume types -> OfferPath ResumeData
 */
export async function parseResumeFromPdf(file: File): Promise<Partial<ResumeData>> {
  const textItems = await readPdfFromFile(file);
  const lines = groupTextItemsIntoLines(textItems);
  const sections = groupLinesIntoSections(lines);
  const resume = extractResumeFromSections(sections);
  return mapToResumeData(resume);
}

// ── Date parsing ────────────────────────────────────

function parseDateRange(dateStr: string): { start_date: string; end_date: string; current: boolean } {
  if (!dateStr) return { start_date: "", end_date: "", current: false };

  // Split on common separators surrounded by spaces
  let parts = dateStr.split(/\s+(?:–|-|—|to)\s+/i);

  // Fallback: try without spaces (e.g., "2020-Present")
  if (parts.length === 1) {
    const m = dateStr.match(/^(.+?)(?:–|-|—)(.+)$/);
    if (m) {
      const before = m[1].trim();
      const after = m[2].trim();
      if (before.match(/\d{4}$/) && after.match(/^(?:\d{4}|Present|Current)/i)) {
        parts = [before, after];
      }
    }
  }

  const start_date = parts[0]?.trim() || "";
  const endPart = parts[1]?.trim() || "";
  const current = /present|current/i.test(endPart);
  const end_date = current ? "" : endPart;

  return { start_date, end_date, current };
}

// ── Type mapping ────────────────────────────────────

export function mapToResumeData(resume: ReturnType<typeof extractResumeFromSections>): Partial<ResumeData> {
  const p = resume.profile;
  if (!p.name && resume.workExperiences.length === 0) {
    return {};
  }

  const result: Partial<ResumeData> = {};

  const personal: PersonalInfo = {
    name: p.name || "",
    title: resume.workExperiences[0]?.jobTitle || undefined,
    email: p.email || undefined,
    phone: p.phone || undefined,
    location: p.location || undefined,
  };

  // Determine if url is LinkedIn or website
  const url = p.url || "";
  if (url.toLowerCase().includes("linkedin")) {
    personal.linkedin = url;
  } else if (url) {
    personal.website = url;
  }

  result.personal = personal;
  if (p.summary) {
    result.summary = p.summary;
  }

  // Work experiences -> ExperienceEntry[]
  if (resume.workExperiences.length > 0) {
    result.experience = resume.workExperiences.map((exp): ExperienceEntry => {
      const { start_date, end_date, current } = parseDateRange(exp.date);
      return {
        company: exp.company || "",
        title: exp.jobTitle || "",
        start_date,
        end_date,
        current,
        bullets: exp.descriptions || [],
      };
    });
  }

  // Educations -> EducationEntry[]
  if (resume.educations.length > 0) {
    result.education = resume.educations.map((edu): EducationEntry => {
      const { start_date, end_date } = parseDateRange(edu.date);
      return {
        institution: edu.school || "",
        degree: edu.degree || "",
        field: "",
        gpa: edu.gpa || undefined,
        start_date: start_date || undefined,
        end_date: end_date || undefined,
      };
    });
  }

  // Skills -> SkillItem[]
  const allSkillTexts: string[] = [];
  if (resume.skills.featuredSkills.length > 0) {
    allSkillTexts.push(...resume.skills.featuredSkills.map((s) => s.skill));
  }
  if (resume.skills.descriptions.length > 0) {
    allSkillTexts.push(...resume.skills.descriptions);
  }

  if (allSkillTexts.length > 0) {
    // Split comma-separated skills and flatten
    const skillNames = allSkillTexts
      .flatMap((text) => text.split(",").map((s) => s.trim()))
      .filter((s) => s && s.length > 0);

    result.skills = skillNames.map((name, i): SkillItem => ({
      id: String(i + 1),
      name,
      isHighlighted: false,
    }));

    // Also create a single technical skills category
    result.technicalSkills = [{
      id: "1",
      category: "Skills",
      skills: skillNames.join(", "),
    }];
  }

  // Projects -> ProjectEntry[]
  if (resume.projects.length > 0) {
    result.projects = resume.projects.map((proj): ProjectEntry => ({
      name: proj.project || "",
      description: (proj.descriptions || []).join(" "),
    }));
  }

  return result;
}
