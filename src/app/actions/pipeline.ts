"use server";
import { logger } from "@/lib/logger";

import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import type { Job } from "@/types";

export async function createJobAction(jobData: Partial<Job>) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const isUUID = (val?: string | null): boolean =>
    Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

  // Resolve company_id if company object is provided
  let companyId = isUUID(jobData.company_id) ? jobData.company_id : null;
  if (!companyId && jobData.company) {
    const companyObj = typeof jobData.company === "object" ? jobData.company : null;
    const companyName = companyObj?.name?.trim();
    if (companyName) {
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .ilike("name", companyName)
        .maybeSingle();

      if (existingCompany?.id) {
        companyId = existingCompany.id;
      } else {
        const companyRow: Record<string, unknown> = {
          user_id: user.id,
          name: companyName,
          career_url: companyObj?.career_url ?? null,
          headquarters: companyObj?.headquarters ?? null,
          industry: companyObj?.industry ?? null,
          tier: companyObj?.tier ?? null,
        };
        if (companyObj && isUUID(companyObj.id)) {
          companyRow.id = companyObj.id;
        }
        const { data: createdCompany } = await supabase
          .from("companies")
          .insert(companyRow)
          .select("id")
          .single();
        if (createdCompany?.id) {
          companyId = createdCompany.id;
        }
      }
    }
  }

  const jobRow: Record<string, unknown> = {
    user_id: user.id,
    company_id: companyId,
    title: jobData.title ?? "(no title)",
    description: jobData.description ?? null,
    location: jobData.location ?? null,
    url: jobData.url ?? null,
    status: jobData.status ?? "new",
    score: jobData.score ?? null,
    tier: jobData.tier ?? null,
    archetype: jobData.archetype ?? null,
    evaluation: jobData.evaluation ?? {},
    resume_id: isUUID(jobData.resume_id) ? jobData.resume_id : null,
    applied_at: jobData.applied_at ?? null,
    interviewed_at: jobData.interviewed_at ?? null,
    offered_at: jobData.offered_at ?? null,
    salary_range: jobData.salary_range ?? null,
    comp_details: jobData.comp_details ?? {},
    kanban_order: jobData.kanban_order ?? 0,
    notes: jobData.notes ?? null,
    history: jobData.history?.length
      ? jobData.history
      : [{
          action: "Created job",
          date: new Date().toISOString(),
          details: `Added ${jobData.title ?? "(no title)"} at ${typeof jobData.company === "string" ? jobData.company : jobData.company?.name ?? "Company"}`
        }],
    created_at: jobData.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isUUID(jobData.id)) {
    jobRow.id = jobData.id;
  }

  const { data, error } = await supabase
    .from("jobs")
    .upsert(jobRow, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    logger.error("Failed to create job:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/pipeline");
  return { success: true, data };
}

export async function updateJobStatusAction(
  jobId: string,
  newStatus: string,
  milestones?: { applied_at?: string; interviewed_at?: string; offered_at?: string }
) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Fetch current job scoped to user to append history
  const { data: currentJob } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single();

  if (!currentJob) return { success: false, error: "Job not found or access denied" };

  const newHistoryEntry = {
    action: "Status Update",
    date: new Date().toISOString(),
    details: `Moved to ${newStatus}`
  };

  const history = [...(currentJob.history || []), newHistoryEntry];
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    updated_at: new Date().toISOString(),
    history,
  };

  if (milestones?.applied_at) updatePayload.applied_at = milestones.applied_at;
  else if (newStatus === "applied" && !currentJob.applied_at) updatePayload.applied_at = new Date().toISOString();

  if (milestones?.interviewed_at) updatePayload.interviewed_at = milestones.interviewed_at;
  else if (newStatus === "interviewing" && !currentJob.interviewed_at) updatePayload.interviewed_at = new Date().toISOString();

  if (milestones?.offered_at) updatePayload.offered_at = milestones.offered_at;
  else if (newStatus === "offered" && !currentJob.offered_at) updatePayload.offered_at = new Date().toISOString();

  const { error } = await supabase
    .from("jobs")
    .update(updatePayload)
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/pipeline");
  return { success: true };
}

/**
 * Generic field update (compensation editor, evaluation results, notes…).
 * Only whitelisted columns are written; id/user_id/history are protected.
 */
const UPDATABLE_JOB_FIELDS = new Set([
  "title",
  "description",
  "location",
  "url",
  "score",
  "tier",
  "archetype",
  "evaluation",
  "resume_id",
  "salary_range",
  "comp_details",
  "notes",
  "kanban_order",
  "applied_at",
  "interviewed_at",
  "offered_at",
]);

export async function updateJobAction(jobId: string, updates: Partial<Job>) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [key, value] of Object.entries(updates)) {
    if (UPDATABLE_JOB_FIELDS.has(key)) payload[key] = value ?? null;
  }
  if (Object.keys(payload).length <= 1) {
    return { success: false, error: "No updatable fields provided" };
  }

  const { error } = await supabase
    .from("jobs")
    .update(payload)
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) {
    logger.error("Failed to update job:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/pipeline");
  revalidatePath(`/dashboard/pipeline/${jobId}`);
  return { success: true };
}

export async function addJobNoteAction(jobId: string, note: string) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: currentJob } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .single();

  if (!currentJob) return { success: false, error: "Job not found or access denied" };

  const newHistoryEntry = {
    action: "Added Note",
    date: new Date().toISOString(),
    details: note
  };

  const history = [...(currentJob.history || []), newHistoryEntry];
  const notes = currentJob.notes ? `${currentJob.notes}\n\n${note}` : note;

  const { error } = await supabase
    .from("jobs")
    .update({
      notes,
      updated_at: new Date().toISOString(),
      history
    })
    .eq("id", jobId)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/pipeline");
  return { success: true };
}
