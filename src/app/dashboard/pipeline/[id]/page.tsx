"use client";

import { use } from "react";
import dynamic from "next/dynamic";
const JobDetail = dynamic(() => import("@/components/pipeline/JobDetail"), { ssr: false });

/* ═══════════════════════════════════════════════════
 Job Detail Page — /dashboard/pipeline/[id]
 ═══════════════════════════════════════════════════ */

export default function JobDetailPage({
 params,
}: {
 params: Promise<{ id: string }>;
}) {
 const { id } = use(params);
 return <JobDetail jobId={id} />;
}
