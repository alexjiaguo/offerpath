"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Target,
  Building2,
  Star,
  Globe,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   Discovery — Job Detail Page
   ═══════════════════════════════════════════════════ */

export default function DiscoverJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    getJobById,
    getCompanyById,
    getJobsByCompany,
    toggleSaved,
  } = useDiscoveryStore();

  const job = getJobById(id);
  if (!job) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Job Not Found</h1>
        <p className="text-gray-500 text-sm mb-4">This job listing may have been removed.</p>
        <Link href="/dashboard/discover" className="text-brand-400 hover:text-brand-300 text-sm">
          ← Back to Discovery
        </Link>
      </div>
    );
  }

  const company = getCompanyById(job.company_id);
  const relatedJobs = getJobsByCompany(job.company_id).filter((j) => j.id !== job.id);

  const scoreColor =
    job.match_score >= 90 ? "text-emerald-400" :
    job.match_score >= 80 ? "text-blue-400" :
    job.match_score >= 70 ? "text-amber-400" :
    "text-gray-400";

  const scoreBg =
    job.match_score >= 90 ? "from-emerald-500/20 to-emerald-500/5" :
    job.match_score >= 80 ? "from-blue-500/20 to-blue-500/5" :
    job.match_score >= 70 ? "from-amber-500/20 to-amber-500/5" :
    "from-gray-500/20 to-gray-500/5";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Nav */}
      <Link
        href="/dashboard/discover"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Discovery
      </Link>

      {/* Hero Card */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                job.source === "career_page" ? "bg-blue-500/10 text-blue-300" :
                "bg-purple-500/10 text-purple-300"
              )}>
                {job.source === "career_page" ? "Career Page" : "Web Search"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-gray-400 font-medium">
                {job.type}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-gray-400 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Posted {new Date(job.posted_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-1">{job.title}</h1>

            <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap mt-2">
              <span className="flex items-center gap-1.5 font-medium text-gray-300">
                <Building2 className="w-4 h-4" /> {job.company_name}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> {job.level}
              </span>
            </div>

            {job.salary_range && (
              <div className="mt-3 text-sm font-semibold text-emerald-400">
                💰 {job.salary_range}
              </div>
            )}
          </div>

          {/* Score Card */}
          <div className={cn(
            "w-24 h-24 rounded-2xl bg-gradient-to-b flex flex-col items-center justify-center flex-shrink-0",
            scoreBg
          )}>
            <Target className={cn("w-5 h-5 mb-1", scoreColor)} />
            <div className={cn("text-2xl font-bold", scoreColor)}>{job.match_score}%</div>
            <div className="text-[9px] text-gray-500 uppercase">Match</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/[0.04]">
          <button
            onClick={() => toggleSaved(job.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              job.saved
                ? "bg-brand-500/10 text-brand-400"
                : "bg-surface-200 text-gray-400 hover:text-brand-400 hover:bg-brand-500/10"
            )}
          >
            {job.saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {job.saved ? "Saved" : "Save"}
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-surface-200 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
          >
            <ExternalLink className="w-4 h-4" /> View Original
          </a>
          <Link
            href={`/dashboard/pipeline?addJob=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company_name)}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity ml-auto"
          >
            <Send className="w-4 h-4" /> Add to Pipeline
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" />
              Job Description
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Requirements
              </h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <ChevronRight className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="glass rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Related Skills & Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Company Info */}
          {company && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                About {company.name}
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{company.logo_emoji}</span>
                  <div>
                    <div className="font-medium text-sm">{company.name}</div>
                    <div className="text-gray-500">{company.industry}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-gray-400">
                  <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {company.hq}</div>
                  <div className="flex items-center gap-2"><Briefcase className="w-3 h-3" /> {company.employee_count} employees</div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    <span>Tier {company.tier} · </span>
                    <span className={cn(
                      "font-bold",
                      company.match_score >= 90 ? "text-emerald-400" :
                      company.match_score >= 80 ? "text-blue-400" :
                      "text-amber-400"
                    )}>{company.match_score}% match</span>
                  </div>
                </div>
                <p className="text-gray-500 leading-relaxed">{company.notes}</p>
                <div className="flex flex-wrap gap-1.5">
                  {company.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-gray-400">{tag}</span>
                  ))}
                </div>
                <a
                  href={company.career_url}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors mt-2"
                >
                  <Globe className="w-3 h-3" /> Career Page <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* More roles at this company */}
          {relatedJobs.length > 0 && (
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold mb-3">
                More at {job.company_name}
              </h3>
              <div className="space-y-2">
                {relatedJobs.slice(0, 5).map((rj) => (
                  <Link
                    key={rj.id}
                    href={`/dashboard/discover/${rj.id}`}
                    className="block p-3 rounded-lg bg-surface-200/50 hover:bg-surface-200 transition-all group/related"
                  >
                    <div className="text-xs font-medium group-hover/related:text-brand-400 transition-colors">{rj.title}</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                      <span>{rj.location}</span>
                      <span className={cn(
                        "font-bold",
                        rj.match_score >= 90 ? "text-emerald-400" :
                        rj.match_score >= 80 ? "text-blue-400" :
                        "text-amber-400"
                      )}>{rj.match_score}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick action: Tailor resume */}
          <div className="glass rounded-xl p-5 border border-brand-500/20">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              Tailor Your Resume
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Create a tailored resume for this role to maximize your ATS score.
            </p>
            <Link
              href={`/dashboard/resume?tailorFor=${job.id}`}
              className="block text-center px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Tailoring →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
