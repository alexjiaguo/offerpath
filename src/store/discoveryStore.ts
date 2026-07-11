/* ═══════════════════════════════════════════════════
   OfferPath — Discovery Store (Zustand)
   Manages company discovery, job search, and scan runs
   ═══════════════════════════════════════════════════ */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MOCK_COMPANIES,
  MOCK_DISCOVERED_JOBS,
  DEFAULT_PROFILE,
  MOCK_SCAN_RUNS,
} from "./mockDiscoveryData";

// ── Types ───────────────────────────────────────────

export interface DiscoveredCompany {
  id: string;
  name: string;
  industry: string;
  hq: string;
  career_url: string;
  logo_emoji: string;
  employee_count: string;
  match_score: number;
  tier: number;
  notes: string;
  tags: string[];
}

export interface DiscoveredJob {
  id: string;
  company_id: string;
  company_name: string;
  title: string;
  location: string;
  type: string;
  level: string;
  salary_range: string;
  url: string;
  match_score: number;
  source: "career_page" | "web_search" | "referral" | "linkedin";
  description: string;
  posted_date: string;
  tags: string[];
  requirements: string[];
  saved?: boolean;
  dismissed?: boolean;
}

export interface SearchProfile {
  id: string;
  title: string;
  target_roles: string[];
  industries: string[];
  locations: string[];
  min_match_score: number;
  keywords: string[];
  experience_years: string;
  auto_scan_enabled: boolean;
  auto_scan_interval: "daily" | "weekly" | "biweekly";
  created_at: string;
  updated_at: string;
}

export interface ScanRun {
  id: string;
  profile_id: string;
  status: "pending" | "running" | "completed" | "failed";
  started_at: string;
  completed_at?: string;
  companies_scanned: number;
  new_jobs_found: number;
  total_matches: number;
  source: "career_pages" | "web_search" | "linkedin";
}

export type DiscoveryTab = "all" | "saved" | "companies" | "scans";
export type SortKey = "match_score" | "posted_date" | "company_name" | "title";

// ── Store Interface ─────────────────────────────────

export interface DiscoveryState {
  companies: DiscoveredCompany[];
  jobs: DiscoveredJob[];
  profile: SearchProfile;
  scanRuns: ScanRun[];

  // UI State
  activeTab: DiscoveryTab;
  searchQuery: string;
  sortBy: SortKey;
  filterIndustry: string;
  filterLocation: string;
  filterLevel: string;
  filterMinScore: number;

  // Actions
  setActiveTab: (tab: DiscoveryTab) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (key: SortKey) => void;
  setFilterIndustry: (industry: string) => void;
  setFilterLocation: (loc: string) => void;
  setFilterLevel: (level: string) => void;
  setFilterMinScore: (score: number) => void;
  toggleSaved: (jobId: string) => void;
  dismissJob: (jobId: string) => void;
  updateProfile: (updates: Partial<SearchProfile>) => void;
  addCompany: (company: Omit<DiscoveredCompany, "id">) => void;
  startScan: () => void;

  // Computed
  getFilteredJobs: () => DiscoveredJob[];
  getSavedJobs: () => DiscoveredJob[];
  getJobById: (id: string) => DiscoveredJob | undefined;
  getCompanyById: (id: string) => DiscoveredCompany | undefined;
  getJobsByCompany: (companyId: string) => DiscoveredJob[];
  getTopCompanies: (limit?: number) => DiscoveredCompany[];
  getUniqueIndustries: () => string[];
  getUniqueLocations: () => string[];
  getUniqueLevels: () => string[];
}

// ── Store ───────────────────────────────────────────

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
  companies: MOCK_COMPANIES,
  jobs: MOCK_DISCOVERED_JOBS,
  profile: DEFAULT_PROFILE,
  scanRuns: MOCK_SCAN_RUNS,

  // UI State
  activeTab: "all",
  searchQuery: "",
  sortBy: "match_score",
  filterIndustry: "",
  filterLocation: "",
  filterLevel: "",
  filterMinScore: 0,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (key) => set({ sortBy: key }),
  setFilterIndustry: (industry) => set({ filterIndustry: industry }),
  setFilterLocation: (loc) => set({ filterLocation: loc }),
  setFilterLevel: (level) => set({ filterLevel: level }),
  setFilterMinScore: (score) => set({ filterMinScore: score }),

  toggleSaved: (jobId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, saved: !j.saved } : j
      ),
    }));
  },

  dismissJob: (jobId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, dismissed: true } : j
      ),
    }));
  },

  updateProfile: (updates) => {
    set((state) => ({
      profile: { ...state.profile, ...updates, updated_at: new Date().toISOString() },
    }));
  },

  addCompany: (companyData) => {
    const newCompany: DiscoveredCompany = {
      ...companyData,
      id: `dc-${Date.now()}`,
    };
    set((state) => ({
      companies: [newCompany, ...state.companies],
    }));
  },

  startScan: () => {
    const newRun: ScanRun = {
      id: `sr-${Date.now()}`,
      profile_id: get().profile.id,
      status: "running",
      started_at: new Date().toISOString(),
      companies_scanned: 0,
      new_jobs_found: 0,
      total_matches: 0,
      source: "career_pages",
    };
    set((state) => ({ scanRuns: [newRun, ...state.scanRuns] }));

    // Simulate completion after 3 seconds
    setTimeout(() => {
      set((state) => ({
        scanRuns: state.scanRuns.map((sr) =>
          sr.id === newRun.id
            ? {
                ...sr,
                status: "completed" as const,
                completed_at: new Date().toISOString(),
                companies_scanned: 30,
                new_jobs_found: Math.floor(Math.random() * 5) + 2,
                total_matches: 30,
              }
            : sr
        ),
      }));
    }, 3000);
  },

  // Computed
  getFilteredJobs: () => {
    const state = get();
    let filtered = state.jobs.filter((j) => !j.dismissed);

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company_name.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (state.filterIndustry) {
      const companyIds = new Set(
        state.companies
          .filter((c) => c.industry === state.filterIndustry || c.tags.includes(state.filterIndustry))
          .map((c) => c.id)
      );
      filtered = filtered.filter((j) => companyIds.has(j.company_id));
    }

    if (state.filterLocation) {
      filtered = filtered.filter((j) =>
        j.location.toLowerCase().includes(state.filterLocation.toLowerCase())
      );
    }

    if (state.filterLevel) {
      filtered = filtered.filter((j) => j.level === state.filterLevel);
    }

    if (state.filterMinScore > 0) {
      filtered = filtered.filter((j) => j.match_score >= state.filterMinScore);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case "match_score":
          return b.match_score - a.match_score;
        case "posted_date":
          return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
        case "company_name":
          return a.company_name.localeCompare(b.company_name);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return b.match_score - a.match_score;
      }
    });

    return filtered;
  },

  getSavedJobs: () => get().jobs.filter((j) => j.saved && !j.dismissed),

  getJobById: (id) => get().jobs.find((j) => j.id === id),

  getCompanyById: (id) => get().companies.find((c) => c.id === id),

  getJobsByCompany: (companyId) =>
    get()
      .jobs.filter((j) => j.company_id === companyId && !j.dismissed)
      .sort((a, b) => b.match_score - a.match_score),

  getTopCompanies: (limit = 10) =>
    [...get().companies].sort((a, b) => b.match_score - a.match_score).slice(0, limit),

  getUniqueIndustries: () => {
    const industries = new Set(get().companies.map((c) => c.industry));
    return Array.from(industries).sort();
  },

  getUniqueLocations: () => {
    const locs = new Set(get().jobs.map((j) => {
      // Extract primary location
      const parts = j.location.split("/").map((p) => p.trim());
      return parts[0];
    }));
    return Array.from(locs).sort();
  },

  getUniqueLevels: () => {
    const levels = new Set(get().jobs.map((j) => j.level));
    return Array.from(levels).sort();
  },
    }),
  {
    name: "offerpath-discovery",
    partialize: (state) => ({
      companies: state.companies,
      jobs: state.jobs,
      profile: state.profile,
      scanRuns: state.scanRuns,
      activeTab: state.activeTab,
    }),
  }
));
