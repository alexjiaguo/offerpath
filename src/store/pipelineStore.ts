import { logger } from "@/lib/logger";
/* ═══════════════════════════════════════════════════
 OfferPath — Pipeline Store (Zustand)
 Manages jobs, filters, sorting, and Kanban state
 ═══════════════════════════════════════════════════ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Job, JobStatus, Company } from "@/types";
import { generateId } from "@/lib/utils";
import { createJobAction, updateJobStatusAction } from "@/app/actions/pipeline";

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
 appliedThisWeek: number;
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

export const MOCK_COMPANIES: Company[] = [
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

// ── Store ───────────────────────────────────────────

export const usePipelineStore = create<PipelineState>()(
 persist(
 (set, get) => ({
 jobs: [],
 companies: [],
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
 history: [{
 action: "Created job",
 date: new Date().toISOString(),
 details: `Added ${jobData.title} at ${jobData.company?.name || 'Company'}`
 }]
 };
 set((state) => ({ jobs: [newJob, ...state.jobs] }));
 
 // Background sync
 createJobAction(newJob).catch(err => logger.error("Failed to sync job creation to server", err));
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
 
 // Append history
 const newHistory = [...(j.history || []), {
 action: "Status Update",
 date: new Date().toISOString(),
 details: `Moved to ${newStatus}`
 }];
 updates.history = newHistory;
 
 return { ...j, ...updates };
 }),
 }));
 
 // Background sync
 updateJobStatusAction(id, newStatus).catch(err => logger.error("Failed to sync status update to server", err));
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
 const appliedThisWeek = jobs.filter(
 (j) => j.status === "applied" && new Date(j.updated_at) >= weekAgo
 ).length;

 return { total, byStatus, avgScore, interviewRate, offerRate, addedThisWeek, appliedThisWeek };
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
 skipHydration: true,
 partialize: (state) => ({
 jobs: state.jobs,
 companies: state.companies,
 weeklyGoalCount: state.weeklyGoalCount,
 }),
 }
 )
);
