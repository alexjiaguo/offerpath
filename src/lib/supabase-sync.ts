import { logger } from "@/lib/logger";
/* ═══════════════════════════════════════════════════
 OfferPath — Supabase Sync Layer
 Bridges Zustand stores to Supabase (additive to localStorage)
 Only activates when Supabase is configured and user is authenticated
 ═══════════════════════════════════════════════════ */

import { createClient, isSupabaseConfigured } from "./supabase";

export type StoreName = "pipeline" | "resume" | "profile" | "discovery" | "interview";

// ── Load: fetch from Supabase and return data for store hydration ──

export async function loadFromSupabase(
 storeName: StoreName
): Promise<unknown | null> {
 if (!isSupabaseConfigured()) return null;
 const supabase = createClient();
 if (!supabase) return null;

 const {
 data: { user },
 } = await supabase.auth.getUser();
 if (!user) return null;

 try {
 switch (storeName) {
 case "profile": {
  const { data } = await supabase
  	.from("profiles")
  	.select("*")
  	.eq("id", user.id)
  	.single();
  if (data) return data;
  // No profile row yet (e.g. trigger hasn't fired or
  // email confirmation pending): fall back to auth
  // user info so the store doesn't keep placeholder data.
  return {
  	full_name: (user.user_metadata?.full_name as string) ?? "",
  	email: user.email ?? "",
  	avatar_url: "",
  };
 }

 case "resume": {
 const { data } = await supabase
 .from("resumes")
 .select("*")
 .eq("user_id", user.id)
 .order("updated_at", { ascending: false });
 return data ?? null;
 }

 case "pipeline": {
 const { data: jobs } = await supabase
 .from("jobs")
 .select("*, companies(*)")
 .eq("user_id", user.id)
 .order("kanban_order");
 return jobs ?? null;
 }

 case "discovery": {
 const [companiesRes, jobsRes] = await Promise.all([
 supabase
 .from("companies")
 .select("*")
 .eq("user_id", user.id)
 .order("created_at", { ascending: false }),
 supabase
 .from("jobs")
 .select("*, companies(*)")
 .eq("user_id", user.id)
 .order("created_at", { ascending: false }),
 ]);
 return {
 companies: companiesRes.data ?? [],
 jobs: jobsRes.data ?? [],
 };
 }

 case "interview": {
 const [storiesRes, prepsRes, mocksRes] = await Promise.all([
 supabase.from("stories").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
 supabase.from("interview_preps").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
 supabase.from("mock_sessions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
 ]);
 return {
 stories: storiesRes.data ?? [],
 preps: prepsRes.data ?? [],
 mockSessions: mocksRes.data ?? [],
 };
 }
 }
 } catch (err) {
 logger.error(
 `[supabase-sync] loadFromSupabase(${storeName}) failed:`,
 err
 );
 }

 return null;
}

// ── Sync: push store data back to Supabase (upsert) ──

export async function syncStoreToSupabase(
 storeName: StoreName,
 data: unknown
): Promise<void> {
 if (!isSupabaseConfigured()) return;
 const supabase = createClient();
 if (!supabase) return;

 const {
 data: { user },
 } = await supabase.auth.getUser();
 if (!user) return;

 try {
 switch (storeName) {
 case "profile": {
 const profile = data as Record<string, unknown>;
 // Map store profile fields to DB columns
 const row: Record<string, unknown> = {
 id: user.id,
 full_name: profile.fullName,
 email: profile.email,
 avatar_url: profile.avatarUrl,
 tier: profile.tier ?? "free",
 ai_uses_this_week: profile.aiUsesThisWeek ?? 0,
 week_reset_at: profile.weekResetAt ?? new Date().toISOString(),
 onboarding_completed: profile.onboardingCompleted ?? false,
 preferences: (() => {
 const prefs: Record<string, unknown> = {};
 const packedFields = [
 "phone", "location", "linkedin", "website", "avatarUrl",
 "headline", "yearsOfExperience", "targetRoleSummary",
 "currentCompany", "currentTitle", "keySkills",
 "careerGoals", "preferredIndustries", "preferredLocations",
 "salaryExpectation", "workAuthorization",
 "workExperience", "education", "disclosures",
 ];
 for (const field of packedFields) {
 if (profile[field] !== undefined) prefs[field] = profile[field];
 }
 return prefs;
 })(),
 };
 await supabase.from("profiles").upsert(row, { onConflict: "id" });
 break;
 }

 case "resume": {
 const resumes = data as Record<string, unknown>[];
 
 // ── Active Deletion Sync ──
 const { data: dbResumes } = await supabase
 .from("resumes")
 .select("id")
 .eq("user_id", user.id);
 if (dbResumes) {
 const dbIds = dbResumes.map((r) => r.id);
 const storeIds = resumes.map((r) => r.id);
 const toDelete = dbIds.filter((id) => !storeIds.includes(id));
 if (toDelete.length > 0) {
 await supabase.from("resumes").delete().in("id", toDelete);
 }
 }

 for (const resume of resumes) {
 const row: Record<string, unknown> = {
 id: resume.id,
 user_id: user.id,
 title: resume.title,
 data: resume.data ?? {},
 template: resume.template ?? "classic",
 theme: resume.theme ?? {},
 is_base: resume.is_base ?? false,
 section_order: resume.section_order ?? [],
 section_visibility: resume.section_visibility ?? {},
 };
 await supabase
 .from("resumes")
 .upsert(row, { onConflict: "id" });
 }
 break;
 }

 case "pipeline": {
 const payload = data as { jobs?: Record<string, unknown>[] };
 const jobs = payload.jobs ?? [];
 
 // ── Active Deletion Sync ──
 const { data: dbJobs } = await supabase
 .from("jobs")
 .select("id")
 .eq("user_id", user.id);
 if (dbJobs) {
 const dbIds = dbJobs.map((j) => j.id);
 const storeIds = jobs.map((j) => j.id);
 const toDelete = dbIds.filter((id) => !storeIds.includes(id));
 if (toDelete.length > 0) {
 await supabase.from("jobs").delete().in("id", toDelete);
 }
 }

 for (const job of jobs) {
 const row: Record<string, unknown> = {
 id: job.id,
 user_id: user.id,
 company_id: job.company_id ?? null,
 title: job.title,
 description: job.description ?? null,
 location: job.location ?? null,
 url: job.url ?? null,
 status: job.status ?? "new",
 score: job.score ?? null,
 tier: job.tier ?? null,
 archetype: job.archetype ?? null,
 evaluation: job.evaluation ?? {},
 resume_id: job.resume_id ?? null,
 applied_at: job.applied_at ?? null,
 interviewed_at: job.interviewed_at ?? null,
 offered_at: job.offered_at ?? null,
 salary_range: job.salary_range ?? null,
 comp_details: job.comp_details ?? {},
 kanban_order: job.kanban_order ?? 0,
 notes: job.notes ?? null,
 history: job.history ?? [],
 };
 await supabase.from("jobs").upsert(row, { onConflict: "id" });
 }
 break;
 }

 case "discovery": {
 const payload = data as {
 companies?: Record<string, unknown>[];
 };
 const companies = payload.companies ?? [];
 
 // ── Active Deletion Sync ──
 const { data: dbCompanies } = await supabase
 .from("companies")
 .select("id")
 .eq("user_id", user.id);
 if (dbCompanies) {
 const dbIds = dbCompanies.map((c) => c.id);
 const storeIds = companies.map((c) => c.id);
 const toDelete = dbIds.filter((id) => !storeIds.includes(id));
 if (toDelete.length > 0) {
 await supabase.from("companies").delete().in("id", toDelete);
 }
 }

 for (const company of companies) {
 const row: Record<string, unknown> = {
 id: company.id,
 user_id: user.id,
 name: company.name,
 industry: company.industry ?? null,
 career_url: company.career_url ?? null,
 headquarters: company.headquarters ?? company.hq ?? null,
 notes: company.notes ?? null,
 tier: company.tier ?? null,
 research_brief: company.research_brief ?? null,
 logo_url: company.logo_url ?? null,
 };
 await supabase
 .from("companies")
 .upsert(row, { onConflict: "id" });
 }
 break;
 break;
 }

 case "interview": {
 const payload = data as {
 stories?: Record<string, unknown>[];
 preps?: Record<string, unknown>[];
 mockSessions?: Record<string, unknown>[];
 };
 const stories = payload.stories ?? [];
 const preps = payload.preps ?? [];
 const mockSessions = payload.mockSessions ?? [];

 // Stories: active deletion + upsert
 const { data: dbStories } = await supabase.from("stories").select("id").eq("user_id", user.id);
 if (dbStories) {
 const toDelete = dbStories.map((s) => s.id).filter((id) => !stories.some((s) => s.id === id));
 if (toDelete.length > 0) await supabase.from("stories").delete().in("id", toDelete);
 }
 for (const story of stories) {
 await supabase.from("stories").upsert({
 id: story.id, user_id: user.id, title: story.title, competency: story.competency,
 situation: story.situation ?? null, task: story.task ?? null,
 action: story.action ?? null, result: story.result ?? null,
 metrics: story.metrics ?? null, tags: story.tags ?? [], used_count: story.used_count ?? 0,
 }, { onConflict: "id" });
 }

 // Interview preps: active deletion + upsert
 const { data: dbPreps } = await supabase.from("interview_preps").select("id").eq("user_id", user.id);
 if (dbPreps) {
 const toDelete = dbPreps.map((p) => p.id).filter((id) => !preps.some((p) => p.id === id));
 if (toDelete.length > 0) await supabase.from("interview_preps").delete().in("id", toDelete);
 }
 for (const prep of preps) {
 await supabase.from("interview_preps").upsert({
 id: prep.id, user_id: user.id, job_id: prep.job_id,
 company_research: prep.company_research ?? null, role_analysis: prep.role_analysis ?? null,
 questions: prep.questions ?? [],
 }, { onConflict: "id" });
 }

 // Mock sessions: active deletion + upsert
 const { data: dbMocks } = await supabase.from("mock_sessions").select("id").eq("user_id", user.id);
 if (dbMocks) {
 const toDelete = dbMocks.map((m) => m.id).filter((id) => !mockSessions.some((m) => m.id === id));
 if (toDelete.length > 0) await supabase.from("mock_sessions").delete().in("id", toDelete);
 }
 for (const session of mockSessions) {
 await supabase.from("mock_sessions").upsert({
 id: session.id, user_id: user.id, job_id: session.job_id ?? null,
 transcript: session.transcript ?? [], score: session.score ?? null,
 feedback: session.feedback ?? {}, duration_seconds: session.duration_seconds ?? null,
 }, { onConflict: "id" });
 }
 break;
 }
 }
 } catch (err) {
 logger.error(
 `[supabase-sync] syncStoreToSupabase(${storeName}) failed:`,
 err
 );
 }
}
