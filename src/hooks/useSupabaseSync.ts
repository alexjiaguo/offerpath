/* ═══════════════════════════════════════════════════
   OfferPath — useSupabaseSync Hook
   Hydrates Zustand stores from Supabase on mount,
   then debounces and syncs store changes back to Supabase.
   No-op when Supabase is not configured or user is not logged in.
   ═══════════════════════════════════════════════════ */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  loadFromSupabase,
  syncStoreToSupabase,
  type StoreName,
} from "@/lib/supabase-sync";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useProfileStore } from "@/store/profileStore";
import { useDiscoveryStore } from "@/store/discoveryStore";

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
          const companiesMap = new Map<string, Record<string, unknown>>();
          const mappedJobs = jobs.map((j) => {
            if (j.companies && typeof j.companies === "object") {
              const c = j.companies as Record<string, unknown>;
              if (c.id) companiesMap.set(c.id as string, c);
            }
            return { ...j, company: j.companies ?? j.company };
          });
          usePipelineStore.setState({
            jobs: mappedJobs as never,
            companies: Array.from(companiesMap.values()) as never,
          });
        },
      };

    case "resume":
      return {
        subscribe: (listener: () => void) =>
          useResumeStore.subscribe(listener),
        getSnapshot: () => useResumeStore.getState().resumes,
        hydrate: (data: unknown) => {
          if (!Array.isArray(data)) return;
          useResumeStore.setState({ resumes: data as never });
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
          // Map DB column names back to store field names
          useProfileStore.setState({
            profile: {
              ...useProfileStore.getState().profile,
              fullName: (row.full_name as string) ?? useProfileStore.getState().profile.fullName,
              email: (row.email as string) ?? useProfileStore.getState().profile.email,
              avatarUrl: (row.avatar_url as string) ?? useProfileStore.getState().profile.avatarUrl,
            },
          } as never);
        },
      };

    case "discovery":
      return {
        subscribe: (listener: () => void) =>
          useDiscoveryStore.subscribe(listener),
        getSnapshot: () => {
          const { companies, jobs } = useDiscoveryStore.getState();
          return { companies, jobs };
        },
        hydrate: (data: unknown) => {
          if (!data || typeof data !== "object") return;
          const d = data as { companies?: unknown[]; jobs?: unknown[] };
          if (Array.isArray(d.companies)) {
            useDiscoveryStore.setState({
              companies: d.companies as never,
            });
          }
          if (Array.isArray(d.jobs)) {
            useDiscoveryStore.setState({
              jobs: d.jobs as never,
            });
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
            adapter.hydrate(data);
          }
        } catch (err) {
          console.error(`[useSupabaseSync] hydrate ${name} failed:`, err);
        }
      }

      if (!cancelled) {
        hydratedRef.current = true;
        setState({ isSynced: true, isSyncing: false });

        // Subscribe to store changes for debounced sync-back ONLY after hydration completes
        unsubscribers.push(
          ...storeNames.map((name) => {
            const adapter = getStoreAdapter(name);
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
