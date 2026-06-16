"use server";

import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import type { Job } from "@/types";

export async function createJobAction(jobData: Partial<Job>) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const newJob = {
    ...jobData,
    user_id: user.id,
    created_at: new Date().toISOString(),
    history: [{
      action: "Created job",
      date: new Date().toISOString(),
      details: `Added ${jobData.title ?? "(no title)"} at ${typeof jobData.company === "string" ? jobData.company : jobData.company?.name ?? "Company"}`
    }]
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(newJob)
    .select()
    .single();

  if (error) {
    console.error("Failed to create job:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/pipeline");
  return { success: true, data };
}

export async function updateJobStatusAction(jobId: string, newStatus: string) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  // Fetch current to append history
  const { data: currentJob } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (!currentJob) return { success: false, error: "Job not found" };

  const newHistoryEntry = {
    action: "Status Update",
    date: new Date().toISOString(),
    details: `Moved to ${newStatus}`
  };

  const history = [...(currentJob.history || []), newHistoryEntry];

  const { error } = await supabase
    .from("jobs")
    .update({ 
      status: newStatus, 
      updated_at: new Date().toISOString(),
      history 
    })
    .eq("id", jobId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/pipeline");
  return { success: true };
}

export async function addJobNoteAction(jobId: string, note: string) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: currentJob } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (!currentJob) return { success: false, error: "Job not found" };

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
    .eq("id", jobId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/pipeline");
  return { success: true };
}
