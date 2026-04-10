"use client";

import { use } from "react";
import JobDetail from "@/components/pipeline/JobDetail";

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
