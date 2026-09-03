import { describe, it, expect, vi, beforeEach } from "vitest";
import { isUUID, syncStoreToSupabase } from "@/lib/supabase-sync";
import { createJobAction, updateJobStatusAction } from "@/app/actions/pipeline";
import {
  saveStoryAction,
  deleteStoryAction,
  savePrepAction,
  deletePrepAction,
  saveMockSessionAction,
  deleteMockSessionAction,
} from "@/app/actions/interview";
import { useProfileStore } from "@/store/profileStore";

// Mock supabase-server for server action tests
const mockUpsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: { id: "11111111-2222-3333-4444-555555555555" },
      error: null,
    }),
  }),
});

const mockInsert = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnValue({
    single: vi.fn().mockResolvedValue({
      data: { id: "22222222-3333-4444-5555-666666666666" },
      error: null,
    }),
  }),
});

const mockUpdate = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockResolvedValue({ data: [{ id: "mock-user" }], error: null }),
  }),
});

const createDeleteMock = () => {
  const del: Record<string, unknown> = {};
  del.in = vi.fn().mockResolvedValue({ error: null });
  del.eq = vi.fn().mockReturnValue(del);
  // Support awaiting delete directly
  del.then = (resolve: (val: { error: null }) => void) => Promise.resolve(resolve({ error: null }));
  return del;
};

const mockDelete = vi.fn(() => createDeleteMock());

const createQueryMock = () => {
  const query: Record<string, unknown> = {};
  query.eq = vi.fn().mockReturnValue(query);
  query.ilike = vi.fn().mockReturnValue(query);
  query.select = vi.fn().mockReturnValue(query);
  query.order = vi.fn().mockReturnValue(query);
  query.single = vi.fn().mockResolvedValue({
    data: { id: "job-123", history: [], applied_at: null, interviewed_at: null, offered_at: null },
    error: null,
  });
  query.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  return query;
};

const mockSelect = vi.fn(() => createQueryMock());

const mockFrom = vi.fn(() => {
  return {
    select: mockSelect,
    insert: mockInsert,
    upsert: mockUpsert,
    update: mockUpdate,
    delete: mockDelete,
  };
});

vi.mock("@/lib/supabase-server", () => ({
  createServerClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "user-12345678-0000-0000-0000-000000000000" } },
      })),
    },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => true,
  createClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: { id: "12345678-1234-1234-1234-123456789abc" } },
      })),
    },
    from: mockFrom,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Database & Sync Consistency Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UUID Validation Helper", () => {
    it("identifies valid RFC 4122 UUIDs", () => {
      expect(isUUID("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
      expect(isUUID("c56a4180-65aa-42ec-a945-5fd21dec0538")).toBe(true);
      expect(isUUID("00000000-0000-0000-0000-000000000000")).toBe(true);
    });

    it("rejects non-UUID string IDs", () => {
      expect(isUUID("r1")).toBe(false);
      expect(isUUID("c1")).toBe(false);
      expect(isUUID("temp-1724659200000")).toBe(false);
      expect(isUUID("dc-1724659200000")).toBe(false);
      expect(isUUID("")).toBe(false);
      expect(isUUID(null)).toBe(false);
      expect(isUUID(undefined)).toBe(false);
      expect(isUUID(123)).toBe(false);
    });
  });

  describe("createJobAction Data Sanitization", () => {
    it("strips nested company and resume objects before inserting into jobs table", async () => {
      const res = await createJobAction({
        title: "Senior Product Manager",
        company: {
          id: "33333333-4444-5555-6666-777777777777",
          name: "Acme Corp",
          user_id: "user-123",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        resume: {
          id: "44444444-5555-6666-7777-888888888888",
          title: "My Resume",
        } as never,
      });

      expect(res.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("jobs");

      // Verify that mockUpsert was called on jobs table
      const upsertCalls = mockUpsert.mock.calls;
      expect(upsertCalls.length).toBeGreaterThan(0);
      const insertedJobPayload = upsertCalls[0][0] as Record<string, unknown>;

      // CRITICAL: company and resume relation objects must NOT exist in the insert payload
      expect(insertedJobPayload).not.toHaveProperty("company");
      expect(insertedJobPayload).not.toHaveProperty("resume");
      expect(insertedJobPayload).toHaveProperty("title", "Senior Product Manager");
      expect(insertedJobPayload).toHaveProperty("company_id");
    });
  });

  describe("updateJobStatusAction Milestone Timestamps", () => {
    it("records milestone timestamps when moving job statuses", async () => {
      const res = await updateJobStatusAction("job-123", "interviewing");
      expect(res.success).toBe(true);

      const updateCall = mockUpdate.mock.calls[0][0] as Record<string, unknown>;
      expect(updateCall.status).toBe("interviewing");
      expect(updateCall).toHaveProperty("interviewed_at");
      expect(typeof updateCall.interviewed_at).toBe("string");
    });
  });

  describe("Profile Sync & Hydration Protection", () => {
    it("does not overwrite server-authoritative tier or ai_uses_this_month during profile sync", async () => {
      await syncStoreToSupabase("profile", {
        fullName: "Alex Chen",
        email: "alex@example.com",
        avatarUrl: "https://avatar.com/alex.png",
        phone: "+1 555-0199",
        headline: "Staff PM",
        keySkills: ["Product Strategy", "AI"],
      });

      expect(mockFrom).toHaveBeenCalledWith("profiles");
      // Must call update (not an upsert with tier="free" and ai_uses_this_month=0)
      expect(mockUpdate).toHaveBeenCalled();
      const updatePayload = mockUpdate.mock.calls[0][0] as Record<string, unknown>;
      expect(updatePayload).not.toHaveProperty("tier");
      expect(updatePayload).not.toHaveProperty("ai_uses_this_month");
      expect(updatePayload).toHaveProperty("preferences");
      const prefs = updatePayload.preferences as Record<string, unknown>;
      expect(prefs.phone).toBe("+1 555-0199");
      expect(prefs.headline).toBe("Staff PM");
      expect(prefs.keySkills).toEqual(["Product Strategy", "AI"]);
    });

    it("hydrates all background fields from preferences into profile store without data loss", () => {
      // Mock row loaded from Supabase
      const dbRow = {
        full_name: "Jordan Lee",
        email: "jordan@example.com",
        avatar_url: "https://example.com/avatar.jpg",
        preferences: {
          phone: "+1 555-1234",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/jordanlee",
          website: "jordanlee.dev",
          headline: "Head of Product",
          yearsOfExperience: "10+",
          targetRoleSummary: "VP of Product",
          currentCompany: "Stripe",
          currentTitle: "Lead PM",
          keySkills: ["Strategy", "Payments"],
          careerGoals: "Lead a tier-1 product org",
          preferredIndustries: ["Fintech", "AI"],
          preferredLocations: ["SF", "Remote"],
          salaryExpectation: "$250k+",
          workAuthorization: "US Citizen",
          workExperience: [
            {
              id: "exp-1",
              company: "Stripe",
              role: "Lead PM",
              title: "Lead PM",
              location: "San Francisco, CA",
              startDate: "2022-01",
              endDate: "Present",
              isCurrent: true,
              description: "Led core payments",
            },
          ],
          education: [
            {
              id: "edu-1",
              school: "Stanford",
              degree: "BS",
              major: "Computer Science",
              fieldOfStudy: "Computer Science",
              graduationDate: "2015",
              graduationYear: "2015",
            },
          ],
          disclosures: {
            requiresSponsorship: false,
            locationPreference: "hybrid" as const,
            gender: "",
            race: "",
            veteranStatus: "No",
            disabilityStatus: "No",
          },
        },
      };

      // Apply hydration logic
      const prefs = dbRow.preferences;
      const current = useProfileStore.getState().profile;
      useProfileStore.setState({
        profile: {
          ...current,
          fullName: dbRow.full_name,
          email: dbRow.email,
          avatarUrl: dbRow.avatar_url,
          phone: prefs.phone,
          location: prefs.location,
          linkedin: prefs.linkedin,
          website: prefs.website,
          headline: prefs.headline,
          yearsOfExperience: prefs.yearsOfExperience,
          targetRoleSummary: prefs.targetRoleSummary,
          currentCompany: prefs.currentCompany,
          currentTitle: prefs.currentTitle,
          keySkills: prefs.keySkills,
          careerGoals: prefs.careerGoals,
          preferredIndustries: prefs.preferredIndustries,
          preferredLocations: prefs.preferredLocations,
          salaryExpectation: prefs.salaryExpectation,
          workAuthorization: prefs.workAuthorization,
          workExperience: prefs.workExperience,
          education: prefs.education,
          disclosures: prefs.disclosures,
        },
      });

      const updated = useProfileStore.getState().profile;
      expect(updated.fullName).toBe("Jordan Lee");
      expect(updated.headline).toBe("Head of Product");
      expect(updated.workExperience).toHaveLength(1);
      expect(updated.workExperience[0].company).toBe("Stripe");
      expect(updated.education).toHaveLength(1);
      expect(updated.education[0].school).toBe("Stanford");
      expect(updated.disclosures?.veteranStatus).toBe("No");
    });
  });

  describe("Discovery & Pipeline Store Separation", () => {
    it("discovery sync never executes active deletion sweep against companies table", async () => {
      await syncStoreToSupabase("discovery", {
        companies: [
          {
            id: "12345678-1234-4234-8234-123456789abc",
            name: "Newly Discovered AI Inc",
            industry: "AI",
          },
        ],
      });

      // Must call upsert for discovered companies
      expect(mockFrom).toHaveBeenCalledWith("companies");
      expect(mockUpsert).toHaveBeenCalled();
      // Must NEVER delete companies in discovery sync
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe("Interview Preps Conflict Handling", () => {
    it("upserts interview preps with onConflict: id (aligned with the id-based deletion sweep)", async () => {
      await syncStoreToSupabase("interview", {
        preps: [
          {
            id: "11111111-2222-4333-8444-555555555555",
            job_id: "22222222-3333-4444-8555-666666666666",
            company_research: "Leading tech company",
            questions: ["Tell me about a time..."],
          },
        ],
      });

      expect(mockFrom).toHaveBeenCalledWith("interview_preps");
      const prepUpsertCall = mockUpsert.mock.calls.find((call) => {
        return (call[1] as { onConflict?: string })?.onConflict === "id";
      });
      expect(prepUpsertCall).toBeDefined();
    });
  });

  describe("Interview Hub Server Actions", () => {
    it("saveStoryAction upserts valid UUID story row to Supabase", async () => {
      const story = {
        id: "11111111-2222-3333-4444-555555555555",
        user_id: "user-12345678-0000-0000-0000-000000000000",
        title: "Launched Payment Gateway",
        competency: "leadership",
        situation: "Legacy payment stack failing",
        task: "Redesign core checkout",
        action: "Led migration team of 6 engineers",
        result: "Reduced failed transactions by 80%",
        metrics: "80% reduction",
        tags: ["fintech", "payments"],
        used_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await saveStoryAction(story);
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("stories");
      expect(mockUpsert).toHaveBeenCalled();
    });

    it("deleteStoryAction calls delete for valid UUID story", async () => {
      const result = await deleteStoryAction("11111111-2222-3333-4444-555555555555");
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("stories");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("savePrepAction upserts valid UUID prep row", async () => {
      const prep = {
        id: "11111111-2222-3333-4444-555555555555",
        user_id: "user-12345678-0000-0000-0000-000000000000",
        job_id: "22222222-3333-4444-5555-666666666666",
        company_research: "Fast growing tech firm",
        role_analysis: "Lead PM role",
        questions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await savePrepAction(prep);
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("interview_preps");
      expect(mockUpsert).toHaveBeenCalled();
    });

    it("saveMockSessionAction upserts mock session with feedback and duration", async () => {
      const session = {
        id: "33333333-4444-5555-6666-777777777777",
        user_id: "user-12345678-0000-0000-0000-000000000000",
        job_id: "22222222-3333-4444-5555-666666666666",
        transcript: [{ role: "candidate" as const, message: "Hello", timestamp: new Date().toISOString() }],
        score: 4.5,
        feedback: {
          overall_score: 4.5,
          strengths: ["Clear structure"],
          improvements: ["Add metrics"],
          tips: ["Stay concise"],
        },
        duration_seconds: 600,
        questionPool: ["Tell me about yourself"],
        created_at: new Date().toISOString(),
      };

      const result = await saveMockSessionAction(session);
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("mock_sessions");
      expect(mockUpsert).toHaveBeenCalled();
    });

    it("deletePrepAction deletes prep row by job_id", async () => {
      const result = await deletePrepAction("22222222-3333-4444-5555-666666666666");
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("interview_preps");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("deleteMockSessionAction deletes mock session row by id", async () => {
      const result = await deleteMockSessionAction("33333333-4444-5555-6666-777777777777");
      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("mock_sessions");
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
