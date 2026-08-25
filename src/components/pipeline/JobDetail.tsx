"use client";

import { usePipelineStore } from "@/store/pipelineStore";
import { useResumeStore } from "@/store/resumeStore";
import { cn } from "@/lib/utils";
import ATSScoreBadge from "./ATSScoreBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ArrowLeft, ArrowSquareOut, Briefcase, Target, Calendar, CheckCircle, CaretRight, CurrencyDollar, Warning, FileText, MapPin, Shield, Star, Sparkle, Trash, XCircle, EnvelopeOpen, Copy, Check } from '@phosphor-icons/react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
 { id: "discarded", label: "Discarded", color: "bg-surface-300" },
 { id: "archived", label: "Archived", color: "bg-surface-300" },
];

// Score ring SVG component
function ScoreRing({ score }: { score: number }) {
 const percentage = (score / 5) * 100;
 const radius = 36;
 const stroke = 5;
 const circumference = 2 * Math.PI * radius;
 const offset = circumference - (percentage / 100) * circumference;

 return (
 <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
 <svg className="w-20 h-20 -rotate-90" viewBox="0 0 96 96">
 <circle
 cx="48"
 cy="48"
 r={radius}
 fill="none"
 stroke="var(--color-surface-200)"
 strokeWidth={stroke}
 />
 <circle
 cx="48"
 cy="48"
 r={radius}
 fill="none"
 stroke="var(--color-surface-400)"
 strokeWidth={stroke}
 strokeLinecap="round"
 strokeDasharray={circumference}
 strokeDashoffset={offset}
 className="transition-all duration-700 ease-out"
 />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-xl font-display font-bold text-surface-400">
 {score.toFixed(1)}
 </span>
 <span className="text-[9px] font-mono text-surface-300">/ 5.0</span>
 </div>
 </div>
 );
}

interface JobDetailProps {
 jobId: string;
}

export default function JobDetail({ jobId }: JobDetailProps) {
 const router = useRouter();
 const { getJobById, moveJob, deleteJob, updateJob } = usePipelineStore();
 const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
 const [evaluating, setEvaluating] = useState(false);
 const [upgradingATS, setUpgradingATS] = useState(false);
 const { getResumeById, atsEvaluations, runLocalATSEvaluation, upgradeATSEvaluationWithAI, getATSScoreView } = useResumeStore();
 const job = getJobById(jobId);
 const linkedResume = job?.resume_id ? getResumeById(job.resume_id) : undefined;

 const atsView = job?.resume_id ? getATSScoreView(job.resume_id, job.id) : null;
 const atsEngine = job?.resume_id ? atsEvaluations[`${job.resume_id}:${job.id}`]?.engine : undefined;

 useEffect(() => {
 if (job?.resume_id && job.description) {
 runLocalATSEvaluation(job.resume_id, job.id);
 }
 }, [job?.id, job?.resume_id, job?.description, runLocalATSEvaluation]);

 const handleUpgradeATS = async () => {
 if (!job?.resume_id || upgradingATS) return;
 setUpgradingATS(true);
 try {
 await upgradeATSEvaluationWithAI(job.resume_id, job.id);
 toast.success("AI match analysis complete.");
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "AI analysis failed.");
 } finally {
 setUpgradingATS(false);
 }
 };

 const handleRunEvaluation = async () => {
 if (!job || evaluating) return;
 setEvaluating(true);
 try {
 const { getLLMConfig, evaluateJob } = await import("@/lib/aiService");
 if (!getLLMConfig()) {
 toast.error("Add an API key in Settings to run AI evaluation.");
 return;
 }
 const evaluation = await evaluateJob({
 jobTitle: job.title,
 companyName:
 typeof job.company === "string" ? job.company : job.company?.name ?? "",
 jobDescription: job.description,
 location: job.location,
 profileSummary: linkedResume?.data.summary ?? "",
 });
 updateJob(job.id, { evaluation });
 toast.success("AI evaluation complete.");
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "AI evaluation failed.");
 } finally {
 setEvaluating(false);
 }
 };

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
 <Warning className="w-12 h-12 text-surface-300 mb-4" />
 <h2 className="text-xl font-display font-semibold text-surface-400 mb-2">Job Not Found</h2>
 <p className="text-sm text-surface-300 mb-6">
 This job may have been deleted or doesn&apos;t exist.
 </p>
 <Link
 href="/dashboard/pipeline"
 className="btn-editorial-secondary inline-flex items-center gap-2"
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
 className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-surface-300 hover:text-surface-400 transition-colors mb-6"
 >
 <ArrowLeft className="w-4 h-4" />
 Back to Pipeline
 </Link>

 {/* Header */}
 <div className="card-editorial mb-6 space-y-4">
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-4">
 {/* Company initial */}
 <div className="w-12 h-12 rounded-md bg-surface-400 flex items-center justify-center text-lg font-mono font-bold text-surface-0 flex-shrink-0">
 {(job.company?.name || "?").charAt(0)}
 </div>
 <div>
 <p className="text-xs font-mono text-surface-300 uppercase tracking-widest mb-0.5">{job.company?.name}</p>
 <h1 className="text-2xl font-display font-bold text-surface-400 leading-tight">{job.title}</h1>
 <div className="flex items-center gap-3 flex-wrap mt-2">
 <span
 className={cn(
 "px-2.5 py-0.5 rounded-md text-xs font-mono font-medium uppercase tracking-wider border",
 statusColor(job.status)
 )}
 >
 {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
 </span>
 {job.location && (
 <span className="flex items-center gap-1 text-xs text-surface-300 font-mono">
 <MapPin weight="bold" className="w-3.5 h-3.5" />
 {job.location}
 </span>
 )}
 {job.salary_range && (
 <span className="flex items-center gap-1 text-xs text-surface-300 font-mono">
 <CurrencyDollar weight="bold" className="w-3.5 h-3.5" />
 {job.salary_range}
 </span>
 )}
 {job.url && (
 <a
 href={job.url}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1 text-xs font-mono font-semibold text-surface-400 hover:text-black transition-colors"
 >
 <ArrowSquareOut weight="bold" className="w-3.5 h-3.5" />
 Posting
 </a>
 )}
 </div>
 </div>
 </div>

 {/* Delete button */}
 <button
 onClick={handleDelete}
 className="p-2 rounded-md text-surface-300 hover:text-red-600 hover:bg-pastel-red-bg transition-all"
 title="Delete job"
 >
 <Trash weight="bold" className="w-4 h-4" />
 </button>
 </div>

 {/* Status changer */}
 <div className="flex items-center gap-1.5 pt-3 border-t border-surface-200 overflow-x-auto">
 {STATUS_OPTIONS.map((opt) => (
 <button
 key={opt.id}
 onClick={() => handleStatusChange(opt.id)}
 className={cn(
 "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider transition-all whitespace-nowrap border",
 job.status === opt.id
 ? "bg-surface-400 text-surface-0 border-surface-400"
 : "bg-surface-50 text-surface-300 border-surface-200 hover:text-surface-400 hover:bg-surface-100"
 )}
 >
 <span className={cn("w-1.5 h-1.5 rounded-full", opt.color)} />
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
 <div className="flex border-b border-surface-200 mb-2 overflow-x-auto gap-4">
 <button
 onClick={() => setActiveTab("overview")}
 className={cn(
 "pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 px-1 transition-all whitespace-nowrap flex items-center gap-2",
 activeTab === "overview"
 ? "border-surface-400 text-surface-400 font-bold"
 : "border-transparent text-surface-300 hover:text-surface-400"
 )}
 >
 <Briefcase weight="bold" className="w-3.5 h-3.5" />
 Job Overview
 </button>
 <button
 onClick={() => setActiveTab("resume")}
 className={cn(
 "pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 px-1 transition-all whitespace-nowrap flex items-center gap-2",
 activeTab === "resume"
 ? "border-surface-400 text-surface-400 font-bold"
 : "border-transparent text-surface-300 hover:text-surface-400"
 )}
 >
 <FileText weight="bold" className="w-3.5 h-3.5" />
 Resume Preview
 {linkedResume && (
 <span className="eyebrow-tag bg-pastel-green-bg text-pastel-green-fg border border-pastel-green-fg/20">
 {atsView !== null ? `${atsView}% Match` : "Match"}
 </span>
 )}
 </button>
 <button
 onClick={() => setActiveTab("outreach")}
 className={cn(
 "pb-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 px-1 transition-all whitespace-nowrap flex items-center gap-2",
 activeTab === "outreach"
 ? "border-surface-400 text-surface-400 font-bold"
 : "border-transparent text-surface-300 hover:text-surface-400"
 )}
 >
 <Sparkle weight="bold" className="w-3.5 h-3.5 text-surface-400" />
 AI Outreach Studio
 </button>
 </div>

 {/* Tab Contents */}
 {activeTab === "overview" && (
 <div className="space-y-4">
 {/* Description */}
 <div className="card-editorial space-y-3">
 <h2 className="text-sm font-display font-bold text-surface-400 flex items-center gap-2">
 <Briefcase weight="bold" className="w-4 h-4 text-surface-400" />
 Job Description
 </h2>
 {job.description ? (
 <div className="text-xs text-surface-400 leading-relaxed whitespace-pre-wrap font-sans">
 {job.description}
 </div>
 ) : (
 <p className="text-xs text-surface-300 italic font-mono">
 No description available. Add a description by editing this job.
 </p>
 )}
 </div>

 {/* Notes */}
 {job.notes && (
 <div className="card-editorial space-y-2">
 <h2 className="text-sm font-display font-bold text-surface-400 flex items-center gap-2">
 <EnvelopeOpen weight="bold" className="w-4 h-4 text-surface-400" />
 Notes
 </h2>
 <div className="text-xs text-surface-400 leading-relaxed whitespace-pre-wrap font-sans">
 {job.notes}
 </div>
 </div>
 )}

 {/* Timeline */}
 <div className="card-editorial space-y-3">
 <h2 className="text-sm font-display font-bold text-surface-400 flex items-center gap-2">
 <Calendar weight="bold" className="w-4 h-4 text-surface-400" />
 Timeline
 </h2>
 <div className="space-y-2">
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
 className="flex items-center gap-3 text-xs font-mono"
 >
 <span className="w-1.5 h-1.5 rounded-full bg-surface-400" />
 <span className="text-surface-300 w-20 uppercase tracking-wider">{event.label}</span>
 <span className="text-surface-400 font-semibold">
 {event.date ? formatDate(event.date) : "—"}
 </span>
 </div>
 ))}
 
 {/* Activity History */}
 {job.history && job.history.length > 0 && (
 <div className="mt-4 pt-3 border-t border-surface-200">
 <h3 className="text-[10px] font-mono font-bold text-surface-300 uppercase tracking-widest mb-3">Activity Log</h3>
 <div className="space-y-3">
 {job.history.map((item, idx) => (
 <div key={idx} className="flex gap-3 text-xs">
 <div className="flex flex-col items-center">
 <div className="w-1.5 h-1.5 rounded-full bg-surface-400 mt-1" />
 {idx !== job.history!.length - 1 && (
 <div className="w-px h-full bg-surface-200 mt-1" />
 )}
 </div>
 <div className="pb-1">
 <div className="flex items-center gap-2 mb-0.5 font-mono">
 <span className="font-semibold text-surface-400">{item.action}</span>
 <span className="text-[10px] text-surface-300">{formatDate(item.date)}</span>
 </div>
 <p className="text-xs text-surface-300">{item.details}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {activeTab === "resume" && (
 <div className="space-y-4">
 {linkedResume ? (
 <div className="card-editorial space-y-4">
 <div className="flex items-center justify-between border-b border-surface-200 pb-3">
 <div>
 <h2 className="text-sm font-display font-bold text-surface-400 flex items-center gap-2">
 <FileText weight="bold" className="w-4 h-4 text-surface-400" />
 Linked Resume Preview
 </h2>
 <p className="text-xs text-surface-300 mt-0.5 font-mono">
 {linkedResume.title} — ATS Alignment: <span className="font-bold text-surface-400">{atsView !== null ? `${atsView}%` : "--"}</span>
 {atsEngine === "llm" && (
 <span className="ml-1.5 px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 text-[9px] font-sans font-bold uppercase">AI</span>
 )}
 </p>
 </div>
 <div className="flex gap-2">
 <button
 type="button"
 onClick={handleUpgradeATS}
 disabled={upgradingATS}
 className={cn(
 "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all",
 upgradingATS
 ? "bg-surface-100 text-surface-300 cursor-wait border-surface-200"
 : "bg-white text-surface-400 border-surface-200 hover:border-surface-400"
 )}
 >
 <Sparkle weight="fill" className={cn("w-3.5 h-3.5", upgradingATS && "animate-pulse")} />
 {upgradingATS ? "Analyzing…" : atsEngine === "llm" ? "Re-run AI analysis" : "Analyze with AI"}
 </button>
 <Link
 href={`/dashboard/resume?view=${linkedResume.id}`}
 className="btn-editorial-secondary"
 >
 Edit Resume
 </Link>
 <Link
 href={`/dashboard/resume?tailorFor=${job.id}`}
 className="btn-editorial-primary"
 >
 Re-tailor
 </Link>
 </div>
 </div>

 {/* Print Mockup Container */}
 <div className="rounded-md border border-surface-200 p-6 bg-white text-surface-400 font-sans max-h-[600px] overflow-y-auto">
 {/* Header */}
 <div className="text-center border-b border-surface-200 pb-4 mb-4">
 <h3 className="text-lg font-display font-bold text-surface-400 mb-0.5">{linkedResume.data.personal?.name || "Brouard Madan"}</h3>
 <p className="text-xs font-mono uppercase tracking-wider text-surface-300">{linkedResume.data.personal?.title || job.title}</p>
 <div className="flex justify-center gap-3 text-[10px] font-mono text-surface-300 mt-2 flex-wrap">
 {linkedResume.data.personal?.email && <span>{linkedResume.data.personal.email}</span>}
 {linkedResume.data.personal?.phone && <span>• {linkedResume.data.personal.phone}</span>}
 {linkedResume.data.personal?.location && <span>• {linkedResume.data.personal.location}</span>}
 {linkedResume.data.personal?.visa_status && <span>• {linkedResume.data.personal.visa_status}</span>}
 </div>
 </div>

 {/* Summary */}
 {linkedResume.data.summary && (
 <div className="mb-4 text-left">
 <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400 mb-1 border-b border-surface-200 pb-0.5">Professional Summary</h4>
 <p className="text-[11px] text-surface-400 leading-relaxed">{linkedResume.data.summary}</p>
 </div>
 )}

 {/* Experience */}
 {linkedResume.data.experience && linkedResume.data.experience.length > 0 && (
 <div className="mb-4 text-left">
 <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400 mb-2 border-b border-surface-200 pb-0.5">Professional Experience</h4>
 <div className="space-y-3">
 {linkedResume.data.experience.map((exp: ExperienceEntry, idx: number) => (
 <div key={idx} className="text-[11px]">
 <div className="flex justify-between items-baseline mb-0.5">
 <span className="font-bold text-surface-400">{exp.company} — {exp.title}</span>
 <span className="text-[9px] font-mono text-surface-300">{exp.start_date} to {exp.current ? "Present" : exp.end_date}</span>
 </div>
 {exp.bullets && exp.bullets.length > 0 && (
 <ul className="list-disc list-outside pl-4 space-y-0.5 mt-1 text-surface-400">
 {exp.bullets.map((b: string, bIdx: number) => (
 <li key={bIdx} className="leading-relaxed">{b}</li>
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
 <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400 mb-2 border-b border-surface-200 pb-0.5">Education</h4>
 <div className="space-y-1">
 {linkedResume.data.education.map((edu: EducationEntry, idx: number) => (
 <div key={idx} className="flex justify-between items-baseline text-[11px]">
 <span className="font-semibold text-surface-400">{edu.institution} — {edu.degree} in {edu.field}</span>
 <span className="text-[9px] font-mono text-surface-300">{edu.end_date}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Skills */}
 {linkedResume.data.skills && linkedResume.data.skills.length > 0 && (
 <div className="text-left">
 <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400 mb-2 border-b border-surface-200 pb-0.5">Skills & Competencies</h4>
 <div className="flex flex-wrap gap-1 mt-1">
 {linkedResume.data.skills.map((s: SkillItem, idx: number) => (
 <span key={idx} className={cn("px-2 py-0.5 rounded text-[10px] font-mono bg-surface-100 text-surface-400 border border-surface-200", s.isHighlighted && "bg-surface-400 text-surface-0 font-bold")}>
 {s.name}
 </span>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="card-editorial text-center py-8">
 <FileText weight="regular" className="w-10 h-10 text-surface-300 mx-auto mb-3" />
 <h3 className="text-sm font-bold text-surface-400 mb-1 font-display">No Resume Linked</h3>
 <p className="text-xs text-surface-300 mb-4 max-w-xs mx-auto">
 Link a tailored resume to this application to check ATS alignment, preview bullets, and generate outreach.
 </p>
 <Link
 href={`/dashboard/resume?tailorFor=${job.id}`}
 className="btn-editorial-primary inline-flex items-center gap-2"
 >
 <Sparkle weight="bold" className="w-3.5 h-3.5" />
 Tailor Resume for This Job
 </Link>
 </div>
 )}
 </div>
 )}

 {activeTab === "outreach" && (
 <div className="space-y-4">
 <div className="card-editorial space-y-4">
 <div>
 <h2 className="text-sm font-display font-bold text-surface-400 flex items-center gap-2">
 <EnvelopeOpen weight="bold" className="w-4 h-4 text-surface-400" />
 AI Outreach Studio
 </h2>
 <p className="text-xs text-surface-300 mt-1">
 Draft high-conversion outreach emails automatically customized for this position, company context, and your experience.
 </p>
 </div>

 <div className="grid sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">Outreach Purpose</label>
 <select
 value={outreachType}
 onChange={(e) => setOutreachType(e.target.value as typeof outreachType)}
 className="w-full px-3 py-1.5 text-xs bg-surface-50 border border-surface-200 rounded-md text-surface-400 focus:outline-none focus:border-surface-400 font-sans"
 >
 <option value="referral">Referral Request (Before Applying)</option>
 <option value="thankyou">Thank You Note (Post-Interview)</option>
 <option value="followup">Application Status Follow-up</option>
 <option value="negotiation">Offer Compensation Discussion</option>
 </select>
 </div>

 <div>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">Recipient Name</label>
 <input
 type="text"
 value={recipientName}
 onChange={(e) => setRecipientName(e.target.value)}
 placeholder="e.g. Hiring Manager, Recruiter"
 className="w-full px-3 py-1.5 text-xs bg-surface-50 border border-surface-200 rounded-md text-surface-400 focus:outline-none focus:border-surface-400 placeholder:text-surface-300 font-sans"
 />
 </div>
 </div>

 <div>
 <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-surface-300 mb-1">Tone & Style</label>
 <div className="flex gap-2 flex-wrap">
 {["Professional & Polished", "Short & Punchy", "Warm & Conversational", "Metrics-Driven"].map((tone) => (
 <button
 key={tone}
 onClick={() => setOutreachTone(tone)}
 className={cn(
 "px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-all",
 outreachTone === tone
 ? "bg-surface-400 text-surface-0 border-surface-400"
 : "bg-surface-50 border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-100"
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
 className="btn-editorial-primary w-full flex items-center justify-center gap-2"
 >
 <Sparkle weight="bold" className="w-3.5 h-3.5" />
 {isGeneratingOutreach ? "Tailoring Outreach Email..." : "Generate AI Outreach Email"}
 </button>
 </div>

 {generatedOutreach && (
 <div className="card-editorial space-y-3">
 <div className="flex items-center justify-between border-b border-surface-200 pb-2">
 <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-surface-400">Generated Email Draft</span>
 <button
 onClick={handleCopyOutreach}
 className="btn-editorial-secondary inline-flex items-center gap-1.5"
 >
 {copied ? (
 <>
 <Check weight="bold" className="w-3.5 h-3.5 text-pastel-green-fg" />
 <span>Copied!</span>
 </>
 ) : (
 <>
 <Copy weight="bold" className="w-3.5 h-3.5" />
 <span>Copy Draft</span>
 </>
 )}
 </button>
 </div>

 <textarea
 value={generatedOutreach}
 onChange={(e) => setGeneratedOutreach(e.target.value)}
 rows={12}
 className="w-full p-3 rounded-md bg-surface-50 border border-surface-200 text-xs text-surface-400 focus:outline-none focus:border-surface-400 font-mono leading-relaxed"
 />
 </div>
 )}
 </div>
 )}
 </div>

 {/* Right: Evaluation panel */}
 <div className="lg:col-span-2 space-y-4">
 {job.evaluation ? (
 <>
 {/* Score card */}
 <div className="card-editorial space-y-3">
 <h2 className="text-sm font-display font-bold text-surface-400 flex items-center gap-2">
 <Star weight="bold" className="w-4 h-4 text-surface-400" />
 AI Evaluation
 </h2>
 <div className="flex items-center gap-4">
 <ScoreRing score={job.evaluation.score} />
 <div>
 <div className="flex items-center gap-1.5 mb-1">
 <span className="eyebrow-tag bg-surface-100 text-surface-400 border border-surface-200 font-bold">
 Tier {job.evaluation.tier}
 </span>
 </div>
 <span className="eyebrow-tag bg-surface-50 text-surface-300 border border-surface-200">
 {job.evaluation.archetype}
 </span>
 </div>
 </div>
 <p className="text-xs text-surface-300 leading-relaxed font-sans border-t border-surface-200 pt-3">
 {job.evaluation.match_summary}
 </p>
 </div>

 {/* Fit reasons */}
 <div className="card-editorial space-y-2">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400 flex items-center gap-2">
 <CheckCircle weight="bold" className="w-3.5 h-3.5 text-pastel-green-fg" />
 Why It Fits
 </h3>
 <ul className="space-y-1.5">
 {job.evaluation.fit_reasons.map((reason, i) => (
 <li key={i} className="flex items-start gap-2 text-xs text-surface-300">
 <CaretRight weight="bold" className="w-3 h-3 text-surface-400 flex-shrink-0 mt-0.5" />
 <span>{reason}</span>
 </li>
 ))}
 </ul>
 </div>

 {/* Concerns */}
 <div className="card-editorial space-y-2">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400 flex items-center gap-2">
 <XCircle weight="bold" className="w-3.5 h-3.5 text-pastel-yellow-fg" />
 Concerns
 </h3>
 <ul className="space-y-1.5">
 {job.evaluation.concerns.map((concern, i) => (
 <li key={i} className="flex items-start gap-2 text-xs text-surface-300">
 <CaretRight weight="bold" className="w-3 h-3 text-surface-400 flex-shrink-0 mt-0.5" />
 <span>{concern}</span>
 </li>
 ))}
 </ul>
 </div>

 {/* Key requirements */}
 <div className="card-editorial space-y-2">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400 flex items-center gap-2">
 <Shield weight="bold" className="w-3.5 h-3.5 text-surface-400" />
 Key Requirements
 </h3>
 <ul className="space-y-1.5">
 {job.evaluation.key_requirements.map((req, i) => (
 <li key={i} className="flex items-start gap-2 text-xs text-surface-300">
 <Target weight="bold" className="w-3 h-3 text-surface-400 flex-shrink-0 mt-0.5" />
 <span>{req}</span>
 </li>
 ))}
 </ul>
 </div>
 </>
 ) : (
 <div className="card-editorial text-center py-6">
 <Star weight="regular" className="w-8 h-8 text-surface-300 mx-auto mb-2" />
 <h3 className="text-xs font-bold text-surface-400 mb-1 font-display">
 Not Evaluated Yet
 </h3>
 <p className="text-[11px] text-surface-300 mb-4 px-4">
 Run AI evaluation to get a fitness score and detailed match analysis.
 </p>
 <button
 type="button"
 onClick={handleRunEvaluation}
 disabled={evaluating}
 className={cn(
 "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
 evaluating
 ? "bg-brand-500/20 text-brand-300 cursor-wait"
 : "bg-brand-500 text-white hover:bg-brand-400"
 )}
 >
 <Sparkle weight="fill" className={cn("w-3.5 h-3.5", evaluating && "animate-pulse")} />
 {evaluating ? "Evaluating…" : "Run AI Evaluation"}
 </button>
 </div>
 )}

 {/* Quick Actions */}
 <div className="card-editorial space-y-3">
 <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">Quick Actions</h3>
 <div className="space-y-2">
 {job.resume_id ? (
 <div className="rounded-md border border-surface-200 p-3 bg-surface-50 space-y-2">
 {(() => {
 const linkedResume = getResumeById(job.resume_id!);
 const atsScore = atsView;
 return linkedResume ? (
 <>
 <div className="flex items-center gap-2">
 <FileText weight="bold" className="w-3.5 h-3.5 text-surface-400" />
 <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-surface-300">
 Linked Resume
 </span>
 </div>
 <p className="text-xs font-medium text-surface-400 truncate">
 {linkedResume.title}
 </p>
 <div className="py-1">
 <ATSScoreBadge score={atsScore ?? 0} size="sm" />
 </div>
 <div className="flex gap-2">
 <Link
 href={`/dashboard/resume?view=${linkedResume.id}`}
 className="flex-1 text-center py-1 rounded-md text-[11px] font-mono font-semibold bg-surface-0 border border-surface-200 text-surface-400 hover:bg-surface-100 transition-all"
 >
 View
 </Link>
 <Link
 href={`/dashboard/resume?tailorFor=${job.id}`}
 className="flex-1 text-center py-1 rounded-md text-[11px] font-mono font-semibold bg-surface-400 text-surface-0 hover:bg-black transition-all"
 >
 Re-tailor
 </Link>
 </div>
 </>
 ) : null;
 })()}
 </div>
 ) : (
 <Link
 href={`/dashboard/resume?tailorFor=${job.id}`}
 className="flex items-center justify-between p-3 rounded-md bg-surface-50 border border-surface-200 hover:bg-surface-100 transition-all group"
 >
 <div className="flex items-center gap-2">
 <Sparkle weight="bold" className="w-4 h-4 text-surface-400" />
 <span className="text-xs text-surface-400 font-semibold uppercase tracking-wider font-mono">
 Tailor Resume
 </span>
 </div>
 <CaretRight weight="bold" className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-400" />
 </Link>
 )}

 <Link
 href="/dashboard/interview"
 className="flex items-center justify-between p-3 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-50 transition-all group"
 >
 <span className="text-xs text-surface-400 font-medium">
 Start Interview Prep
 </span>
 <CaretRight weight="bold" className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-400" />
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
