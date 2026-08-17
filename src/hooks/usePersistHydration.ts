"use client";

import { useEffect } from "react";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { useProfileStore } from "@/store/profileStore";
import { useResumeStore } from "@/store/resumeStore";
import { useUIStore } from "@/store/uiStore";

/** Rehydrate persisted Zustand stores after the first paint (skipHydration). */
export function usePersistHydration() {
  useEffect(() => {
    void useProfileStore.persist.rehydrate();
    void usePipelineStore.persist.rehydrate();
    void useResumeStore.persist.rehydrate();
    void useDiscoveryStore.persist.rehydrate();
    void useInterviewStore.persist.rehydrate();
    void useUIStore.persist.rehydrate();
  }, []);
}
