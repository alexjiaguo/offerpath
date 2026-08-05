"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import GuestBanner from "@/components/dashboard/GuestBanner";

const AddJobDialog = dynamic(() => import("@/components/pipeline/AddJobDialog"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hydrates stores from Supabase on mount, then syncs changes back.
  useSupabaseSync();

  return (
    <div className="min-h-[100dvh] bg-surface-50 selection:bg-black/10">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:ml-[260px] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] h-[100dvh] flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden">
        <Topbar />
        <GuestBanner />
        <main className="flex-1 min-h-0 relative z-10 w-full flex flex-col bg-surface-0 border border-surface-200 rounded-lg overflow-hidden shadow-none">
          <div className="flex-1 overflow-y-auto relative w-full p-4 md:p-6 bg-surface-0">
            {children}
          </div>
        </main>
      </div>
      <Suspense fallback={null}><AddJobDialog /></Suspense>
    </div>
  );
}
