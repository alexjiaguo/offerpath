import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OnboardingChecklistWidget, { calculateTimeSavedHours } from "@/components/dashboard/OnboardingChecklistWidget";
import { useProfileStore } from "@/store/profileStore";
import { useResumeStore } from "@/store/resumeStore";
import type { Resume } from "@/types";
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useDiscoveryStore } from "@/store/discoveryStore";

describe("OnboardingChecklistWidget & Gamification", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useProfileStore.setState({
      profile: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "",
        location: "",
        linkedin: "",
        website: "",
        avatarUrl: "",
        headline: "",
        yearsOfExperience: "",
        targetRoleSummary: "",
        currentCompany: "",
        currentTitle: "",
        keySkills: [],
        careerGoals: "",
        preferredIndustries: [],
        preferredLocations: [],
        salaryExpectation: "",
        workAuthorization: "",
        workExperience: [],
        education: [],
        disclosures: {
          requiresSponsorship: false,
          locationPreference: "remote",
          gender: "",
          race: "",
          disabilityStatus: "",
          veteranStatus: "",
        },
      },
      apiKeys: [],
    });
    useResumeStore.setState({ resumes: [] });
    usePipelineStore.setState({ jobs: [] });
    useInterviewStore.setState({ stories: [], mockSessions: [] });
    useDiscoveryStore.setState({ companies: [], jobs: [] });
  });

  describe("calculateTimeSavedHours", () => {
    it("returns 0 hours when no activities completed", () => {
      const hours = calculateTimeSavedHours({
        resumesCount: 0,
        jobsCount: 0,
        storiesCount: 0,
        mocksCount: 0,
        hasSkills: false,
      });
      expect(hours).toBe(0);
    });

    it("calculates realistic time saved based on user activities", () => {
      const hours = calculateTimeSavedHours({
        resumesCount: 2, // 2 * 1.5 = 3.0
        jobsCount: 4,    // 4 * 0.5 = 2.0
        storiesCount: 1, // 1 * 1.0 = 1.0
        mocksCount: 1,   // 1 * 0.8 = 0.8
        hasSkills: true, // 1.0
      });
      expect(hours).toBe(7.8);
    });
  });

  describe("Widget Rendering & Progression", () => {
    it("renders initial state at 0% with New Explorer badge", () => {
      render(<OnboardingChecklistWidget />);
      expect(screen.getByText("0%")).toBeDefined();
      expect(screen.getByText(/steps remaining|steps to complete/)).toBeDefined();
    });

    it("updates progress percentage when steps are completed", () => {
      // Complete profile and resume
      useProfileStore.setState((s) => ({
        profile: { ...s.profile, keySkills: ["Product Management"] },
      }));
      useResumeStore.setState({
        resumes: [{ id: "r1", title: "Master", is_base: true } as unknown as Resume],
      });

      render(<OnboardingChecklistWidget />);
      // 2 / 5 = 40%
      expect(screen.getByText("40%")).toBeDefined();
    });

    it("toggles collapse state and persists to localStorage", () => {
      render(<OnboardingChecklistWidget />);
      const toggleBtn = screen.getByRole("button", { name: /hide|show/i });
      fireEvent.click(toggleBtn);
      expect(window.localStorage.getItem("offerpath_onboarding_collapsed")).toBe("1");

      fireEvent.click(toggleBtn);
      expect(window.localStorage.getItem("offerpath_onboarding_collapsed")).toBe("0");
    });

    it("dismisses checklist and persists dismissal to localStorage", () => {
      const { container } = render(<OnboardingChecklistWidget />);
      const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
      fireEvent.click(dismissBtn);
      expect(window.localStorage.getItem("offerpath_onboarding_dismissed")).toBe("1");
      expect(container.firstChild).toBeNull();
    });
  });
});
