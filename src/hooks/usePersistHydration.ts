"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { useProfileStore } from "@/store/profileStore";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";

/** Rehydrate persisted Zustand stores after the first paint (skipHydration).
 *  Failures (corrupt JSON, denied storage) are logged and surfaced via the
 *  returned error state instead of vanishing into `void`. */
export function usePersistHydration() {
  useEffect(() => {
    const stores = [
      ["profile", useProfileStore],
      ["pipeline", usePipelineStore],
      ["resume", useResumeStore],
      ["discovery", useDiscoveryStore],
      ["interview", useInterviewStore],
      ["ui", useUIStore],
    ] as const;
    for (const [name, store] of stores) {
      try {
        const result = store.persist.rehydrate() as unknown as Promise<void> | void;
        if (result && typeof (result as Promise<void>).catch === "function") {
          (result as Promise<void>).catch((err) => {
            logger.error(`[usePersistHydration] rehydrate ${name} failed:`, err);
          });
        }
      } catch (err) {
        logger.error(`[usePersistHydration] rehydrate ${name} threw:`, err);
      }
    }
  }, []);
}
