/* ═══════════════════════════════════════════════════
   OfferPath — AI Service
   Supports both mock (fallback) and real LLM calls.
   When API keys are configured in profileStore,
   routes to OpenAI/Anthropic/Gemini/DeepSeek.
   Otherwise falls back to mock implementations.
   ═══════════════════════════════════════════════════ */

import type { ResumeData, ExperienceEntry, Story } from "@/types";
import DOMPurify from 'dompurify';
import { useProfileStore } from "@/store/profileStore";

// ── Real API Integration ───────────────────────────

type LLMProvider = "openai" | "anthropic" | "gemini" | "deepseek";

interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string;
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

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "call-llm",
      provider,
      apiKey,
      systemPrompt,
      userPrompt,
    }),
  });

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
function getLLMConfig(): LLMConfig | null {
  try {
    const store = useProfileStore.getState();
    const priority: LLMProvider[] = ["openai", "anthropic", "deepseek", "gemini"];
    for (const p of priority) {
      const key = store.apiKeys.find((k: { provider: string; status: string }) => k.provider === p && k.status === "active");
      if (key && key.key?.trim()) return { provider: p, apiKey: key.key.trim() };
    }
  } catch {
    // Store not available (SSR, etc.)
  }

  // Fallback: check environment variables (empty in the client, but we return a config with no apiKey so the server proxy tries its own variables)
  return { provider: "openai" };
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

// ── Types ───────────────────────────────────────────

export interface TailorRequest {
  baseResume: ResumeData;
  jobDescription: string;
  jobTitle: string;
  companyName: string;
  profileSummary: string;    // from profileStore.getProfileSummary()
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
      console.warn("Real ATS evaluation failed, falling back to mock:", err);
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
    feedback.push({ severity: "high", message: "Critical missing keywords detected. ATS systems may filter this asset." });
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
}`;
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
      console.warn("Real Resume Tailoring failed, falling back to mock:", err);
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

// ── Interview Prep Generation ───────────────────────

export async function generateInterviewPrep(
  req: InterviewPrepRequest
): Promise<InterviewPrepResult> {
  const llm = getLLMConfig();

  if (llm) {
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
      console.warn("Real Interview Prep generation failed, falling back to mock:", err);
      // Fallback to keyword-based mock
    }
  }

  // ── Mock fallback ──────────────────────────────────
  await delay(2500 + Math.random() * 1500);

  const keywords = extractKeywords(req.jobDescription);

  const companyResearch = `## ${req.companyName}: Company Research Brief

*AI-generated research based on available context.*

### About ${req.companyName}
Research the company's recent news, product launches, and strategic direction before your interview. Focus on:
- What products/services does ${req.companyName} offer?
- What is their competitive advantage?
- What are their recent achievements or challenges?
- What is the company culture like?

### Why This Role Matters
The **${req.jobTitle}** role appears to focus on: ${keywords.slice(0, 4).join(", ") || "product strategy and execution"}.

### Talking Points
- Connect your experience with ${keywords.slice(0, 2).join(" and ") || "their core business"}
- Prepare specific metrics from your achievements
- Show understanding of their market position

### Interview Tips
- Research the interviewer(s) on LinkedIn
- Prepare 3-5 thoughtful questions about the team and roadmap
- Have your STAR stories ready with quantified impact
- Be ready to discuss your 30-60-90 day plan`;

  const roleAnalysis = `## Role Analysis: ${req.jobTitle}

### Key Focus Areas
Based on the job description, this role emphasizes:
${keywords.map((kw, i) => `${i + 1}. **${kw.charAt(0).toUpperCase() + kw.slice(1)}**`).join("\n") || "1. Product management core skills"}

### Your Competitive Advantages
- Map each job requirement to a specific achievement from your background
- Quantify impact wherever possible (revenue, users, efficiency gains)
- Highlight transferable skills from adjacent domains

### Gap Areas to Address
- Identify any requirements you're less experienced in
- Prepare honest answers about learning curves
- Show eagerness and a plan to ramp up quickly`;

  const questions = [
    {
      question: `Why are you interested in ${req.companyName} and this specific role?`,
      category: "behavioral",
      difficulty: "easy" as const,
      suggestedAnswer: `Research ${req.companyName}'s mission and recent developments. Connect your passion for ${keywords[0] || "product innovation"} to their specific challenges. Share what excites you about the ${req.jobTitle} opportunity.`,
    },
    {
      question: `Walk me through your approach to the first 90 days as ${req.jobTitle}.`,
      category: "product",
      difficulty: "medium" as const,
      suggestedAnswer: `Month 1: Listen & Learn — stakeholder interviews, data deep-dive, user research. Month 2: Quick Wins — identify 2-3 improvements, build credibility with the team. Month 3: Strategy — present product vision, roadmap, and OKRs. Customize this with ${req.companyName}-specific context.`,
    },
    {
      question: `Tell me about a time you drove significant ${keywords[0] || "business"} impact through a product decision.`,
      category: "behavioral",
      difficulty: "medium" as const,
      suggestedAnswer: `Use your strongest STAR story. Focus on: the decision you made, data that informed it, how you aligned stakeholders, and quantified business impact. Tie it back to how similar thinking would apply at ${req.companyName}.`,
    },
    {
      question: `How would you prioritize features for ${req.companyName}'s ${req.jobTitle.toLowerCase().includes("platform") ? "platform" : "product"} roadmap?`,
      category: "product",
      difficulty: "hard" as const,
      suggestedAnswer: `Framework: RICE scoring combined with strategic alignment. Show your approach: (1) Understand business objectives, (2) Gather user insights, (3) Score initiatives by impact × confidence / effort, (4) Align with company strategy, (5) Communicate trade-offs clearly. Reference a real example where you made tough prioritization decisions.`,
    },
    {
      question: "How do you handle disagreements with engineering or design partners?",
      category: "behavioral",
      difficulty: "easy" as const,
      suggestedAnswer: `Show your collaborative approach: (1) Listen first to understand their perspective, (2) Find shared goals, (3) Use data to make objective comparisons, (4) Propose compromises, (5) Commit to the decision together. Reference your conflict resolution experience.`,
    },
    {
      question: `Describe a product you shipped that failed. What did you learn?`,
      category: "situational",
      difficulty: "medium" as const,
      suggestedAnswer: `Show vulnerability and learning. Structure: What was the hypothesis? What went wrong? What data told you it failed? What did you change? What was the ultimate outcome? Great PMs learn from failures — show you're one of them.`,
    },
    {
      question: `How do you measure success for a ${req.jobTitle.toLowerCase().includes("ad") ? "advertising" : "product"} product?`,
      category: "technical",
      difficulty: "medium" as const,
      suggestedAnswer: `Framework: (1) North Star metric tied to user value, (2) Input metrics you can influence, (3) Guardrail metrics to protect, (4) Business metrics that matter to stakeholders. Customize for ${req.companyName}'s context.`,
    },
    {
      question: "Tell me about a time you influenced stakeholders without direct authority.",
      category: "leadership",
      difficulty: "hard" as const,
      suggestedAnswer: `Use your strongest influence story. Highlight: structured decision-making, data-driven persuasion, building coalitions, and aligning incentives. Emphasize the outcome and what you learned about organizational dynamics.`,
    },
  ];

  return { companyResearch, roleAnalysis, questions };
}

// ── Story Extraction ──────────────────────────────────

export async function extractStoriesFromFile(_text: string): Promise<Partial<Story>[]> {
  void _text;
  // Simulate AI processing time
  await delay(2500 + Math.random() * 1000);

  // Return realistic mock stories extracted from document text
  return [
    {
      title: "Led cross-functional team to launch MVP",
      competency: "leadership",
      situation: "The company needed a new mobile app MVP within 3 months, but the team lacked a clear roadmap and was siloed.",
      task: "I was tasked with aligning engineering, design, and marketing to deliver the MVP on schedule.",
      action: "I instituted daily stand-ups, created a shared Jira board, and facilitated weekly alignment meetings to unblock cross-functional dependencies.",
      result: "We launched the MVP 1 week early, leading to 10k downloads in the first month.",
      metrics: "1 week early, 10k downloads",
      tags: ["mvp", "agile", "cross-functional"]
    },
    {
      title: "Resolved critical production database outage",
      competency: "technical",
      situation: "During Black Friday, our main database cluster experienced 100% CPU utilization, causing a site-wide outage.",
      task: "I needed to immediately restore service and ensure we wouldn't go down again during the peak traffic period.",
      action: "I quickly added read replicas and implemented an aggressive Redis caching layer for the product catalog to reduce database load.",
      result: "Service was restored within 15 minutes, and the site handled a 3x traffic spike without further issues.",
      metrics: "15 min recovery, 3x traffic scaling",
      tags: ["scaling", "outage", "database"]
    }
  ];
}
