"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const AddJobDialog = dynamic(() => import("@/components/pipeline/AddJobDialog"), { ssr: false });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
