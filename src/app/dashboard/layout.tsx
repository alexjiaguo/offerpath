"use client";

import { Suspense, useEffect } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useProfileStore } from "@/store/profileStore";
import { ClientOnly } from "@/components/ui/ClientOnly";

const AddJobDialog = dynamic(() => import("@/components/pipeline/AddJobDialog"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hydrates stores from Supabase on mount, then syncs changes back.
  useSupabaseSync();

  // Rehydrate Zustand stores from localStorage on the client only.
  // Stores use skipHydration: true to avoid SSR/CSR mismatches.
  useEffect(() => {
    usePipelineStore.persist.rehydrate();
    useResumeStore.persist.rehydrate();
    useDiscoveryStore.persist.rehydrate();
    useInterviewStore.persist.rehydrate();
    useProfileStore.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-surface-50 selection:bg-black/10">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:ml-[260px] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] h-[100dvh] flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        <Topbar />
        <main className="flex-1 doppel-shell min-h-0 relative z-10 w-full flex flex-col">
          <div className="doppel-core flex-1 overflow-y-auto relative w-full !p-6 md:!p-8 bg-surface-50/50">
            <ClientOnly fallback={
              <div className="flex items-center justify-center h-full">
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-surface-300 animate-pulse">Loading workspace…</span>
              </div>
            }>
              {children}
            </ClientOnly>
          </div>
        </main>
      </div>
      <Suspense fallback={null}><AddJobDialog /></Suspense>
    </div>
  );
}
