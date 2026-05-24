"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";

const AddJobDialog = dynamic(() => import("@/components/pipeline/AddJobDialog"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hydrates stores from Supabase on mount, then syncs changes back.
  // No-op when Supabase is not configured or user is not authenticated.
  useSupabaseSync();

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Sidebar — hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:ml-[260px] transition-all duration-300">
        <Topbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
      <Suspense fallback={null}><AddJobDialog /></Suspense>
    </div>
  );
}
