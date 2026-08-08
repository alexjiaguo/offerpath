"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import GuestBanner from "@/components/dashboard/GuestBanner";
import { useUIStore } from "@/store/uiStore";

const AddJobDialog = dynamic(() => import("@/components/pipeline/AddJobDialog"), { ssr: false });

export default function DashboardLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 // Hydrates stores from Supabase on mount, then syncs changes back.
 useSupabaseSync();
 const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

 return (
 <div className="min-h-[100dvh] bg-surface-50 flex flex-col md:flex-row selection:bg-surface-400/10">
 {/* Sidebar — hidden on mobile, visible on md+ */}
 <div className="hidden md:block">
 <Sidebar />
 </div>
 
 {/* Main Content Shell */}
 <div className={`flex-1 ${sidebarCollapsed ? "md:pl-[72px]" : "md:pl-[240px]"} flex flex-col min-h-[100dvh] min-w-0 transition-[padding] duration-300 ease-out`}>
 <Topbar />
 <GuestBanner />
 <main className="flex-1 min-h-0 relative w-full flex flex-col overflow-y-auto p-4 md:p-6 lg:p-8 bg-surface-50">
 {children}
 </main>
 </div>
 <Suspense fallback={null}><AddJobDialog /></Suspense>
 </div>
 );
}
