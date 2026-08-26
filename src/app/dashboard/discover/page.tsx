"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowsDownUp, ArrowsClockwise, BookmarkSimple, ArrowSquareOut, Briefcase, Buildings, Target, CheckCircle, CaretDown, Clock, Compass, Funnel, FloppyDisk, MapPin, Globe, TrendUp, Lightning, Pencil, Play, Plus, MagnifyingGlass, Sparkle, Barcode, X } from '@phosphor-icons/react';
import { useDiscoveryStore } from "@/store/discoveryStore";
import { usePipelineStore } from "@/store/pipelineStore";
import type { DiscoveryTab, SortKey, DiscoveredCompany } from "@/store/discoveryStore";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "@/i18n";

/* ═══════════════════════════════════════════════════
   Discovery Hub — Unified job search & company discovery
   ═══════════════════════════════════════════════════ */

// ── Match Score Badge ────────────────────────────────

function MatchBadge({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const color =
    score >= 90 ? "text-emerald-400 bg-emerald-500/10" :
    score >= 80 ? "text-blue-400 bg-blue-500/10" :
    score >= 70 ? "text-amber-400 bg-amber-500/10" :
    "text-surface-300 bg-surface-300/10";

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-md font-bold",
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
  const { isZh } = useTranslation();
  const jobCount = useDiscoveryStore(
    (s) => s.jobs.filter((j) => j.company_id === company.id).length
  );

  return (
    <div className="card-editorial rounded-xl p-5 group">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-surface-200 flex items-center justify-center text-xl flex-shrink-0">
          {company.logo_emoji || company.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold truncate">{company.name}</h3>
            <MatchBadge score={company.match_score} />
          </div>
          <div className="flex items-center gap-3 text-xs text-surface-300 mb-2 flex-wrap">
            <span className="flex items-center gap-1"><Buildings className="w-3 h-3" />{company.industry}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{company.hq}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{company.employee_count}</span>
          </div>
          <p className="text-xs text-surface-300 line-clamp-2 mb-3">{company.notes}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {company.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-surface-300 font-medium">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
        <span className="text-[10px] text-surface-400">
          {isZh ? `已匹配 ${jobCount} 个在招岗位` : `${jobCount} open ${jobCount === 1 ? "role" : "roles"} matched`}
        </span>
        <div className="flex gap-2">
          <a href={company.career_url} target="_blank" rel="noopener" className="text-xs text-surface-300 hover:text-brand-400 transition-colors flex items-center gap-1">
            {isZh ? "招聘官网" : "Career Page"} <ArrowSquareOut className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Job Discovery Card ───────────────────────────────

function JobCard({ jobId }: { jobId: string }) {
  const { isZh } = useTranslation();
  const job = useDiscoveryStore((s) => s.jobs.find((j) => j.id === jobId));
  const toggleSaved = useDiscoveryStore((s) => s.toggleSaved);
  const dismissJob = useDiscoveryStore((s) => s.dismissJob);
  const setAddJobDialogOpen = usePipelineStore((s) => s.setAddJobDialogOpen);
  const setAddJobPrefill = usePipelineStore((s) => s.setAddJobPrefill);

  if (!job) return null;

  const trackDiscoveredJob = () => {
    setAddJobPrefill({
      title: job.title,
      company: {
        id: `prefill-${job.id}`,
        user_id: "demo",
        name: job.company_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      location: job.location,
      url: job.url || undefined,
      salary_range: job.salary_range || undefined,
      description: job.description || undefined,
    });
    setAddJobDialogOpen(true);
  };

  return (
    <div className={cn(
      "card-editorial rounded-xl p-5 group relative transition-opacity",
      job.dismissed && "opacity-40"
    )}>
      {/* Source badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className={cn(
          "text-[9px] px-1.5 py-0.5 rounded-md font-medium",
          job.source === "career_page" ? "bg-blue-500/10 text-blue-300" :
          job.source === "web_search" ? "bg-purple-500/10 text-purple-300" :
          "bg-green-500/10 text-green-300"
        )}>
          {job.source === "career_page" ? (isZh ? "官网直聘" : "Career Page") : job.source === "web_search" ? (isZh ? "全网抓取" : "Web Search") : job.source}
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
          <div className="flex items-center gap-3 text-xs text-surface-300 mt-1 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-surface-300">{job.company_name}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.level}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-surface-300 mt-3 line-clamp-2 leading-relaxed">{(job.description || (isZh ? "暂无详细描述" : "No description"))}</p>

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {(job.tags || []).slice(0, 4).map((tag) => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 font-medium">{tag}</span>
        ))}
        {job.salary_range && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-medium">{job.salary_range}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-3">
          <MatchBadge score={job.match_score} size="md" />
          <span className="text-[10px] text-surface-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(job.posted_date).toLocaleDateString(isZh ? "zh-CN" : "en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => trackDiscoveredJob()}
            title={isZh ? "加入求职看板" : "Track this job"}
            className={cn(
              "p-1.5 rounded-lg transition-all text-surface-300 hover:text-surface-400 hover:bg-surface-100"
            )}
          >
            <Briefcase className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleSaved(job.id)}
            aria-label={job.saved ? (isZh ? "取消收藏" : "Remove bookmark") : (isZh ? "收藏职位" : "Save job")}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              job.saved ? "text-brand-400 bg-brand-500/10" : "text-surface-300 hover:text-brand-400 hover:bg-brand-500/10"
            )}
          >
            {job.saved ? <BookmarkSimple weight="fill" className="w-4 h-4" /> : <BookmarkSimple className="w-4 h-4" />}
          </button>
          <button
            onClick={() => dismissJob(job.id)}
            aria-label={isZh ? "忽略此职位" : "Dismiss job"}
            className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <Link
            href={`/dashboard/discover/${job.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 transition-all"
          >
            {isZh ? "查看详情" : "View Details"}
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

export default function DiscoverPage() {
  const { t, isZh } = useTranslation();
  const companies = useDiscoveryStore((s) => s.companies);
  const jobs = useDiscoveryStore((s) => s.jobs);
  const scanRuns = useDiscoveryStore((s) => s.scanRuns);
  const profile = useDiscoveryStore((s) => s.profile);
  const activeTab = useDiscoveryStore((s) => s.activeTab);
  const searchQuery = useDiscoveryStore((s) => s.searchQuery);
  const sortBy = useDiscoveryStore((s) => s.sortBy);
  const filterIndustry = useDiscoveryStore((s) => s.filterIndustry);
  const filterLocation = useDiscoveryStore((s) => s.filterLocation);
  const filterLevel = useDiscoveryStore((s) => s.filterLevel);
  const filterMinScore = useDiscoveryStore((s) => s.filterMinScore);
  const scanLive = useDiscoveryStore((s) => s.scanLive);

  const handleScan = async () => {
    const result = await scanLive();
    if (!result.ok) {
      toast.error(result.error ?? "Live scan failed.");
      return;
    }
    toast.success(`${result.added ?? 0} new jobs pulled from career pages.`);
    if (result.errors?.length) {
      toast.message(result.errors.slice(0, 3).join("\n"));
    }
  };
  const setActiveTab = useDiscoveryStore((s) => s.setActiveTab);
  const setSearchQuery = useDiscoveryStore((s) => s.setSearchQuery);
  const setSortBy = useDiscoveryStore((s) => s.setSortBy);
  const setFilterIndustry = useDiscoveryStore((s) => s.setFilterIndustry);
  const setFilterLocation = useDiscoveryStore((s) => s.setFilterLocation);
  const setFilterLevel = useDiscoveryStore((s) => s.setFilterLevel);
  const setFilterMinScore = useDiscoveryStore((s) => s.setFilterMinScore);
  const updateProfile = useDiscoveryStore((s) => s.updateProfile);
  const addCompany = useDiscoveryStore((s) => s.addCompany);
  const getFilteredJobs = useDiscoveryStore((s) => s.getFilteredJobs);
  const getSavedJobs = useDiscoveryStore((s) => s.getSavedJobs);
  const getTopCompanies = useDiscoveryStore((s) => s.getTopCompanies);
  const getUniqueIndustries = useDiscoveryStore((s) => s.getUniqueIndustries);
  const getUniqueLocations = useDiscoveryStore((s) => s.getUniqueLocations);
  const getUniqueLevels = useDiscoveryStore((s) => s.getUniqueLevels);
  const [showFilters, setShowFilters] = useState(false);
  const [showPrefsEditor, setShowPrefsEditor] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);

  const tabs = useMemo(() => [
    { id: "all" as DiscoveryTab, label: t.discover.tabs.all, icon: Compass },
    { id: "saved" as DiscoveryTab, label: t.discover.tabs.saved, icon: BookmarkSimple },
    { id: "companies" as DiscoveryTab, label: t.discover.tabs.companies, icon: Buildings },
    { id: "scans" as DiscoveryTab, label: t.discover.tabs.scans, icon: Barcode },
  ], [t]);

  const sortOptions = useMemo<{ value: SortKey; label: string }[]>(() => [
    { value: "match_score", label: t.discover.sortMatchScore },
    { value: "posted_date", label: t.discover.sortPostedDate },
    { value: "company_name", label: t.discover.sortCompany },
    { value: "title", label: t.discover.sortTitle },
  ], [t]);

  // Preferences form state
  const [prefsForm, setPrefsForm] = useState({
    target_roles: profile.target_roles.join(", "),
    industries: profile.industries.join(", "),
    locations: profile.locations.join(", "),
    keywords: profile.keywords.join(", "),
    min_match_score: profile.min_match_score,
    experience_years: profile.experience_years,
    auto_scan_enabled: profile.auto_scan_enabled,
    auto_scan_interval: profile.auto_scan_interval,
  });

  // Add Company form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    hq: "",
    career_url: "",
    logo_emoji: "",
    employee_count: "",
    tier: 2,
    notes: "",
    tags: "",
  });

  const handleSavePrefs = () => {
    updateProfile({
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
    addCompany({
      name: companyForm.name.trim(),
      industry: companyForm.industry.trim() || "Technology",
      hq: companyForm.hq.trim() || "Unknown",
      career_url: companyForm.career_url.trim(),
      logo_emoji: companyForm.logo_emoji || "",
      employee_count: companyForm.employee_count.trim() || "Unknown",
      match_score: 0,
      tier: companyForm.tier,
      notes: companyForm.notes.trim(),
      tags: companyForm.tags.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setCompanyForm({ name: "", industry: "", hq: "", career_url: "", logo_emoji: "", employee_count: "", tier: 2, notes: "", tags: "" });
    setShowAddCompany(false);
  };

  const filteredJobs = getFilteredJobs();
  const savedJobs = getSavedJobs();
  const topCompanies = getTopCompanies(30);
  const industries = getUniqueIndustries();
  const locations = getUniqueLocations();
  const levels = getUniqueLevels();
  const latestScan = scanRuns[0];

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-brand-400" />
          <div>
            <h1 className="text-2xl font-bold font-display">{t.discover.title}</h1>
            <p className="text-xs text-surface-300 mt-0.5">
              {isZh
                ? `来自 ${companies.length} 家追踪企业的 ${jobs.filter((j) => !j.dismissed).length} 个职位`
                : `${jobs.filter((j) => !j.dismissed).length} jobs from ${companies.length} companies`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void handleScan()}
            className="btn-editorial-primary flex items-center gap-2"
          >
            {latestScan?.status === "running" ? (
              <><ArrowsClockwise className="w-4 h-4 animate-spin" /> {isZh ? "扫描中…" : "Scanning…"}</>
            ) : (
              <><Play className="w-4 h-4" weight="fill" /> {isZh ? "运行实时扫描" : "Run live scan"}</>
            )}
          </button>
        </div>
      </div>

      {/* Demo data notice */}
      <div className="mb-6 flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-surface-400 leading-relaxed">
        <Lightning className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" weight="fill" />
        {scanRuns.some((r) => r.source === "career_pages" && r.status === "completed") ? (
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {isZh
              ? "实时模式：扫描会直接读取已跟踪公司官网 / Greenhouse / Lever / Ashby / Workable 的公开职位数据。"
              : "Live mode: scans read public openings from tracked companies' Greenhouse / Lever / Ashby / Workable boards and career pages."}
          </p>
        ) : (
          <p>
            {isZh
              ? "演示模式：当前列表为示例数据。为公司在设置中填写招聘页地址（支持 Greenhouse / Lever / Ashby / Workable），点击“运行实时扫描”即可拉取真实职位。"
              : "Demo preview: listings below are sample data. Set each company's career URL (Greenhouse / Lever / Ashby / Workable supported), then Run demo scan becomes a live pull."}
          </p>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: t.discover.statsJobs, value: filteredJobs.length, icon: Compass, color: "text-brand-400" },
          { label: t.discover.statsSaved, value: savedJobs.length, icon: BookmarkSimple, color: "text-emerald-400" },
          { label: t.discover.statsCompanies, value: companies.length, icon: Buildings, color: "text-blue-400" },
          { label: t.discover.statsAvgMatch, value: `${Math.round(filteredJobs.reduce((a, j) => a + j.match_score, 0) / (filteredJobs.length || 1))}%`, icon: TrendUp, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="card-editorial rounded-xl p-4 flex items-center gap-3">
            <stat.icon className={cn("w-5 h-5", stat.color)} />
            <div>
              <div className="text-lg font-bold font-display">{stat.value}</div>
              <div className="text-[10px] text-surface-300 uppercase tracking-wider font-mono">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scan Status Banner */}
      {latestScan && (
        <div className="card-editorial rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {latestScan.status === "running" ? (
              <ArrowsClockwise className="w-5 h-5 text-brand-400 animate-spin" />
            ) : latestScan.status === "completed" ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <Barcode className="w-5 h-5 text-surface-300" />
            )}
            <div>
              <div className="text-sm font-medium">
                {latestScan.status === "running" ? t.discover.scanInProgress : t.discover.lastScanCompleted}
              </div>
              <div className="text-xs text-surface-300">
                {latestScan.status === "completed"
                  ? isZh
                    ? `已扫描 ${latestScan.companies_scanned} 家企业 · 发现 ${latestScan.new_jobs_found} 个新职位 · ${new Date(latestScan.completed_at!).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                    : `${latestScan.companies_scanned} companies scanned · ${latestScan.new_jobs_found} new jobs · ${new Date(latestScan.completed_at!).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                  : t.discover.scanningNotice}
              </div>
            </div>
          </div>
          {profile.auto_scan_enabled && (
            <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 font-medium flex items-center gap-1">
              <Lightning className="w-3 h-3" weight="fill" /> {t.discover.autoScan} {profile.auto_scan_interval}
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-surface-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all",
              activeTab === tab.id
                ? "text-ember-700 border-ember-600 font-semibold"
                : "text-surface-300 border-transparent hover:text-surface-400"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === "saved" && savedJobs.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-brand-500/10 text-brand-300 font-bold">
                {savedJobs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      {(activeTab === "all" || activeTab === "saved") && (
        <div className="mb-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                placeholder={t.discover.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                showFilters ? "bg-surface-400 text-surface-0 font-bold" : "bg-surface-100 text-surface-300 hover:text-surface-400"
              )}
            >
              <Funnel className="w-4 h-4" />
              {t.discover.filterBtn}
              <CaretDown className={cn("w-3 h-3 transition-transform", showFilters && "rotate-180")} />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-surface-100 text-sm text-surface-300">
              <ArrowsDownUp className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-transparent text-sm text-surface-400 focus:outline-none cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="card-editorial rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
              <div>
                <label className="text-[10px] text-surface-300 uppercase tracking-wider font-medium mb-1 block">{t.discover.industryLabel}</label>
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 text-sm text-surface-400 border border-surface-200 focus:outline-none"
                >
                  <option value="">{t.discover.allIndustries}</option>
                  {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-surface-300 uppercase tracking-wider font-medium mb-1 block">{t.discover.locationLabel}</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 text-sm text-surface-400 border border-surface-200 focus:outline-none"
                >
                  <option value="">{t.discover.allLocations}</option>
                  {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-surface-300 uppercase tracking-wider font-medium mb-1 block">{t.discover.levelLabel}</label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-50 text-sm text-surface-400 border border-surface-200 focus:outline-none"
                >
                  <option value="">{t.discover.allLevels}</option>
                  {levels.map((lvl) => <option key={lvl} value={lvl}>{lvl}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-surface-300 uppercase tracking-wider font-medium mb-1 block">{t.discover.minMatchScoreLabel}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={filterMinScore}
                    onChange={(e) => setFilterMinScore(Number(e.target.value))}
                    className="flex-1 accent-ember-600"
                  />
                  <span className="text-xs text-surface-300 font-mono w-8 text-right">{filterMinScore}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: All jobs ── */}
      {activeTab === "all" && (
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="card-editorial rounded-xl p-8 text-center">
              <MagnifyingGlass className="w-8 h-8 text-surface-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-surface-300 mb-1">{t.discover.noMatchesTitle}</h3>
              <p className="text-xs text-surface-400">{t.discover.noMatchesDesc}</p>
            </div>
          ) : (
            filteredJobs.map((job) => <JobCard key={job.id} jobId={job.id} />)
          )}
        </div>
      )}

      {/* ── Tab: Saved ── */}
      {activeTab === "saved" && (
        <div className="space-y-3">
          {savedJobs.length === 0 ? (
            <div className="card-editorial rounded-xl p-8 text-center">
              <BookmarkSimple className="w-8 h-8 text-surface-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-surface-300 mb-1">{t.discover.noSavedTitle}</h3>
              <p className="text-xs text-surface-400">{t.discover.noSavedDesc}</p>
            </div>
          ) : (
            savedJobs.map((job) => <JobCard key={job.id} jobId={job.id} />)
          )}
        </div>
      )}

      {/* ── Tab: Companies ── */}
      {activeTab === "companies" && (
        <div>
          {/* Add Company button */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-surface-300">{topCompanies.length} {t.discover.companiesTracked}</p>
            <button
              onClick={() => setShowAddCompany(true)}
              className="btn-editorial-primary flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.discover.addCompanyBtn}
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
      {activeTab === "scans" && (
        <div className="space-y-3">
          {/* Search Profile summary */}
          <div className="card-editorial rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-ember-600" />
                <h3 className="text-sm font-semibold">{t.discover.searchProfile}</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 font-medium">{t.discover.active}</span>
              </div>
              <button
                onClick={() => {
                  setPrefsForm({
                    target_roles: profile.target_roles.join(", "),
                    industries: profile.industries.join(", "),
                    locations: profile.locations.join(", "),
                    keywords: profile.keywords.join(", "),
                    min_match_score: profile.min_match_score,
                    experience_years: profile.experience_years,
                    auto_scan_enabled: profile.auto_scan_enabled,
                    auto_scan_interval: profile.auto_scan_interval,
                  });
                  setShowPrefsEditor(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-100 text-surface-400 hover:text-black text-xs font-medium transition-all"
              >
                <Pencil className="w-3 h-3" />
                {t.discover.editPreferences}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-surface-300">{t.discover.targetRolesLabel}:</span>
                <div className="text-surface-400 mt-0.5">{profile.target_roles.join(", ")}</div>
              </div>
              <div>
                <span className="text-surface-300">{t.discover.industriesLabel}:</span>
                <div className="text-surface-400 mt-0.5">{profile.industries.join(", ")}</div>
              </div>
              <div>
                <span className="text-surface-300">{t.discover.locationsLabel}:</span>
                <div className="text-surface-400 mt-0.5">{profile.locations.join(", ")}</div>
              </div>
              <div>
                <span className="text-surface-300">{t.discover.minMatchLabel}:</span>
                <div className="text-surface-400 mt-0.5">{profile.min_match_score}%</div>
              </div>
              <div>
                <span className="text-surface-300">{t.discover.keywordsLabel}:</span>
                <div className="text-surface-400 mt-0.5">{(profile?.keywords || []).slice(0, 3).join(", ") || (isZh ? "暂无关键词" : "No keywords yet")}</div>
              </div>
              <div>
                <span className="text-surface-300">{t.discover.autoScanLabel}:</span>
                <div className="text-surface-400 mt-0.5 flex items-center gap-1">
                  {profile.auto_scan_enabled ? (
                    <><Globe className="w-3 h-3 text-emerald-600" /> {profile.auto_scan_interval}</>
                  ) : (isZh ? "未启用" : "Disabled")}
                </div>
              </div>
            </div>
          </div>

          {/* Scan runs */}
          {scanRuns.map((run) => (
            <div key={run.id} className="card-editorial rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {run.status === "running" ? (
                  <ArrowsClockwise className="w-5 h-5 text-brand-400 animate-spin" />
                ) : run.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Barcode className="w-5 h-5 text-surface-300" />
                )}
                <div>
                  <div className="text-sm font-medium">
                    {run.source === "career_pages" ? (isZh ? "企业官网自动巡航" : "Career Pages Scan") : (isZh ? "全网搜索深度扫描" : "Web Search Scan")}
                  </div>
                  <div className="text-xs text-surface-300 mt-0.5">
                    {new Date(run.started_at).toLocaleDateString(isZh ? "zh-CN" : "en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-surface-300">
                <span>{run.companies_scanned} {isZh ? "家企业" : "companies"}</span>
                <span className="text-emerald-700 font-medium">+{run.new_jobs_found} {isZh ? "新增" : "new"}</span>
                <span>{run.total_matches} {isZh ? "匹配" : "total"}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-medium",
                  run.status === "completed" ? "bg-emerald-500/10 text-emerald-700" :
                  run.status === "running" ? "bg-brand-500/10 text-brand-700" :
                  "bg-red-500/10 text-red-600"
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
        <Dialog open={showPrefsEditor} onClose={() => setShowPrefsEditor(false)} labelledBy="prefs-title" className="max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkle className="w-5 h-5 text-brand-400" />
              <h2 id="prefs-title" className="text-base font-semibold">{t.discover.editPreferences}</h2>
            </div>
            <button type="button" onClick={() => setShowPrefsEditor(false)} className="p-1.5 rounded-lg text-surface-300 hover:text-surface-400 hover:bg-surface-0/[0.04] transition-all" aria-label={t.common.close}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.discover.targetRolesLabel}</label>
              <input type="text" value={prefsForm.target_roles} onChange={(e) => setPrefsForm({ ...prefsForm, target_roles: e.target.value })} placeholder="e.g. Product Manager, PM Lead" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" />
              <p className="text-[10px] text-surface-400 mt-1">{isZh ? "使用逗号分隔" : "Comma-separated"}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.discover.industriesLabel}</label>
              <input type="text" value={prefsForm.industries} onChange={(e) => setPrefsForm({ ...prefsForm, industries: e.target.value })} placeholder="e.g. Technology, Ad Tech, Fintech" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" />
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.discover.locationsLabel}</label>
              <input type="text" value={prefsForm.locations} onChange={(e) => setPrefsForm({ ...prefsForm, locations: e.target.value })} placeholder="e.g. Singapore, San Francisco, Remote" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" />
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.discover.keywordsLabel}</label>
              <input type="text" value={prefsForm.keywords} onChange={(e) => setPrefsForm({ ...prefsForm, keywords: e.target.value })} placeholder="e.g. AI, ML, revenue, platform" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{isZh ? "工作经验年限" : "Experience Level"}</label>
                <select value={prefsForm.experience_years} onChange={(e) => setPrefsForm({ ...prefsForm, experience_years: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all appearance-none cursor-pointer">
                  <option value="0-2">{isZh ? "0-2 年" : "0–2 years"}</option>
                  <option value="3-5">{isZh ? "3-5 年" : "3–5 years"}</option>
                  <option value="5-8">{isZh ? "5-8 年" : "5–8 years"}</option>
                  <option value="8-12">{isZh ? "8-12 年" : "8–12 years"}</option>
                  <option value="12+">{isZh ? "12 年以上" : "12+ years"}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.discover.minMatchScoreLabel}</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={prefsForm.min_match_score} onChange={(e) => setPrefsForm({ ...prefsForm, min_match_score: Number(e.target.value) })} className="flex-1 accent-ember-600" />
                  <span className="text-xs text-surface-300 font-mono w-8 text-right">{prefsForm.min_match_score}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-100 border border-surface-200">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-surface-300" />
                <div>
                  <p className="text-sm font-medium">{t.discover.autoScan}</p>
                  <p className="text-[10px] text-surface-300">{isZh ? "定时自动扫描（即将推出）" : "Scheduled auto-scanning (coming soon)"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prefsForm.auto_scan_enabled && (
                  <select disabled value={prefsForm.auto_scan_interval} onChange={(e) => setPrefsForm({ ...prefsForm, auto_scan_interval: e.target.value as "daily" | "weekly" | "biweekly" })} className="px-2 py-1 rounded-lg bg-surface-50 text-xs text-surface-400 border border-surface-200 focus:outline-none opacity-50 cursor-not-allowed">
                    <option value="daily">{isZh ? "每日" : "Daily"}</option>
                    <option value="weekly">{isZh ? "每周" : "Weekly"}</option>
                    <option value="biweekly">{isZh ? "每双周" : "Biweekly"}</option>
                  </select>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-surface-300">{isZh ? "即将推出" : "Coming soon"}</span>
                <button type="button" aria-disabled="true" onClick={(e) => e.preventDefault()} className={cn("w-10 h-6 rounded-full relative opacity-40 cursor-not-allowed", prefsForm.auto_scan_enabled ? "bg-ember-600" : "bg-surface-300")}>
                  <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", prefsForm.auto_scan_enabled ? "left-5" : "left-1")} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowPrefsEditor(false)} className="btn-editorial-secondary flex-1">{t.common.cancel}</button>
            <button onClick={handleSavePrefs} className="btn-editorial-primary flex-1 flex items-center justify-center gap-2">
              <FloppyDisk className="w-4 h-4" />
              {isZh ? "保存求职偏好" : "Save Preferences"}
            </button>
          </div>
        </Dialog>
      )}

      {/* ═══ Modal: Add Company ═══ */}
      {showAddCompany && (
        <Dialog open={showAddCompany} onClose={() => setShowAddCompany(false)} labelledBy="add-company-title" className="max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Buildings className="w-5 h-5 text-brand-400" />
              <h2 id="add-company-title" className="text-base font-semibold">{t.discover.addCompanyBtn}</h2>
            </div>
            <button type="button" onClick={() => setShowAddCompany(false)} className="p-1.5 rounded-lg text-surface-300 hover:text-surface-400 hover:bg-surface-0/[0.04] transition-all" aria-label={t.common.close}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">Emoji</label>
                <input type="text" value={companyForm.logo_emoji} onChange={(e) => setCompanyForm({ ...companyForm, logo_emoji: e.target.value })} className="w-14 px-2 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-lg text-center focus:outline-none focus:border-brand-500/40 transition-all font-sans" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{isZh ? "企业名称 *" : "Company Name *"}</label>
                <input type="text" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} placeholder="e.g. Stripe" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.discover.industryLabel}</label>
                <input type="text" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} placeholder="e.g. Fintech" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 transition-all font-sans" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{isZh ? "总部地点" : "HQ Location"}</label>
                <input type="text" value={companyForm.hq} onChange={(e) => setCompanyForm({ ...companyForm, hq: e.target.value })} placeholder="e.g. San Francisco, CA" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 transition-all font-sans" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{isZh ? "人员规模" : "Employee Count"}</label>
                <input type="text" value={companyForm.employee_count} onChange={(e) => setCompanyForm({ ...companyForm, employee_count: e.target.value })} placeholder="e.g. 5,000+" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 transition-all font-sans" />
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-300 mb-1.5">{t.pipelineDetail.tier}</label>
                <select value={companyForm.tier} onChange={(e) => setCompanyForm({ ...companyForm, tier: Number(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all appearance-none cursor-pointer">
                  <option value={1}>{isZh ? "Tier 1 — Dream 心仪名企" : "Tier 1 — Dream"}</option>
                  <option value={2}>{isZh ? "Tier 2 — Strong 强意向" : "Tier 2 — Strong"}</option>
                  <option value={3}>{isZh ? "Tier 3 — Good Fit 良好匹配" : "Tier 3 — Good Fit"}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{isZh ? "招聘主页链接" : "Career Page URL"}</label>
              <input type="url" value={companyForm.career_url} onChange={(e) => setCompanyForm({ ...companyForm, career_url: e.target.value })} placeholder="https://careers.stripe.com" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all font-sans" />
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{isZh ? "标签" : "Tags"}</label>
              <input type="text" value={companyForm.tags} onChange={(e) => setCompanyForm({ ...companyForm, tags: e.target.value })} placeholder="e.g. payments, API, developer tools" className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 transition-all font-sans" />
              <p className="text-[10px] text-surface-400 mt-1">{isZh ? "使用逗号分隔" : "Comma-separated"}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">{isZh ? "备注" : "Notes"}</label>
              <textarea value={companyForm.notes} onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })} rows={2} placeholder={isZh ? "记录关注该企业的理由与核心亮点..." : "Why this company interests you..."} className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 transition-all resize-none font-sans" />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAddCompany(false)} className="btn-editorial-secondary flex-1">{t.common.cancel}</button>
            <button onClick={handleAddCompany} disabled={!companyForm.name.trim()} className={cn("btn-editorial-primary flex-1 flex items-center justify-center gap-2", !companyForm.name.trim() && "opacity-50 cursor-not-allowed")}>
              <Plus className="w-4 h-4" />
              {t.discover.addCompanyBtn}
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
