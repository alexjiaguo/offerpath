/* ═══════════════════════════════════════════════════
 OfferPath — Profile Store (Zustand)
 Manages user profile, background info, and uploaded resume
 ═══════════════════════════════════════════════════ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LLMProvider } from "@/lib/llmProviders";

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
 tier?: "free" | "pro" | "ultra" | "team";
 aiUsesThisMonth?: number;
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
 provider: LLMProvider;
 label: string;
 key: string;
 baseUrl?: string;
 model?: string;
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
 updateApiKeyConfig: (id: string, config: Pick<ApiKeyEntry, "baseUrl" | "model">) => void;
 getActiveApiKey: (provider: ApiKeyEntry["provider"]) => ApiKeyEntry | undefined;
 addWorkExperience: (entry: WorkExperienceEntry) => void;
 removeWorkExperience: (id: string) => void;
 addEducation: (entry: EducationEntry) => void;
 removeEducation: (id: string) => void;
 updateDisclosures: (updates: Partial<EmploymentDisclosures>) => void;
}

/**
 * Returns a blank profile for new users (signup).
 * First paint must not inherit placeholder data like "Brouard Madan".
 */
export function createEmptyProfile(fullName: string, email: string): UserProfile {
  return {
    fullName,
    email,
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
    tier: "free",
    aiUsesThisMonth: 0,
  };
}

export const useProfileStore = create<ProfileState>()(
 persist(
 (set, get) => ({
 profile: createEmptyProfile("", ""),
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
 const { parseUploadedResume } = await import("@/lib/resumeUploadPipeline");
 const result = await parseUploadedResume(file);
 if (!result.ok) {
 throw new Error(result.error);
 }
 const fileType = file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".docx") ? "docx" : "txt";
 const parsedText = [
 result.data.personal?.name,
 result.data.personal?.title,
 result.data.personal?.email,
 result.data.summary,
 ].filter(Boolean).join("\n");
 const uploaded: UploadedResume = {
 fileName: file.name,
 fileSize: file.size,
 uploadedAt: new Date().toISOString(),
 parsedText,
 fileType: fileType as "pdf" | "docx" | "txt",
 };

 const currentProfile = get().profile;
 const profileUpdates: Partial<UserProfile> = {};

 if (result.data.personal?.name) profileUpdates.fullName = result.data.personal.name;
 if (result.data.personal?.email) profileUpdates.email = result.data.personal.email;
 if (result.data.personal?.phone) profileUpdates.phone = result.data.personal.phone;
 if (result.data.personal?.location) profileUpdates.location = result.data.personal.location;
 if (result.data.personal?.linkedin) profileUpdates.linkedin = result.data.personal.linkedin;
 if (result.data.personal?.website) profileUpdates.website = result.data.personal.website;
 if (result.data.personal?.title) {
   profileUpdates.currentTitle = result.data.personal.title;
   profileUpdates.headline = result.data.personal.title;
 }
 if (result.data.summary) {
   profileUpdates.targetRoleSummary = result.data.summary;
 }
 if (result.data.experience && result.data.experience.length > 0) {
   if (!profileUpdates.currentCompany && result.data.experience[0].company) {
     profileUpdates.currentCompany = result.data.experience[0].company;
   }
   profileUpdates.workExperience = result.data.experience.map((exp, i) => ({
     id: `exp-${Date.now()}-${i}`,
     company: exp.company || "",
     role: exp.title || "",
     location: exp.location || "",
     startDate: exp.start_date || "",
     endDate: exp.end_date || "",
     isCurrent: !!exp.current,
     description: (exp.bullets || []).join("\n"),
   }));
 }
 if (result.data.education && result.data.education.length > 0) {
   profileUpdates.education = result.data.education.map((edu, i) => ({
     id: `edu-${Date.now()}-${i}`,
     school: edu.institution || "",
     degree: edu.degree || "",
     major: edu.field || "",
     graduationDate: edu.end_date || "",
   }));
 }
 if (result.data.skills && result.data.skills.length > 0) {
   const extractedSkills = result.data.skills
     .map((s) => (typeof s === "string" ? s : s.name))
     .filter(Boolean);
   profileUpdates.keySkills = Array.from(
     new Set([...currentProfile.keySkills, ...extractedSkills])
   );
 }

 set({
   uploadedResume: uploaded,
   profile: { ...currentProfile, ...profileUpdates },
 });
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
 updateApiKeyConfig: (id, config) => {
 set((state) => ({
 apiKeys: state.apiKeys.map((k) => (k.id === id ? { ...k, ...config } : k)),
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
 { name: "offerpath-profile", skipHydration: true }
 )
);
