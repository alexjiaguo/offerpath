"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BsArrowLeft, BsBriefcase, BsBuilding, BsGlobe, BsGeoAlt, BsCashCoin, BsPlus } from "react-icons/bs";
import { usePipelineStore } from "@/store/pipelineStore";

const JOB_TIERS = [1, 2, 3] as const;
const JOB_LEVELS = ["Entry", "Mid", "Senior", "Lead", "Manager", "Director", "VP"] as const;
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

export default function AddJobPage() {
  const router = useRouter();
  const { addJob } = usePipelineStore();

  const [form, setForm] = useState({
    title: "",
    company_name: "",
    company_url: "",
    location: "",
    salary_range: "",
    job_url: "",
    job_description: "",
    tier: 2 as 1 | 2 | 3,
    level: "Senior",
    type: "Full-time",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Job title is required";
    if (!form.company_name.trim()) newErrors.company_name = "Company name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      addJob({
        title: form.title,
        status: "new",
        location: form.location,
        salary_range: form.salary_range,
        url: form.job_url,
        description: form.job_description,
        tier: form.tier,
      });

      router.push("/dashboard/pipeline");
    } catch (err) {
      console.error("Failed to add job:", err);
      setErrors({ submit: "Failed to add job. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/pipeline"
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-white/[0.04] transition-colors"
        >
          <BsArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Job</h1>
          <p className="text-sm text-zinc-500 dark:text-gray-500">
            Track a new opportunity in your pipeline
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
            {errors.submit}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Job Title <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <BsBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Senior Product Manager"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
            />
          </div>
          {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
        </div>

        {/* Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Company Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <BsBuilding className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={form.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                placeholder="Acme Corp"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
            {errors.company_name && <p className="text-xs text-red-400 mt-1">{errors.company_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Company Website</label>
            <div className="relative">
              <BsGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="url"
                value={form.company_url}
                onChange={(e) => updateField("company_url", e.target.value)}
                placeholder="https://acme.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* Location & Salary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <div className="relative">
              <BsGeoAlt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="San Francisco, CA / Remote"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Salary Range</label>
            <div className="relative">
              <BsCashCoin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={form.salary_range}
                onChange={(e) => updateField("salary_range", e.target.value)}
                placeholder="$150K - $200K"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* Job URL */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Job Posting URL</label>
          <input
            type="url"
            value={form.job_url}
            onChange={(e) => updateField("job_url", e.target.value)}
            placeholder="https://linkedin.com/jobs/..."
            className="w-full px-4 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
          />
        </div>

        {/* Tier & Level & Type */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Tier</label>
            <div className="flex gap-1">
              {JOB_TIERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateField("tier", t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.tier === t
                      ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      : "bg-surface-100 text-zinc-500 border border-transparent hover:text-zinc-700"
                  }`}
                >
                  T{t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Level</label>
            <select
              value={form.level}
              onChange={(e) => updateField("level", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40"
            >
              {JOB_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => updateField("type", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm focus:outline-none focus:border-brand-500/40"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Job Description</label>
          <textarea
            value={form.job_description}
            onChange={(e) => updateField("job_description", e.target.value)}
            placeholder="Paste the job description here..."
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-surface-100 border border-zinc-200 dark:border-white/[0.06] text-sm resize-none focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/dashboard/pipeline"
            className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-100 dark:hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <BsPlus className="w-4 h-4" />
                Add to Pipeline
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
