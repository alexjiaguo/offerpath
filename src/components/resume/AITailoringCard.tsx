"use client";

import { useState, useEffect } from "react";
import { Sparkle, ArrowsClockwise, CheckCircle, X, Target, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ResumeData } from "@/types";
import { tailorResume, getLLMConfig, type TailorResult, type ATSResult } from "@/lib/aiService";
import { evaluateLocalAts } from "@/lib/localAts";
import { useProfileStore } from "@/store/profileStore";
import { useTranslation } from "@/i18n";

interface AITailoringCardProps {
  resumeData: ResumeData;
  resumeId: string;
  profileSummary: string;
  onApply: (result: TailorResult) => void;
  saveToHistory: (id: string) => void;
}

export default function AITailoringCard({
  resumeData,
  resumeId,
  profileSummary,
  onApply,
  saveToHistory,
}: AITailoringCardProps) {
  const { t, isZh } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [tailorJD, setTailorJD] = useState("");
  const [tailorJobTitle, setTailorJobTitle] = useState("");
  const [tailorCompany, setTailorCompany] = useState("");
  const [processing, setProcessing] = useState(false);
  const [draftResult, setDraftResult] = useState<TailorResult | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [usedMock, setUsedMock] = useState(false);
  // Re-render when keys change so the demo badge tracks reality.
  useProfileStore((s) => s.apiKeys);
  const aiAvailable = Boolean(getLLMConfig());

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setShowModal(false); setDraftResult(null); setAtsResult(null); setUsedMock(false); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [showModal]);

  const handleTailor = async () => {
    if (!tailorJD.trim()) return;
    setProcessing(true);
    // Without an API key tailorResume() fabricates a local demo draft —
    // badge it as such instead of presenting it as AI output.
    setUsedMock(!getLLMConfig());
    try {
      const tailorRes = await tailorResume({
        baseResume: resumeData,
        jobDescription: tailorJD,
        jobTitle: tailorJobTitle || "Job title",
        companyName: tailorCompany || "Target Company",
        profileSummary,
      });
      setDraftResult(tailorRes);

      // One AI action per tailor run: keyword-level match preview is computed
      // locally on the tailored draft; LLM reasoning stays available via
      // "Analyze with AI" on the job page.
      const tailoredData = {
        ...resumeData,
        summary: tailorRes.summary,
        experience: tailorRes.experience,
      };
      const local = evaluateLocalAts(tailoredData, tailorJD);
      const feedback: ATSResult["feedback"] = [];
      if (local.missingKeywords.length > 5) {
        feedback.push({ severity: "high", message: "Several JD keywords are still missing from the tailored draft." });
      }
      if (local.matchedKeywords.length > 0) {
        feedback.push({ severity: "low", message: `Covered: ${local.matchedKeywords.slice(0, 5).join(", ")}.` });
      }
      setAtsResult({
        score: local.score,
        matchedKeywords: local.matchedKeywords,
        missingKeywords: local.missingKeywords,
        feedback,
      });
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : t("resumeStudio.aiActions.enhanceBulletError") ||
              "Analysis failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  const applyDraft = () => {
    if (!draftResult) return;
    saveToHistory(resumeId);
    onApply(draftResult);
    setDraftResult(null);
    setAtsResult(null);
    setUsedMock(false);
    setShowModal(false);
    setTailorJD("");
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  const hasResult = !!(draftResult || atsResult);

  return (
    <>
      {/* Prominent card - full width, gradient accent */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="group w-full flex items-center gap-3 rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-500/10 to-brand-500/5 p-3 text-left transition-all hover:border-brand-500/40 hover:from-brand-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 min-w-0"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center flex-shrink-0">
          <Sparkle className="w-4.5 h-4.5 text-brand-400" weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-xs sm:text-sm font-bold text-surface-400 truncate">
            {t("resumeStudio.aiActions.tailorToJob") || "Tailor to a job"}
          </span>
          <span className="block text-[10px] sm:text-[11px] text-surface-300 mt-0.5 truncate">
            {hasResult
              ? (t("resumeStudio.aiActions.draftReady") || "Draft ready — click to review")
              : (t("resumeStudio.aiActions.tailorDesc") || "Rewrite your resume to match a job description")}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {atsResult && (
            <span className={cn("px-2 py-0.5 rounded-lg text-xs font-bold border", scoreBg(atsResult.score), scoreColor(atsResult.score))}>
              {atsResult.score}
            </span>
          )}
          {!aiAvailable && !hasResult && (
            <span className="px-2 py-0.5 rounded-md bg-surface-100 border border-surface-200 text-[9px] font-mono font-bold uppercase tracking-wider text-surface-300">
              {isZh ? "演示" : "Demo"}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-brand-500 text-white text-[10px] font-bold uppercase tracking-widest group-hover:bg-brand-400 transition-colors">
            {t("resumeStudio.aiActions.start") || "Start"}
          </span>
        </div>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => { setShowModal(false); setDraftResult(null); setAtsResult(null); setUsedMock(false); }}
        >
          <div
            className="bg-surface-50 border border-white/[0.08] rounded-[32px] w-full max-w-2xl mx-4 p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Sparkle className="w-6 h-6 text-brand-400" weight="fill" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-surface-400">
                    {t("resumeStudio.aiActions.tailorToJob") || "Tailor to a job"}
                  </h2>
                  <p className="text-[10px] text-surface-300 uppercase tracking-widest mt-0.5">
                    {t("resumeStudio.aiActions.tailorDesc") || "Updated resume and match score"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowModal(false); setDraftResult(null); setAtsResult(null); setUsedMock(false); }} className="p-2 rounded-xl text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!hasResult ? (
              <div className="space-y-6">
                {!aiAvailable && (
                  <div className="p-3 rounded-xl bg-surface-100 border border-surface-200 text-[11px] text-surface-300 leading-relaxed">
                    {isZh
                      ? "未连接 API Key：将生成本地演示草稿。在设置 → API Keys 中连接密钥即可获得 AI 定制。"
                      : "No API key connected: this produces a local demo draft. Connect a key in Settings → API Keys for AI tailoring."}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest ml-1">
                      {t("resumeStudio.fields.jobTitle") || "Job title"}
                    </label>
                    <input type="text" value={tailorJobTitle} onChange={(e) => setTailorJobTitle(e.target.value)} placeholder="e.g. Senior PM" className="w-full px-4 py-3 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest ml-1">
                      {t("resumeStudio.fields.company") || "Company"}
                    </label>
                    <input type="text" value={tailorCompany} onChange={(e) => setTailorCompany(e.target.value)} placeholder="e.g. Google" className="w-full px-4 py-3 rounded-xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all font-sans" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-surface-300 uppercase tracking-widest ml-1">
                    {t("resumeStudio.aiActions.jobDescription") || "Job Description"}
                  </label>
                  <textarea value={tailorJD} onChange={(e) => setTailorJD(e.target.value)} rows={8} placeholder={t("resumeStudio.aiActions.pasteJdPlaceholder") || "Paste the job description here..."} className="w-full px-5 py-4 rounded-2xl bg-white border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all resize-none font-sans" />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-surface-300 bg-surface-100 border border-surface-200 hover:bg-surface-200 transition-all uppercase tracking-widest">
                    {t("resumeStudio.dialogs.cancel") || "Cancel"}
                  </button>
                  <button onClick={handleTailor} disabled={processing || !tailorJD.trim()} className={cn("flex-[2] flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg", processing || !tailorJD.trim() ? "bg-surface-400 text-surface-300 cursor-not-allowed" : "bg-brand-500 text-white hover:bg-brand-400 shadow-brand-500/20")}>
                    {processing ? <><ArrowsClockwise className="w-5 h-5 animate-spin" /> {t("resumeStudio.aiActions.tailoring") || "Tailoring…"}</> : <><Sparkle className="w-5 h-5" /> {t("resumeStudio.aiActions.tailorResume") || "Tailor resume"}</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {usedMock && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-700 leading-relaxed">
                    {isZh
                      ? "演示草稿（本地规则生成，非 AI 输出）。连接 API Key 后可获得真正的 AI 定制。"
                      : "Demo draft (rule-based, not AI output). Connect an API key for real AI tailoring."}
                  </div>
                )}
                {/* ATS Score - prominent at top */}
                {atsResult && (
                  <div className={cn("p-5 rounded-2xl border flex items-center gap-6", scoreBg(atsResult.score))}>
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-white/5" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className={scoreColor(atsResult.score)} strokeDasharray={`${atsResult.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-bold font-display">{atsResult.score}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-surface-300" />
                        <span className="text-sm font-bold text-surface-400 uppercase tracking-widest">{t("resumeStudio.aiActions.atsScore") || "Keyword Match Preview"}</span>
                      </div>
                      <div className="text-[10px] font-bold text-surface-300 uppercase tracking-widest mb-2">
                        {atsResult.matchedKeywords.length} Matched - {atsResult.missingKeywords.length} Missing
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.matchedKeywords.slice(0, 8).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/15 text-[9px] font-bold text-emerald-600 uppercase">{kw}</span>
                        ))}
                        {atsResult.missingKeywords.slice(0, 4).map((kw, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/15 text-[9px] font-bold text-red-600 uppercase">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ATS Feedback */}
                {atsResult && atsResult.feedback.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-surface-300 uppercase tracking-widest flex items-center gap-2">
                      <Warning className="w-3.5 h-3.5" /> {t("resumeStudio.aiActions.suggestions") || "Suggestions"}
                    </div>
                    {atsResult.feedback.map((fb, i) => (
                      <div key={i} className={cn("p-2.5 rounded-lg border-l-2 text-[11px] font-medium leading-relaxed", fb.severity === "high" ? "bg-red-500/5 border-red-500/40 text-red-600" : fb.severity === "medium" ? "bg-amber-500/5 border-amber-500/40 text-amber-600" : "bg-blue-500/5 border-blue-500/40 text-blue-600")}>
                        {fb.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Success banner */}
                {draftResult && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest">{t("resumeStudio.aiActions.draftReady") || "Draft ready"}</p>
                      <p className="text-[10px] text-emerald-500/70 font-medium uppercase tracking-widest mt-0.5">{t("resumeStudio.aiActions.draftReadyDesc") || "Review the changes, then apply them."}</p>
                    </div>
                  </div>
                )}

                {/* New Summary */}
                {draftResult && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-surface-300 uppercase tracking-widest ml-1">{t("resumeStudio.aiActions.newSummary") || "New Summary"}</h4>
                    <div className="p-5 rounded-2xl bg-white border border-surface-200 text-sm text-surface-400 leading-relaxed font-sans">{draftResult.summary}</div>
                  </div>
                )}

                {/* Experience Changes */}
                {draftResult && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-surface-300 uppercase tracking-widest ml-1">{t("resumeStudio.aiActions.experienceChanges") || "Experience Changes"}</h4>
                    <div className="space-y-3">
                      {draftResult.experience.map((exp, i) => {
                        const old = resumeData.experience?.[i];
                        const beforeDates = [
                          old?.start_date,
                          old?.current ? "Present" : old?.end_date,
                        ].filter(Boolean).join(" – ");
                        const afterDates = [
                          exp.start_date,
                          exp.current ? "Present" : exp.end_date,
                        ].filter(Boolean).join(" – ");
                        return (
                          <div key={i} className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 truncate">{old?.title || old?.company || `Entry ${i + 1}`} - Before</p>
                              {beforeDates && <p className="text-[9px] text-surface-300 uppercase tracking-widest mb-1 truncate">{beforeDates}</p>}
                              <ul className="text-[10px] text-surface-300 leading-relaxed list-disc pl-4 space-y-0.5">
                                {(old?.bullets || []).map((b, bi) => <li key={bi}>{b.replace(/<[^>]*>/g, "")}</li>)}
                              </ul>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 truncate">{exp.title || exp.company || `Entry ${i + 1}`} - After</p>
                              {afterDates && <p className="text-[9px] text-surface-300 uppercase tracking-widest mb-1 truncate">{afterDates}</p>}
                              <ul className="text-[10px] text-surface-300 leading-relaxed list-disc pl-4 space-y-0.5">
                                {(exp.bullets || []).map((b, bi) => <li key={bi}>{b.replace(/<[^>]*>/g, "")}</li>)}
                              </ul>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tailoring Notes */}
                {draftResult && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-surface-300 uppercase tracking-widest ml-1">{t("resumeStudio.aiActions.tailoringNotes") || "Tailoring Notes"}</h4>
                    <div className="p-5 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-xs text-surface-400 leading-relaxed whitespace-pre-wrap font-sans">{draftResult.tailoringNotes}</div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button onClick={() => { setDraftResult(null); setAtsResult(null); setUsedMock(false); }} className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-surface-300 bg-surface-100 border border-surface-200 hover:bg-surface-200 transition-all uppercase tracking-widest">
                    {t("resumeStudio.aiActions.discard") || "Discard"}
                  </button>
                  <button onClick={applyDraft} disabled={!draftResult} className={cn("flex-[2] px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-xl uppercase tracking-widest", draftResult ? "bg-surface-400 text-white hover:bg-surface-400 shadow-white/5" : "bg-surface-200 text-surface-300 cursor-not-allowed")}>
                    {t("resumeStudio.aiActions.applyChanges") || "Apply changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
