"use client";

import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import ATSScoreBadge from "./ATSScoreBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ArrowLeft, ArrowSquareOut, Briefcase, Target, Calendar, CheckCircle, CaretRight, CurrencyDollar, Warning, FileText, MapPin, Shield, Star, Sparkle, Trash, XCircle, EnvelopeOpen, Copy, Check } from '@phosphor-icons/react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { JobStatus, ExperienceEntry, EducationEntry, SkillItem } from "@/types";
import { formatDate, statusColor } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
   generateSimulatedOutreach — High-end Outreach Builder
   ═══════════════════════════════════════════════════ */
function generateSimulatedOutreach(
  type: string,
  jobTitle: string,
  companyName: string,
  recipientName: string
): string {
  const recipient = recipientName.trim() || "Hiring Team";
  
  switch(type) {
    case "referral":
      return `Subject: PM Connection & Discussion - ${jobTitle} at ${companyName}

Hi ${recipient},

I hope you're having a great week! 

My name is Brouard Madan, and I've been following ${companyName}'s impressive growth in the PropTech space. I noticed an open role for a ${jobTitle} on your team and felt a strong alignment with my background. 

For context, I recently led a core PropTech product portfolio at my previous firm where we scaled active listings by 3x and drove a 45% increase in user conversion through AI-powered optimization. Given ${companyName}'s current initiatives, I believe my experience in high-growth marketplace products could bring immediate value.

I would love to learn more about your journey at ${companyName} and how the team is approaching these challenges. Would you be open to a brief 10-minute virtual coffee next week? I'd be incredibly grateful for your perspective.

Thank you so much for your time and consideration!

Best regards,
Brouard Madan
brouard.madan@email.com`;

    case "thankyou":
      return `Subject: Thank you! - ${jobTitle} Interview

Hi ${recipient},

Thank you so much for taking the time to speak with me today about the ${jobTitle} position at ${companyName}. I thoroughly enjoyed our conversation and learning more about how the team is scaling its platform architecture.

Our discussion about the upcoming product roadmap further energized me about this opportunity. I am confident that my background in product metrics, AI integration, and cross-functional leadership will allow me to hit the ground running and make a meaningful impact.

Please let me know if you need any additional information from my end. I look forward to hearing about the next steps!

Warm regards,
Brouard Madan
brouard.madan@email.com`;

    case "followup":
      return `Subject: Follow-up: ${jobTitle} Application Status

Hi ${recipient},

I hope this email finds you well! 

I'm writing to check in on the status of my application for the ${jobTitle} role at ${companyName}. I had a wonderful time speaking with the team two weeks ago and remain highly enthusiastic about the opportunity to contribute to your current projects.

Since we last spoke, I've continued to follow ${companyName}'s updates and am even more convinced that my experience in marketplace optimization and scale matches your needs perfectly.

Please let me know if there are any updates you can share or if there is any other information I can provide to assist in your decision-making process.

Thank you again for your time and continued consideration!

Best,
Brouard Madan
brouard.madan@email.com`;

    case "negotiation":
      return `Subject: ${jobTitle} Offer - Compensation Discussion - Brouard Madan

Hi ${recipient},

Thank you so much for extending the offer for the ${jobTitle} position at ${companyName}! I am absolutely thrilled about the prospect of joining the team and helping drive your product roadmap forward.

Before I sign the agreement, I wanted to discuss the compensation package. Given my 8+ years of specialized experience in PropTech product leadership and the immediate impact I plan to deliver on your conversion metrics, I was hoping we could explore a small adjustment to the base salary. 

Would it be possible to bring the base salary to $235,000 to align more closely with industry standards for this depth of experience? Alternatively, I'd be open to discussing an adjustment in equity or a sign-on bonus to bridge the gap.

I am incredibly excited about joining ${companyName} and am confident we can find a mutually agreeable starting point. Thank you so much for your support and guidance throughout this process!

Warmly,
Brouard Madan`;
    default:
      return "";
  }
}

/* ═══════════════════════════════════════════════════
   JobDetail — Full job view with evaluation panel
   ═══════════════════════════════════════════════════ */

const STATUS_OPTIONS: { id: JobStatus; label: string; color: string }[] = [
  { id: "new", label: "New", color: "bg-brand-500" },
  { id: "evaluated", label: "Evaluated", color: "bg-blue-500" },
  { id: "applied", label: "Applied", color: "bg-emerald-500" },
  { id: "interviewing", label: "Interviewing", color: "bg-amber-500" },
  { id: "offered", label: "Offered", color: "bg-purple-500" },
  { id: "rejected", label: "Rejected", color: "bg-red-500" },
  { id: "discarded", label: "Discarded", color: "bg-gray-500" },
  { id: "archived", label: "Archived", color: "bg-gray-600" },
];

// Score ring SVG component
function ScoreRing({ score }: { score: number }) {
  const percentage = (score / 5) * 100;
  const radius = 40;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    score >= 4.5
      ? "#10b981"
      : score >= 3.5
      ? "#3b82f6"
      : score >= 2.5
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[10px] text-zinc-500 dark:text-gray-500">/ 5.0</span>
      </div>
    </div>
  );
}

interface JobDetailProps {
  jobId: string;
}

export default function JobDetail({ jobId }: JobDetailProps) {
  const router = useRouter();
  const { getJobById, moveJob, deleteJob } = usePipelineStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { getResumeById, getATSScore } = useResumeStore();
  const job = getJobById(jobId);
  const linkedResume = job?.resume_id ? getResumeById(job.resume_id) : undefined;

  // Split-pane and AI Outreach Builder tab state
  const [activeTab, setActiveTab] = useState<"overview" | "resume" | "outreach">("overview");
  const [outreachType, setOutreachType] = useState<"referral" | "thankyou" | "followup" | "negotiation">("referral");
  const [recipientName, setRecipientName] = useState("");
  const [outreachTone, setOutreachTone] = useState("Professional & Polished");
  const [generatedOutreach, setGeneratedOutreach] = useState("");
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateOutreach = () => {
    if (!job) return;
    setIsGeneratingOutreach(true);
    setTimeout(() => {
      const email = generateSimulatedOutreach(
        outreachType,
        job.title,
        job.company?.name || "Target Company",
        recipientName
      );
      setGeneratedOutreach(email);
      setIsGeneratingOutreach(false);
      toast.success("AI Outreach email tailored successfully!");
    }, 850);
  };

  const handleCopyOutreach = () => {
    navigator.clipboard.writeText(generatedOutreach);
    setCopied(true);
    toast.success("Outreach template copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <Warning className="w-12 h-12 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-600 dark:text-gray-400 mb-2">Job Not Found</h2>
        <p className="text-sm text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-6">
          This job may have been deleted or doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard/pipeline"
          className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: JobStatus) => {
    moveJob(job.id, newStatus);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteJob(job.id);
    setShowDeleteConfirm(false);
    router.push("/dashboard/pipeline");
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Back navigation */}
      <Link
        href="/dashboard/pipeline"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Pipeline
      </Link>

      {/* Header */}
      <div className="liquid-glass rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Company initial */}
            <div
              className={cn(
                "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl font-bold text-white flex-shrink-0",
                "from-brand-500 to-purple-400"
              )}
            >
              {(job.company?.name || "?").charAt(0)}
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-gray-500 mb-0.5">{job.company?.name}</p>
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold border",
                    statusColor(job.status)
                  )}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                )}
                {job.salary_range && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500 dark:text-gray-500">
                    <CurrencyDollar className="w-3.5 h-3.5" />
                    {job.salary_range}
                  </span>
                )}
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <ArrowSquareOut className="w-3.5 h-3.5" />
                    View Posting
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-zinc-700 dark:text-zinc-400 dark:text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete job"
          >
            <Trash className="w-5 h-5" />
          </button>
        </div>

        {/* Status changer */}
        <div className="flex items-center gap-1 mt-4 p-1 bg-surface-200/40 rounded-xl overflow-x-auto">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleStatusChange(opt.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                job.status === opt.id
                  ? "bg-surface-100 text-white shadow-sm"
                  : "text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.04]"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full", opt.color)} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Job details and interaction tools */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs Navigation */}
          <div className="flex border-b border-zinc-200 dark:border-white/[0.06] mb-2 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "pb-3 text-sm font-semibold border-b-2 px-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "overview"
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-zinc-500 dark:text-gray-500 hover:text-zinc-800 dark:hover:text-gray-200"
              )}
            >
              <Briefcase className="w-4 h-4" />
              Job Overview
            </button>
            <button
              onClick={() => setActiveTab("resume")}
              className={cn(
                "pb-3 text-sm font-semibold border-b-2 px-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "resume"
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-zinc-500 dark:text-gray-500 hover:text-zinc-800 dark:hover:text-gray-200"
              )}
            >
              <FileText className="w-4 h-4" />
              Resume Preview
              {linkedResume && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-medium">
                  {getATSScore(job.resume_id!, job.id)}% Match
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("outreach")}
              className={cn(
                "pb-3 text-sm font-semibold border-b-2 px-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === "outreach"
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-zinc-500 dark:text-gray-500 hover:text-zinc-800 dark:hover:text-gray-200"
              )}
            >
              <Sparkle className="w-4 h-4 text-brand-400" />
              AI Outreach Builder
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Description */}
              <div className="liquid-glass rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-400" />
                  Job Description
                </h2>
                {job.description ? (
                  <div className="text-sm text-zinc-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {job.description}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-700 dark:text-zinc-400 dark:text-gray-600 italic">
                    No description available. Add a description by editing this job.
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div className="liquid-glass rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  Timeline
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Added", date: job.created_at, always: true },
                    { label: "Applied", date: job.applied_at },
                    { label: "Interview", date: job.interviewed_at },
                    { label: "Offered", date: job.offered_at },
                  ]
                    .filter((e) => e.always || e.date)
                    .map((event) => (
                      <div
                        key={event.label}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-500" />
                        <span className="text-zinc-600 dark:text-gray-400 w-20">{event.label}</span>
                        <span className="text-zinc-700 dark:text-gray-300">
                          {event.date ? formatDate(event.date) : "—"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Comp details (if offer) */}
              {job.comp_details && (
                <div className="liquid-glass rounded-2xl p-6">
                  <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <CurrencyDollar className="w-4 h-4 text-emerald-400" />
                    Compensation Details
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {job.comp_details.base_salary && (
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Base Salary</p>
                        <p className="text-lg font-semibold">{job.comp_details.base_salary}</p>
                      </div>
                    )}
                    {job.comp_details.equity && (
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Equity</p>
                        <p className="text-lg font-semibold">{job.comp_details.equity}</p>
                      </div>
                    )}
                    {job.comp_details.bonus && (
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Bonus</p>
                        <p className="text-lg font-semibold">{job.comp_details.bonus}</p>
                      </div>
                    )}
                    {job.comp_details.total_comp && (
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-gray-500 mb-0.5">Total Comp</p>
                        <p className="text-lg font-bold text-emerald-400">
                          {job.comp_details.total_comp}
                        </p>
                      </div>
                    )}
                  </div>
                  {job.comp_details.benefits && job.comp_details.benefits.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-white/[0.06]">
                      <p className="text-xs text-zinc-500 dark:text-gray-500 mb-2">Benefits</p>
                      <div className="flex flex-wrap gap-2">
                        {job.comp_details.benefits.map((b) => (
                          <span
                            key={b}
                            className="px-2 py-1 rounded-md text-xs bg-surface-200 text-zinc-600 dark:text-gray-400"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "resume" && (
            <div className="space-y-6">
              {linkedResume ? (
                <div className="liquid-glass rounded-2xl p-6">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-4 mb-5">
                    <div>
                      <h2 className="text-base font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-400" />
                        Linked Resume Preview
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-gray-500 mt-0.5">
                        {linkedResume.title} — ATS Alignment: <span className="font-semibold text-emerald-400">{getATSScore(job.resume_id!, job.id)}%</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/resume?view=${linkedResume.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-200 text-zinc-700 dark:text-gray-300 hover:text-white transition-colors"
                      >
                        Edit Resume
                      </Link>
                      <Link
                        href={`/dashboard/resume?tailorFor=${job.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 border border-brand-500/20 transition-all"
                      >
                        Re-tailor for Job
                      </Link>
                    </div>
                  </div>

                  {/* Print Mockup Container */}
                  <div className="rounded-xl border border-zinc-200 dark:border-white/[0.06] p-8 bg-white text-zinc-800 font-sans shadow-lg max-h-[600px] overflow-y-auto">
                    {/* Header */}
                    <div className="text-center border-b border-zinc-200 pb-4 mb-4">
                      <h3 className="text-xl font-bold text-zinc-955 mb-0.5">{linkedResume.data.personal?.name || "Brouard Madan"}</h3>
                      <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">{linkedResume.data.personal?.title || job.title}</p>
                      <div className="flex justify-center gap-3 text-[10px] text-zinc-500 mt-2 flex-wrap">
                        {linkedResume.data.personal?.email && <span>{linkedResume.data.personal.email}</span>}
                        {linkedResume.data.personal?.phone && <span>• {linkedResume.data.personal.phone}</span>}
                        {linkedResume.data.personal?.location && <span>• {linkedResume.data.personal.location}</span>}
                        {linkedResume.data.personal?.visa_status && <span>• {linkedResume.data.personal.visa_status}</span>}
                      </div>
                    </div>

                    {/* Summary */}
                    {linkedResume.data.summary && (
                      <div className="mb-4 text-left">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-805 mb-1 border-b border-zinc-200 pb-0.5">Professional Summary</h4>
                        <p className="text-[11px] text-zinc-705 leading-relaxed">{linkedResume.data.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {linkedResume.data.experience && linkedResume.data.experience.length > 0 && (
                      <div className="mb-4 text-left">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-805 mb-2 border-b border-zinc-200 pb-0.5">Professional Experience</h4>
                        <div className="space-y-3">
                          {linkedResume.data.experience.map((exp: ExperienceEntry, idx: number) => (
                            <div key={idx} className="text-[11px]">
                              <div className="flex justify-between items-baseline mb-0.5">
                                <span className="font-bold text-zinc-900">{exp.company} — {exp.title}</span>
                                <span className="text-[9px] text-zinc-505 font-medium">{exp.start_date} to {exp.current ? "Present" : exp.end_date}</span>
                              </div>
                              {exp.bullets && exp.bullets.length > 0 && (
                                <ul className="list-disc list-outside pl-4 space-y-0.5 mt-1 text-zinc-705">
                                  {exp.bullets.map((b: string, bIdx: number) => (
                                    <li key={bIdx} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: b }} />
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {linkedResume.data.education && linkedResume.data.education.length > 0 && (
                      <div className="mb-4 text-left">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-805 mb-2 border-b border-zinc-200 pb-0.5">Education</h4>
                        <div className="space-y-1">
                          {linkedResume.data.education.map((edu: EducationEntry, idx: number) => (
                            <div key={idx} className="flex justify-between items-baseline text-[11px]">
                              <span className="font-semibold text-zinc-900">{edu.institution} — {edu.degree} in {edu.field}</span>
                              <span className="text-[9px] text-zinc-505 font-medium">{edu.end_date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {linkedResume.data.skills && linkedResume.data.skills.length > 0 && (
                      <div className="text-left">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-805 mb-2 border-b border-zinc-200 pb-0.5">Skills & Competencies</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {linkedResume.data.skills.map((s: SkillItem, idx: number) => (
                            <span key={idx} className={cn("px-2 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-200", s.isHighlighted && "bg-brand-500/10 text-brand-800 border-brand-500/20 font-medium")}>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="liquid-glass rounded-2xl p-8 text-center">
                  <FileText className="w-12 h-12 text-zinc-500 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-base font-semibold mb-2">No Resume Linked</h3>
                  <p className="text-sm text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-5 max-w-sm mx-auto">
                    Link a tailored resume to this application to check your ATS alignment score, preview bullet points, and generate hyper-targeted outreach.
                  </p>
                  <Link
                    href={`/dashboard/resume?tailorFor=${job.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <Sparkle className="w-4 h-4" />
                    Tailor Resume for This Job
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "outreach" && (
            <div className="space-y-6 animate-scale-in">
              <div className="liquid-glass rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <EnvelopeOpen className="w-4 h-4 text-brand-400"  weight="fill" />
                  AI Outreach Email Tailoring
                </h2>
                <p className="text-xs text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-6">
                  Draft premium, high-conversion outreach emails automatically customized for this position, company context, and your background.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-1.5">Outreach Purpose</label>
                    <select
                      value={outreachType}
                      onChange={(e) => setOutreachType(e.target.value as typeof outreachType)}
                      className="w-full px-3 py-2 text-sm bg-surface-100 border border-zinc-200 dark:border-white/[0.06] rounded-lg text-zinc-800 dark:text-gray-200 focus:outline-none focus:border-brand-500/40"
                    >
                      <option value="referral">Referral Request (Before Applying)</option>
                      <option value="thankyou">Thank You Note (Post-Interview)</option>
                      <option value="followup">Application Status Follow-up</option>
                      <option value="negotiation">Offer Compensation Discussion</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-1.5">Recipient Name</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Hiring Manager, Recruiter"
                      className="w-full px-3 py-2 text-sm bg-surface-100 border border-zinc-200 dark:border-white/[0.06] rounded-lg text-zinc-800 dark:text-gray-200 focus:outline-none focus:border-brand-500/40 placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-gray-400 mb-1.5">Tone & Personalization Style</label>
                  <div className="flex gap-2 flex-wrap">
                    {["Professional & Polished", "Short & Punchy", "Warm & Conversational", "Metrics-Driven"].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setOutreachTone(tone)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          outreachTone === tone
                            ? "bg-brand-500/20 text-brand-300 border-brand-500/40"
                            : "bg-surface-100 border-white/[0.06] text-zinc-500 hover:text-white"
                        )}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateOutreach}
                  disabled={isGeneratingOutreach}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg gradient-brand text-white text-sm font-semibold hover:opacity-95 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Sparkle className="w-4 h-4 animate-pulse" />
                  {isGeneratingOutreach ? "Tailoring Outreach Email..." : "Generate AI Outreach Email"}
                </button>
              </div>

              {generatedOutreach && (
                <div className="liquid-glass rounded-2xl p-6 animate-scale-in">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/[0.06] pb-3 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Generated Email Draft</span>
                    <button
                      onClick={handleCopyOutreach}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20 hover:bg-brand-500/20 transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Draft
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    value={generatedOutreach}
                    onChange={(e) => setGeneratedOutreach(e.target.value)}
                    rows={12}
                    className="w-full p-4 rounded-xl bg-surface-100/50 border border-zinc-200 dark:border-white/[0.06] text-sm text-zinc-800 dark:text-gray-200 focus:outline-none focus:border-brand-500/30 font-mono leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Evaluation panel */}
        <div className="lg:col-span-2 space-y-6">
          {job.evaluation ? (
            <>
              {/* Score card */}
              <div className="liquid-glass rounded-2xl p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  AI Evaluation
                </h2>
                <div className="flex items-center gap-5 mb-4">
                  <ScoreRing score={job.evaluation.score} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-semibold",
                          job.evaluation.tier === 1
                            ? "text-amber-400 bg-amber-400/10"
                            : job.evaluation.tier === 2
                            ? "text-zinc-600 dark:text-gray-400 bg-gray-400/10"
                            : "text-amber-700 bg-amber-700/10"
                        )}
                      >
                        Tier {job.evaluation.tier}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs text-zinc-600 dark:text-gray-400 bg-surface-200">
                      {job.evaluation.archetype}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-gray-400 leading-relaxed">
                  {job.evaluation.match_summary}
                </p>
              </div>

              {/* Fit reasons */}
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400"  weight="fill" />
                  Why It Fits
                </h3>
                <ul className="space-y-2">
                  {job.evaluation.fit_reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-gray-400">
                      <CaretRight className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Concerns */}
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-amber-400" />
                  Concerns
                </h3>
                <ul className="space-y-2">
                  {job.evaluation.concerns.map((concern, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-gray-400">
                      <CaretRight className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key requirements */}
              <div className="liquid-glass rounded-2xl p-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Key Requirements
                </h3>
                <ul className="space-y-2">
                  {job.evaluation.key_requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-gray-400">
                      <Target className="w-3 h-3 text-blue-500 flex-shrink-0 mt-1" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="liquid-glass rounded-2xl p-6 text-center">
              <Star className="w-10 h-10 text-zinc-700 dark:text-zinc-300 dark:text-gray-700 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-gray-400 mb-1">
                Not Evaluated Yet
              </h3>
              <p className="text-xs text-zinc-700 dark:text-zinc-400 dark:text-gray-600 mb-4">
                Run AI evaluation to get a fitness score, tier assignment, and detailed
                analysis.
              </p>
              <button onClick={() => toast.info("AI Evaluation feature coming soon!")} className="px-4 py-2 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Evaluate with AI
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="liquid-glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {/* Resume action — context-aware */}
              {job.resume_id ? (
                <div className="rounded-lg border border-zinc-200 dark:border-white/[0.06] overflow-hidden">
                  {/* Linked resume card */}
                  {(() => {
                    const linkedResume = getResumeById(job.resume_id!);
                    const atsScore = getATSScore(job.resume_id!, job.id);
                    return linkedResume ? (
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-3.5 h-3.5 text-brand-400" />
                          <span className="text-xs font-medium text-zinc-600 dark:text-gray-400">
                            Linked Resume
                          </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-gray-200 mb-2 truncate">
                          {linkedResume.title}
                        </p>
                        <div className="mb-2">
                          <ATSScoreBadge score={atsScore} size="sm" />
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/resume?view=${linkedResume.id}`}
                            className="flex-1 text-center px-2 py-1.5 rounded-md text-xs text-zinc-600 dark:text-gray-400 hover:text-zinc-800 dark:hover:text-gray-200 bg-surface-200/50 hover:bg-surface-200 transition-all"
                          >
                            View Resume
                          </Link>
                          <Link
                            href={`/dashboard/resume?tailorFor=${job.id}`}
                            className="flex-1 text-center px-2 py-1.5 rounded-md text-xs text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 transition-all"
                          >
                            Re-tailor
                          </Link>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <Link
                  href={`/dashboard/resume?tailorFor=${job.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-brand-500/5 border border-brand-500/10 hover:bg-brand-500/10 hover:border-brand-500/20 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-brand-400" />
                    <span className="text-sm text-brand-300 font-medium">
                      Tailor Resume for This Job
                    </span>
                  </div>
                  <CaretRight className="w-4 h-4 text-brand-500 group-hover:text-brand-400" />
                </Link>
              )}

              <Link
                href="/dashboard/interview"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-sm text-zinc-600 dark:text-gray-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-900 dark:hover:text-gray-200">
                  Start Interview Prep
                </span>
                <CaretRight className="w-4 h-4 text-zinc-700 dark:text-zinc-400 dark:text-gray-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-900 dark:hover:text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Job"
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
