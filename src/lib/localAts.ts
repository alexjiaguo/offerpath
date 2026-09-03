import type { ResumeData, SkillItem } from "@/types";

export interface LocalAtsResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "will", "you", "our", "are", "have", "has",
  "this", "that", "from", "into", "your", "their", "they", "who", "all",
  "any", "can", "not", "but", "its", "it's", "was", "were", "been", "being",
  "about", "above", "across", "after", "before", "below", "between", "both",
  "each", "few", "more", "most", "other", "some", "such", "only", "own",
  "same", "than", "too", "very", "just", "also", "over", "under", "again",
  "here", "there", "when", "where", "why", "how", "what", "which", "while",
  "does", "did", "doing", "done", "require", "requires", "required",
  "looking", "seeking", "join", "team", "role", "work", "working", "years",
  "year", "experience", "experiences", "strong", "plus", "etc", "via",
  "per", "within", "must", "should", "would", "could", "may", "might",
  "including", "include", "includes", "ability", "abilities", "candidate",
  "candidates", "company", "companies", "new", "us", "we", "he", "she",
]);

const MAX_KEYWORDS = 60;
// Local keyword overlap systematically overstates vs LLM judgment, so a
// perfect 100 is withheld (95 cap) — but zero overlap honestly scores 0
// (the old MIN_SCORE=5 floor faked signal out of nothing).
const MAX_SCORE = 95;

function isCjk(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(text: string): string[] {
  const counts = new Map<string, number>();
  const rawTokens = text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\u4e00-\u9fa5\s-]/g, " ")
    .split(/[\s/|,;:!?()[\]{}"']+/)
    .map((w) => w.replace(/^[-.]+|[-.]+$/g, ""))
    .filter((w) => {
      if (w.length < 2 || w.length > 30) return false;
      if (/^\d+$/.test(w)) return false;
      if (STOPWORDS.has(w)) return false;
      return true;
    });

  for (const token of rawTokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_KEYWORDS)
    .map(([token]) => token);
}

export function resumeToText(data?: Partial<ResumeData>): string {
  if (!data) return "";
  const parts: (string | undefined)[] = [
    data.summary,
    data.personal?.title,
  ];
  for (const entry of data.experience ?? []) {
    parts.push(entry.title, entry.company, entry.location, ...entry.bullets);
  }
  for (const skill of (data.skills ?? []) as SkillItem[]) {
    parts.push(typeof skill === "string" ? skill : skill.name);
  }
  for (const tech of data.technicalSkills ?? []) {
    parts.push(tech.category, tech.skills);
  }
  for (const project of data.projects ?? []) {
    parts.push(project.name, project.description);
  }
  for (const cert of data.certifications ?? []) parts.push(cert);
  for (const language of data.languages ?? []) parts.push(language);
  for (const education of data.education ?? []) {
    parts.push(education.degree, education.field, education.institution);
  }
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function evaluateLocalAts(
  resumeData: Partial<ResumeData> | undefined,
  jobDescription: string
): LocalAtsResult {
  const resumeText = resumeToText(resumeData);

  if (!resumeText || !jobDescription?.trim()) {
    return { score: 0, matchedKeywords: [], missingKeywords: [] };
  }

  const keywords = tokenize(jobDescription);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    let hit: boolean;
    if (isCjk(keyword)) {
      hit = resumeText.includes(keyword);
    } else {
      hit = new RegExp(`\\b${escapeRegExp(keyword)}\\b`).test(resumeText);
    }
    if (hit) matched.push(keyword);
    else missing.push(keyword);
  }

  const total = matched.length + missing.length;
  if (total === 0) return { score: 0, matchedKeywords: [], missingKeywords: [] };

  const score = Math.min(
    MAX_SCORE,
    Math.round((matched.length / total) * 100)
  );
  return { score, matchedKeywords: matched, missingKeywords: missing };
}
