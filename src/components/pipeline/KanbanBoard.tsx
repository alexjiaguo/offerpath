"use client";

import { useState, useCallback, useMemo } from "react";
import {
 DndContext,
 DragOverlay,
 closestCorners,
 PointerSensor,
 useSensor,
 useSensors,
 type DragStartEvent,
 type DragEndEvent,
} from "@dnd-kit/core";
import { usePipelineStore } from "@/store/pipelineStore";
import KanbanColumn, { KANBAN_COLUMNS } from "./KanbanColumn";
import { JobCardOverlay } from "./JobCard";
import type { Job, JobStatus } from "@/types";

/* ═══════════════════════════════════════════════════
 KanbanBoard — Main drag-and-drop board container
 ═══════════════════════════════════════════════════ */

export default function KanbanBoard() {
  const { getJobsByStatus, moveJob, reorderJobs, setAddJobDialogOpen, jobs, filters } = usePipelineStore();
 const [activeJob, setActiveJob] = useState<Job | null>(null);

 // Memoize column jobs to prevent unnecessary re-renders
 const columnJobs = useMemo(() => {
 const result: Record<string, Job[]> = {};
 for (const col of KANBAN_COLUMNS) {
 result[col.id] = getJobsByStatus(col.id);
 }
 return result;
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [jobs, filters, getJobsByStatus]);

 const sensors = useSensors(
 useSensor(PointerSensor, {
 activationConstraint: {
 distance: 8,
 },
 })
 );

 const handleDragStart = useCallback(
 (event: DragStartEvent) => {
 const { active } = event;
 const job = usePipelineStore.getState().getJobById(active.id as string);
 if (job) setActiveJob(job);
 },
 []
 );

 const handleDragEnd = useCallback(
 (event: DragEndEvent) => {
 const { active, over } = event;
 setActiveJob(null);

 if (!over) return;

 const activeId = active.id as string;

 // Determine target status
 let targetStatus: JobStatus | null = null;

 // Dropped on a column
 if (typeof over.id === "string" && over.id.startsWith("column-")) {
 targetStatus = over.id.replace("column-", "") as JobStatus;
 }
 // Dropped on a job card
 else if (over.data.current?.type === "job") {
 targetStatus = over.data.current.status as JobStatus;
 }

  if (targetStatus) {
  const currentJob = usePipelineStore.getState().getJobById(activeId);
  if (!currentJob) return;
  const droppedOnCard = typeof over.id === "string" && !over.id.startsWith("column-");
  if (currentJob.status !== targetStatus) {
  if (targetStatus === "applied") {
  // Route through moveJob so the no-resume ResumePicker intercept fires.
  moveJob(activeId, targetStatus);
  } else if (droppedOnCard) {
  // Cross-column move onto a specific card → insert at that position.
  reorderJobs(activeId, over.id as string, targetStatus);
  } else {
  moveJob(activeId, targetStatus);
  }
  } else if (droppedOnCard && over.id !== activeId) {
  // Same-column reorder (previously a no-op).
  reorderJobs(activeId, over.id as string, targetStatus);
  }
  }
  },
  [moveJob, reorderJobs]
 );

 return (
 <DndContext
 sensors={sensors}
 collisionDetection={closestCorners}
 onDragStart={handleDragStart}
 onDragEnd={handleDragEnd}
 >
 <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-220px)]">
 {KANBAN_COLUMNS.map((col) => (
 <KanbanColumn
 key={col.id}
 config={col}
 jobs={columnJobs[col.id] || []}
 onAddClick={col.id === "new" ? () => setAddJobDialogOpen(true) : undefined}
 />
 ))}
 </div>

 {/* Drag Overlay — renders outside columns for smooth cross-column dragging */}
 <DragOverlay dropAnimation={null}>
 {activeJob ? <JobCardOverlay job={activeJob} /> : null}
 </DragOverlay>

  {/* Resume Picker is mounted globally in dashboard/layout.tsx so the
      "applied" intercept works from every surface, not just the board. */}
  </DndContext>
 );
}
