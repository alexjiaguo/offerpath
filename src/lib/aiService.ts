import { logger } from "@/lib/logger";
/* ═══════════════════════════════════════════════════
 OfferPath — AI Service
 Supports both mock (fallback) and real LLM calls.
 When API keys are configured in profileStore,
 routes to OpenAI/Anthropic/Gemini/DeepSeek.
 Otherwise falls back to mock implementations.
 ═══════════════════════════════════════════════════ */

import type { ResumeData, ExperienceEntry, Story } from "@/types";
import DOMPurify from 'dompurify';
import { ResumeParserService } from "@/lib/ResumeParserService";
import { useProfileStore } from "@/store/profileStore";
import { LLM_PROVIDER_CONFIG, type LLMProvider } from "@/lib/llmProviders";

// ── Real API Integration ───────────────────────────

interface LLMConfig {
 provider: LLMProvider;
 apiKey?: string;
 baseUrl?: string;
 model?: string;
}

/**
 * Extracts a JSON block (object or array) from a string by finding
 * the first '{' or '[' and the matching last '}' or ']'.
 */
function extractJsonBlock(text: string): string {
 const firstBrace = text.indexOf("{");
 const firstBracket = text.indexOf("[");
 
 let startIdx = -1;
 let isArray = false;
 
 if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
 startIdx = firstBrace;
 isArray = false;
 } else if (firstBracket !== -1) {
 startIdx = firstBracket;
 isArray = true;
 }
 
 if (startIdx === -1) {
 return text.trim();
 }
 
 const endIdx = isArray ? text.lastIndexOf("]") : text.lastIndexOf("}");
 
 if (endIdx === -1 || endIdx < startIdx) {
 return text.substring(startIdx).trim();
 }
 
 return text.substring(startIdx, endIdx + 1).trim();
}

async function callLLM(config: LLMConfig, systemPrompt: string, userPrompt: string): Promise<string> {
 const { provider, apiKey } = config;
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), 30000);

 let res: Response;
 try {
  res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
 body: JSON.stringify({
 action: "call-llm",
 provider,
 apiKey,
 baseUrl: config.baseUrl,
 model: config.model,
 systemPrompt,
 userPrompt,
 }),
    signal: controller.signal,
  });
 } catch (err) {
  if (err instanceof Error && err.name === "AbortError") {
    throw new Error("AI request timed out");
  }
  throw err;
 } finally {
  clearTimeout(timer);
 }

 if (!res.ok) {
 const errText = await res.text();
 let errMsg = `${provider} proxy error (status ${res.status})`;
 try {
 const parsed = JSON.parse(errText);
 if (parsed.error) errMsg = parsed.error;
 } catch {
 if (errText) errMsg += `: ${errText}`;
 }
 throw new Error(errMsg);
 }

 const data = await res.json();
 if (data.error) {
 throw new Error(data.error);
 }
 return data.content;
}

/** Get the best available LLM config from the profile store */
export function getLLMConfig(): LLMConfig | null {
 try {
 const store = useProfileStore.getState();
 const priority: LLMProvider[] = [
 "openai",
 "anthropic",
 "deepseek",
 "gemini",
 "mistral",
 "openrouter",
 "perplexity",
 "ollama",
 "lmstudio",
 ];
 for (const p of priority) {
 const key = store.apiKeys.find((k: { provider: string; status: string }) => k.provider === p && k.status === "active");
 const providerConfig = LLM_PROVIDER_CONFIG[p];
 const hasUsableKey = !!key?.key?.trim() || !providerConfig.apiKeyRequired;
 if (key && hasUsableKey) {
 return {
 provider: p,
 apiKey: key.key?.trim() || undefined,
 baseUrl: key.baseUrl?.trim() || providerConfig.defaultBaseUrl,
 model: key.model?.trim() || providerConfig.defaultModel,
 };
 }
 }
 } catch {
 // Store not available (SSR, etc.)
 }

 return null;
}

const SANITIZE_ALLOWED_TAGS = ['strong', 'em', 'u', 'b', 'i', 'br', 'span', 'mark'];

function sanitizeHtml(text: string): string {
 if (typeof window === 'undefined') {
 return text;
 }
 const purify = (DOMPurify as unknown as { default?: typeof DOMPurify }).default || DOMPurify;
 if (purify && typeof purify.sanitize === 'function') {
 return purify.sanitize(text, { ALLOWED_TAGS: SANITIZE_ALLOWED_TAGS, ALLOWED_ATTR: [] });
 }
 return text;
}

// ── Resume Parsing (AI-powered with regex fallback) ──

/**
 * Parses raw resume text into structured ResumeData.
 * Uses LLM for extraction when available; falls back to
 * the regex-based ResumeParserService if no LLM is configured
 * or the LLM call fails.
 */
export async function parseResumeWithAI(
  text: string,
  fileType: string
): Promise<Partial<ResumeData>> {
  const llm = getLLMConfig();

  if (llm) {
    try {
      const result = await parseResumeWithLLM(llm, text, fileType);
      if (result && (result.personal?.name || result.experience?.length || result.education?.length)) {
        return result;
      }
      logger.warn("LLM parsing returned empty result, falling back to regex parser");
    } catch (err) {
      logger.warn("LLM resume parsing failed, falling back to regex parser:", err);
    }
  }

  // Fallback: synchronous regex-based parser
  return ResumeParserService.parse(text, fileType);
}

async function parseResumeWithLLM(
  config: LLMConfig,
  text: string,
  fileType: string
): Promise<Partial<ResumeData>> {
  const systemPrompt = `You are a resume parser. Extract ALL information from the resume text and return it as a JSON object matching this exact schema:

{
  "personal": {
    "name": "full name",
    "title": "professional title or headline",
    "email": "email address",
    "phone": "phone number",
    "location": "city, state/country",
    "linkedin": "LinkedIn URL or handle",
    "website": "personal website URL if present"
  },
  "summary": "professional summary or objective text",
  "experience": [
    {
      "company": "company name",
      "title": "job title",
      "location": "work location if stated",
      "start_date": "start date as it appears",
      "end_date": "end date as it appears, empty string if current",
      "current": true or false,
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "institution": "school/university name",
      "degree": "degree name as written",
      "field": "field of study if stated",
      "location": "school location if stated",
      "start_date": "start date if stated",
      "end_date": "graduation date or end date"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "technicalSkills": [
    {
      "category": "category name e.g. Languages, Cloud, Tools",
      "skills": "comma-separated skill names"
    }
  ],
  "certifications": ["certification name 1", "certification name 2"],
  "projects": [
    {
      "name": "project name",
      "description": "one-line description",
      "url": "project URL if present",
      "tech": ["technology1", "technology2"]
    }
  ],
  "languages": ["English", "Mandarin Chinese"]
}

Rules:
- Extract EVERY piece of information present in the text. Do not skip or summarize.
- Use the exact text from the resume for values - do not rephrase or invent.
- For dates, use the format as it appears in the source (e.g., "Jan 2020", "2020-03", "2020").
- Set "current" to true if the end date is "Present" or "Current".
- For "skills", list individual skill names as separate array entries (not comma-separated in one string).
- For "technicalSkills", group skills by category if the resume has categories. If skills are listed without categories, use "General" as the category.
- If a field is not present in the resume, use an empty string for strings, an empty array for arrays, or false for booleans.
- Plain strings only. Do not wrap names, titles, or bullets in markdown asterisks.
- Return ONLY the JSON object, no markdown code fences or explanation.`;

  const userPrompt = `File type: ${fileType}\n\nResume text:\n${text}`;

  const response = await callLLM(config, systemPrompt, userPrompt);
  const cleaned = extractJsonBlock(response);
  const parsed = JSON.parse(cleaned);

  return normalizeResumeData(parsed);
}

/**
 * Normalizes the LLM-parsed JSON into the exact ResumeData shape
 * expected by the app, ensuring IDs and required fields are present.
 */
function normalizeResumeData(raw: Record<string, unknown>): Partial<ResumeData> {
  const result: Partial<ResumeData> = {};

  // Personal info
  if (raw.personal && typeof raw.personal === 'object') {
    const p = raw.personal as Record<string, unknown>;
    result.personal = {
      name: String(p.name || ''),
      title: p.title ? String(p.title) : undefined,
      email: p.email ? String(p.email) : undefined,
      phone: p.phone ? String(p.phone) : undefined,
      location: p.location ? String(p.location) : undefined,
      linkedin: p.linkedin ? String(p.linkedin) : undefined,
      website: p.website ? String(p.website) : undefined,
    };
  }

  // Summary
  if (typeof raw.summary === 'string') {
    result.summary = raw.summary;
  }

  // Experience
  if (Array.isArray(raw.experience)) {
    result.experience = (raw.experience as Record<string, unknown>[]).map((e) => ({
      company: String(e.company || ''),
      title: String(e.title || ''),
      location: e.location ? String(e.location) : undefined,
      start_date: String(e.start_date || ''),
      end_date: e.end_date ? String(e.end_date) : '',
      current: Boolean(e.current),
      bullets: Array.isArray(e.bullets)
        ? (e.bullets as unknown[]).map((b) => String(b))
        : [],
    }));
  }

  // Education
  if (Array.isArray(raw.education)) {
    result.education = (raw.education as Record<string, unknown>[]).map((e) => ({
      institution: String(e.institution || ''),
      degree: String(e.degree || ''),
      field: String(e.field || ''),
      location: e.location ? String(e.location) : undefined,
      start_date: e.start_date ? String(e.start_date) : undefined,
      end_date: e.end_date ? String(e.end_date) : undefined,
    }));
  }

  // Skills - LLM returns string array, normalize to SkillItem[]
  if (Array.isArray(raw.skills)) {
    result.skills = (raw.skills as unknown[]).map((name, i) => ({
      id: String(i + 1),
      name: String(name),
      isHighlighted: false,
    }));
  }

  // Technical skills
  if (Array.isArray(raw.technicalSkills)) {
    result.technicalSkills = (raw.technicalSkills as Record<string, unknown>[]).map((t, i) => ({
      id: String(i + 1),
      category: String(t.category || ''),
      skills: String(t.skills || ''),
    }));
  }

  // Certifications
  if (Array.isArray(raw.certifications)) {
    result.certifications = (raw.certifications as unknown[]).map((c) => String(c));
  }

  // Projects
  if (Array.isArray(raw.projects)) {
    result.projects = (raw.projects as Record<string, unknown>[]).map((p) => ({
      name: String(p.name || ''),
      description: String(p.description || ''),
      url: p.url ? String(p.url) : undefined,
      tech: Array.isArray(p.tech) ? (p.tech as unknown[]).map((t) => String(t)) : undefined,
    }));
  }

  // Languages
  if (Array.isArray(raw.languages)) {
    result.languages = (raw.languages as unknown[]).map((l) => String(l));
  }

  return result;
}

// ── Types ───────────────────────────────────────────

export interface TailorRequest {
 baseResume: ResumeData;
 jobDescription: string;
 jobTitle: string;
 companyName: string;
 profileSummary: string; // from profileStore.getProfileSummary()
}

export interface TailorResult {
 summary: string;
 experience: ExperienceEntry[];
 skillsToHighlight: string[];
 tailoringNotes: string;
}

export interface InterviewPrepRequest {
 jobTitle: string;
 companyName: string;
 jobDescription: string;
 profileSummary: string;
}

export interface InterviewPrepResult {
 companyResearch: string;
 roleAnalysis: string;
 questions: {
 question: string;
 category: string;
 difficulty: "easy" | "medium" | "hard";
 suggestedAnswer: string;
 }[];
}

// ── Helpers ─────────────────────────────────────────

function delay(ms: number): Promise<void> {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Extract keywords from job description for mock tailoring */
function extractKeywords(text: string): string[] {
 const keywords = [
 "leadership", "strategy", "data-driven", "ML", "AI",
 "cross-functional", "stakeholder", "revenue", "growth",
 "platform", "monetization", "optimization", "analytics",
 "agile", "scrum", "roadmap", "KPI", "OKR", "P&L",
 "user experience", "A/B testing", "product-market fit",
 "go-to-market", "ecosystem", "scalable", "infrastructure",
 ];
 const lower = text.toLowerCase();
 return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

export interface ATSRequest {
 resumeData: ResumeData;
 jobDescription: string;
}

export interface ATSResult {
 score: number;
 matchedKeywords: string[];
 missingKeywords: string[];
 feedback: { severity: "high" | "medium" | "low"; message: string }[];
}

// ── ATS Evaluation ──────────────────────────────────

export async function evaluateATS(req: ATSRequest): Promise<ATSResult> {
 const llm = getLLMConfig();

 if (llm) {
 const systemPrompt = `You are an ATS (Applicant Tracking System) analyzer. Evaluate the resume against the job description. Return JSON:
{
 "score": 0-100,
 "matchedKeywords": ["keyword1", "keyword2"],
 "missingKeywords": ["keyword1", "keyword2"],
 "feedback": [{"severity": "high|medium|low", "message": "..."}]
}`;
 const userPrompt = `## Resume Data
${JSON.stringify(req.resumeData, null, 2)}

## Job Description
${req.jobDescription}

Evaluate ATS compatibility.`;

 try {
 const response = await callLLM(llm, systemPrompt, userPrompt);
 const cleaned = extractJsonBlock(response);
 return JSON.parse(cleaned);
 } catch (err) {
 logger.warn("Real ATS evaluation failed, falling back to mock:", err);
 // Fallback to keyword-based mock
 }
 }

 // ── Mock fallback ──────────────────────────────────
 await delay(1500 + Math.random() * 1000);

 const jdKeywords = extractKeywords(req.jobDescription);
 const resumeText = JSON.stringify(req.resumeData).toLowerCase();
 
 const matched = jdKeywords.filter(kw => resumeText.includes(kw.toLowerCase()));
 const missing = jdKeywords.filter(kw => !resumeText.includes(kw.toLowerCase()));
 
 const score = Math.min(100, Math.round((matched.length / Math.max(1, jdKeywords.length)) * 100) + 20);

 const feedback: { severity: "high" | "medium" | "low"; message: string }[] = [];
 
 if (missing.length > 5) {
 feedback.push({ severity: "high", message: "Critical missing keywords detected. ATS systems may filter this resume." });
 }
 if (!req.resumeData.summary || req.resumeData.summary.length < 100) {
 feedback.push({ severity: "medium", message: "Professional summary is too brief for optimal indexing." });
 }
 if (matched.length > 0) {
 feedback.push({ severity: "low", message: `Strong alignment on ${matched.slice(0, 3).join(", ")} skills.` });
 }

 return {
 score,
 matchedKeywords: matched,
 missingKeywords: missing,
 feedback,
 };
}

export async function tailorResume(req: TailorRequest): Promise<TailorResult> {
 const llm = getLLMConfig();

 if (llm) {
 const systemPrompt = `You are an expert resume tailoring AI. Given a base resume and a job description, produce a tailored version that maximizes ATS match while remaining truthful. Return JSON matching this schema:
{
 "summary": "tailored professional summary string",
 "experience": [{"title": "...", "company": "...", "location": "...", "dates": "...", "bullets": ["..."]}],
 "skillsToHighlight": ["skill1", "skill2"],
 "tailoringNotes": "markdown notes about changes made"
}
Rules:
- Plain strings only in summary, titles, companies, and bullets. Do not wrap names, titles, or bullets in markdown asterisks.
- tailoringNotes may use markdown.`;
 const userPrompt = `## Base Resume
${JSON.stringify(req.baseResume, null, 2)}

## Target Job
Title: ${req.jobTitle}
Company: ${req.companyName}

## Job Description
${req.jobDescription}

## Candidate Profile
${req.profileSummary}

Produce a tailored resume as JSON.`;

 try {
 const response = await callLLM(llm, systemPrompt, userPrompt);
 try {
 const cleaned = extractJsonBlock(response);
 return JSON.parse(cleaned);
 } catch {
 // If JSON parse fails, return the raw text as notes
 return {
 summary: req.baseResume.summary || "",
 experience: req.baseResume.experience || [],
 skillsToHighlight: [],
 tailoringNotes: `AI response (could not parse as JSON):\n${response}`,
 };
 }
 } catch (err) {
 logger.warn("Real Resume Tailoring failed, falling back to mock:", err);
 // Fallback to keyword-based mock
 }
 }

 // ── Mock fallback ──────────────────────────────────
 await delay(2000 + Math.random() * 1500);

 const keywords = extractKeywords(req.jobDescription);
 const keywordStr = keywords.slice(0, 5).join(", ");

 // Generate tailored summary
 const tailoredSummary = `${
 req.baseResume.personal?.title || "Product Manager"
 } with ${
 req.baseResume.experience?.length
 ? `${req.baseResume.experience.length}+ roles`
 : "extensive experience"
 } in ${keywordStr || "product management"}. Seeking to drive ${
 req.companyName
 }'s ${req.jobTitle.toLowerCase().includes("ad") ? "advertising" : "product"} strategy with proven expertise in ${
 keywords.slice(0, 3).join(", ") || "data-driven product development"
 }. Track record of delivering measurable business impact through ${
 keywords.includes("AI") || keywords.includes("ML")
 ? "AI/ML-powered solutions"
 : "innovative product strategies"
 } at scale.`;

 // Tailor experience bullets
 const tailoredExperience: ExperienceEntry[] = (
 req.baseResume.experience || []
 ).map((exp) => ({
 ...exp,
 bullets: exp.bullets.map((bullet) => {
 // Add relevance signals to bullets
 if (keywords.includes("revenue") && !bullet.toLowerCase().includes("revenue")) {
 return bullet.replace(/\.$/, "") + " — directly contributing to revenue growth objectives.";
 }
 if (
 keywords.includes("AI") &&
 bullet.toLowerCase().includes("ml")
 ) {
 return sanitizeHtml(bullet.replace("ML-powered", "<strong>AI/ML-powered</strong>"));
 }
 if (
 req.companyName &&
 bullet.toLowerCase().includes("platform")
 ) {
 return bullet.replace(
 /platform/i,
 `platform (relevant to ${req.companyName}'s infrastructure)`
 );
 }
 return bullet;
 }),
 }));

 // Suggest skills to highlight
 const allSkills =
 req.baseResume.skills?.map((s) =>
 typeof s === "string" ? s : s.name
 ) || [];
 const skillsToHighlight = allSkills.filter((skill) => {
 const lower = skill.toLowerCase();
 return keywords.some(
 (kw) =>
 lower.includes(kw.toLowerCase()) ||
 kw.toLowerCase().includes(lower)
 );
 });

 // If no matches, just pick top 4
 const finalHighlights =
 skillsToHighlight.length > 0
 ? skillsToHighlight.slice(0, 6)
 : allSkills.slice(0, 4);

 return {
 summary: tailoredSummary,
 experience: tailoredExperience,
 skillsToHighlight: finalHighlights,
 tailoringNotes: `AI-tailored for **${req.jobTitle}** at **${req.companyName}**.\n\n` +
 `**Keywords matched:** ${keywords.join(", ") || "None detected"}\n` +
 `**Skills highlighted:** ${finalHighlights.join(", ")}\n` +
 `**Confidence:** ${keywords.length >= 3 ? "High" : keywords.length >= 1 ? "Medium" : "Low"} — ` +
 `${keywords.length} relevant keywords found in the job description.`,
 };
}

// ── Single Bullet AI Polish ────────────────────────

export async function polishBulletPoint(bullet: string, roleTitle?: string): Promise<string> {
  const trimmed = bullet.trim();
  if (!trimmed) return "";

  const config = getLLMConfig();
  if (config) {
    try {
      const systemPrompt = "You are an elite executive resume writer. Improve this single resume bullet point by starting with a powerful action verb, quantifying results or impact where appropriate, and keeping it concise, impactful, and ATS-friendly. Return ONLY the improved bullet point as plain text without quotation marks, bullet symbols, or conversational prefix.";
      const userPrompt = `Role: ${roleTitle || "Professional"}\nOriginal bullet point:\n${trimmed}`;
      const res = await callLLM(config, systemPrompt, userPrompt);
      const cleaned = res.replace(/^[-•*▪▫➢✓]\s*/, '').replace(/^"|"$/g, '').trim();
      if (cleaned) return cleaned;
    } catch (err) {
      logger.warn("Real bullet polish failed, falling back to local enhancement:", err);
    }
  }

  // Local enhancement fallback
  let polished = trimmed.replace(/^[-•*▪▫➢✓]\s*/, '');
  polished = polished.charAt(0).toUpperCase() + polished.slice(1);
  return polished;
}

// ── Interview Prep Generation ───────────────────────

export async function generateInterviewPrep(
 req: InterviewPrepRequest
): Promise<InterviewPrepResult> {
 const llm = getLLMConfig();
 if (!llm) {
 throw new Error("Add an API key in Settings to generate interview prep.");
 }

 const systemPrompt = `You are an expert interview preparation AI. Given a job description and candidate profile, produce comprehensive interview prep. Return JSON matching this schema:
{
 "companyResearch": "markdown research brief",
 "roleAnalysis": "markdown role analysis",
 "questions": [{"question": "...", "category": "behavioral|product|technical|leadership|situational", "difficulty": "easy|medium|hard", "suggestedAnswer": "..."}]
}`;
 const userPrompt = `## Target Job
Title: ${req.jobTitle}
Company: ${req.companyName}

## Job Description
${req.jobDescription}

## Candidate Profile
${req.profileSummary}

Generate 8 interview questions with suggested answers.`;

 try {
 const response = await callLLM(llm, systemPrompt, userPrompt);
 try {
 const cleaned = extractJsonBlock(response);
 return JSON.parse(cleaned);
 } catch {
 return {
 companyResearch: response,
 roleAnalysis: "",
 questions: [],
 };
 }
 } catch (err) {
 logger.warn("Interview prep generation failed:", err);
 throw new Error("Could not generate interview prep. Check your API key and try again.");
 }
}

function captureStarField(block: string, label: string): string {
 const re = new RegExp(`${label}\\s*[:\\-–]\\s*([\\s\\S]*?)(?=(?:situation|task|action|result|metrics)\\s*[:\\-–]|$)`, "i");
 return block.match(re)?.[1]?.trim() ?? "";
}

export function extractStoriesFromText(text: string): Partial<Story>[] {
 const chunks = text
 .split(/\n(?=#{1,3}\s|\d+\.\s|[A-Z][^\n]{8,80}\n)/)
 .map((c) => c.trim())
 .filter((c) => c.length > 40);

 const stories: Partial<Story>[] = [];
 for (const chunk of chunks) {
 const situation = captureStarField(chunk, "situation");
 const task = captureStarField(chunk, "task");
 const action = captureStarField(chunk, "action");
 const result = captureStarField(chunk, "result");
 if (!situation && !action && !result) continue;
 const heading = chunk.match(/^(?:#{1,3}\s+|\d+\.\s+)?(.+)/)?.[1]?.trim() ?? "Untitled story";
 stories.push({
 title: heading.slice(0, 80),
 competency: /lead|manager|team/i.test(chunk) ? "leadership" : /tech|engineer|outage|system/i.test(chunk) ? "technical" : "execution",
 situation,
 task,
 action,
 result,
 metrics: captureStarField(chunk, "metrics"),
 tags: [],
 });
 }
 return stories;
}

export async function extractStoriesFromFile(text: string): Promise<Partial<Story>[]> {
 const stories = extractStoriesFromText(text);
 if (stories.length === 0) {
 throw new Error("No STAR stories found. Use Situation, Task, Action, and Result headings.");
 }
 return stories;
}
