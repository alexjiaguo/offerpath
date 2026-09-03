import { describe, it, expect, beforeEach } from "vitest";
import { useInterviewStore } from "@/store/interviewStore";
import { normalizeCompetency } from "@/components/interview/StoryDialog";

describe("interviewStore - mock sessions", () => {
  beforeEach(() => {
    useInterviewStore.setState({
      stories: [],
      preps: [],
      mockSessions: [],
      storySearch: "",
    });
  });

  it("startMockSession seeds the transcript with the first question", () => {
    const id = useInterviewStore.getState().startMockSession("job-1", ["Q1?", "Q2?"]);
    const session = useInterviewStore.getState().getMockById(id);
    expect(session).toBeDefined();
    expect(session!.transcript).toHaveLength(1);
    expect(session!.transcript[0].role).toBe("interviewer");
    expect(session!.transcript[0].message).toBe("Q1?");
  });

  it("addMockMessage chains the next interviewer question", () => {
    const id = useInterviewStore.getState().startMockSession("job-1", ["Q1?", "Q2?"]);
    useInterviewStore.getState().addMockMessage(id, "candidate", "My answer");
    const session = useInterviewStore.getState().getMockById(id)!;
    expect(session.transcript).toHaveLength(3);
    expect(session.transcript[1].role).toBe("candidate");
    expect(session.transcript[2].role).toBe("interviewer");
    expect(session.transcript[2].message).toBe("Q2?");
  });

  it("endMockSession records real elapsed time (no 5-minute floor)", async () => {
    // No API keys in the test env, so the transcript-derived heuristic path runs.
    const id = useInterviewStore.getState().startMockSession("job-1", ["Q1?"]);
    await useInterviewStore.getState().endMockSession(id);
    const session = useInterviewStore.getState().getMockById(id)!;
    expect(session.feedback).toBeDefined();
    expect(session.duration_seconds).toBeLessThan(60);
  });

  it("heuristic feedback varies with transcript quality", async () => {
    const thin = useInterviewStore.getState().startMockSession("job-1", ["Q1?"]);
    useInterviewStore.getState().addMockMessage(thin, "candidate", "ok");
    await useInterviewStore.getState().endMockSession(thin);

    const rich = useInterviewStore.getState().startMockSession("job-1", ["Q1?"]);
    useInterviewStore
      .getState()
      .addMockMessage(
        rich,
        "candidate",
        "As lead I shipped a new onboarding flow that grew activation by 40 percent and reduced churn because we ran weekly experiments and I built the analytics myself across situation task action result"
      );
    await useInterviewStore.getState().endMockSession(rich);

    const thinScore = useInterviewStore.getState().getMockById(thin)!.score!;
    const richScore = useInterviewStore.getState().getMockById(rich)!.score!;
    expect(richScore).toBeGreaterThan(thinScore);
  });

  it("deletePrep removes the package for a job", () => {
    const store = useInterviewStore.getState();
    store.generatePrepForJob("job-9", "Engineer", "Acme", "Build things");
    expect(store.getPrepByJobId("job-9")).toBeDefined();
    useInterviewStore.getState().deletePrep("job-9");
    expect(useInterviewStore.getState().getPrepByJobId("job-9")).toBeUndefined();
  });

  it("generatePrepForJob is idempotent per job", () => {
    const store = useInterviewStore.getState();
    const first = store.generatePrepForJob("job-9", "Engineer", "Acme", "Build things");
    const second = useInterviewStore.getState().generatePrepForJob("job-9", "Engineer", "Acme", "Build things");
    expect(first).toBe(second);
    expect(useInterviewStore.getState().preps).toHaveLength(1);
  });
});

describe("normalizeCompetency", () => {
  it("passes known competencies through", () => {
    expect(normalizeCompetency("technical")).toBe("technical");
  });

  it("maps unknown labels (e.g. file-import 'unspecified') to the default", () => {
    expect(normalizeCompetency("unspecified")).toBe("leadership");
    expect(normalizeCompetency(undefined)).toBe("leadership");
    expect(normalizeCompetency("")).toBe("leadership");
  });
});
