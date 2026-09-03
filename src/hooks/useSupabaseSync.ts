/* ═══════════════════════════════════════════════════
   OfferPath — useSupabaseSync Hook
   Hydrates Zustand stores from Supabase on mount,
   then debounces and syncs store changes back to Supabase.
   No-op when Supabase is not configured or user is not logged in.
   ═══════════════════════════════════════════════════ */

"use client";

import { logger } from "@/lib/logger";
import { useEffect, useRef, useCallback, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  loadFromSupabase,
  syncStoreToSupabase,
  type StoreName,
} from "@/lib/supabase-sync";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore, type ATSEvaluation } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";
import type { Job, Company, Resume } from "@/types";
import type { UserProfile } from "@/store/profileStore";
import type { DiscoveredCompany } from "@/store/discoveryStore";
import type { Story, InterviewPrep, MockSession } from "@/types";
import { migrateGuestDataToSupabase } from "@/lib/supabase-migration";

const DEBOUNCE_MS = 500;

interface SyncState {
  isSynced: boolean;
  isSyncing: boolean;
}

/**
 * Maps each store name to a subscriber that reads the persisted slice
 * and a hydrator that writes Supabase data back into the store.
 */
function getStoreAdapter(storeName: StoreName) {
  switch (storeName) {
    case "pipeline":
      return {
        subscribe: (listener: () => void) =>
          usePipelineStore.subscribe(listener),
        getSnapshot: () => {
          const { jobs, companies } = usePipelineStore.getState();
          return { jobs, companies };
        },
        hydrate: (data: unknown) => {
          if (!Array.isArray(data)) return;
          // data is an array of jobs with nested companies from the join
          const jobs = data as Record<string, unknown>[];
          // Never clobber local state with an empty server payload: persist
          // writes through to localStorage, so overwriting with [] would
          // destroy guest work before migrateGuestDataToSupabase() can push
          // it up. An empty server simply means "nothing to pull".
          if (jobs.length === 0) return;
          const companiesMap = new Map<string, Record<string, unknown>>();
          const mappedJobs = jobs.map((j) => {
            if (j.companies && typeof j.companies === "object") {
              const c = j.companies as Record<string, unknown>;
              if (c.id) companiesMap.set(c.id as string, c);
            }
            return { ...j, company: j.companies ?? j.company };
          });
          const existingCompanies = usePipelineStore.getState().companies || [];
          for (const c of existingCompanies) {
            if (c.id && !companiesMap.has(c.id)) {
              companiesMap.set(c.id, c as unknown as Record<string, unknown>);
            }
          }
          usePipelineStore.setState({
            jobs: mappedJobs as unknown as Job[],
            companies: Array.from(companiesMap.values()) as unknown as Company[],
          });
        },
      };

    case "resume":
      return {
        subscribe: (listener: () => void) =>
          useResumeStore.subscribe(listener),
        getSnapshot: () => {
          const { resumes, atsEvaluations } = useResumeStore.getState();
          return { resumes, atsEvaluations };
        },
        hydrate: (data: unknown) => {
          if (!Array.isArray(data)) return;
          const resumes = data as (Resume & { ats_evaluations?: Record<string, ATSEvaluation> })[];
          // Same empty-payload guard as pipeline: don't wipe local resumes
          // when the server has nothing (see comment above).
          if (resumes.length === 0) return;
          const atsEvals: Record<string, ATSEvaluation> = {};
          for (const r of resumes) {
            if (r.ats_evaluations && typeof r.ats_evaluations === "object") {
              Object.assign(atsEvals, r.ats_evaluations);
            }
          }
          useResumeStore.setState({
            resumes: resumes as unknown as Resume[],
            ...(Object.keys(atsEvals).length > 0
              ? { atsEvaluations: { ...useResumeStore.getState().atsEvaluations, ...atsEvals } }
              : {}),
          });
        },
      };

    case "profile":
      return {
        subscribe: (listener: () => void) =>
          useProfileStore.subscribe(listener),
        getSnapshot: () => useProfileStore.getState().profile,
        hydrate: (data: unknown) => {
          if (!data || typeof data !== "object") return;
          const row = data as Record<string, unknown>;
          const prefs = (row.preferences as Record<string, unknown>) ?? {};
          const current = useProfileStore.getState().profile;
          useProfileStore.setState({
            profile: {
              ...current,
              fullName: (row.full_name as string) ?? current.fullName,
              email: (row.email as string) ?? current.email,
              avatarUrl: (row.avatar_url as string) ?? current.avatarUrl,
              phone: (prefs.phone as string) ?? current.phone,
              location: (prefs.location as string) ?? current.location,
              linkedin: (prefs.linkedin as string) ?? current.linkedin,
              website: (prefs.website as string) ?? current.website,
              headline: (prefs.headline as string) ?? current.headline,
              yearsOfExperience: (prefs.yearsOfExperience as string) ?? current.yearsOfExperience,
              targetRoleSummary: (prefs.targetRoleSummary as string) ?? current.targetRoleSummary,
              currentCompany: (prefs.currentCompany as string) ?? current.currentCompany,
              currentTitle: (prefs.currentTitle as string) ?? current.currentTitle,
              keySkills: Array.isArray(prefs.keySkills) ? (prefs.keySkills as string[]) : current.keySkills,
              careerGoals: (prefs.careerGoals as string) ?? current.careerGoals,
              preferredIndustries: Array.isArray(prefs.preferredIndustries) ? (prefs.preferredIndustries as string[]) : current.preferredIndustries,
              preferredLocations: Array.isArray(prefs.preferredLocations) ? (prefs.preferredLocations as string[]) : current.preferredLocations,
              salaryExpectation: (prefs.salaryExpectation as string) ?? current.salaryExpectation,
              workAuthorization: (prefs.workAuthorization as string) ?? current.workAuthorization,
              workExperience: Array.isArray(prefs.workExperience) ? (prefs.workExperience as UserProfile["workExperience"]) : current.workExperience,
              education: Array.isArray(prefs.education) ? (prefs.education as UserProfile["education"]) : current.education,
              disclosures: prefs.disclosures && typeof prefs.disclosures === "object"
                ? { ...current.disclosures, ...(prefs.disclosures as UserProfile["disclosures"]) }
                : current.disclosures,
            },
          });
        },
      };

    case "discovery":
      return {
        subscribe: (listener: () => void) =>
          useDiscoveryStore.subscribe(listener),
        getSnapshot: () => {
          const { companies } = useDiscoveryStore.getState();
          return { companies };
        },
        hydrate: (data: unknown) => {
          if (!data || typeof data !== "object") return;
          const d = data as { companies?: unknown[] };
          if (Array.isArray(d.companies) && d.companies.length > 0) {
            useDiscoveryStore.setState({
              companies: d.companies as unknown as DiscoveredCompany[],
            });
          }
        },
      };

    case "interview":
      return {
        subscribe: (listener: () => void) =>
          useInterviewStore.subscribe(listener),
        getSnapshot: () => {
          const { stories, preps, mockSessions } = useInterviewStore.getState();
          return { stories, preps, mockSessions };
        },
        hydrate: (data: unknown) => {
          if (!data || typeof data !== "object") return;
          const d = data as {
            stories?: unknown[];
            preps?: unknown[];
            mockSessions?: unknown[];
          };
          const patch: Partial<{
            stories: Story[];
            preps: InterviewPrep[];
            mockSessions: MockSession[];
          }> = {};
          // Only patch non-empty arrays: an empty server table must not
          // wipe local guest stories/preps/sessions before migration.
          if (Array.isArray(d.stories) && d.stories.length > 0) patch.stories = d.stories as Story[];
          if (Array.isArray(d.preps) && d.preps.length > 0) patch.preps = d.preps as InterviewPrep[];
          if (Array.isArray(d.mockSessions) && d.mockSessions.length > 0) {
            patch.mockSessions = (d.mockSessions as Record<string, unknown>[]).map((m) => ({
              ...m,
              questionPool: Array.isArray(m.question_pool)
                ? (m.question_pool as string[])
                : (m.questionPool as string[] ?? []),
            })) as MockSession[];
          }
          if (Object.keys(patch).length > 0) {
            useInterviewStore.setState(patch);
          }
        },
      };
  }
}

export function useSupabaseSync(): SyncState {
  const [state, setState] = useState<SyncState>({
    isSynced: false,
    isSyncing: false,
  });

  // Track whether initial hydration has been done to avoid
  // re-syncing the data we just loaded back to Supabase.
  const hydratedRef = useRef(false);
  const debounceTimers = useRef<Map<StoreName, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const scheduleSync = useCallback(
    (storeName: StoreName, data: unknown) => {
      // Don't sync back until initial hydration is complete
      if (!hydratedRef.current) return;

      const existing = debounceTimers.current.get(storeName);
      if (existing) clearTimeout(existing);

      debounceTimers.current.set(
        storeName,
        setTimeout(async () => {
          debounceTimers.current.delete(storeName);
          setState((s) => ({ ...s, isSyncing: true }));
          try {
            await syncStoreToSupabase(storeName, data);
          } finally {
            setState((s) => ({ ...s, isSyncing: false }));
          }
        }, DEBOUNCE_MS)
      );
    },
    []
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    const storeNames: StoreName[] = [
      "pipeline",
      "resume",
      "profile",
      "discovery",
      "interview",
    ];
    const unsubscribers: (() => void)[] = [];

    async function hydrateAll() {
      setState((s) => ({ ...s, isSyncing: true }));

      for (const name of storeNames) {
        if (cancelled) break;
        try {
          const data = await loadFromSupabase(name);
          if (cancelled) break;
          if (data) {
            const adapter = getStoreAdapter(name);
            if (!adapter) continue;
            adapter.hydrate(data);
          }
        } catch (err) {
          logger.error(`[useSupabaseSync] hydrate ${name} failed:`, err);
        }
      }

      if (!cancelled) {
        hydratedRef.current = true;
        setState({ isSynced: true, isSyncing: false });

        // One-time migration: if the user came in as a guest, push their
        // localStorage data into Supabase now that they have an account.
        migrateGuestDataToSupabase().catch((err) => {
          logger.error("[useSupabaseSync] migration failed:", err);
        });

        // Subscribe to store changes for debounced sync-back ONLY after hydration completes
        unsubscribers.push(
          ...storeNames.map((name) => {
            const adapter = getStoreAdapter(name);
            if (!adapter) return () => {};
            return adapter.subscribe(() => {
              const snapshot = adapter.getSnapshot();
              scheduleSync(name, snapshot);
            });
          })
        );
      }
    }

    hydrateAll();

    const timers = debounceTimers;

    return () => {
      cancelled = true;
      unsubscribers.forEach((unsub) => unsub());
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    };
  }, [scheduleSync]);

  return state;
}
