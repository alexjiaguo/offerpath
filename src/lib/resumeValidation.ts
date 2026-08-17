import type { ResumeData } from "@/types";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
}

const BANNED_WORDS = [
  "spearheaded", "orchestrated", "leveraged", "utilized",
  "synergized", "fostered a culture of", "drove meaningful impact",
  "cutting-edge", "state-of-the-art", "best-in-class",
  "passionate about", "results-driven", "devise robust strategies",
  "comprehensive solution", "seamless integration", "holistic approach",
  "key stakeholders", "cross-functional collaboration",
];

const FIRST_PERSON_RE = /\b(I|me|my|we|our|mine|ours)\b/i;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function checkBannedWords(text: string, field: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const lower = text.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      issues.push({
        field,
        severity: "warning",
        message: `Banned word: "${word}". Use plain, direct verbs instead.`,
      });
    }
  }
  return issues;
}

function checkMetrics(text: string, field: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const hasNumber = /\d/.test(text);
  if (!hasNumber && text.length > 20) {
    issues.push({
      field,
      severity: "info",
      message: "No metrics found. Add concrete numbers (e.g., 50%, $2M, 3x).",
    });
  }
  return issues;
}

function checkFirstPerson(text: string, field: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const plain = stripHtml(text);
  if (FIRST_PERSON_RE.test(plain)) {
    issues.push({
      field,
      severity: "warning",
      message: "Avoid first-person pronouns (I, me, my). Use action verbs.",
    });
  }
  return issues;
}

export function validateResume(data: ResumeData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Summary
  if (data.summary) {
    const plain = stripHtml(data.summary);
    issues.push(...checkBannedWords(plain, "Summary"));
    issues.push(...checkFirstPerson(data.summary, "Summary"));
  }

  // Experience bullets
  (data.experience || []).forEach((exp, idx) => {
    if (!exp.title?.trim()) {
      issues.push({ field: `Experience ${idx + 1}`, severity: "error", message: "Missing job title." });
    }
    if (!exp.company?.trim()) {
      issues.push({ field: `Experience ${idx + 1}`, severity: "error", message: "Missing company name." });
    }
    (exp.bullets || []).forEach((bullet, bi) => {
      const plain = stripHtml(bullet);
      issues.push(...checkBannedWords(plain, `${exp.title || `Experience ${idx + 1}`} bullet ${bi + 1}`));
      issues.push(...checkMetrics(plain, `${exp.title || `Experience ${idx + 1}`} bullet ${bi + 1}`));
      issues.push(...checkFirstPerson(bullet, `${exp.title || `Experience ${idx + 1}`} bullet ${bi + 1}`));
    });
  });

  // Skills count
  const skills = data.skills || [];
  if (skills.length > 0 && skills.length < 10) {
    issues.push({
      field: "Skills",
      severity: "info",
      message: `${skills.length} skills. Consider adding more (10-20 recommended).`,
    });
  }
  if (skills.length > 20) {
    issues.push({
      field: "Skills",
      severity: "warning",
      message: `${skills.length} skills. Consider trimming to 10-20 most relevant.`,
    });
  }

  // Projects
  (data.projects || []).forEach((proj, idx) => {
    if (!proj.name?.trim()) {
      issues.push({ field: `Project ${idx + 1}`, severity: "error", message: "Missing project name." });
    }
    if (proj.description && proj.description.length > 0) {
      const plain = stripHtml(proj.description);
      issues.push(...checkBannedWords(plain, `Project: ${proj.name || idx + 1}`));
    }
  });

  // Personal info
  if (!data.personal?.name?.trim()) {
    issues.push({ field: "Contact", severity: "error", message: "Missing name." });
  }
  if (!data.personal?.email?.trim()) {
    issues.push({ field: "Contact", severity: "warning", message: "Missing email." });
  }

  return issues;
}

export function getIssueCounts(issues: ValidationIssue[]) {
  return {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };
}
