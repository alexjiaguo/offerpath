/* ═══════════════════════════════════════════════════
   OfferPath — Profile Store (Zustand)
   Manages user profile, background info, and uploaded resume
   ═══════════════════════════════════════════════════ */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ───────────────────────────────────────────

export interface WorkExperienceEntry {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  major: string;
  graduationDate: string;
}

export interface EmploymentDisclosures {
  requiresSponsorship: boolean;
  locationPreference: "remote" | "hybrid" | "onsite";
  gender: string;
  race: string;
  disabilityStatus: string;
  veteranStatus: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  avatarUrl: string;
  headline: string;
  yearsOfExperience: string;
  targetRoleSummary: string;
  currentCompany: string;
  currentTitle: string;
  keySkills: string[];
  careerGoals: string;
  preferredIndustries: string[];
  preferredLocations: string[];
  salaryExpectation: string;
  workAuthorization: string;
  workExperience: WorkExperienceEntry[];
  education: EducationEntry[];
  disclosures: EmploymentDisclosures;
}

export interface UploadedResume {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  parsedText: string;
  fileType: "pdf" | "docx" | "txt";
}

export interface ApiKeyEntry {
  id: string;
  provider: "openai" | "gemini" | "deepseek" | "anthropic";
  label: string;
  key: string;
  status: "active" | "invalid" | "untested";
  addedAt: string;
}

export interface ProfileState {
  profile: UserProfile;
  uploadedResume: UploadedResume | null;
  apiKeys: ApiKeyEntry[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  uploadResume: (file: File) => Promise<void>;
  clearResume: () => void;
  getProfileSummary: () => string;
  addApiKey: (entry: ApiKeyEntry) => void;
  removeApiKey: (id: string) => void;
  updateApiKeyStatus: (id: string, status: ApiKeyEntry["status"]) => void;
  getActiveApiKey: (provider: ApiKeyEntry["provider"]) => ApiKeyEntry | undefined;
  addWorkExperience: (entry: WorkExperienceEntry) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: (entry: EducationEntry) => void;
  removeEducation: (id: string) => void;
  updateDisclosures: (updates: Partial<EmploymentDisclosures>) => void;
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: "Brouard Madan",
  email: "brouard.madan@email.com",
  phone: "+1 650 555 0199",
  location: "Los Angeles, CA",
  linkedin: "linkedin.com/in/brouardmadan",
  website: "brouard.dev",
  avatarUrl: "",
  headline: "AI Product Manager | LLM & Monetization Platforms",
  yearsOfExperience: "5+",
  targetRoleSummary: "Seeking Lead/Senior PM roles owning P&L for AI platforms, LLM/RAG integrations, or SaaS marketplaces at tier-1 tech companies.",
  currentCompany: "Tripalink",
  currentTitle: "AI Product Manager",
  keySkills: ["LLM", "RAG", "Agile", "Python", "SQL", "Product Strategy", "Revenue Optimization", "A/B Testing"],
  careerGoals: "Transition into a Director-level role leading AI platform monetization and product strategy at a global scale.",
  preferredIndustries: ["Technology", "AI/SaaS", "E-Commerce", "PropTech"],
  preferredLocations: ["San Francisco, CA", "Los Angeles, CA", "Remote (US)"],
  salaryExpectation: "USD 180K–240K",
  workAuthorization: "US Citizen",
  workExperience: [
    {
      id: "w1",
      company: "Tripalink",
      role: "AI Product Manager",
      location: "Los Angeles, CA",
      startDate: "2024-03",
      endDate: "",
      isCurrent: true,
      description: "Spearheaded AI onboarding flows that increased candidate funnel activation by 35%. Automated SaaS contract redlines using LLMs, cutting legal review latency by 60%."
    },
    {
      id: "w2",
      company: "SaaSify",
      role: "Associate Product Manager",
      location: "San Jose, CA",
      startDate: "2022-06",
      endDate: "2024-02",
      isCurrent: false,
      description: "Owned product development for a marketplace billing hub. Increased self-serve checkout conversions by 15% through smart defaults."
    }
  ],
  education: [
    {
      id: "e1",
      school: "Xi'an Jiaotong University",
      degree: "Master of Science",
      major: "Electrical Engineering",
      graduationDate: "2022-05"
    }
  ],
  disclosures: {
    requiresSponsorship: false,
    locationPreference: "hybrid",
    gender: "male",
    race: "asian",
    disabilityStatus: "no",
    veteranStatus: "no"
  }
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      uploadedResume: null,
      apiKeys: [],
      updateProfile: (updates) => {
        set((state) => ({ profile: { ...state.profile, ...updates } }));
      },
      addSkill: (skill) => {
        set((state) => {
          if (state.profile.keySkills.includes(skill)) return state;
          return { profile: { ...state.profile, keySkills: [...state.profile.keySkills, skill] } };
        });
      },
      removeSkill: (skill) => {
        set((state) => ({ profile: { ...state.profile, keySkills: state.profile.keySkills.filter((s) => s !== skill) } }));
      },
      uploadResume: async (file: File) => {
        const fileType = file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".docx") ? "docx" : "txt";
        const mockParsedText = `BROUARD MADAN\nAI Product Manager\nLos Angeles · brouard.madan@email.com`;
        const uploaded: UploadedResume = {
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          parsedText: mockParsedText,
          fileType: fileType as "pdf" | "docx" | "txt",
        };
        set({ uploadedResume: uploaded });
      },
      clearResume: () => {
        set({ uploadedResume: null });
      },
      getProfileSummary: () => {
        const { profile, uploadedResume } = get();
        const parts = [
          `Name: ${profile.fullName}`,
          `Headline: ${profile.headline}`,
          `Experience: ${profile.yearsOfExperience} years`,
          `Current: ${profile.currentTitle} at ${profile.currentCompany}`,
          `Skills: ${profile.keySkills.join(", ")}`,
        ];
        if (uploadedResume) parts.push(`Resume: ${uploadedResume.fileName}`);
        return parts.join("\n");
      },
      addApiKey: (entry) => {
        set((state) => ({ apiKeys: [...state.apiKeys, entry] }));
      },
      removeApiKey: (id) => {
        set((state) => ({ apiKeys: state.apiKeys.filter((k) => k.id !== id) }));
      },
      updateApiKeyStatus: (id, status) => {
        set((state) => ({
          apiKeys: state.apiKeys.map((k) => (k.id === id ? { ...k, status } : k)),
        }));
      },
      getActiveApiKey: (provider) => {
        return get().apiKeys.find((k) => k.provider === provider && k.status === "active");
      },
      addWorkExperience: (entry) => {
        set((state) => ({
          profile: {
            ...state.profile,
            workExperience: [...state.profile.workExperience, entry]
          }
        }));
      },
      removeWorkExperience: (id) => {
        set((state) => ({
          profile: {
            ...state.profile,
            workExperience: state.profile.workExperience.filter((w) => w.id !== id)
          }
        }));
      },
      addEducation: (entry) => {
        set((state) => ({
          profile: {
            ...state.profile,
            education: [...state.profile.education, entry]
          }
        }));
      },
      removeEducation: (id) => {
        set((state) => ({
          profile: {
            ...state.profile,
            education: state.profile.education.filter((e) => e.id !== id)
          }
        }));
      },
      updateDisclosures: (updates) => {
        set((state) => ({
          profile: {
            ...state.profile,
            disclosures: { ...state.profile.disclosures, ...updates }
          }
        }));
      },
    }),
    { name: "offerpath-profile" }
  )
);
