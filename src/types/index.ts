/* ═══════════════════════════════════════════════════
   OfferPath — Core Type Definitions
   ═══════════════════════════════════════════════════ */

// ── User & Profile ──────────────────────────────────

export type Tier = "free" | "pro" | "team";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  tier: Tier;
  ai_uses_this_week: number;
  week_reset_at: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  preferences: UserPreferences;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  default_template?: string;
  default_provider?: LLMProvider;
  notifications_enabled?: boolean;
}

// ── AI / LLM ────────────────────────────────────────

export type LLMProvider = "openai" | "gemini" | "deepseek";

// ── Resume ──────────────────────────────────────────

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  data: ResumeData;
  template: string;
  theme: ResumeTheme;
  section_order: SectionKey[];
  section_visibility: Record<string, Record<SectionKey, boolean>>;
  is_base: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeData {
  personal?: PersonalInfo;
  summary?: string;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  skills?: SkillItem[];
  technicalSkills?: TechnicalSkillCategory[];
  certifications?: string[];
  projects?: ProjectEntry[];
  languages?: string[];
  [key: string]: unknown;
}

export interface PersonalInfo {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  photo_url?: string;
  portfolio_url?: string;
  portfolio_label?: string;
  visa_status?: string;
  visa_label?: string;
}

export interface SkillItem {
  id: string;
  name: string;
  isHighlighted: boolean;
}

export interface TechnicalSkillCategory {
  id: string;
  category: string;
  skills: string;
}

export interface ExperienceEntry {
  company: string;
  title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current?: boolean;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  url?: string;
  tech?: string[];
}

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "technicalSkills"
  | "languages"
  | "certifications"
  | "projects"
  | "photo"
  | "portfolio"
  | "visaStatus";

export const DEFAULT_SECTION_VISIBILITY: Record<SectionKey, boolean> = {
  summary: true,
  experience: true,
  education: true,
  skills: true,
  technicalSkills: true,
  languages: true,
  certifications: true,
  projects: true,
  photo: true,
  portfolio: true,
  visaStatus: true,
};

export interface ResumeTheme {
  preset?: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  baseFontSize: number;
  headerFontSize: number;
  sectionTitleSize: number;
  companyFontSize: number;
  lineHeight: number;
  pagePadding: number;
  sectionSpacing: number;
  itemSpacing: number;
  // Sidebar (PremiumHeadshot, ElegantTwoColumn)
  sidebarBg?: string;
  sidebarText?: string;
  sidebarAccent?: string;
  sidebarWidth?: number;
  headshotSize?: number;
  headshotRadius?: number;
  // Clean Layout
  summaryBg?: string;
  // ATS Executive
  metricsBg?: string;
  dividerColor?: string;
  // Page break
  showPageBreak?: boolean;
  [key: string]: unknown;
}

// ── Pipeline / Jobs ─────────────────────────────────

export type JobStatus =
  | "new"
  | "evaluated"
  | "applied"
  | "interviewing"
  | "offered"
  | "rejected"
  | "discarded"
  | "archived";

export interface Company {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  career_url?: string;
  headquarters?: string;
  notes?: string;
  tier?: number;
  research_brief?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  company_id?: string;
  company?: Company;
  title: string;
  description?: string;
  location?: string;
  url?: string;
  status: JobStatus;
  score?: number;
  tier?: number;
  archetype?: string;
  evaluation?: JobEvaluation;
  resume_id?: string;
  resume?: Resume;
  applied_at?: string;
  interviewed_at?: string;
  offered_at?: string;
  salary_range?: string;
  comp_details?: CompDetails;
  kanban_order: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface JobEvaluation {
  score: number;
  tier: number;
  archetype: string;
  fit_reasons: string[];
  concerns: string[];
  key_requirements: string[];
  match_summary: string;
}

export interface CompDetails {
  base_salary?: string;
  equity?: string;
  bonus?: string;
  benefits?: string[];
  total_comp?: string;
}

// ── Interview Prep ──────────────────────────────────

export interface InterviewPrep {
  id: string;
  user_id: string;
  job_id: string;
  job?: Job;
  company_research?: string;
  role_analysis?: string;
  questions: PrepQuestion[];
  created_at: string;
  updated_at: string;
}

export interface PrepQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  suggested_answer: string;
  user_answer?: string;
  notes?: string;
}

export type QuestionCategory =
  | "behavioral"
  | "technical"
  | "case"
  | "situational"
  | "culture"
  | "leadership"
  | "product";

export interface MockSession {
  id: string;
  user_id: string;
  job_id?: string;
  transcript: MockMessage[];
  score?: number;
  feedback?: MockFeedback;
  duration_seconds?: number;
  created_at: string;
}

export interface MockMessage {
  role: "interviewer" | "candidate";
  message: string;
  timestamp: string;
}

export interface MockFeedback {
  overall_score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
  category_scores?: Record<string, number>;
}

// ── Story Bank ──────────────────────────────────────

export interface Story {
  id: string;
  user_id: string;
  title: string;
  competency: string;
  situation?: string;
  task?: string;
  action?: string;
  result?: string;
  metrics?: string;
  tags: string[];
  used_count: number;
  created_at: string;
  updated_at: string;
}

// ── Kanban ──────────────────────────────────────────

export interface KanbanColumn {
  id: JobStatus;
  title: string;
  jobs: Job[];
}

// ── Module Navigation ───────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
