import { logger } from "@/lib/logger";
/* ═══════════════════════════════════════════════════
 OfferPath — Resume Store (Zustand)
 Manages resumes, tailoring links, and ATS scoring
 ═══════════════════════════════════════════════════ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Resume, SectionKey, ResumeTheme, ResumeData } from "@/types";
import { DEFAULT_SECTION_VISIBILITY } from "@/types";
import { generateId } from "@/lib/utils";
import { evaluateLocalAts } from "@/lib/localAts";
import { usePipelineStore } from "@/store/pipelineStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { saveResumeAction, deleteResumeAction } from "@/app/actions/resume";
import { toast } from "sonner";

// Demo-expected failures stay silent (local-first by design); real server
// errors surface once instead of vanishing into the logger.
const DEMO_EXPECTED_ERRORS = ["Supabase not configured", "Not authenticated"];
function reportSyncError(context: string, result: { success: boolean; error?: string } | void, err?: unknown) {
  if (err) {
    logger.error(`Failed to sync ${context}`, err);
    toast.error(`Couldn't save ${context} to the cloud. Your local copy is safe.`);
    return;
  }
  if (result && !result.success && result.error && !DEMO_EXPECTED_ERRORS.includes(result.error)) {
    logger.error(`Failed to sync ${context}: ${result.error}`);
    toast.error(`Couldn't save ${context} to the cloud. Your local copy is safe.`);
  }
}

// ── Store Types ─────────────────────────────────────

export interface HistorySnapshot {
 data: ResumeData;
 template: string;
 theme: ResumeTheme;
 section_order: SectionKey[];
 section_visibility: Record<string, Record<SectionKey, boolean>>;
}

export interface ResumeState {
 resumes: Resume[];
 history: {
 resumeId: string | null;
 past: HistorySnapshot[];
 future: HistorySnapshot[];
 };

 // Actions
 addResume: (resume: Omit<Resume, "id" | "user_id" | "created_at" | "updated_at">) => string;
 updateResume: (id: string, updates: Partial<Resume>) => void;
 deleteResume: (id: string) => void;
 duplicateResume: (id: string, newTitle?: string) => string | null;
 
 // History Actions
 saveToHistory: (id: string) => void;
 undo: (id: string) => void;
 redo: (id: string) => void;
 canUndo: boolean;
 canRedo: boolean;

 // Section Management
 moveSection: (id: string, sectionKey: SectionKey, direction: "up" | "down") => void;
 toggleVisibility: (id: string, template: string, sectionKey: SectionKey) => void;

 // Computed
 getResumeById: (id: string) => Resume | undefined;
 getBaseResumes: () => Resume[];
 getTailoredResumes: () => Resume[];

 // ATS Evaluation (persisted, single source of truth)
 atsEvaluations: Record<string, ATSEvaluation>;
 runLocalATSEvaluation: (resumeId: string, jobId: string) => void;
 upgradeATSEvaluationWithAI: (resumeId: string, jobId: string) => Promise<void>;
 getATSScoreView: (resumeId: string, jobId: string) => number | null;
}

export interface ATSEvaluation {
 score: number;
 engine: "local" | "llm";
 matchedKeywords: string[];
 missingKeywords: string[];
 evaluatedAt: string;
}

// ── Default Theme ──────────────────────────────────

const DEFAULT_THEME: ResumeTheme = {
 primaryColor: "#2c3e50",
 accentColor: "#7f8c8d",
 backgroundColor: "#ffffff",
 textColor: "#1a1a2e",
 fontFamily: "'Inter', sans-serif",
 baseFontSize: 10,
 headerFontSize: 28,
 sectionTitleSize: 12,
 companyFontSize: 11,
 lineHeight: 1.3,
 pagePadding: 36,
 sectionSpacing: 12,
 itemSpacing: 6,
 bulletSpacing: 4,
};

// ── Default Section Order ──────────────────────────

const DEFAULT_SECTION_ORDER: SectionKey[] = [
 "summary",
 "experience",
 "education",
 "technicalSkills",
 "skills",
 "languages",
 "certifications",
 "projects",
];

// ── Mock Resumes ────────────────────────────────────


export const MOCK_RESUMES: Resume[] = [
 {
 id: "r1",
 user_id: "demo",
 title: "Master resume — Product Leader",
 data: {
 personal: {
 name: "Alex Chen",
 title: "Senior Product Manager",
 email: "alex.chen@email.com",
 phone: "+65 9123 4567",
 location: "Singapore",
 linkedin: "linkedin.com/in/alexchen",
 website: "alexchen.dev",
 portfolio_url: "alexchen.dev/portfolio",
 portfolio_label: "Portfolio",
 visa_status: "Singapore PR",
 visa_label: "Work Authorization",
 },
 summary:
 "Senior Product Manager with 8+ years driving growth across ad tech, AI platforms, and marketplace products. Led teams of 15+ engineers to ship products serving 100M+ users. Proven track record of 3x revenue growth through data-driven strategy and ML-powered optimization.",
 experience: [
 {
 company: "TechCorp",
 title: "Senior Product Manager, Ad Platform",
 location: "Singapore",
 start_date: "2022-01",
 current: true,
 bullets: [
 "Led ad serving platform strategy generating <strong>$50M+ ARR</strong> across 3 ad formats",
 "Shipped ML-powered CTR prediction model improving click-through by <strong>40%</strong>",
 "Built AIGC auto-fitting system reducing creative production time by 60%",
 "Managed cross-functional team of 15 engineers, 3 designers, 2 data scientists",
 ],
 },
 {
 company: "StartupXYZ",
 title: "Product Manager, Growth",
 location: "Singapore",
 start_date: "2019-06",
 end_date: "2021-12",
 bullets: [
 "Owned user acquisition funnel serving 10M+ monthly active users",
 "Designed A/B testing framework improving conversion by <strong>25%</strong>",
 "Launched 5 new product features driving <strong>3x revenue growth</strong>",
 ],
 },
 {
 company: "BigTech Inc",
 title: "Associate Product Manager",
 location: "San Francisco, CA",
 start_date: "2017-01",
 end_date: "2019-05",
 bullets: [
 "Shipped v2 of analytics dashboard used by 500+ enterprise clients",
 "Reduced churn 18% through data-driven product improvements",
 ],
 },
 ],
 education: [
 {
 institution: "National University of Singapore",
 degree: "MBA",
 field: "Technology Management",
 location: "Singapore",
 end_date: "2017",
 },
 {
 institution: "Tsinghua University",
 degree: "B.Eng",
 field: "Computer Science",
 location: "Beijing, China",
 end_date: "2015",
 },
 ],
 skills: [
 { id: "s1", name: "Product Strategy", isHighlighted: true },
 { id: "s2", name: "Data Analytics", isHighlighted: true },
 { id: "s3", name: "Machine Learning", isHighlighted: true },
 { id: "s4", name: "A/B Testing", isHighlighted: false },
 { id: "s5", name: "Agile/Scrum", isHighlighted: false },
 { id: "s6", name: "SQL", isHighlighted: false },
 { id: "s7", name: "Python", isHighlighted: false },
 { id: "s8", name: "Figma", isHighlighted: false },
 { id: "s9", name: "JIRA", isHighlighted: false },
 { id: "s10", name: "Stakeholder Management", isHighlighted: false },
 { id: "s11", name: "Revenue Optimization", isHighlighted: true },
 { id: "s12", name: "Cross-Functional Leadership", isHighlighted: false },
 ],
 technicalSkills: [
 { id: "ts1", category: "Languages", skills: "Python, SQL, JavaScript, R" },
 { id: "ts2", category: "Analytics", skills: "BigQuery, Amplitude, Mixpanel, Looker" },
 { id: "ts3", category: "ML/AI", skills: "TensorFlow, scikit-learn, OpenAI API, LangChain" },
 { id: "ts4", category: "Tools", skills: "Figma, JIRA, Confluence, Notion, Miro" },
 ],
 certifications: [
 "Google Cloud Professional Data Engineer (2024)",
 "Pragmatic Institute — Product Management Certification (2023)",
 "AWS Solutions Architect Associate (2022)",
 ],
 languages: [
 "English — Native",
 "Mandarin Chinese — Native",
 "Japanese — Conversational (JLPT N2)",
 ],
 },
 template: "classic-minimal",
 theme: { ...DEFAULT_THEME, primaryColor: "#2c3e50" },
 section_order: DEFAULT_SECTION_ORDER,
 section_visibility: {
 "classic-minimal": { ...DEFAULT_SECTION_VISIBILITY },
 "ats-executive": { ...DEFAULT_SECTION_VISIBILITY },
 "premium-headshot": { ...DEFAULT_SECTION_VISIBILITY },
 "bold-engineer": { ...DEFAULT_SECTION_VISIBILITY },
 "clean-layout": { ...DEFAULT_SECTION_VISIBILITY },
 "clean-professional": { ...DEFAULT_SECTION_VISIBILITY },
 "elegant-two-column": { ...DEFAULT_SECTION_VISIBILITY },
 "photo-header": { ...DEFAULT_SECTION_VISIBILITY },
 "academic": { ...DEFAULT_SECTION_VISIBILITY },
 },
 is_base: true,
 created_at: "2026-03-01T10:00:00Z",
 updated_at: "2026-03-20T14:00:00Z",
 },
 {
 id: "r2",
 user_id: "demo",
 title: "Tailored — Google Ads PM",
 data: {
 personal: {
 name: "Alex Chen",
 title: "Ad Tech Product Leader",
 email: "alex.chen@email.com",
 location: "Singapore",
 linkedin: "linkedin.com/in/alexchen",
 visa_status: "Singapore PR",
 },
 summary:
 "Ad Tech Product Leader with 8+ years building ML-powered advertising platforms at scale. Expert in programmatic ad serving, CTR optimization, and creative automation. Seeking to drive Google's Ads Platform strategy with proven experience in AI-driven ad targeting and monetization.",
 experience: [
 {
 company: "TechCorp",
 title: "Senior Product Manager, Ad Platform",
 location: "Singapore",
 start_date: "2022-01",
 current: true,
 bullets: [
 "Led ad serving platform strategy generating <strong>$50M+ ARR</strong>, directly relevant to Google Ads infrastructure",
 "Shipped ML-powered CTR prediction model improving click-through by <strong>40%</strong> — comparable to Google Smart Bidding",
 "Built AIGC auto-fitting system reducing creative production time by 60%, aligning with Performance Max",
 "Managed cross-functional team of 15 engineers, 3 designers, 2 data scientists across 3 time zones",
 ],
 },
 {
 company: "StartupXYZ",
 title: "Product Manager, Growth & Monetization",
 location: "Singapore",
 start_date: "2019-06",
 end_date: "2021-12",
 bullets: [
 "Owned ad-supported revenue model serving 10M+ MAU across display and video formats",
 "Designed advertiser self-serve dashboard improving campaign setup completion by 25%",
 "Launched 5 ad product features driving 3x revenue growth, including native ad formats",
 ],
 },
 ],
 skills: [
 { id: "s1", name: "Ad Tech / Programmatic", isHighlighted: true },
 { id: "s2", name: "ML-Powered Products", isHighlighted: true },
 { id: "s3", name: "Revenue Optimization", isHighlighted: true },
 { id: "s4", name: "CTR/CVR Modeling", isHighlighted: true },
 { id: "s5", name: "A/B Testing at Scale", isHighlighted: false },
 { id: "s6", name: "Cross-Functional Leadership", isHighlighted: false },
 { id: "s7", name: "SQL & BigQuery", isHighlighted: false },
 { id: "s8", name: "Python", isHighlighted: false },
 ],
 technicalSkills: [
 { id: "ts1", category: "Ad Tech", skills: "DFP/GAM, Programmatic Buying, RTB, Header Bidding" },
 { id: "ts2", category: "Analytics", skills: "BigQuery, Amplitude, Looker, Ads Data Hub" },
 { id: "ts3", category: "ML/AI", skills: "CTR Prediction, LTV Models, Recommendation Engines" },
 ],
 },
 template: "ats-executive",
 theme: { ...DEFAULT_THEME, primaryColor: "#1a73e8", accentColor: "#5f9ea0" },
 section_order: DEFAULT_SECTION_ORDER,
 section_visibility: {
 "ats-executive": { ...DEFAULT_SECTION_VISIBILITY, photo: false },
 },
 is_base: false,
 created_at: "2026-03-22T10:00:00Z",
 updated_at: "2026-03-25T14:00:00Z",
 },
 {
 id: "r3",
 user_id: "demo",
 title: "Tailored — Grab Lead PM",
 data: {
 personal: {
 name: "Alex Chen",
 title: "Super-App Product Leader",
 email: "alex.chen@email.com",
 location: "Singapore",
 linkedin: "linkedin.com/in/alexchen",
 visa_status: "Singapore PR",
 photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
 },
 summary:
 "Seasoned Ad Tech & Super-App Product Leader with 8+ years building monetization platforms across SEA markets. Deep expertise in ad serving, ML-based targeting, and multi-product ecosystem monetization.",
 experience: [
 {
 company: "TechCorp",
 title: "Senior Product Manager, Ad Platform",
 location: "Singapore",
 start_date: "2022-01",
 current: true,
 bullets: [
 "Led multi-format ad serving platform generating $50M+ ARR across display, video, and native ad units",
 "Shipped ML-powered CTR prediction model improving advertiser ROI by 40%",
 "Pioneered AIGC creative automation reducing ad production cycle from 3 days to 2 hours",
 "Owned P&L for ad monetization vertical, achieving 120% of annual revenue targets for 2 consecutive years",
 ],
 },
 ],
 skills: [
 { id: "s1", name: "Ad Monetization & P&L", isHighlighted: true },
 { id: "s2", name: "Super-App Ecosystems", isHighlighted: true },
 { id: "s3", name: "ML-Powered Ad Serving", isHighlighted: true },
 { id: "s4", name: "Southeast Asia Markets", isHighlighted: false },
 { id: "s5", name: "Multi-Product Strategy", isHighlighted: false },
 { id: "s6", name: "Cross-Functional Leadership", isHighlighted: false },
 { id: "s7", name: "Data-Driven Decision Making", isHighlighted: false },
 ],
 },
 template: "elegant-two-column",
 theme: { ...DEFAULT_THEME, primaryColor: "#00b14f", accentColor: "#34d399" },
 section_order: DEFAULT_SECTION_ORDER,
 section_visibility: {
 "elegant-two-column": { ...DEFAULT_SECTION_VISIBILITY },
 },
 is_base: false,
 created_at: "2026-04-01T10:00:00Z",
 updated_at: "2026-04-03T14:00:00Z",
 },
];

// ── ATS Score Deterministic Mock ────────────────────

// Placeholder content shown in the live preview when a resume is still empty,
// so users can compare templates before entering their own data.
export const PLACEHOLDER_RESUME_DATA: ResumeData = MOCK_RESUMES[0].data;

// ── Store ───────────────────────────────────────────

export const useResumeStore = create<ResumeState>()(
 persist(
 (set, get) => ({
 resumes: [],
 history: { resumeId: null, past: [], future: [] },
 canUndo: false,
 canRedo: false,

 // ── History Helpers ──

 saveToHistory: (id) => {
 const resume = get().resumes.find((r) => r.id === id);
 if (!resume) return;

 // If history belongs to a different resume, reset it
 const currentHistoryResumeId = get().history.resumeId;
 if (currentHistoryResumeId && currentHistoryResumeId !== id) {
 set({ history: { resumeId: id, past: [], future: [] }, canUndo: false, canRedo: false });
 }

 const snapshot: HistorySnapshot = {
 data: JSON.parse(JSON.stringify(resume.data)),
 template: resume.template,
 theme: { ...resume.theme },
 section_order: resume.section_order ? [...resume.section_order] : [],
 section_visibility: JSON.parse(JSON.stringify(resume.section_visibility)),
 };

 set((state) => ({
 history: {
 resumeId: id,
 past: [...(state.history.resumeId === id ? state.history.past : []), snapshot].slice(-50),
 future: [],
 },
 canUndo: true,
 canRedo: false,
 }));
 },

 undo: (id) => {
 const { past, future, resumeId } = get().history;
 // Only allow undo for the resume that owns the history
 if (past.length === 0 || (resumeId && resumeId !== id)) return;

 const resume = get().resumes.find((r) => r.id === id);
 if (!resume) return;

 const currentSnapshot: HistorySnapshot = {
 data: JSON.parse(JSON.stringify(resume.data)),
 template: resume.template,
 theme: { ...resume.theme },
 section_order: resume.section_order ? [...resume.section_order] : [],
 section_visibility: JSON.parse(JSON.stringify(resume.section_visibility)),
 };

 const previous = past[past.length - 1];
 const newPast = past.slice(0, -1);

 set((state) => ({
 resumes: state.resumes.map((r) =>
 r.id === id ? { ...r, ...previous, updated_at: new Date().toISOString() } : r
 ),
 history: {
 resumeId: id,
 past: newPast,
 future: [currentSnapshot, ...future],
 },
 canUndo: newPast.length > 0,
 canRedo: true,
 }));
 },

 redo: (id) => {
 const { past, future, resumeId } = get().history;
 if (future.length === 0 || (resumeId && resumeId !== id)) return;

 const resume = get().resumes.find((r) => r.id === id);
 if (!resume) return;

 const currentSnapshot: HistorySnapshot = {
 data: JSON.parse(JSON.stringify(resume.data)),
 template: resume.template,
 theme: { ...resume.theme },
 section_order: resume.section_order ? [...resume.section_order] : [],
 section_visibility: JSON.parse(JSON.stringify(resume.section_visibility)),
 };

 const next = future[0];
 const newFuture = future.slice(1);

 set((state) => ({
 resumes: state.resumes.map((r) =>
 r.id === id ? { ...r, ...next, updated_at: new Date().toISOString() } : r
 ),
 history: {
 resumeId: id,
 past: [...past, currentSnapshot],
 future: newFuture,
 },
 canUndo: true,
 canRedo: newFuture.length > 0,
 }));
 },

 // ── CRUD ──

 addResume: (resumeData) => {
 const id = generateId();
 const newResume: Resume = {
 ...resumeData,
 id,
 user_id: "demo",
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };
 set((state) => ({ resumes: [newResume, ...state.resumes] }));
 
 // Background sync
  saveResumeAction(id, newResume).then(
    (result) => reportSyncError("resume creation", result),
    (err) => reportSyncError("resume creation", undefined, err)
  );
 
 return id;
 },

 updateResume: (id, updates) => {
 // Note: We don't auto-save to history on every keystroke
 // The editor should call saveToHistory on blur or major changes
 set((state) => ({
 resumes: state.resumes.map((r) =>
 r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
 ),
 }));
 },

 deleteResume: (id) => {
 set((state) => ({ resumes: state.resumes.filter((r) => r.id !== id) }));
 
 // Background sync
  deleteResumeAction(id).then(
    (result) => reportSyncError("resume deletion", result),
    (err) => reportSyncError("resume deletion", undefined, err)
  );
 },

 duplicateResume: (id, newTitle) => {
 const source = get().resumes.find((r) => r.id === id);
 if (!source) return null;

 const newId = generateId();
 const duplicate: Resume = {
 ...source,
 id: newId,
 title: newTitle || `${source.title} (Copy)`,
 is_base: false,
 created_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 };
 set((state) => ({ resumes: [duplicate, ...state.resumes] }));
 
 // Background sync
  saveResumeAction(newId, duplicate).then(
    (result) => reportSyncError("duplicated resume", result),
    (err) => reportSyncError("duplicated resume", undefined, err)
  );
 
 return newId;
 },

 // ── Section Management ──

 moveSection: (id, sectionKey, direction) => {
 const resume = get().resumes.find((r) => r.id === id);
 if (!resume) return;

 const order = [...(resume.section_order || DEFAULT_SECTION_ORDER)];
 const idx = order.indexOf(sectionKey);
 if (idx < 0) return;

 const swapIdx = direction === "up" ? idx - 1 : idx + 1;
 if (swapIdx < 0 || swapIdx >= order.length) return;

 // Save history only for an actual change; no-op clicks must not pollute undo.
 get().saveToHistory(id);

 [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];

 get().updateResume(id, { section_order: order });
 },

 toggleVisibility: (id, template, sectionKey) => {
 const resume = get().resumes.find((r) => r.id === id);
 if (!resume) return;

 get().saveToHistory(id);

 const currentVis = { ...resume.section_visibility };
 const templateVis = { ...(currentVis[template] || DEFAULT_SECTION_VISIBILITY) };
 
 templateVis[sectionKey] = !templateVis[sectionKey];
 currentVis[template] = templateVis;

 get().updateResume(id, { section_visibility: currentVis });
 },

 // ── Computed ──

 getResumeById: (id) => get().resumes.find((r) => r.id === id),

 getBaseResumes: () => get().resumes.filter((r) => r.is_base),

 getTailoredResumes: () => get().resumes.filter((r) => !r.is_base),

 atsEvaluations: {},

  runLocalATSEvaluation: (resumeId, jobId) => {
  const key = `${resumeId}:${jobId}`;
  const existing = get().atsEvaluations[key];
  if (existing?.engine === "llm") return;

  const resume = get().resumes.find((r) => r.id === resumeId);
  // Pipeline jobs and discovery listings are both valid tailor targets
  // (resume page ?tailorFor= accepts either) — previously discovery jobs
  // always missed, so their ATS badges never resolved.
  const description =
    usePipelineStore.getState().jobs.find((j) => j.id === jobId)?.description?.trim() ||
    useDiscoveryStore.getState().jobs.find((j) => j.id === jobId)?.description?.trim();
  if (!resume || !description) return;

  const result = evaluateLocalAts(resume.data, description);
 set((state) => ({
 atsEvaluations: {
 ...state.atsEvaluations,
 [key]: {
 score: result.score,
 engine: "local",
 matchedKeywords: result.matchedKeywords,
 missingKeywords: result.missingKeywords,
 evaluatedAt: new Date().toISOString(),
 },
 },
 }));
 },

  upgradeATSEvaluationWithAI: async (resumeId, jobId) => {
  const resume = get().resumes.find((r) => r.id === resumeId);
  const description =
    usePipelineStore.getState().jobs.find((j) => j.id === jobId)?.description ||
    useDiscoveryStore.getState().jobs.find((j) => j.id === jobId)?.description;
  if (!resume || !description) throw new Error("Resume or job not found");

  const { evaluateATS } = await import("@/lib/aiService");
  const result = await evaluateATS({
  resumeData: resume.data,
  jobDescription: description,
  });

 set((state) => ({
 atsEvaluations: {
 ...state.atsEvaluations,
 [`${resumeId}:${jobId}`]: {
 score: Math.max(0, Math.min(100, Math.round(result.score))),
 engine: "llm",
 matchedKeywords: result.matchedKeywords ?? [],
 missingKeywords: result.missingKeywords ?? [],
 evaluatedAt: new Date().toISOString(),
 },
 },
 }));
 },

  getATSScoreView: (resumeId, jobId) => {
  const stored = get().atsEvaluations[`${resumeId}:${jobId}`];
  if (stored) return stored.score;

  const resume = get().resumes.find((r) => r.id === resumeId);
  const description =
    usePipelineStore.getState().jobs.find((j) => j.id === jobId)?.description?.trim() ||
    useDiscoveryStore.getState().jobs.find((j) => j.id === jobId)?.description?.trim();
  if (!resume || !description) return null;
  return evaluateLocalAts(resume.data, description).score;
  },
 }),
 {
 name: "offerpath-resume",
 skipHydration: true,
 partialize: (state) => ({
 resumes: state.resumes,
 atsEvaluations: state.atsEvaluations,
 }),
 }
 )
);
