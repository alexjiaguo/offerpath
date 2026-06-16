"use server";

import { createServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import type { Resume } from "@/types";

export async function saveResumeAction(resumeId: string, resumeData: Partial<Resume>) {
  const supabase = await createServerClient();
  if (!supabase) {
    console.warn("Supabase is not configured. Save skipped.");
    return { success: false, error: "Supabase not configured" };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const row = {
    id: resumeId,
    user_id: user.id,
    title: resumeData.title,
    data: resumeData.data ?? {},
    template: resumeData.template ?? "classic",
    theme: resumeData.theme ?? {},
    is_base: resumeData.is_base ?? false,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("resumes")
    .upsert(row, { onConflict: "id" });

  if (error) {
    console.error("Failed to save resume via Server Action:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/resume");
  revalidatePath(`/dashboard/resume/${resumeId}`);
  
  return { success: true };
}

export async function deleteResumeAction(resumeId: string) {
  const supabase = await createServerClient();
  if (!supabase) return { success: false, error: "Supabase not configured" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete resume:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/resume");
  return { success: true };
}
