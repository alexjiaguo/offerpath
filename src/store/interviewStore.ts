/* ═══════════════════════════════════════════════════
   OfferPath — Interview Store (Zustand)
   Manages stories, preps, and mock sessions
   ═══════════════════════════════════════════════════ */

import { create } from "zustand";
import type {
  Story,
  InterviewPrep,
  PrepQuestion,
  MockSession,
  MockMessage,
  MockFeedback,
  QuestionCategory,
} from "@/types";
import { generateInterviewPrep } from "@/lib/aiService";

// ── Store Types ─────────────────────────────────────

export interface InterviewState {
  stories: Story[];
  preps: InterviewPrep[];
  mockSessions: MockSession[];

  // Story Bank Actions
  addStory: (story: Omit<Story, "id" | "user_id" | "used_count" | "created_at" | "updated_at">) => string;
  updateStory: (id: string, updates: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  incrementStoryUsage: (id: string) => void;

  // Prep Actions
  addPrep: (prep: Omit<InterviewPrep, "id" | "user_id" | "created_at" | "updated_at">) => string;
  updatePrep: (id: string, updates: Partial<InterviewPrep>) => void;
  generatePrepForJob: (jobId: string, jobTitle: string, companyName: string, description: string) => string;
  generateAIPrepForJob: (
    jobId: string,
    jobTitle: string,
    companyName: string,
    description: string,
    profileSummary: string
  ) => Promise<string>;

  // Mock Session Actions
  addMockSession: (session: Omit<MockSession, "id" | "user_id" | "created_at">) => string;
  startMockSession: (jobId: string) => string;
  addMockMessage: (sessionId: string, role: "interviewer" | "candidate", message: string) => void;
  endMockSession: (sessionId: string) => void;

  // Computed
  getStoriesByCompetency: (competency?: string) => Story[];
  getPrepByJobId: (jobId: string) => InterviewPrep | undefined;
  getMocksByJobId: (jobId: string) => MockSession[];
  getActiveMockSession: () => MockSession | undefined;
  getAllCompetencies: () => string[];
  getStoryById: (id: string) => Story | undefined;
  getMockById: (id: string) => MockSession | undefined;
}

// ── Mock Data ───────────────────────────────────────

const MOCK_STORIES: Story[] = [
  {
    id: "s1",
    user_id: "demo",
    title: "Led Ad Platform Revenue Growth 3x",
    competency: "leadership",
    situation:
      "Our ad platform was generating $15M ARR but growth had plateaued after 2 years. The CEO set a target to triple revenue within 18 months, but the team was demoralized after a failed major feature launch.",
    task:
      "As Senior PM, I needed to define a new product strategy, rebuild team confidence, and deliver a revenue growth plan that could achieve the 3x target.",
    action:
      "I conducted a comprehensive analysis of our ad inventory utilization and discovered we were only monetizing 40% of available impressions. I proposed a 3-pronged strategy: (1) Launch ML-powered CTR prediction to improve ad relevance, (2) introduce 2 new ad formats (native and video), and (3) build a self-serve advertiser dashboard to reduce sales costs. I restructured the team into 3 squads, each owning one prong, and ran weekly growth reviews with clear OKRs.",
    result:
      "Within 12 months, we grew ARR from $15M to $50M — exceeding the 3x target. CTR improved by 40%, new ad formats contributed 35% of revenue, and the self-serve dashboard reduced customer acquisition cost by 60%.",
    metrics: "3.3x revenue growth ($15M → $50M), 40% CTR improvement, 60% CAC reduction",
    tags: ["revenue", "growth", "ad-tech", "team-leadership"],
    used_count: 5,
    created_at: "2026-03-01T10:00:00Z",
    updated_at: "2026-03-20T14:00:00Z",
  },
  {
    id: "s2",
    user_id: "demo",
    title: "Resolved Cross-Team Conflict on Data Platform",
    competency: "conflict-resolution",
    situation:
      "The data engineering team and the product analytics team had a fundamental disagreement about data architecture. The data engineers wanted a centralized data lake, while analytics wanted a domain-driven mesh approach. This conflict had stalled 3 product initiatives for 2 months.",
    task:
      "As the PM sitting between both teams, I needed to find a resolution that unblocked product development while keeping both teams productive and engaged.",
    action:
      "I organized a structured decision-making workshop using a decision matrix. First, I had each team present their proposal with a clear pros/cons analysis. Then I introduced the evaluation criteria (scalability, time-to-delivery, cost, team autonomy), weighted by business priorities. I proposed a hybrid approach: centralized data lake for raw ingestion with domain-specific data marts that gave analytics teams ownership of their data models.",
    result:
      "Both teams agreed on the hybrid approach. The 3 stalled initiatives were unblocked within 2 weeks. We shipped the new data platform in 6 weeks, and it's been the foundation for all analytics products since.",
    metrics: "3 initiatives unblocked, 6-week delivery, 0 team attrition",
    tags: ["conflict", "cross-functional", "data-platform", "stakeholder-management"],
    used_count: 3,
    created_at: "2026-03-05T10:00:00Z",
    updated_at: "2026-03-15T14:00:00Z",
  },
  {
    id: "s3",
    user_id: "demo",
    title: "Shipped AIGC Creative Automation Under Pressure",
    competency: "technical",
    situation:
      "Our biggest advertiser threatened to leave (representing 20% of revenue) because they needed AI-generated ad creatives at scale, but our platform only supported manual creative uploads. We had 8 weeks before their contract renewal.",
    task:
      "I needed to design and ship an AI-powered creative automation system that could generate, resize, and A/B test ad creatives from a single prompt — all within the 8-week client deadline.",
    action:
      "I assembled a tiger team of 5 engineers and 1 designer. I wrote the PRD in 2 days, conducted rapid user interviews with the advertiser's marketing team to nail requirements, and made hard scope trade-offs (launching with 3 ad formats instead of 6). I coordinated with our ML team to integrate Stable Diffusion for image generation and built a custom prompt templating system. We ran daily standups and I personally QA'd every build.",
    result:
      "Shipped the AIGC system in 7 weeks — 1 week early. The client renewed their contract with a 40% spend increase. The feature then became our fastest-growing product, reducing creative production time from 3 days to 2 hours for all advertisers.",
    metrics: "7-week delivery, 40% client spend increase, 95% creative production time reduction",
    tags: ["ai", "aigc", "deadline", "execution", "product-launch"],
    used_count: 4,
    created_at: "2026-03-10T10:00:00Z",
    updated_at: "2026-03-25T14:00:00Z",
  },
  {
    id: "s4",
    user_id: "demo",
    title: "Data-Driven Pivot that Saved a Failing Product",
    competency: "analytical",
    situation:
      "Our user engagement dashboard product had been declining for 3 quarters. Monthly active users dropped 30%, and leadership was considering sunsetting it. However, I noticed that a small segment of power users had actually increased their usage.",
    task:
      "I needed to determine whether the product could be saved with a pivot, or if we should sunset it and reallocate the team.",
    action:
      "I ran a deep cohort analysis breaking users into 5 segments by usage patterns. I discovered that enterprise users (10% of base) were using the dashboard 4x more than others, specifically for real-time alerting — a feature we had accidentally shipped as a side-effect. I built a business case showing the enterprise segment's willingness to pay was 5x higher. I proposed pivoting from a broad dashboard tool to a specialized real-time monitoring platform for enterprise clients.",
    result:
      "Leadership approved the pivot. Within 2 quarters, we grew enterprise revenue 200% and improved NPS from 32 to 67. The product went from 'almost sunset' to our second-highest revenue line.",
    metrics: "200% enterprise revenue growth, NPS 32→67, saved product from sunset",
    tags: ["data-analysis", "pivot", "enterprise", "product-strategy"],
    used_count: 2,
    created_at: "2026-03-12T10:00:00Z",
    updated_at: "2026-03-28T14:00:00Z",
  },
  {
    id: "s5",
    user_id: "demo",
    title: "Building Culture of Experimentation",
    competency: "culture",
    situation:
      "When I joined the team, there was a strong 'ship it and hope' culture. Features were launched without hypotheses, A/B testing was ad-hoc, and the team couldn't articulate why features succeeded or failed.",
    task:
      "I needed to establish a systematic experimentation culture that improved feature success rates while not slowing down the team's shipping velocity.",
    action:
      "I introduced a lightweight experimentation framework: every feature needed a one-page Experiment Card (hypothesis, metrics, success criteria, expected lift). I set up a self-serve A/B testing platform using our existing analytics infrastructure, trained 8 PMs and 15 engineers on statistical significance and experimental design, and instituted a weekly 'Experiment Review' meeting where teams shared results.",
    result:
      "Feature success rate improved from 30% to 65% within 6 months. The team ran 3x more experiments per quarter. Two major product insights emerged from failed experiments that led to our most successful feature of the year.",
    metrics: "Feature success rate 30%→65%, 3x experiment velocity, adopted by 4 product teams",
    tags: ["culture", "experimentation", "a/b-testing", "coaching"],
    used_count: 1,
    created_at: "2026-03-18T10:00:00Z",
    updated_at: "2026-03-30T14:00:00Z",
  },
];

const MOCK_PREP_QUESTIONS: PrepQuestion[] = [
  {
    id: "q1",
    question: "Tell me about a time you led a cross-functional team to deliver a complex product under tight deadlines.",
    category: "behavioral",
    difficulty: "medium",
    suggested_answer:
      "Use your AIGC creative automation story — highlight the 8-week deadline, tiger team assembly, and stakeholder management. Emphasize the structured approach to scope trade-offs and daily execution cadence.",
  },
  {
    id: "q2",
    question: "How would you approach building an ad serving platform from scratch for a super-app ecosystem?",
    category: "product",
    difficulty: "hard",
    suggested_answer:
      "Start with the user segments (advertisers vs consumers), then outline phases: (1) Define ad inventory across app surfaces (ride-hailing, food, finance), (2) Build a unified auction system, (3) Implement targeting using first-party super-app data, (4) Create advertiser self-serve tools, (5) Measure and optimize with ML bidding. Reference your TechCorp experience building similar infrastructure.",
  },
  {
    id: "q3",
    question: "Describe a situation where you had to make a difficult trade-off between user experience and revenue goals.",
    category: "situational",
    difficulty: "medium",
    suggested_answer:
      "Great opportunity to discuss ad frequency capping — how you balanced advertiser demand for more impressions with consumer experience. Share the data-driven approach: tested 3 frequency levels, found the optimal point where revenue increased 20% without impacting user retention.",
  },
  {
    id: "q4",
    question: "How do you measure the success of an advertising product?",
    category: "technical",
    difficulty: "easy",
    suggested_answer:
      "Framework: (1) Advertiser metrics — ROAS, CTR, CVR, CPA, (2) Platform metrics — fill rate, eCPM, revenue per session, (3) User metrics — ad engagement, app session length, NPS impact. Emphasize the balance between supply-side and demand-side optimization.",
  },
  {
    id: "q5",
    question: "Tell me about a time you influenced without authority to drive a strategic initiative.",
    category: "leadership",
    difficulty: "hard",
    suggested_answer:
      "Use the data platform conflict resolution story. Highlight how you structured the decision-making process, used data to overcome emotional resistance, and created ownership for both teams. Emphasize outcome: unblocked 3 initiatives, no attrition.",
  },
  {
    id: "q6",
    question: "If Grab's ad revenue is currently $X, how would you grow it 5x in 2 years?",
    category: "case",
    difficulty: "hard",
    suggested_answer:
      "Structure as: (1) Size the opportunity — TAM for digital ads in SEA, Grab's unique first-party data advantage, (2) Growth levers — new ad formats (video, sponsored listings), new surfaces (GrabPay, GrabMart), improved targeting with ML, (3) Execution plan — phased rollout prioritized by revenue potential × feasibility, (4) Risks and mitigations. Draw on your 3x revenue growth experience at TechCorp.",
  },
  {
    id: "q7",
    question: "How do you handle stakeholder disagreements about product direction?",
    category: "behavioral",
    difficulty: "easy",
    suggested_answer:
      "Reference the cross-team data platform story. Framework: (1) Listen to all perspectives without judgment, (2) Align on shared goals and evaluation criteria, (3) Use data to make objective comparisons, (4) Propose hybrid solutions where possible, (5) Commit to a decision and align everyone behind it.",
  },
  {
    id: "q8",
    question: "What's your approach to prioritizing features in a new product with limited resources?",
    category: "product",
    difficulty: "medium",
    suggested_answer:
      "Framework: RICE scoring (Reach × Impact × Confidence / Effort) combined with strategic alignment. Share example from TechCorp where you chose 3 ad formats over 6 for the AIGC launch — the 80/20 principle. Also discuss user research to validate assumptions before committing resources.",
  },
];

const MOCK_PREPS: InterviewPrep[] = [
  {
    id: "p1",
    user_id: "demo",
    job_id: "j3",
    company_research:
      "## Grab: Company Overview\n\n**Founded:** 2012 in Malaysia, HQ in Singapore\n**Industry:** Super-app (ride-hailing, food delivery, payments, financial services)\n**Public:** Listed on NASDAQ (GRAB) since Dec 2021\n**Revenue:** $2.4B (2025), growing 17% YoY\n**Employees:** ~8,000 across SEA\n\n### Culture & Values\n- **Heart:** Serving with empathy and integrity\n- **Hunger:** Relentlessly pursuing excellence\n- **Honour:** Acting with trust and transparency\n- **Humility:** Learning from everyone\n\n### Recent Developments\n- Expanded GrabAds platform with self-serve tools (Q1 2026)\n- Launched AI-powered ad targeting using first-party super-app data\n- Growing GrabFinancial Services (insurance, lending) as 3rd revenue pillar\n- Focus on profitability — achieved adjusted EBITDA profitability in 2025\n\n### Ad Business Context\n- GrabAds launched in 2019, growing rapidly as Grab monetizes its 35M+ monthly transacting users\n- Ad surfaces: in-app banners, sponsored listings, branded experiences\n- Key differentiator: first-party offline-to-online data (rides + food + payments)\n- Competition: Meta, Google, TikTok for SMB ad budgets in SEA\n\n### Interview Tips\n- Emphasize SEA market knowledge and localization experience\n- Show understanding of super-app ecosystem synergies\n- Demonstrate P&L thinking — Grab values leaders who can own a revenue line\n- Be prepared to discuss scale challenges specific to emerging markets",
    role_analysis:
      "## Role Analysis: Lead PM, Ad Serving & Monetization\n\n### Core Responsibilities\n1. Own the ad serving platform across the Grab super-app ecosystem\n2. Build advertiser tools and self-serve capabilities\n3. Optimize revenue across ride-hailing, food delivery, and financial services\n4. Lead ML-powered ad targeting and personalization initiatives\n\n### Technical Requirements\n- Deep understanding of ad tech architecture (RTB, SSP, DSP concepts)\n- Experience with ML-driven products (CTR prediction, recommendation)\n- Data infrastructure and analytics platform experience\n- Mobile-first product development\n\n### Your Competitive Advantages\n- ✅ Direct ad platform experience at TechCorp ($50M ARR)\n- ✅ ML-powered CTR prediction model shipped (40% improvement)\n- ✅ AIGC creative automation — unique differentiator\n- ✅ P&L ownership experience\n- ✅ Singapore-based — no relocation needed\n\n### Areas to Prepare\n- ⚠️ Super-app ecosystem dynamics (multi-product monetization)\n- ⚠️ Southeast Asian market nuances (regulatory, payment infrastructure)\n- ⚠️ Grab-specific metrics and business model details",
    questions: MOCK_PREP_QUESTIONS,
    created_at: "2026-04-05T10:00:00Z",
    updated_at: "2026-04-08T14:00:00Z",
  },
];

const MOCK_SESSIONS: MockSession[] = [
  {
    id: "m1",
    user_id: "demo",
    job_id: "j3",
    transcript: [
      {
        role: "interviewer",
        message:
          "Thanks for joining us today. I'm excited to learn more about your background. Let's start — can you walk me through your experience building ad platforms?",
        timestamp: "2026-04-06T10:00:00Z",
      },
      {
        role: "candidate",
        message:
          "Thank you for having me! At TechCorp, I led our ad serving platform which grew to $50M ARR. I was responsible for the full ad stack — from inventory management and auction systems to ML-powered CTR prediction and creative automation. My team of 15 shipped an ML model that improved CTR by 40%, and I pioneered an AIGC system that reduced creative production time from 3 days to 2 hours.",
        timestamp: "2026-04-06T10:01:30Z",
      },
      {
        role: "interviewer",
        message:
          "Impressive growth. How would you approach building an ad platform for a super-app like Grab, where you have multiple surfaces like ride-hailing, food delivery, and payments?",
        timestamp: "2026-04-06T10:03:00Z",
      },
      {
        role: "candidate",
        message:
          "Great question. The super-app context is unique because you have cross-product data that no single-vertical platform can match. I'd approach it in phases: First, audit all potential ad surfaces across apps and rank them by user attention and conversion potential. Second, build a unified auction system that can serve ads across surfaces while respecting user context — someone hailing a ride has different intent than someone browsing restaurants. Third, leverage Grab's first-party data advantage — the offline-to-online loop of rides, food orders, and payments — to build targeting that outperforms generic digital ads.",
        timestamp: "2026-04-06T10:05:00Z",
      },
      {
        role: "interviewer",
        message:
          "If I told you our current ad revenue is $100M and we need to grow it 5x in 2 years, how would you structure that plan?",
        timestamp: "2026-04-06T10:07:00Z",
      },
      {
        role: "candidate",
        message:
          "I'd break the $500M target into 3 growth vectors: First, deepening existing revenue — improve fill rate and eCPM on current surfaces through better targeting and auction optimization. This could deliver 1.5-2x alone. Second, new ad formats — video ads, sponsored listings in GrabMart, branded experiences in GrabPay. Each new format historically adds 15-25% revenue in my experience. Third, expanding the advertiser base — build self-serve tools to onboard SMBs across SEA who currently can't afford managed campaigns. I'd prioritize these by ROI and sequence them quarterly. The key risk is balancing ad load with user experience — I'd establish a 'user NPS floor' metric to ensure we never compromise the consumer experience for short-term revenue.",
        timestamp: "2026-04-06T10:10:00Z",
      },
    ],
    score: 4.2,
    feedback: {
      overall_score: 4.2,
      strengths: [
        "Strong quantified examples from direct experience",
        "Structured responses using clear frameworks",
        "Good understanding of super-app dynamics",
        "Balanced revenue growth with user experience considerations",
      ],
      improvements: [
        "Could have mentioned competitive positioning vs Meta/Google in SEA",
        "Should dive deeper into SEA-specific market dynamics",
        "Consider addressing team scaling and org design for the growth plan",
      ],
      tips: [
        "Prepare a 90-day plan specifically for Grab's ad platform",
        "Research Grab's recent earnings calls for latest ad revenue metrics",
        "Practice discussing GrabFinancial integration opportunities",
      ],
      category_scores: {
        "Technical Depth": 4.5,
        "Strategic Thinking": 4.3,
        "Communication": 4.0,
        "Domain Knowledge": 3.8,
        "Leadership Signals": 4.2,
      },
    },
    duration_seconds: 1800,
    created_at: "2026-04-06T10:00:00Z",
  },
];

// ── Mock Interview Questions Pool ───────────────────

const MOCK_INTERVIEW_QUESTIONS = [
  "Tell me about yourself and your product management journey.",
  "Walk me through a product you shipped that you're most proud of.",
  "How do you prioritize when everything seems urgent?",
  "Tell me about a time you had to pivot a product strategy based on data.",
  "How would you handle a disagreement with your engineering lead?",
  "What metrics would you use to measure the success of this role?",
  "How do you approach building products in markets you're unfamiliar with?",
  "Tell me about a time you failed. What did you learn?",
  "How do you balance short-term revenue goals with long-term product vision?",
  "Any questions for me about the role or the team?",
];

// ── Helpers ─────────────────────────────────────────

function generateId(): string {
  return crypto.randomUUID();
}

function generateMockFeedback(): MockFeedback {
  return {
    overall_score: 3.5 + Math.random() * 1.5,
    strengths: [
      "Clear and structured responses",
      "Good use of quantified examples",
      "Demonstrated product thinking",
    ],
    improvements: [
      "Could provide more specific metrics",
      "Consider addressing edge cases in your answers",
      "Practice more concise delivery",
    ],
    tips: [
      "Start each answer with a brief headline",
      "Use the STAR framework consistently",
      "End answers with measurable impact",
    ],
    category_scores: {
      "Technical Depth": 3 + Math.random() * 2,
      "Strategic Thinking": 3 + Math.random() * 2,
      "Communication": 3 + Math.random() * 2,
      "Domain Knowledge": 3 + Math.random() * 2,
      "Leadership Signals": 3 + Math.random() * 2,
    },
  };
}

// ── Store ───────────────────────────────────────────

export const useInterviewStore = create<InterviewState>((set, get) => ({
  stories: MOCK_STORIES,
  preps: MOCK_PREPS,
  mockSessions: MOCK_SESSIONS,

  // ── Story Bank CRUD ──

  addStory: (storyData) => {
    const id = generateId();
    const newStory: Story = {
      ...storyData,
      id,
      user_id: "demo",
      used_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ stories: [newStory, ...state.stories] }));
    return id;
  },

  updateStory: (id, updates) => {
    set((state) => ({
      stories: state.stories.map((s) =>
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      ),
    }));
  },

  deleteStory: (id) => {
    set((state) => ({ stories: state.stories.filter((s) => s.id !== id) }));
  },

  incrementStoryUsage: (id) => {
    set((state) => ({
      stories: state.stories.map((s) =>
        s.id === id ? { ...s, used_count: s.used_count + 1 } : s
      ),
    }));
  },

  // ── Prep Actions ──

  addPrep: (prepData) => {
    const id = generateId();
    const newPrep: InterviewPrep = {
      ...prepData,
      id,
      user_id: "demo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ preps: [newPrep, ...state.preps] }));
    return id;
  },

  updatePrep: (id, updates) => {
    set((state) => ({
      preps: state.preps.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      ),
    }));
  },

  generatePrepForJob: (jobId, jobTitle, companyName, description) => {
    const existingPrep = get().preps.find((p) => p.job_id === jobId);
    if (existingPrep) return existingPrep.id;

    const questions: PrepQuestion[] = [
      {
        id: generateId(),
        question: `Why do you want to work at ${companyName}?`,
        category: "behavioral" as QuestionCategory,
        difficulty: "easy",
        suggested_answer: `Research ${companyName}'s mission, recent achievements, and how your experience aligns. Mention specific products or initiatives that excite you.`,
      },
      {
        id: generateId(),
        question: `How would you approach the first 90 days as ${jobTitle}?`,
        category: "product" as QuestionCategory,
        difficulty: "medium",
        suggested_answer: `Structure: Month 1 = Listen & Learn (stakeholder meetings, data analysis, user research). Month 2 = Quick Wins (identify low-hanging improvements, build credibility). Month 3 = Strategy (present product vision, roadmap, and OKRs).`,
      },
      {
        id: generateId(),
        question: "Describe a time you had to make a decision with incomplete information.",
        category: "situational" as QuestionCategory,
        difficulty: "medium",
        suggested_answer: "Use a STAR story highlighting your framework for decision-making under uncertainty. Emphasize reversible vs. irreversible decisions.",
      },
      {
        id: generateId(),
        question: `What experience do you have that's most relevant to this ${jobTitle} role?`,
        category: "behavioral" as QuestionCategory,
        difficulty: "easy",
        suggested_answer: "Map your most impactful experience directly to the key requirements in the job description. Use specific metrics.",
      },
      {
        id: generateId(),
        question: "How do you measure product success?",
        category: "technical" as QuestionCategory,
        difficulty: "medium",
        suggested_answer: "Framework: North Star metrics, input metrics, guardrail metrics. Give company-specific examples of what you'd measure.",
      },
      {
        id: generateId(),
        question: "Tell me about a time you had to influence without authority.",
        category: "leadership" as QuestionCategory,
        difficulty: "hard",
        suggested_answer: "Use your cross-team conflict resolution story. Emphasize structured decision-making and data-driven persuasion.",
      },
    ];

    const id = generateId();
    const prep: InterviewPrep = {
      id,
      user_id: "demo",
      job_id: jobId,
      company_research: `## ${companyName}: Company Overview\n\n*AI-generated research brief based on available information.*\n\n### About\nResearch the company's mission, products, market position, and recent news before your interview.\n\n### Interview Tips\n- Show genuine interest in ${companyName}'s products and mission\n- Prepare specific examples relevant to the ${jobTitle} role\n- Research the interviewer's background on LinkedIn\n- Prepare thoughtful questions about the team and roadmap`,
      role_analysis: `## Role Analysis: ${jobTitle}\n\n### Key Responsibilities\nBased on the job description, focus your preparation on:\n\n${description ? description.slice(0, 500) + "..." : "Review the full job description for detailed requirements."}\n\n### Your Competitive Advantages\n- Map your experience to each requirement in the JD\n- Prepare 2-3 specific examples for each key requirement\n- Quantify your impact wherever possible`,
      questions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ preps: [prep, ...state.preps] }));
    return id;
  },

  generateAIPrepForJob: async (jobId, jobTitle, companyName, description, profileSummary) => {
    const existingPrep = get().preps.find((p) => p.job_id === jobId);
    if (existingPrep) return existingPrep.id;

    const result = await generateInterviewPrep({
      jobTitle,
      companyName,
      jobDescription: description,
      profileSummary,
    });

    const questions: PrepQuestion[] = result.questions.map((q) => ({
      id: generateId(),
      question: q.question,
      category: q.category as QuestionCategory,
      difficulty: q.difficulty,
      suggested_answer: q.suggestedAnswer,
    }));

    const id = generateId();
    const prep: InterviewPrep = {
      id,
      user_id: "demo",
      job_id: jobId,
      company_research: result.companyResearch,
      role_analysis: result.roleAnalysis,
      questions,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ preps: [prep, ...state.preps] }));
    return id;
  },

  // ── Mock Session Actions ──

  addMockSession: (sessionData) => {
    const id = generateId();
    const session: MockSession = {
      ...sessionData,
      id,
      user_id: "demo",
      created_at: new Date().toISOString(),
    };
    set((state) => ({ mockSessions: [session, ...state.mockSessions] }));
    return id;
  },

  startMockSession: (jobId) => {
    const id = generateId();
    const session: MockSession = {
      id,
      user_id: "demo",
      job_id: jobId,
      transcript: [
        {
          role: "interviewer",
          message: MOCK_INTERVIEW_QUESTIONS[0],
          timestamp: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };
    set((state) => ({ mockSessions: [session, ...state.mockSessions] }));
    return id;
  },

  addMockMessage: (sessionId, role, message) => {
    set((state) => ({
      mockSessions: state.mockSessions.map((s) => {
        if (s.id !== sessionId) return s;

        const newMessage: MockMessage = {
          role,
          message,
          timestamp: new Date().toISOString(),
        };
        const transcript = [...s.transcript, newMessage];

        // If candidate just responded, add a follow-up interviewer question
        if (role === "candidate") {
          const questionIndex = Math.floor(transcript.filter((m) => m.role === "interviewer").length);
          if (questionIndex < MOCK_INTERVIEW_QUESTIONS.length) {
            transcript.push({
              role: "interviewer",
              message: MOCK_INTERVIEW_QUESTIONS[questionIndex],
              timestamp: new Date(Date.now() + 2000).toISOString(),
            });
          }
        }

        return { ...s, transcript };
      }),
    }));
  },

  endMockSession: (sessionId) => {
    const feedback = generateMockFeedback();
    set((state) => ({
      mockSessions: state.mockSessions.map((s) => {
        if (s.id !== sessionId) return s;
        const duration = Math.floor(
          (Date.now() - new Date(s.created_at).getTime()) / 1000
        );
        return {
          ...s,
          score: feedback.overall_score,
          feedback,
          duration_seconds: Math.max(duration, 300),
        };
      }),
    }));
  },

  // ── Computed ──

  getStoriesByCompetency: (competency) => {
    const { stories } = get();
    if (!competency) return stories;
    return stories.filter((s) => s.competency === competency);
  },

  getPrepByJobId: (jobId) => get().preps.find((p) => p.job_id === jobId),

  getMocksByJobId: (jobId) =>
    get().mockSessions.filter((m) => m.job_id === jobId),

  getActiveMockSession: () =>
    get().mockSessions.find((m) => !m.feedback),

  getAllCompetencies: () => {
    const { stories } = get();
    return [...new Set(stories.map((s) => s.competency))];
  },

  getStoryById: (id) => get().stories.find((s) => s.id === id),

  getMockById: (id) => get().mockSessions.find((m) => m.id === id),
}));
