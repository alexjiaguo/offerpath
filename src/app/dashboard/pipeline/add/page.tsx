"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePipelineStore } from "@/store/pipelineStore";

export default function PipelineAddRedirect() {
  const router = useRouter();
  const setAddJobDialogOpen = usePipelineStore((s) => s.setAddJobDialogOpen);

  useEffect(() => {
    setAddJobDialogOpen(true);
    router.replace("/dashboard/pipeline");
  }, [router, setAddJobDialogOpen]);

  return null;
}
