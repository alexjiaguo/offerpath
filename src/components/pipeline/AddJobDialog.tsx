"use client";
import { logger } from "@/lib/logger";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowsClockwise, FileText, Link, Sparkle, X } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import { usePipelineStore } from "@/store/pipelineStore";
import { Dialog } from "@/components/ui/Dialog";
import { useTranslation } from "@/i18n";

/* ═══════════════════════════════════════════════════
   AddJobDialog — Modal for adding a new job
   URL paste or JD text with field extraction
   ═══════════════════════════════════════════════════ */

type InputMode = "url" | "text";

export default function AddJobDialog() {
  const { t, isZh } = useTranslation();
  const addJobDialogOpen = usePipelineStore((s) => s.addJobDialogOpen);
  const setAddJobDialogOpen = usePipelineStore((s) => s.setAddJobDialogOpen);
  const addJob = usePipelineStore((s) => s.addJob);
  const addJobPrefill = usePipelineStore((s) => s.addJobPrefill);
  const setAddJobPrefill = usePipelineStore((s) => s.setAddJobPrefill);
  const companies = usePipelineStore((s) => s.companies);
  const [mode, setMode] = useState<InputMode>("url");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [tier, setTier] = useState<1 | 2 | 3>(2);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setUrl("");
    setDescription("");
    setSalaryRange("");
    setCompanyUrl("");
    setTier(2);
    setNotes("");
    setIsEvaluating(false);
    setMode("url");
  };

  useEffect(() => {
    if (!addJobDialogOpen || !addJobPrefill) return;
    const p = addJobPrefill;
    if (p.title) setTitle(p.title);
    if (p.company?.name) setCompany(p.company.name);
    if (p.location) setLocation(p.location);
    if (p.url) setUrl(p.url);
    if (p.description) {
      setDescription(p.description);
      setMode("text");
    }
    if (p.salary_range) setSalaryRange(p.salary_range);
    if (p.tier === 1 || p.tier === 2 || p.tier === 3) setTier(p.tier);
    if (p.notes) setNotes(p.notes);
    setAddJobPrefill(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addJobDialogOpen, addJobPrefill]);

  const handleClose = () => {
    resetForm();
    setAddJobDialogOpen(false);
  };

  const applyParsedJob = (job: { title?: string; company?: string; location?: string; salary_range?: string }) => {
    let applied = false;
    if (job.title) { setTitle(job.title); applied = true; }
    if (job.company) { setCompany(job.company); applied = true; }
    if (job.location) { setLocation(job.location); applied = true; }
    if (job.salary_range) { setSalaryRange(job.salary_range); applied = true; }
    return applied;
  };

  const parseJobText = async (text: string) => {
    const res = await fetch("/api/jobs/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      toast.error(isZh ? "无法解析该招聘需求文本。" : "Could not parse the job description.");
      return;
    }
    const data = await res.json();
    if (data.job && applyParsedJob(data.job)) {
      toast.success(isZh ? "岗位信息提取成功！" : "Job details extracted!");
    } else {
      toast.error(isZh ? "未能在文本中找到有效职位字段。" : "No job fields found in that text.");
    }
  };

  const handleEvaluate = async () => {
    if (mode === "url") {
      const trimmedUrl = url.trim();
      if (!/^https?:\/\/.+/.test(trimmedUrl)) {
        toast.error(isZh ? "请输入以 http:// 或 https:// 开头的有效网址" : "Please enter a valid URL starting with http:// or https://");
        return;
      }
      setIsEvaluating(true);
      try {
        const fetchRes = await fetch("/api/jobs/fetch-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmedUrl })
        });
        const fetchData = await fetchRes.json().catch(() => ({}));
        if (!fetchRes.ok) {
          toast.error(fetchData?.error || (isZh ? "无法抓取该网页内容。" : "Couldn't fetch that page."));
          return;
        }
        setDescription(fetchData.text as string);
        await parseJobText(fetchData.text as string);
      } catch (e) {
        logger.error("Failed to import job from URL", e);
        toast.error(isZh ? "网址导入失败，请重试。" : "URL import failed. Please try again.");
      } finally {
        setIsEvaluating(false);
      }
      return;
    }

    if (!(description.trim())) {
      toast.message(isZh ? "请粘贴招聘描述 (JD) 以自动解析岗位、企业与工作地点。" : "Paste a job description to extract title, company, and location.");
      return;
    }
    setIsEvaluating(true);
    try {
      await parseJobText(description);
    } catch (e) {
      logger.error("Failed to parse job description", e);
      toast.error(isZh ? "自动提取信息失败" : "Failed to extract details automatically");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (url.trim() && !/^https?:\/\/.+/.test(url.trim())) {
      toast.error(isZh ? "请输入以 http:// 或 https:// 开头的有效网址" : "Please enter a valid URL starting with http:// or https://");
      return;
    }

    // Find or create company reference
    const existingCompany = companies.find(
      (c) => c.name.toLowerCase() === company.toLowerCase()
    );

    addJob({
      title: title.trim(),
      company_id: existingCompany?.id,
      company: existingCompany || (company
        ? {
            id: `temp-${Date.now()}`,
            user_id: "demo",
            name: company,
            career_url: companyUrl.trim() || undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      url: url.trim() || undefined,
      salary_range: salaryRange.trim() || undefined,
      tier,
      notes: notes.trim() || undefined,
      status: "new",
    });

    handleClose();
  };

  return (
    <Dialog open={addJobDialogOpen} onClose={handleClose} labelledBy="add-job-title" className="max-w-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
        <h2 id="add-job-title" className="text-lg font-semibold">{t.addJobDialog.title}</h2>
        <button
          type="button"
          onClick={handleClose}
          className="p-1.5 rounded-lg text-surface-300 hover:text-surface-400 hover:bg-surface-0/[0.06] transition-all"
          aria-label={t.common.close}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Input Mode Toggle */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 p-1 bg-surface-200/60 rounded-lg w-fit">
          <button
            onClick={() => setMode("url")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              mode === "url"
                ? "bg-surface-100 text-black shadow-sm"
                : "text-black hover:text-black"
            )}
          >
            <Link className="w-3.5 h-3.5" />
            {t.addJobDialog.pasteUrlTab}
          </button>
          <button
            onClick={() => setMode("text")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              mode === "text"
                ? "bg-surface-100 text-black shadow-sm"
                : "text-black hover:text-black"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            {t.addJobDialog.pasteJdTab}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {mode === "url" && (
          <div>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">
              {t.addJobDialog.urlLabel}
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://careers.google.com/jobs/..."
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">
              {t.addJobDialog.jobTitleLabel}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.addJobDialog.jobTitlePlaceholder}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">
              {t.addJobDialog.companyLabel}
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={t.addJobDialog.companyPlaceholder}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">
              {t.addJobDialog.locationLabel}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.addJobDialog.locationPlaceholder}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">
              {t.addJobDialog.salaryRangeLabel}
            </label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder={t.addJobDialog.salaryRangePlaceholder}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-surface-300 mb-1.5 block">
            {isZh ? "公司官网 / 招聘页" : "Company career page"}
          </label>
          <input
            type="url"
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="https://company.com/careers"
            className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-surface-300 mb-1.5 block">
            {isZh ? "优先级 Tier" : "Priority tier"}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((tierValue) => (
              <button
                key={tierValue}
                type="button"
                onClick={() => setTier(tierValue)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold border transition-all",
                  tier === tierValue
                    ? "bg-surface-400 text-white border-surface-400"
                    : "bg-surface-50 text-surface-300 border-surface-200 hover:border-surface-300"
                )}
              >
                {isZh ? `Tier ${tierValue}` : `Tier ${tierValue}`}
                <span className="block text-[10px] font-normal opacity-70">
                  {tierValue === 1
                    ? isZh ? "全力冲刺" : "Dream role"
                    : tierValue === 2
                      ? isZh ? "积极争取" : "Strong interest"
                      : isZh ? "机会观察" : "Worth watching"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {mode === "text" && (
          <div>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">
              {t.addJobDialog.descriptionLabel}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.addJobDialog.descriptionPlaceholder}
              rows={6}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-surface-300 mb-1.5 block">
            {isZh ? "备注（TA / 内推人联系方式等）" : "Notes (recruiter / TA contacts, referrals…)"}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isZh
                ? "例如：TA Sarah Li (sarah@company.com)，内推人张伟，HR 电话 13800000000"
                : "e.g. TA: Sarah Li (sarah@company.com), referral: Wei Zhang, HR phone +1 …"
            }
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-surface-200 text-sm text-surface-400 placeholder:text-surface-300 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 bg-surface-100/30">
        <button
          onClick={handleEvaluate}
          disabled={isEvaluating || (mode === "url" ? !/^https?:\/\/.+/.test(url.trim()) : (!title.trim() && !description.trim()))}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            isEvaluating
              ? "bg-brand-500/20 text-brand-300 cursor-wait"
              : "bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {isEvaluating ? (
            <ArrowsClockwise className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkle className="w-4 h-4" />
          )}
          {isEvaluating ? t.addJobDialog.extracting : t.addJobDialog.extractFields}
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-400 hover:bg-surface-0/[0.04] transition-all"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="btn-editorial-primary text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.addJobDialog.addJobBtn}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
