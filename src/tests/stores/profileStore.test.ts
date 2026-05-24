import { describe, it, expect, beforeEach } from "vitest";
import { useProfileStore } from "@/store/profileStore";

describe("profileStore", () => {
  beforeEach(() => {
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
          locationPreference: "hybrid",
          gender: "",
          race: "",
          disabilityStatus: "",
          veteranStatus: "",
        },
      },
      apiKeys: [],
    });
  });

  it("should update profile fields", () => {
    const { updateProfile } = useProfileStore.getState();
    updateProfile({ fullName: "Jane Doe" });
    expect(useProfileStore.getState().profile.fullName).toBe("Jane Doe");
  });

  it("should add and remove skills", () => {
    const { addSkill, removeSkill } = useProfileStore.getState();
    addSkill("React");
    expect(useProfileStore.getState().profile.keySkills).toContain("React");
    removeSkill("React");
    expect(useProfileStore.getState().profile.keySkills).not.toContain("React");
  });

  it("should add and remove API keys", () => {
    const { addApiKey, removeApiKey } = useProfileStore.getState();
    const key = {
      id: "test-1",
      provider: "openai" as const,
      label: "Test Key",
      key: "sk-test",
      status: "untested" as const,
      addedAt: "2026-01-01",
    };
    addApiKey(key);
    expect(useProfileStore.getState().apiKeys).toHaveLength(1);
    removeApiKey("test-1");
    expect(useProfileStore.getState().apiKeys).toHaveLength(0);
  });

  it("should get active API key by provider", () => {
    const { addApiKey, getActiveApiKey } = useProfileStore.getState();
    addApiKey({
      id: "test-1",
      provider: "openai",
      label: "Test Key",
      key: "sk-test",
      status: "active",
      addedAt: "2026-01-01",
    });
    const active = getActiveApiKey("openai");
    expect(active?.key).toBe("sk-test");
    expect(getActiveApiKey("anthropic")).toBeUndefined();
  });
});
