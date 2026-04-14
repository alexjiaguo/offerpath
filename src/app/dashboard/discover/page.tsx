"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Compass,
  Building2,
  Bookmark,
  BookmarkCheck,
  ScanLine,
  Filter,
  ChevronDown,
  MapPin,
  Briefcase,
  Clock,
  TrendingUp,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  Play,
  CheckCircle,
  Loader2,
  X,
  Globe,
  Zap,
  Target,
  Plus,
  Pencil,
  Save,
} from "lucide-react";
import { useDiscoveryStore } from "@/store/discoveryStore";
import type { DiscoveryTab, SortKey, DiscoveredCompany } from "@/store/discoveryStore";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   Discovery Hub — Unified job search & company discovery
   ═══════════════════════════════════════════════════ */

// ── Match Score Badge ────────────────────────────────

function MatchBadge({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const color =
    score >= 90 ? "text-emerald-400 bg-emerald-500/10" :
    score >= 80 ? "text-blue-400 bg-blue-500/10" :
    score >= 70 ? "text-amber-400 bg-amber-500/10" :
    "text-zinc-600 dark:text-gray-400 bg-gray-500/10";

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full font-bold",
      color,
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
    )}>
      <Target className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      {score}%
    </span>
  );
}

// ── Company Card ─────────────────────────────────────

function CompanyCard({ company }: { company: DiscoveredCompany }) {
  const { getJobsByCompany } = useDiscoveryStore();
  const jobCount = getJobsByCompany(company.id).length;

  return (
    <div className="glass-hover rounded-xl p-5 group">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-surface-200 flex items-center justify-center text-xl flex-shrink-0">
          {company.logo_emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold truncate">{company.name}</h3>
            <MatchBadge score={company.match_score} />
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-gray-500 mb-2 flex-wrap">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{company.industry}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{company.hq}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{company.employee_count}</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-gray-500 line-clamp-2 mb-3">{company.notes}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {company.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-zinc-600 dark:text-gray-400 font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
        <span className="text-[10px] text-zinc-700 dark:text-zinc-400 dark:text-gray-600">
          {jobCount} open {jobCount === 1 ? "role" : "roles"} matched
        </span>
        <div className="flex gap-2">
          <a href={company.career_url} target="_blank" rel="noopener" className="text-xs text-zinc-500 dark:text-gray-500 hover:text-brand-400 transition-colors flex items-center gap-1">
            Career Page <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Job Discovery Card ───────────────────────────────

function JobCard({ jobId }: { jobId: string }) {
  const { getJobById, toggleSaved, dismissJob } = useDiscoveryStore();
  const job = getJobById(jobId);
  if (!job) return null;

  return (
    <div className={cn(
      "glass-hover rounded-xl p-5 group relative transition-opacity",
      job.dismissed && "opacity-40"
    )}>
      {/* Source badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className={cn(
          "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
          job.source === "career_page" ? "bg-blue-500/10 text-blue-300" :
          job.source === "web_search" ? "bg-purple-500/10 text-purple-300" :
          "bg-green-500/10 text-green-300"
        )}>
          {job.source === "career_page" ? "Career Page" : job.source === "web_search" ? "Web Search" : job.source}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-200 flex items-center justify-center text-lg flex-shrink-0">
          {MOCK_COMPANY_EMOJI[job.company_id] || "🏢"}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/dashboard/discover/${job.id}`} className="group/link">
            <h3 className="text-sm font-semibold group-hover/link:text-brand-400 transition-colors truncate pr-20">
              {job.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-gray-500 mt-1 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-zinc-600 dark:text-gray-400">{job.company_name}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.level}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-500 dark:text-gray-500 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {job.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 font-medium">{tag}</span>
        ))}
        {job.salary_range && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-medium">{job.salary_range}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <MatchBadge score={job.match_score} size="md" />
          <span className="text-[10px] text-zinc-700 dark:text-zinc-400 dark:text-gray-600 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(job.posted_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSaved(job.id)}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              job.saved ? "text-brand-400 bg-brand-500/10" : "text-zinc-400 dark:text-gray-600 hover:text-brand-400 hover:bg-brand-500/10"
            )}
          >
            {job.saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button
            onClick={() => dismissJob(job.id)}
            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <Link
            href={`/dashboard/discover/${job.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 transition-all"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// Quick emoji lookup for company logos
const MOCK_COMPANY_EMOJI: Record<string, string> = {
  dc1: "🔍", dc2: "🍎", dc3: "📘", dc4: "📦", dc5: "🪟",
  dc6: "💳", dc7: "🟢", dc8: "🎵", dc9: "🛍️", dc10: "🐶",
  dc11: "🏡", dc12: "🎧", dc13: "🚗", dc14: "🎬", dc15: "☁️",
  dc16: "🪙", dc17: "🌊", dc18: "📝", dc19: "🎨", dc20: "❄️",
  dc21: "🛵", dc22: "🔵", dc23: "🚪", dc24: "✏️", dc25: "💰",
  dc26: "💸", dc27: "🛒", dc28: "📞", dc29: "🔮", dc30: "🐧",
};

// ── Tabs ─────────────────────────────────────────────

const TABS: { id: DiscoveryTab; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Leads", icon: Compass },
  { id: "saved", label: "Saved", icon: BookmarkCheck },
  { id: "companies", label: "Companies", icon: Building2 },
  { id: "scans", label: "Scan History", icon: ScanLine },
];

// ── Sort Options ─────────────────────────────────────

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "match_score", label: "Match Score" },
  { value: "posted_date", label: "Date Posted" },
  { value: "company_name", label: "Company" },
  { value: "title", label: "Job Title" },
];

// ── Main Component ───────────────────────────────────

export default function DiscoverPage() {
  const store = useDiscoveryStore();
  const [showFilters, setShowFilters] = useState(false);
  const [showPrefsEditor, setShowPrefsEditor] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);

  // Preferences form state
  const [prefsForm, setPrefsForm] = useState({
    target_roles: store.profile.target_roles.join(", "),
    industries: store.profile.industries.join(", "),
    locations: store.profile.locations.join(", "),
    keywords: store.profile.keywords.join(", "),
    min_match_score: store.profile.min_match_score,
    experience_years: store.profile.experience_years,
    auto_scan_enabled: store.profile.auto_scan_enabled,
    auto_scan_interval: store.profile.auto_scan_interval,
  });

  // Add Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    hq: "",
    career_url: "",
    logo_emoji: "\ud83c\udfe2",
    employee_count: "",
    tier: 2,
    notes: "",
    tags: "",
  });

  const handleSavePrefs = () => {
    store.updateProfile({
      target_roles: prefsForm.target_roles.split(",").map((s) => s.trim()).filter(Boolean),
      industries: prefsForm.industries.split(",").map((s) => s.trim()).filter(Boolean),
      locations: prefsForm.locations.split(",").map((s) => s.trim()).filter(Boolean),
      keywords: prefsForm.keywords.split(",").map((s) => s.trim()).filter(Boolean),
      min_match_score: prefsForm.min_match_score,
      experience_years: prefsForm.experience_years,
      auto_scan_enabled: prefsForm.auto_scan_enabled,
      auto_scan_interval: prefsForm.auto_scan_interval,
    });
    setShowPrefsEditor(false);
  };

  const handleAddCompany = () => {
    if (!companyForm.name.trim()) return;
    store.addCompany({
      name: companyForm.name.trim(),
      industry: companyForm.industry.trim() || "Technology",
      hq: companyForm.hq.trim() || "Unknown",
      career_url: companyForm.career_url.trim(),
      logo_emoji: companyForm.logo_emoji || "\ud83c\udfe2",
      employee_count: companyForm.employee_count.trim() || "Unknown",
      match_score: Math.floor(Math.random() * 20) + 70,
      tier: companyForm.tier,
      notes: companyForm.notes.trim(),
      tags: companyForm.tags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setCompanyForm({ name: "", industry: "", hq: "", career_url: "", logo_emoji: "\ud83c\udfe2", employee_count: "", tier: 2, notes: "", tags: "" });
    setShowAddCompany(false);
  };

  const filteredJobs = store.getFilteredJobs();
  const savedJobs = store.getSavedJobs();
  const topCompanies = store.getTopCompanies(30);
  const industries = store.getUniqueIndustries();
  const locations = store.getUniqueLocations();
  const levels = store.getUniqueLevels();
  const latestScan = store.scanRuns[0];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-brand-400" />
          <div>
            <h1 className="text-2xl font-bold">Job Discovery</h1>
            <p className="text-xs text-zinc-500 dark:text-gray-500 mt-0.5">
              {filteredJobs.length} leads from {store.companies.length} companies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => store.startScan()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {latestScan?.status === "running" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Scan</>
            )}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Leads", value: filteredJobs.length, icon: Compass, color: "text-brand-400" },
          { label: "Saved", value: savedJobs.length, icon: BookmarkCheck, color: "text-emerald-400" },
          { label: "Companies", value: store.companies.length, icon: Building2, color: "text-blue-400" },
          { label: "Avg. Match", value: `${Math.round(filteredJobs.reduce((a, j) => a + j.match_score, 0) / (filteredJobs.length || 1))}%`, icon: TrendingUp, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-3">
            <stat.icon className={cn("w-5 h-5", stat.color)} />
            <div>
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-[10px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scan Status Banner */}
      {latestScan && (
        <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {latestScan.status === "running" ? (
              <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
            ) : latestScan.status === "completed" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <ScanLine className="w-5 h-5 text-zinc-600 dark:text-gray-400" />
            )}
            <div>
              <div className="text-sm font-medium">
                {latestScan.status === "running" ? "Scan in progress..." : "Last scan completed"}
              </div>
              <div className="text-xs text-zinc-500 dark:text-gray-500">
                {latestScan.status === "completed"
                  ? `${latestScan.companies_scanned} companies scanned · ${latestScan.new_jobs_found} new leads · ${new Date(latestScan.completed_at!).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                  : "Scanning career pages and job boards..."}
              </div>
            </div>
          </div>
          {store.profile.auto_scan_enabled && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" /> Auto-scan {store.profile.auto_scan_interval}
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-white/[0.04] pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => store.setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all",
              store.activeTab === tab.id
                ? "text-brand-400 border-brand-400"
                : "text-zinc-500 dark:text-gray-500 border-transparent hover:text-zinc-700 dark:hover:text-gray-300"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === "saved" && savedJobs.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-300 font-bold">
                {savedJobs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      {(store.activeTab === "all" || store.activeTab === "saved") && (
        <div className="mb-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-gray-500" />
              <input
                type="text"
                value={store.searchQuery}
                onChange={(e) => store.setSearchQuery(e.target.value)}
                placeholder="Search jobs by title, company, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                showFilters ? "bg-brand-500/10 text-brand-400" : "bg-surface-100 text-zinc-600 dark:text-gray-400 hover:text-zinc-700 dark:hover:text-gray-300"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={cn("w-3 h-3 transition-transform", showFilters && "rotate-180")} />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-100 text-sm text-zinc-600 dark:text-gray-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={store.sortBy}
                onChange={(e) => store.setSortBy(e.target.value as SortKey)}
                className="bg-transparent text-sm text-zinc-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="glass rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
              <div>
                <label className="text-[10px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-medium mb-1 block">Industry</label>
                <select
                  value={store.filterIndustry}
                  onChange={(e) => store.setFilterIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-200 text-sm text-zinc-700 dark:text-gray-300 border border-white/[0.04] focus:outline-none"
                >
                  <option value="">All Industries</option>
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-medium mb-1 block">Location</label>
                <select
                  value={store.filterLocation}
                  onChange={(e) => store.setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-200 text-sm text-zinc-700 dark:text-gray-300 border border-white/[0.04] focus:outline-none"
                >
                  <option value="">All Locations</option>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-medium mb-1 block">Level</label>
                <select
                  value={store.filterLevel}
                  onChange={(e) => store.setFilterLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-200 text-sm text-zinc-700 dark:text-gray-300 border border-white/[0.04] focus:outline-none"
                >
                  <option value="">All Levels</option>
                  {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 dark:text-gray-500 uppercase tracking-wider font-medium mb-1 block">Min Match Score</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={store.filterMinScore}
                    onChange={(e) => store.setFilterMinScore(Number(e.target.value))}
                    className="flex-1 accent-brand-400"
                  />
                  <span className="text-xs text-zinc-600 dark:text-gray-400 font-mono w-8 text-right">{store.filterMinScore}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: All Leads ── */}
      {store.activeTab === "all" && (
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <Search className="w-8 h-8 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-zinc-600 dark:text-gray-400 mb-1">No matches found</h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-400 dark:text-gray-600">Try adjusting your filters or run a new scan.</p>
            </div>
          ) : (
            filteredJobs.map((job) => <JobCard key={job.id} jobId={job.id} />)
          )}
        </div>
      )}

      {/* ── Tab: Saved ── */}
      {store.activeTab === "saved" && (
        <div className="space-y-3">
          {savedJobs.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <Bookmark className="w-8 h-8 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-zinc-600 dark:text-gray-400 mb-1">No saved leads yet</h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-400 dark:text-gray-600">Bookmark interesting jobs to save them here.</p>
            </div>
          ) : (
            savedJobs.map((job) => <JobCard key={job.id} jobId={job.id} />)
          )}
        </div>
      )}

      {/* ── Tab: Companies ── */}
      {store.activeTab === "companies" && (
        <div>
          {/* Add Company button */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-zinc-500 dark:text-gray-500">{topCompanies.length} companies tracked</p>
            <button
              onClick={() => setShowAddCompany(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg gradient-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Company
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {topCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Scan History ── */}
      {store.activeTab === "scans" && (
        <div className="space-y-3">
          {/* Search Profile summary */}
          <div className="glass rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold">Search Profile</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-medium">Active</span>
              </div>
              <button
                onClick={() => {
                  setPrefsForm({
                    target_roles: store.profile.target_roles.join(", "),
                    industries: store.profile.industries.join(", "),
                    locations: store.profile.locations.join(", "),
                    keywords: store.profile.keywords.join(", "),
                    min_match_score: store.profile.min_match_score,
                    experience_years: store.profile.experience_years,
                    auto_scan_enabled: store.profile.auto_scan_enabled,
                    auto_scan_interval: store.profile.auto_scan_interval,
                  });
                  setShowPrefsEditor(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200 text-zinc-600 dark:text-gray-400 hover:text-brand-300 text-xs font-medium transition-all"
              >
                <Pencil className="w-3 h-3" />
                Edit Preferences
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-zinc-500 dark:text-gray-500">Target Roles:</span>
                <div className="text-zinc-700 dark:text-gray-300 mt-0.5">{store.profile.target_roles.join(", ")}</div>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-gray-500">Industries:</span>
                <div className="text-zinc-700 dark:text-gray-300 mt-0.5">{store.profile.industries.join(", ")}</div>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-gray-500">Locations:</span>
                <div className="text-zinc-700 dark:text-gray-300 mt-0.5">{store.profile.locations.join(", ")}</div>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-gray-500">Min Match:</span>
                <div className="text-zinc-700 dark:text-gray-300 mt-0.5">{store.profile.min_match_score}%</div>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-gray-500">Keywords:</span>
                <div className="text-zinc-700 dark:text-gray-300 mt-0.5">{store.profile.keywords.slice(0, 3).join(", ")}...</div>
              </div>
              <div>
                <span className="text-zinc-500 dark:text-gray-500">Auto-Scan:</span>
                <div className="text-zinc-700 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                  {store.profile.auto_scan_enabled ? (
                    <><Globe className="w-3 h-3 text-emerald-400" /> {store.profile.auto_scan_interval}</>
                  ) : "Disabled"}
                </div>
              </div>
            </div>
          </div>

          {/* Scan runs */}
          {store.scanRuns.map((run) => (
            <div key={run.id} className="glass-hover rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {run.status === "running" ? (
                  <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                ) : run.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ScanLine className="w-5 h-5 text-zinc-500 dark:text-gray-500" />
                )}
                <div>
                  <div className="text-sm font-medium">
                    {run.source === "career_pages" ? "Career Pages Scan" : "Web Search Scan"}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-gray-500 mt-0.5">
                    {new Date(run.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-gray-500">
                <span>{run.companies_scanned} companies</span>
                <span className="text-brand-300 font-medium">+{run.new_jobs_found} new</span>
                <span>{run.total_matches} total</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium",
                  run.status === "completed" ? "bg-emerald-500/10 text-emerald-300" :
                  run.status === "running" ? "bg-brand-500/10 text-brand-300" :
                  "bg-red-500/10 text-red-300"
                )}>
                  {run.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ═══ Modal: Edit Search Preferences ═══ */}
      {showPrefsEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-50 border border-white/[0.08] rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h2 className="text-base font-semibold">Edit Search Preferences</h2>
              </div>
              <button onClick={() => setShowPrefsEditor(false)} className="p-1.5 rounded-lg text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.04] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Target Roles</label>
                <input type="text" value={prefsForm.target_roles} onChange={(e) => setPrefsForm({ ...prefsForm, target_roles: e.target.value })} placeholder="e.g. Product Manager, PM Lead" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all" />
                <p className="text-[10px] text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mt-1">Comma-separated</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Industries</label>
                <input type="text" value={prefsForm.industries} onChange={(e) => setPrefsForm({ ...prefsForm, industries: e.target.value })} placeholder="e.g. Technology, Ad Tech, Fintech" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Locations</label>
                <input type="text" value={prefsForm.locations} onChange={(e) => setPrefsForm({ ...prefsForm, locations: e.target.value })} placeholder="e.g. Singapore, San Francisco, Remote" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Keywords</label>
                <input type="text" value={prefsForm.keywords} onChange={(e) => setPrefsForm({ ...prefsForm, keywords: e.target.value })} placeholder="e.g. AI, ML, revenue, platform" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Experience Level</label>
                  <select value={prefsForm.experience_years} onChange={(e) => setPrefsForm({ ...prefsForm, experience_years: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 focus:outline-none focus:border-brand-500/40 transition-all appearance-none cursor-pointer">
                    <option value="0-2">0–2 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5-8">5–8 years</option>
                    <option value="8-12">8–12 years</option>
                    <option value="12+">12+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Min Match Score</label>
                  <div className="flex items-center gap-2">
                    <input type="range" min={0} max={100} value={prefsForm.min_match_score} onChange={(e) => setPrefsForm({ ...prefsForm, min_match_score: Number(e.target.value) })} className="flex-1 accent-brand-400" />
                    <span className="text-xs text-zinc-600 dark:text-gray-400 font-mono w-8 text-right">{prefsForm.min_match_score}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Auto-Scan</p>
                    <p className="text-[10px] text-zinc-500 dark:text-gray-500">Automatically scan for new jobs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prefsForm.auto_scan_enabled && (
                    <select value={prefsForm.auto_scan_interval} onChange={(e) => setPrefsForm({ ...prefsForm, auto_scan_interval: e.target.value as "daily" | "weekly" | "biweekly" })} className="px-2 py-1 rounded-lg bg-surface-200 text-xs text-zinc-700 dark:text-gray-300 border border-white/[0.04] focus:outline-none">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                    </select>
                  )}
                  <button onClick={() => setPrefsForm({ ...prefsForm, auto_scan_enabled: !prefsForm.auto_scan_enabled })} className={cn("w-10 h-6 rounded-full transition-all relative", prefsForm.auto_scan_enabled ? "bg-brand-500" : "bg-surface-300")}>
                    <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", prefsForm.auto_scan_enabled ? "left-5" : "left-1")} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPrefsEditor(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-gray-400 bg-surface-200 hover:bg-surface-300 transition-all">Cancel</button>
              <button onClick={handleSavePrefs} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium gradient-brand text-white hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Add Company ═══ */}
      {showAddCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-50 border border-white/[0.08] rounded-2xl w-full max-w-lg mx-4 p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-400" />
                <h2 className="text-base font-semibold">Add Company</h2>
              </div>
              <button onClick={() => setShowAddCompany(false)} className="p-1.5 rounded-lg text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.04] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Emoji</label>
                  <input type="text" value={companyForm.logo_emoji} onChange={(e) => setCompanyForm({ ...companyForm, logo_emoji: e.target.value })} className="w-14 px-2 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-lg text-center focus:outline-none focus:border-brand-500/40 transition-all" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Company Name *</label>
                  <input type="text" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="e.g. Stripe" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Industry</label>
                  <input type="text" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} placeholder="e.g. Fintech" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">HQ Location</label>
                  <input type="text" value={companyForm.hq} onChange={(e) => setCompanyForm({ ...companyForm, hq: e.target.value })} placeholder="e.g. San Francisco, CA" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Employee Count</label>
                  <input type="text" value={companyForm.employee_count} onChange={(e) => setCompanyForm({ ...companyForm, employee_count: e.target.value })} placeholder="e.g. 5,000+" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Tier</label>
                  <select value={companyForm.tier} onChange={(e) => setCompanyForm({ ...companyForm, tier: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 focus:outline-none focus:border-brand-500/40 transition-all appearance-none cursor-pointer">
                    <option value={1}>Tier 1 — Dream</option>
                    <option value={2}>Tier 2 — Strong</option>
                    <option value={3}>Tier 3 — Good Fit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Career Page URL</label>
                <input type="url" value={companyForm.career_url} onChange={(e) => setCompanyForm({ ...companyForm, career_url: e.target.value })} placeholder="https://careers.stripe.com" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Tags</label>
                <input type="text" value={companyForm.tags} onChange={(e) => setCompanyForm({ ...companyForm, tags: e.target.value })} placeholder="e.g. payments, API, developer tools" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all" />
                <p className="text-[10px] text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mt-1">Comma-separated</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-gray-400 mb-1.5">Notes</label>
                <textarea value={companyForm.notes} onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })} rows={2} placeholder="Why this company interests you..." className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-brand-500/40 transition-all resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddCompany(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-gray-400 bg-surface-200 hover:bg-surface-300 transition-all">Cancel</button>
              <button onClick={handleAddCompany} disabled={!companyForm.name.trim()} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all", companyForm.name.trim() ? "gradient-brand text-white hover:opacity-90" : "bg-surface-300 text-zinc-400 dark:text-gray-600 cursor-not-allowed")}>
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
