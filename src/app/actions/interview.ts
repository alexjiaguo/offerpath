"use server";
import { logger } from "@/lib/logger";
import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import type { Story, InterviewPrep, MockSession } from "@/types";

const isUUID = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

// ── Story Actions ───────────────────────────────────

export async function saveStoryAction(storyData: Partial<Story> & { id: string }) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!isUUID(storyData.id)) {
    return { success: false, error: "Invalid story ID format" };
  }

  const row = {
    id: storyData.id,
    user_id: user.id,
    title: storyData.title ?? "Untitled Story",
    competency: storyData.competency ?? "general",
    situation: storyData.situation ?? null,
    task: storyData.task ?? null,
    action: storyData.action ?? null,
    result: storyData.result ?? null,
    metrics: storyData.metrics ?? null,
    tags: Array.isArray(storyData.tags) ? storyData.tags : [],
    used_count: storyData.used_count ?? 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("stories")
    .upsert(row, { onConflict: "id" });

  if (error) {
    logger.error("Failed to save story via Server Action:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/interview");
  revalidatePath("/dashboard/interview/stories");
  return { success: true };
}

export async function deleteStoryAction(storyId: string) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!isUUID(storyId)) return { success: true };

  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Failed to delete story via Server Action:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/interview");
  revalidatePath("/dashboard/interview/stories");
  return { success: true };
}

// ── Interview Prep Actions ──────────────────────────

export async function savePrepAction(prepData: Partial<InterviewPrep> & { id: string; job_id: string }) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!isUUID(prepData.id) || !isUUID(prepData.job_id)) {
    return { success: false, error: "Invalid prep or job ID format" };
  }

  const row = {
    id: prepData.id,
    user_id: user.id,
    job_id: prepData.job_id,
    company_research: prepData.company_research ?? null,
    role_analysis: prepData.role_analysis ?? null,
    questions: Array.isArray(prepData.questions) ? prepData.questions : [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("interview_preps")
    .upsert(row, { onConflict: "id" });

  if (error) {
    logger.error("Failed to save interview prep via Server Action:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/interview");
  revalidatePath(`/dashboard/interview/${prepData.job_id}`);
  return { success: true };
}

export async function deletePrepAction(jobId: string) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!isUUID(jobId)) return { success: true };

  const { error } = await supabase
    .from("interview_preps")
    .delete()
    .eq("job_id", jobId)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Failed to delete interview prep via Server Action:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/interview");
  return { success: true };
}

// ── Mock Interview Session Actions ──────────────────

export async function saveMockSessionAction(sessionData: Partial<MockSession> & { id: string }) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!isUUID(sessionData.id)) {
    return { success: false, error: "Invalid session ID format" };
  }

  const validJobId = isUUID(sessionData.job_id) ? sessionData.job_id : null;

  const row = {
    id: sessionData.id,
    user_id: user.id,
    job_id: validJobId,
    transcript: sessionData.transcript ?? [],
    score: sessionData.score ?? null,
    feedback: sessionData.feedback ?? {},
    duration_seconds: sessionData.duration_seconds ?? null,
    question_pool: sessionData.questionPool ?? (sessionData as Record<string, unknown>).question_pool ?? [],
  };

  const { error } = await supabase
    .from("mock_sessions")
    .upsert(row, { onConflict: "id" });

  if (error) {
    logger.error("Failed to save mock interview session via Server Action:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/interview");
  if (validJobId) {
    revalidatePath(`/dashboard/interview/${validJobId}/mock`);
  }
  return { success: true };
}

export async function deleteMockSessionAction(sessionId: string) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (!isUUID(sessionId)) return { success: true };

  const { error } = await supabase
    .from("mock_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Failed to delete mock session via Server Action:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/interview");
  return { success: true };
}
