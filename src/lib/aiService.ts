/* ═══════════════════════════════════════════════════
   OfferPath — AI Service (Mock)
   Provides mock AI responses for resume tailoring
   and interview prep generation.
   Replace mock implementations with real LLM calls later.
   ═══════════════════════════════════════════════════ */

import type { ResumeData, ExperienceEntry } from "@/types";

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

// ── Resume Tailoring ────────────────────────────────

export async function tailorResume(req: TailorRequest): Promise<TailorResult> {
  // Simulate AI processing time
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
        return bullet.replace("ML-powered", "<strong>AI/ML-powered</strong>");
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
  // Simulate AI processing time
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
