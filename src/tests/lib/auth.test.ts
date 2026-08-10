import { describe, it, expect, beforeEach } from "vitest";
import {
  setGuestSession,
  clearGuestSession,
  isGuestMode,
  setMockAuthSession,
  clearMockAuthSession,
  signUpWithEmail,
  signInWithEmail,
} from "@/lib/auth";
import { useProfileStore } from "@/store/profileStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useInterviewStore } from "@/store/interviewStore";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const pair = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return pair ? pair.split("=")[1] ?? null : null;
}

describe("auth helpers - guest mode", () => {
  beforeEach(() => {
    document.cookie.split("; ").forEach((c) => {
      const name = c.split("=")[0];
      if (name) document.cookie = `${name}=; path=/; max-age=0`;
    });
  });

  it("setGuestSession sets the guest cookie and isGuestMode returns true", () => {
    expect(isGuestMode()).toBe(false);
    setGuestSession();
    expect(getCookie("offerpath_guest")).toBe("1");
    expect(isGuestMode()).toBe(true);
  });

  it("clearGuestSession removes the guest cookie", () => {
    setGuestSession();
    clearGuestSession();
    expect(getCookie("offerpath_guest")).toBeNull();
    expect(isGuestMode()).toBe(false);
  });

  it("setMockAuthSession clears guest cookie (signed-in user is not a guest)", () => {
    setGuestSession();
    setMockAuthSession("user@example.com");
    expect(getCookie("offerpath_guest")).toBeNull();
    expect(isGuestMode()).toBe(false);
  });

  it("clearMockAuthSession + setGuestSession round-trip", () => {
    setMockAuthSession("user@example.com");
    clearMockAuthSession();
    setGuestSession();
    expect(isGuestMode()).toBe(true);
  });
});

describe("auth - clean slate on signup/login (mock path)", () => {
  beforeEach(() => {
    // Seed all stores with demo/placeholder data to verify it gets cleared
    useProfileStore.setState({
      profile: {
        fullName: "Brouard Madan",
        email: "brouard.madan@email.com",
        phone: "+1 650 555 0199",
        location: "Los Angeles, CA",
        linkedin: "linkedin.com/in/brouardmadan",
        website: "brouard.dev",
        avatarUrl: "",
        headline: "AI Product Manager",
        yearsOfExperience: "5+",
        targetRoleSummary: "",
        currentCompany: "Tripalink",
        currentTitle: "AI Product Manager",
        keySkills: ["LLM", "RAG"],
        careerGoals: "",
        preferredIndustries: [],
        preferredLocations: [],
        salaryExpectation: "",
        workAuthorization: "US Citizen",
        workExperience: [],
        education: [],
        disclosures: {
          requiresSponsorship: false,
          locationPreference: "hybrid",
          gender: "male",
          race: "asian",
          disabilityStatus: "no",
          veteranStatus: "no",
        },
      },
      uploadedResume: null,
      apiKeys: [],
    });
    usePipelineStore.setState({
      jobs: [{ id: "demo-job", title: "Demo Job" } as never],
      companies: [{ id: "demo-co", name: "Demo Co" } as never],
    });
    useResumeStore.setState({
      resumes: [{ id: "demo-resume", title: "Demo Resume" } as never],
      history: { resumeId: null, past: [], future: [] },
      canUndo: false,
      canRedo: false,
    });
    useDiscoveryStore.setState({
      companies: [{ id: "dc1", name: "Demo Discovery" } as never],
      jobs: [{ id: "dj1", title: "Demo Discovery Job" } as never],
      scanRuns: [{ id: "sr1", status: "completed" } as never],
    });
    useInterviewStore.setState({
      stories: [{ id: "s1", title: "Demo Story" } as never],
      preps: [{ id: "p1", job_id: "j1" } as never],
      mockSessions: [{ id: "m1", job_id: "j1" } as never],
    });
    // Clear cookies
    document.cookie.split("; ").forEach((c) => {
      const name = c.split("=")[0];
      if (name) document.cookie = `${name}=; path=/; max-age=0`;
    });
  });

  it("signUpWithEmail resets all stores and sets user's name/email", async () => {
    await signUpWithEmail("newuser@test.com", "Password123", { full_name: "New User" });

    // Profile: clean, with user's info
    const profile = useProfileStore.getState().profile;
    expect(profile.fullName).toBe("New User");
    expect(profile.email).toBe("newuser@test.com");
    expect(profile.keySkills).toEqual([]);
    expect(profile.workExperience).toEqual([]);
    expect(profile.currentCompany).toBe("");

    // Pipeline: empty
    expect(usePipelineStore.getState().jobs).toEqual([]);
    expect(usePipelineStore.getState().companies).toEqual([]);

    // Resume: empty
    expect(useResumeStore.getState().resumes).toEqual([]);

    // Discovery: empty
    expect(useDiscoveryStore.getState().companies).toEqual([]);
    expect(useDiscoveryStore.getState().jobs).toEqual([]);
    expect(useDiscoveryStore.getState().scanRuns).toEqual([]);

    // Interview: empty
    expect(useInterviewStore.getState().stories).toEqual([]);
    expect(useInterviewStore.getState().preps).toEqual([]);
    expect(useInterviewStore.getState().mockSessions).toEqual([]);
  });

  it("signInWithEmail resets all stores even with pre-existing data", async () => {
    await signInWithEmail("realuser@test.com", "Password123");

    // Profile: clean, with login email
    const profile = useProfileStore.getState().profile;
    expect(profile.email).toBe("realuser@test.com");
    expect(profile.fullName).toBe("");

    // All other stores: empty
    expect(usePipelineStore.getState().jobs).toEqual([]);
    expect(useResumeStore.getState().resumes).toEqual([]);
    expect(useDiscoveryStore.getState().companies).toEqual([]);
    expect(useInterviewStore.getState().stories).toEqual([]);
  });
});
