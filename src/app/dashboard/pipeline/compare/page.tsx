"use client";

import Link from "next/link";
import { ArrowLeft, Bank, Check, CurrencyDollar, WarningCircle, MapPin, Star, Trophy } from '@phosphor-icons/react';
import { usePipelineStore } from "@/store/pipelineStore";
import { cn } from "@/lib/utils";

/* ═══════════════════════════════════════════════════
 Offer Compare — side-by-side offer comparison
 /dashboard/pipeline/compare
 ═══════════════════════════════════════════════════ */

export default function OfferComparePage() {
 const jobs = usePipelineStore((s) => s.jobs);
 const offeredJobs = jobs.filter((j) => j.status === "offered");
 const bestScore = Math.max(-1, ...offeredJobs.map((j) => j.score ?? -1));
 const bestId =
 bestScore >= 0
 ? offeredJobs.find((j) => j.score != null && j.score === bestScore)?.id
 : undefined;

 return (
 <div className="w-full animate-fade-in">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <Bank className="w-6 h-6 text-brand-400" />
 <h1 className="text-2xl font-bold">Compare Offers</h1>
 </div>
 <Link
 href="/dashboard/pipeline"
 className="flex items-center gap-1.5 text-sm text-surface-300 hover:text-surface-400 transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Back to Board
 </Link>
 </div>

 {offeredJobs.length === 0 ? (
 <div className="card-editorial rounded-2xl p-12 text-center">
 <Bank className="w-10 h-10 text-surface-400 mx-auto mb-4" />
 <h2 className="text-lg font-semibold mb-2">No offers to compare</h2>
 <p className="text-sm text-surface-300 mb-6 max-w-md mx-auto">
 Move jobs to the &quot;Offered&quot; column in your pipeline to compare
 offers side by side.
 </p>
 <Link
 href="/dashboard/pipeline"
 className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
 >
 Go to Pipeline →
 </Link>
 </div>
 ) : offeredJobs.length === 1 ? (
 <div className="space-y-6">
 <div className="card-editorial rounded-2xl p-6 text-center">
 <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-3" />
 <p className="text-sm text-surface-300 mb-4">
 You have one offer. Add more offers to compare them side by side.
 </p>
 </div>
 {/* Single offer card */}
 <OfferCard job={offeredJobs[0]} isBest={false} />
 </div>
 ) : (
 <>
 {/* Comparison Grid */}
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
 {offeredJobs.map((job) => (
 <OfferCard key={job.id} job={job} isBest={!!bestId && job.id === bestId} />
 ))}
 </div>

 {/* Comparison Table */}
 <div className="mt-8 card-editorial rounded-2xl overflow-hidden">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-surface-200">
 <th className="text-left px-5 py-3 text-xs font-semibold text-surface-300 uppercase tracking-wider">
 Factor
 </th>
 {offeredJobs.map((job) => (
 <th
 key={job.id}
 className="text-left px-5 py-3 text-xs font-semibold text-surface-400"
 >
 {job.title}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {[
 {
 label: "Company",
 render: (j: typeof offeredJobs[0]) =>
 j.company?.name || "—",
 },
 {
 label: "Location",
 render: (j: typeof offeredJobs[0]) => j.location || "—",
 },
 {
 label: "Salary Range",
 render: (j: typeof offeredJobs[0]) =>
 j.salary_range || j.comp_details?.base_salary || "Not disclosed",
 },
 {
 label: "Equity",
 render: (j: typeof offeredJobs[0]) =>
 j.comp_details?.equity || "—",
 },
 {
 label: "Bonus",
 render: (j: typeof offeredJobs[0]) =>
 j.comp_details?.bonus || "—",
 },
 {
 label: "Total Comp",
 render: (j: typeof offeredJobs[0]) =>
 j.comp_details?.total_comp || "—",
 },
 {
 label: "AI Score",
 render: (j: typeof offeredJobs[0]) =>
 j.score?.toFixed(1) || "—",
 },
 {
 label: "Role type",
 render: (j: typeof offeredJobs[0]) =>
 j.archetype || "—",
 },
 ].map((row, ri) => (
 <tr
 key={row.label}
 className={cn(
 "border-b border-white/[0.03]",
 ri % 2 === 0 ? "bg-surface-0/[0.01]" : ""
 )}
 >
 <td className="px-5 py-3 text-xs font-medium text-surface-300">
 {row.label}
 </td>
 {offeredJobs.map((job) => (
 <td key={job.id} className="px-5 py-3 text-sm text-surface-400">
 {row.render(job)}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </>
 )}
 </div>
 );
}

/* ── Offer Card Component ──────────────────────────── */

function OfferCard({
 job,
 isBest,
}: {
 job: ReturnType<typeof usePipelineStore.getState>["jobs"][0];
 isBest: boolean;
}) {
 return (
 <div
 className={cn(
 "card-editorial rounded-2xl p-6 relative",
 isBest && "border-2 border-emerald-500/30"
 )}
 >
 {isBest && (
 <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-md bg-emerald-500 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
 Highest Score
 </div>
 )}

 {/* Company */}
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-400 flex items-center justify-center text-lg font-bold text-surface-400">
 {(job.company?.name || "?").charAt(0)}
 </div>
 <div>
 <h3 className="text-base font-bold">{job.title}</h3>
 <p className="text-sm text-surface-300">{job.company?.name}</p>
 </div>
 </div>

 {/* Details */}
 <div className="space-y-3">
 {job.location && (
 <div className="flex items-center gap-2 text-sm text-surface-300">
 <MapPin className="w-4 h-4 text-surface-300" />
 {job.location}
 </div>
 )}

 {(job.salary_range || job.comp_details?.base_salary) && (
 <div className="flex items-center gap-2 text-sm">
 <CurrencyDollar className="w-4 h-4 text-emerald-400" />
 <span className="font-medium text-emerald-300">
 {job.salary_range || job.comp_details?.base_salary}
 </span>
 </div>
 )}

 {job.score !== undefined && (
 <div className="flex items-center gap-2 text-sm">
 <Star className="w-4 h-4 text-amber-400" />
 <span className="text-surface-400">
 Score: <strong>{job.score.toFixed(1)}</strong>/5.0
 </span>
 </div>
 )}

 {/* Comp Breakdown */}
 {job.comp_details && (
 <div className="mt-3 p-3 rounded-lg bg-surface-200/30 text-xs space-y-1.5">
 {job.comp_details.equity && (
 <div className="flex items-center justify-between">
 <span className="text-surface-300">Equity</span>
 <span className="text-surface-400">{job.comp_details.equity}</span>
 </div>
 )}
 {job.comp_details.bonus && (
 <div className="flex items-center justify-between">
 <span className="text-surface-300">Bonus</span>
 <span className="text-surface-400">{job.comp_details.bonus}</span>
 </div>
 )}
 {job.comp_details.total_comp && (
 <div className="flex items-center justify-between border-t border-surface-200 pt-1.5">
 <span className="text-surface-300 font-medium">Total Comp</span>
 <span className="font-semibold text-emerald-300">
 {job.comp_details.total_comp}
 </span>
 </div>
 )}
 </div>
 )}

 {/* Evaluation */}
 {job.evaluation && (
 <div className="mt-3 space-y-1.5">
 {job.evaluation.fit_reasons.slice(0, 2).map((reason, i) => (
 <div key={i} className="flex items-start gap-1.5 text-xs text-surface-300">
 <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" />
 {reason}
 </div>
 ))}
 {job.evaluation.concerns.slice(0, 1).map((concern, i) => (
 <div key={i} className="flex items-start gap-1.5 text-xs text-surface-300">
 <WarningCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
 {concern}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
