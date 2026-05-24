/* ═══════════════════════════════════════════════════
   OfferPath — Supabase Sync Layer
   Bridges Zustand stores to Supabase (additive to localStorage)
   Only activates when Supabase is configured and user is authenticated
   ═══════════════════════════════════════════════════ */

import { createClient, isSupabaseConfigured } from "./supabase";

export type StoreName = "pipeline" | "resume" | "profile" | "discovery";

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
        return data ?? null;
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
    }
  } catch (err) {
    console.error(
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
          preferences: profile.preferences ?? {},
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
      }
    }
  } catch (err) {
    console.error(
      `[supabase-sync] syncStoreToSupabase(${storeName}) failed:`,
      err
    );
  }
}
