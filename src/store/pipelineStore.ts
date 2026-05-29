/* ═══════════════════════════════════════════════════
   OfferPath — Pipeline Store (Zustand)
   Manages jobs, filters, sorting, and Kanban state
   ═══════════════════════════════════════════════════ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Job, JobStatus, Company } from "@/types";
import { generateId } from "@/lib/utils";

// ── Filter & Sort Types ─────────────────────────────

export type SortField = "score" | "created_at" | "title" | "company";
export type SortDirection = "asc" | "desc";

export interface PipelineFilters {
  search: string;
  statuses: JobStatus[];
  tiers: number[];
  archetypes: string[];
  scoreMin: number | null;
  scoreMax: number | null;
}

export interface PipelineState {
  jobs: Job[];
  companies: Company[];
  filters: PipelineFilters;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedJobId: string | null;
  addJobDialogOpen: boolean;
  weeklyGoalCount: number;
  setWeeklyGoalCount: (count: number) => void;

  // Resume picker state
  resumePickerOpen: boolean;
  resumePickerJobId: string | null;

  // Actions
  addJob: (job: Omit<Job, "id" | "user_id" | "kanban_order" | "created_at" | "updated_at">) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  moveJob: (id: string, newStatus: JobStatus) => void;
  moveJobDirect: (id: string, newStatus: JobStatus) => void;
  reorderJobs: (activeId: string, overId: string, newStatus: JobStatus) => void;
  setFilter: (filters: Partial<PipelineFilters>) => void;
  clearFilters: () => void;
  setSort: (field: SortField, direction?: SortDirection) => void;
  setSelectedJob: (id: string | null) => void;
  setAddJobDialogOpen: (open: boolean) => void;
  setResumePickerOpen: (open: boolean, jobId?: string | null) => void;
  linkResumeToJob: (jobId: string, resumeId: string) => void;

  // Computed
  getJobsByStatus: (status: JobStatus) => Job[];
  getFilteredJobs: () => Job[];
  getJobById: (id: string) => Job | undefined;
  getStats: () => PipelineStats;
  getUniqueArchetypes: () => string[];
  getJobsNeedingResume: () => Job[];
}

export interface PipelineStats {
  total: number;
  byStatus: Record<JobStatus, number>;
  avgScore: number;
  interviewRate: number;
  offerRate: number;
  addedThisWeek: number;
}

// ── Default Filters ─────────────────────────────────

const DEFAULT_FILTERS: PipelineFilters = {
  search: "",
  statuses: [],
  tiers: [],
  archetypes: [],
  scoreMin: null,
  scoreMax: null,
};

// ── Mock Companies ──────────────────────────────────

const MOCK_COMPANIES: Company[] = [
  {
    id: "c1",
    user_id: "demo",
    name: "Google",
    industry: "Technology",
    headquarters: "Mountain View, CA",
    tier: 1,
    logo_url: "",
    career_url: "https://careers.google.com",
    created_at: "2026-03-15T00:00:00Z",
    updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "c2",
    user_id: "demo",
    name: "Stripe",
    industry: "Fintech",
    headquarters: "San Francisco, CA",
    tier: 1,
    logo_url: "",
    career_url: "https://stripe.com/jobs",
    created_at: "2026-03-16T00:00:00Z",
    updated_at: "2026-03-16T00:00:00Z",
  },
  {
    id: "c3",
    user_id: "demo",
    name: "Grab",
    industry: "Technology / Ride-hailing",
    headquarters: "Singapore",
    tier: 1,
    logo_url: "",
    career_url: "https://grab.careers",
    created_at: "2026-03-17T00:00:00Z",
    updated_at: "2026-03-17T00:00:00Z",
  },
  {
    id: "c4",
    user_id: "demo",
    name: "Shopify",
    industry: "E-Commerce",
    headquarters: "Ottawa, Canada",
    tier: 2,
    logo_url: "",
    career_url: "https://shopify.com/careers",
    created_at: "2026-03-18T00:00:00Z",
    updated_at: "2026-03-18T00:00:00Z",
  },
  {
    id: "c5",
    user_id: "demo",
    name: "ByteDance",
    industry: "Technology / Social Media",
    headquarters: "Singapore",
    tier: 1,
    logo_url: "",
    career_url: "https://jobs.bytedance.com",
    created_at: "2026-03-19T00:00:00Z",
    updated_at: "2026-03-19T00:00:00Z",
  },
  {
    id: "c6",
    user_id: "demo",
    name: "Datadog",
    industry: "Cloud / DevOps",
    headquarters: "New York, NY",
    tier: 2,
    logo_url: "",
    career_url: "https://www.datadoghq.com/careers",
    created_at: "2026-03-20T00:00:00Z",
    updated_at: "2026-03-20T00:00:00Z",
  },
];

// ── Mock Jobs ───────────────────────────────────────

const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    user_id: "demo",
    company_id: "c1",
    company: MOCK_COMPANIES[0],
    title: "Senior Product Manager, Ads Platform",
    description:
      "Lead product strategy for Google's advertising platform. Drive growth through AI-powered ad targeting and personalization. Partner with engineering to deliver scalable solutions serving billions of impressions daily.",
    location: "Singapore",
    url: "https://careers.google.com/jobs/results/123",
    status: "evaluated",
    score: 4.5,
    tier: 1,
    archetype: "Ad Tech",
    evaluation: {
      score: 4.5,
      tier: 1,
      archetype: "Ad Tech",
      fit_reasons: [
        "Strong match with ad platform experience",
        "AI/ML product leadership aligns with background",
        "Singapore location is ideal",
      ],
      concerns: [
        "May require deeper ML engineering knowledge",
        "Competitive internal promotion culture",
      ],
      key_requirements: [
        "7+ years PM experience",
        "Ad tech or marketplace background",
        "Data-driven decision making",
        "Cross-functional leadership",
      ],
      match_summary:
        "Excellent fit — your ad tech experience and AI product leadership directly match this role's requirements.",
    },
    kanban_order: 0,
    salary_range: "$220K–$320K",
    created_at: "2026-03-20T10:00:00Z",
    updated_at: "2026-03-25T14:00:00Z",
  },
  {
    id: "j2",
    user_id: "demo",
    company_id: "c2",
    company: MOCK_COMPANIES[1],
    title: "Product Lead, Payments Infrastructure",
    description:
      "Own the product vision for Stripe's core payments infrastructure. Define the roadmap for payment processing, fraud detection, and merchant experience. Build products that move billions of dollars.",
    location: "San Francisco, CA",
    url: "https://stripe.com/jobs/456",
    status: "applied",
    score: 4.2,
    tier: 1,
    archetype: "Fintech Platform",
    evaluation: {
      score: 4.2,
      tier: 1,
      archetype: "Fintech Platform",
      fit_reasons: [
        "Platform product experience is transferable",
        "Data infrastructure skills are highly relevant",
        "Strong analytical mindset aligns",
      ],
      concerns: [
        "Payments domain may require ramp-up time",
        "Relocation to SF required",
      ],
      key_requirements: [
        "8+ years product management",
        "Platform or infrastructure experience",
        "Technical depth in distributed systems",
        "Experience with regulated industries",
      ],
      match_summary:
        "Strong match — platform experience and technical depth are directly transferable to payments infrastructure.",
    },
    resume_id: "r1",
    applied_at: "2026-04-01T09:00:00Z",
    kanban_order: 0,
    salary_range: "$240K–$350K",
    created_at: "2026-03-22T10:00:00Z",
    updated_at: "2026-04-01T09:00:00Z",
  },
  {
    id: "j3",
    user_id: "demo",
    company_id: "c3",
    company: MOCK_COMPANIES[2],
    title: "Lead PM, Ad Serving & Monetization",
    description:
      "Drive Grab's advertising monetization strategy across the super-app ecosystem. Own the ad serving platform, build advertiser tools, and optimize revenue across ride-hailing, food delivery, and financial services.",
    location: "Singapore",
    url: "https://grab.careers/jobs/789",
    status: "interviewing",
    score: 4.8,
    tier: 1,
    archetype: "Ad Tech",
    evaluation: {
      score: 4.8,
      tier: 1,
      archetype: "Ad Tech",
      fit_reasons: [
        "Perfect ad tech alignment",
        "Super-app ecosystem matches multi-product experience",
        "Singapore-based, no relocation needed",
        "Leadership role matches seniority level",
      ],
      concerns: ["Grab's ad platform is still maturing — may face resource constraints"],
      key_requirements: [
        "8+ years in product management",
        "Ad tech or marketplace monetization",
        "Experience with ML-driven products",
        "P&L ownership experience",
      ],
      match_summary:
        "Exceptional fit — the closest match to your ad tech background and leadership level. Top priority application.",
    },
    interviewed_at: "2026-04-05T10:00:00Z",
    kanban_order: 0,
    salary_range: "SGD 280K–380K",
    created_at: "2026-03-18T10:00:00Z",
    updated_at: "2026-04-05T10:00:00Z",
  },
  {
    id: "j4",
    user_id: "demo",
    company_id: "c4",
    company: MOCK_COMPANIES[3],
    title: "Senior PM, Merchant Experience",
    description:
      "Build delightful merchant onboarding and management experiences for Shopify's global platform. Own the merchant dashboard, analytics, and automation tools that help millions of merchants succeed.",
    location: "Remote (APAC)",
    url: "https://shopify.com/careers/101",
    status: "new",
    kanban_order: 0,
    salary_range: "$180K–$250K",
    created_at: "2026-04-08T10:00:00Z",
    updated_at: "2026-04-08T10:00:00Z",
  },
  {
    id: "j5",
    user_id: "demo",
    company_id: "c5",
    company: MOCK_COMPANIES[4],
    title: "Product Manager, AIGC Platform",
    description:
      "Lead product development for ByteDance's AI-Generated Content platform. Drive the creation of tools that leverage large language models and generative AI for content creation at scale across TikTok and Lark.",
    location: "Singapore",
    url: "https://jobs.bytedance.com/position/202",
    status: "evaluated",
    score: 3.8,
    tier: 2,
    archetype: "AI Platform",
    evaluation: {
      score: 3.8,
      tier: 2,
      archetype: "AI Platform",
      fit_reasons: [
        "AIGC experience is directly relevant",
        "Singapore location is appealing",
        "Fast-paced environment matches work style",
      ],
      concerns: [
        "ByteDance corporate culture may differ from expectations",
        "Potential geopolitical considerations",
        "IC role despite leadership background",
      ],
      key_requirements: [
        "5+ years product management",
        "Experience with AI/ML products",
        "Content platform experience",
        "Data-driven product development",
      ],
      match_summary:
        "Good match with your AIGC background, but potential culture and level mismatch warrant careful consideration.",
    },
    kanban_order: 1,
    salary_range: "SGD 200K–280K",
    created_at: "2026-04-02T10:00:00Z",
    updated_at: "2026-04-03T10:00:00Z",
  },
  {
    id: "j6",
    user_id: "demo",
    company_id: "c6",
    company: MOCK_COMPANIES[5],
    title: "Senior PM, Observability Platform",
    description:
      "Own the product roadmap for Datadog's core observability platform. Drive innovation in APM, logs, and infrastructure monitoring used by millions of engineers worldwide.",
    location: "New York, NY",
    url: "https://datadoghq.com/careers/303",
    status: "offered",
    score: 3.5,
    tier: 2,
    archetype: "DevOps Platform",
    evaluation: {
      score: 3.5,
      tier: 2,
      archetype: "DevOps Platform",
      fit_reasons: [
        "Platform product experience transfers well",
        "Data-heavy product aligns with analytical strengths",
      ],
      concerns: [
        "DevOps/observability is a new domain",
        "Relocation to NYC required",
        "Less alignment with ad tech specialization",
      ],
      key_requirements: [
        "6+ years product management",
        "Developer tools or infrastructure experience",
        "Technical depth in cloud systems",
        "B2B SaaS experience",
      ],
      match_summary:
        "Decent match on platform skills but domain pivot into DevOps observability carries higher ramp-up risk.",
    },
    offered_at: "2026-04-07T10:00:00Z",
    kanban_order: 0,
    salary_range: "$200K–$300K",
    comp_details: {
      base_salary: "$230K",
      equity: "$80K/yr RSU",
      bonus: "15% target",
      benefits: ["Health", "401k match", "Unlimited PTO"],
      total_comp: "$345K",
    },
    created_at: "2026-03-10T10:00:00Z",
    updated_at: "2026-04-07T10:00:00Z",
  },
  {
    id: "j7",
    user_id: "demo",
    company_id: "c1",
    company: MOCK_COMPANIES[0],
    title: "PM, YouTube Ads Measurement",
    description:
      "Build measurement and attribution products for YouTube's advertising platform. Help advertisers understand the impact of their video campaigns through advanced analytics and ML-powered insights.",
    location: "Singapore",
    url: "https://careers.google.com/jobs/results/456",
    status: "new",
    kanban_order: 1,
    created_at: "2026-04-09T10:00:00Z",
    updated_at: "2026-04-09T10:00:00Z",
  },
  {
    id: "j8",
    user_id: "demo",
    company_id: "c3",
    company: MOCK_COMPANIES[2],
    title: "Senior PM, Driver Experience",
    description:
      "Own the driver-side experience for Grab's ride-hailing platform. Optimize driver earnings, reduce churn, and build tools that make driving for Grab the best experience in Southeast Asia.",
    location: "Singapore",
    url: "https://grab.careers/jobs/890",
    status: "rejected",
    score: 2.8,
    tier: 3,
    archetype: "Marketplace",
    evaluation: {
      score: 2.8,
      tier: 3,
      archetype: "Marketplace",
      fit_reasons: [
        "Marketplace experience transfers partially",
        "Singapore location is ideal",
      ],
      concerns: [
        "Driver-side product is outside core expertise",
        "Operational focus may not align with strategic preference",
        "Lower seniority than current level",
      ],
      key_requirements: [
        "5+ years product management",
        "Marketplace or operations experience",
        "Mobile-first product development",
        "Experience with driver/rider platforms",
      ],
      match_summary:
        "Weak match — operational driver-side focus doesn't leverage your ad tech and AI platform strengths.",
    },
    kanban_order: 0,
    salary_range: "SGD 180K–240K",
    created_at: "2026-03-05T10:00:00Z",
    updated_at: "2026-04-04T10:00:00Z",
  },
];

// ── Store ───────────────────────────────────────────

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
  jobs: MOCK_JOBS,
  companies: MOCK_COMPANIES,
  filters: DEFAULT_FILTERS,
  sortField: "created_at",
  sortDirection: "desc",
  selectedJobId: null,
  addJobDialogOpen: false,
  weeklyGoalCount: 5,
  setWeeklyGoalCount: (count) => set({ weeklyGoalCount: count }),
  resumePickerOpen: false,
  resumePickerJobId: null,

  // ── CRUD ──

  addJob: (jobData) => {
    const newJob: Job = {
      ...jobData,
      id: generateId(),
      user_id: "demo",
      status: jobData.status || "new",
      kanban_order: get().jobs.filter((j) => j.status === (jobData.status || "new")).length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ jobs: [newJob, ...state.jobs] }));
  },

  updateJob: (id, updates) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === id ? { ...j, ...updates, updated_at: new Date().toISOString() } : j
      ),
    }));
  },

  deleteJob: (id) => {
    set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
  },

  moveJob: (id, newStatus) => {
    // Intercept: when moving to "applied", open resume picker first
    if (newStatus === "applied") {
      const job = get().getJobById(id);
      if (job && job.status !== "applied" && !job.resume_id) {
        set({ resumePickerOpen: true, resumePickerJobId: id });
        return; // Don't move yet — ResumePicker will call moveJobDirect
      }
    }
    // Direct move for all other statuses
    get().moveJobDirect(id, newStatus);
  },

  moveJobDirect: (id, newStatus) => {
    set((state) => ({
      jobs: state.jobs.map((j) => {
        if (j.id !== id) return j;
        const updates: Partial<Job> = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };
        // Set timestamps for lifecycle events
        if (newStatus === "applied" && !j.applied_at) updates.applied_at = new Date().toISOString();
        if (newStatus === "interviewing" && !j.interviewed_at) updates.interviewed_at = new Date().toISOString();
        if (newStatus === "offered" && !j.offered_at) updates.offered_at = new Date().toISOString();
        return { ...j, ...updates };
      }),
    }));
  },

  reorderJobs: (activeId, overId, newStatus) => {
    set((state) => {
      const jobs = [...state.jobs];
      const activeIdx = jobs.findIndex((j) => j.id === activeId);
      if (activeIdx === -1) return state;

      // Update status
      jobs[activeIdx] = {
        ...jobs[activeIdx],
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Reorder within column
      const columnJobs = jobs
        .filter((j) => j.status === newStatus)
        .sort((a, b) => a.kanban_order - b.kanban_order);

      const overIdx = columnJobs.findIndex((j) => j.id === overId);
      if (overIdx !== -1) {
        // Place after the target
        columnJobs.forEach((j, i) => {
          const jobIdx = jobs.findIndex((jj) => jj.id === j.id);
          if (jobIdx !== -1) {
            jobs[jobIdx] = { ...jobs[jobIdx], kanban_order: i };
          }
        });
      }

      return { jobs };
    });
  },

  // ── Filters ──

  setFilter: (updates) => {
    set((state) => ({ filters: { ...state.filters, ...updates } }));
  },

  clearFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  setSort: (field, direction) => {
    set((state) => ({
      sortField: field,
      sortDirection: direction || (state.sortField === field && state.sortDirection === "desc" ? "asc" : "desc"),
    }));
  },

  setSelectedJob: (id) => set({ selectedJobId: id }),
  setAddJobDialogOpen: (open) => set({ addJobDialogOpen: open }),

  setResumePickerOpen: (open, jobId) =>
    set({
      resumePickerOpen: open,
      resumePickerJobId: open ? (jobId ?? null) : null,
    }),

  linkResumeToJob: (jobId, resumeId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId
          ? { ...j, resume_id: resumeId, updated_at: new Date().toISOString() }
          : j
      ),
    }));
  },

  // ── Computed ──

  getJobsByStatus: (status) => {
    const state = get();
    return state
      .getFilteredJobs()
      .filter((j) => j.status === status)
      .sort((a, b) => a.kanban_order - b.kanban_order);
  },

  getFilteredJobs: () => {
    const { jobs, filters, sortField, sortDirection } = get();
    let filtered = [...jobs];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.name?.toLowerCase().includes(q) ||
          j.archetype?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((j) => filters.statuses.includes(j.status));
    }

    // Tier filter
    if (filters.tiers.length > 0) {
      filtered = filtered.filter((j) => j.tier !== undefined && filters.tiers.includes(j.tier));
    }

    // Archetype filter
    if (filters.archetypes.length > 0) {
      filtered = filtered.filter(
        (j) => j.archetype !== undefined && filters.archetypes.includes(j.archetype)
      );
    }

    // Score range
    if (filters.scoreMin !== null) {
      filtered = filtered.filter((j) => j.score !== undefined && j.score >= filters.scoreMin!);
    }
    if (filters.scoreMax !== null) {
      filtered = filtered.filter((j) => j.score !== undefined && j.score <= filters.scoreMax!);
    }

    // Sort
    filtered.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "score":
          return ((a.score || 0) - (b.score || 0)) * dir;
        case "title":
          return a.title.localeCompare(b.title) * dir;
        case "company":
          return (a.company?.name || "").localeCompare(b.company?.name || "") * dir;
        case "created_at":
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });

    return filtered;
  },

  getJobById: (id) => get().jobs.find((j) => j.id === id),

  getStats: () => {
    const { jobs } = get();
    const total = jobs.length;
    const byStatus = {} as Record<JobStatus, number>;
    const allStatuses: JobStatus[] = [
      "new",
      "evaluated",
      "applied",
      "interviewing",
      "offered",
      "rejected",
      "discarded",
      "archived",
    ];
    allStatuses.forEach((s) => {
      byStatus[s] = jobs.filter((j) => j.status === s).length;
    });

    const scoredJobs = jobs.filter((j) => j.score !== undefined);
    const avgScore =
      scoredJobs.length > 0
        ? scoredJobs.reduce((sum, j) => sum + (j.score || 0), 0) / scoredJobs.length
        : 0;

    const applied = jobs.filter((j) =>
      ["applied", "interviewing", "offered"].includes(j.status)
    ).length;
    const interviewing = jobs.filter((j) =>
      ["interviewing", "offered"].includes(j.status)
    ).length;
    const offered = jobs.filter((j) => j.status === "offered").length;

    const interviewRate = applied > 0 ? (interviewing / applied) * 100 : 0;
    const offerRate = interviewing > 0 ? (offered / interviewing) * 100 : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const addedThisWeek = jobs.filter(
      (j) => new Date(j.created_at) >= weekAgo
    ).length;

    return { total, byStatus, avgScore, interviewRate, offerRate, addedThisWeek };
  },

  getUniqueArchetypes: () => {
    const { jobs } = get();
    const archetypes = jobs
      .map((j) => j.archetype)
      .filter((a): a is string => !!a);
    return [...new Set(archetypes)];
  },

  getJobsNeedingResume: () => {
    const { jobs } = get();
    return jobs.filter(
      (j) => j.status === "evaluated" && !j.resume_id
    );
  },
    }),
    {
      name: "offerpath-pipeline",
      partialize: (state) => ({
        jobs: state.jobs,
        companies: state.companies,
        weeklyGoalCount: state.weeklyGoalCount,
      }),
    }
  )
);
