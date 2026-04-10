/* ═══════════════════════════════════════════════════
   OfferPath — Profile Store (Zustand)
   Manages user profile, background info, and uploaded resume
   ═══════════════════════════════════════════════════ */

import { create } from "zustand";

// ── Types ───────────────────────────────────────────

export interface UserProfile {
  // Identity
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  avatarUrl: string;

  // Professional background
  headline: string;
  yearsOfExperience: string;
  targetRoleSummary: string;
  currentCompany: string;
  currentTitle: string;

  // Key skills (free-form tags)
  keySkills: string[];

  // Career goals
  careerGoals: string;
  preferredIndustries: string[];
  preferredLocations: string[];
  salaryExpectation: string;
  workAuthorization: string;
}

export interface UploadedResume {
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  parsedText: string;        // Simulated parsed content
  fileType: "pdf" | "docx" | "txt";
}

export interface ProfileState {
  profile: UserProfile;
  uploadedResume: UploadedResume | null;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  uploadResume: (file: File) => Promise<void>;
  clearResume: () => void;
  getProfileSummary: () => string;
}

// ── Default Profile ─────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  fullName: "Alex Chen",
  email: "alex.chen@email.com",
  phone: "+65 9123 4567",
  location: "Singapore",
  linkedin: "linkedin.com/in/alexchen",
  website: "alexchen.dev",
  avatarUrl: "",

  headline: "Senior Product Manager | Ad Tech & AI Platforms",
  yearsOfExperience: "8+",
  targetRoleSummary:
    "Seeking Lead/Senior PM roles in ad tech, AI platforms, or marketplace monetization at tier-1 tech companies in Singapore or remote-APAC.",
  currentCompany: "TechCorp",
  currentTitle: "Senior Product Manager, Ad Platform",

  keySkills: [
    "Product Strategy",
    "Data Analytics",
    "Machine Learning",
    "A/B Testing",
    "Ad Tech",
    "Revenue Optimization",
    "Cross-Functional Leadership",
    "SQL",
    "Python",
  ],

  careerGoals:
    "Transition into a Lead PM or Director-level role owning P&L for an ad tech or AI-powered monetization platform at a top-tier company in SEA.",
  preferredIndustries: ["Technology", "Ad Tech", "Fintech", "E-Commerce"],
  preferredLocations: ["Singapore", "Remote (APAC)", "San Francisco, CA"],
  salaryExpectation: "SGD 280K–400K / USD 220K–350K",
  workAuthorization: "Singapore PR",
};

// ── Store ───────────────────────────────────────────

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  uploadedResume: null,

  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates },
    }));
  },

  addSkill: (skill) => {
    set((state) => {
      if (state.profile.keySkills.includes(skill)) return state;
      return {
        profile: {
          ...state.profile,
          keySkills: [...state.profile.keySkills, skill],
        },
      };
    });
  },

  removeSkill: (skill) => {
    set((state) => ({
      profile: {
        ...state.profile,
        keySkills: state.profile.keySkills.filter((s) => s !== skill),
      },
    }));
  },

  uploadResume: async (file: File) => {
    // Simulate file reading & parsing
    const fileType = file.name.endsWith(".pdf")
      ? "pdf"
      : file.name.endsWith(".docx")
      ? "docx"
      : "txt";

    // Mock parsing — in production this would use a PDF/DOCX parser
    const mockParsedText = `
ALEX CHEN
Senior Product Manager | Ad Tech & AI Platforms
Singapore · alex.chen@email.com · +65 9123 4567

PROFESSIONAL SUMMARY
Senior Product Manager with 8+ years driving growth across ad tech, AI platforms, and marketplace products. Led teams of 15+ engineers to ship products serving 100M+ users. Proven track record of 3x revenue growth through data-driven strategy and ML-powered optimization.

EXPERIENCE
TechCorp — Senior Product Manager, Ad Platform (Jan 2022 – Present)
• Led ad serving platform strategy generating $50M+ ARR across 3 ad formats
• Shipped ML-powered CTR prediction model improving click-through by 40%
• Built AIGC auto-fitting system reducing creative production time by 60%

StartupXYZ — Product Manager, Growth (Jun 2019 – Dec 2021)
• Owned user acquisition funnel serving 10M+ monthly active users
• Designed A/B testing framework improving conversion by 25%

BigTech Inc — Associate Product Manager (Jan 2017 – May 2019)
• Shipped v2 of analytics dashboard used by 500+ enterprise clients

EDUCATION
National University of Singapore — MBA, Technology Management (2017)
Tsinghua University — B.Eng, Computer Science (2015)

SKILLS
Product Strategy · Data Analytics · Machine Learning · A/B Testing · SQL · Python · Figma
    `.trim();

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
      `Goals: ${profile.careerGoals}`,
    ];
    if (uploadedResume) {
      parts.push(`\nUploaded Resume:\n${uploadedResume.parsedText}`);
    }
    return parts.join("\n");
  },
}));
