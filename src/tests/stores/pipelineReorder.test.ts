import { describe, it, expect, beforeEach } from "vitest";
import { usePipelineStore } from "@/store/pipelineStore";
import type { Job } from "@/types";

function makeJob(id: string, status: Job["status"], order: number): Job {
  const now = new Date().toISOString();
  return {
    id,
    user_id: "demo",
    title: `Role ${id}`,
    company: {
      id: `c-${id}`,
      user_id: "demo",
      name: `Company ${id}`,
      created_at: now,
      updated_at: now,
    },
    status,
    kanban_order: order,
    created_at: now,
    updated_at: now,
  };
}

describe("pipelineStore - reorderJobs", () => {
  beforeEach(() => {
    usePipelineStore.setState({
      jobs: [
        makeJob("a", "new", 0),
        makeJob("b", "new", 1),
        makeJob("c", "new", 2),
      ],
      companies: [],
    });
  });

  it("reorders within the same column (previously a no-op)", () => {
    usePipelineStore.getState().reorderJobs("c", "a", "new");
    const ordered = usePipelineStore.getState().getJobsByStatus("new").map((j) => j.id);
    expect(ordered).toEqual(["c", "a", "b"]);
  });

  it("moves across columns at the drop position", () => {
    usePipelineStore.setState({
      jobs: [
        makeJob("a", "new", 0),
        makeJob("x", "applied", 0),
        makeJob("y", "applied", 1),
      ],
    });
    usePipelineStore.getState().reorderJobs("a", "y", "applied");
    expect(usePipelineStore.getState().getJobsByStatus("applied").map((j) => j.id)).toEqual([
      "x",
      "a",
      "y",
    ]);
  });

  it("appends at the end when dropped on empty column space", () => {
    usePipelineStore.getState().reorderJobs("a", "column-interviewing", "interviewing");
    const col = usePipelineStore.getState().getJobsByStatus("interviewing").map((j) => j.id);
    expect(col).toEqual(["a"]);
    expect(usePipelineStore.getState().getJobsByStatus("new").map((j) => j.id)).toEqual(["b", "c"]);
  });

  it("moveJobDirect assigns kanban_order at the end of the target column", () => {
    usePipelineStore.setState({
      jobs: [makeJob("a", "new", 0), makeJob("x", "applied", 0)],
    });
    usePipelineStore.getState().moveJobDirect("a", "applied");
    const moved = usePipelineStore.getState().getJobById("a")!;
    expect(moved.status).toBe("applied");
    expect(moved.kanban_order).toBe(1);
  });
});
