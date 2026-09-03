"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  Trophy,
  CaretDown,
  CaretUp,
  Sparkle,
  Clock,
} from "@phosphor-icons/react";
import { useProfileStore } from "@/store/profileStore";
import { useResumeStore } from "@/store/resumeStore";
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import { useDiscoveryStore } from "@/store/discoveryStore";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

const COLLAPSED_STORAGE_KEY = "offerpath_onboarding_collapsed";

export function calculateTimeSavedHours(metrics: {
  resumesCount: number;
  jobsCount: number;
  storiesCount: number;
  mocksCount: number;
  hasSkills: boolean;
}): number {
  const hours =
    metrics.resumesCount * 1.5 +
    metrics.jobsCount * 0.5 +
    metrics.storiesCount * 1.0 +
    metrics.mocksCount * 0.8 +
    (metrics.hasSkills ? 1.0 : 0);
  return Math.round(hours * 10) / 10;
}

export default function OnboardingChecklistWidget() {
  const { t } = useTranslation();

  const profile = useProfileStore((s) => s.profile);
  const resumes = useResumeStore((s) => s.resumes);
  const jobs = usePipelineStore((s) => s.jobs);
  const stories = useInterviewStore((s) => s.stories);
  const mockSessions = useInterviewStore((s) => s.mockSessions);
  const discoveredCompanies = useDiscoveryStore((s) => s.companies);
  const discoveredJobs = useDiscoveryStore((s) => s.jobs);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === "1");
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  const steps = useMemo(() => {
    const hasProfileInfo =
      (Array.isArray(profile.keySkills) && profile.keySkills.length > 0) ||
      Boolean(profile.targetRoleSummary?.trim()) ||
      (Array.isArray(profile.workExperience) && profile.workExperience.length > 0);

    return [
      {
        id: "profile",
        label: t.dashboard.onboarding.stepProfile,
        href: "/dashboard/settings",
        done: Boolean(hasProfileInfo),
      },
      {
        id: "resume",
        label: t.dashboard.onboarding.stepBuildResume,
        href: "/dashboard/resume/new",
        done: resumes.length > 0,
      },
      {
        id: "job",
        label: t.dashboard.onboarding.stepAddJob,
        href: "/dashboard/pipeline",
        done: jobs.length > 0,
      },
      {
        id: "story",
        label: t.dashboard.onboarding.stepAddStory,
        href: "/dashboard/interview/stories",
        done: stories.length > 0 || mockSessions.length > 0,
      },
      {
        id: "discovery",
        label: t.dashboard.onboarding.stepTrackCompany,
        href: "/dashboard/discover",
        done: discoveredCompanies.length > 0 || discoveredJobs.length > 0,
      },
    ];
  }, [t, profile, resumes, jobs, stories, mockSessions, discoveredCompanies, discoveredJobs]);

  const doneCount = steps.filter((s) => s.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const allComplete = doneCount === steps.length;

  const badgeTitle = useMemo(() => {
    if (percent === 100) return t.dashboard.onboarding.badges.pro;
    if (percent >= 75) return t.dashboard.onboarding.badges.explorer;
    if (percent >= 50) return t.dashboard.onboarding.badges.navigator;
    if (percent >= 25) return t.dashboard.onboarding.badges.apprentice;
    return t.dashboard.onboarding.badges.newbie;
  }, [percent, t]);

  const timeSaved = useMemo(() => {
    return calculateTimeSavedHours({
      resumesCount: resumes.length,
      jobsCount: jobs.length,
      storiesCount: stories.length,
      mocksCount: mockSessions.length,
      hasSkills: Boolean(profile.keySkills && profile.keySkills.length > 0),
    });
  }, [resumes, jobs, stories, mockSessions, profile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="card-editorial space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-200">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-md bg-surface-100 border border-surface-200 flex flex-col items-center justify-center font-mono">
            {allComplete ? (
              <Sparkle weight="fill" className="w-5 h-5 text-amber-500" />
            ) : (
              <span className="text-xs font-bold text-surface-400">{percent}%</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-surface-400 font-sans">
                {t.dashboard.onboarding.title}
              </h3>
              {allComplete && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  <CheckCircle weight="fill" className="w-3 h-3" />
                  100%
                </span>
              )}
            </div>
            <p className="text-xs text-surface-300">
              {allComplete
                ? t.dashboard.onboarding.allConfigured
                : `${steps.length - doneCount} ${t.dashboard.onboarding.stepsRemaining}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="eyebrow-tag border border-surface-200 bg-surface-100 text-surface-400">
            <Trophy weight="bold" className="w-3 h-3 text-surface-400" />
            {badgeTitle}
          </span>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? t.dashboard.onboarding.showChecklist : t.dashboard.onboarding.hideChecklist}
            className="p-1 rounded text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-colors"
          >
            {isCollapsed ? (
              <CaretDown weight="bold" className="w-4 h-4" />
            ) : (
              <CaretUp weight="bold" className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Value Callout Banner */}
      {timeSaved > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-surface-50 border border-surface-200 text-xs">
          <div className="flex items-center gap-2 text-surface-400">
            <Clock weight="fill" className="w-4 h-4 text-brand-500 shrink-0" />
            <span className="font-medium">{t.dashboard.onboarding.timeSavedLabel}:</span>
            <span className="font-mono font-bold text-surface-500">
              ~{timeSaved} {t.dashboard.onboarding.timeSavedUnit}
            </span>
          </div>
          <span className="text-[10px] text-surface-300 hidden sm:inline">
            {t.dashboard.onboarding.timeSavedDesc}
          </span>
        </div>
      )}

      {/* Collapsible Steps List */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            key="checklist-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5 overflow-hidden"
          >
            {/* Progress track */}
            <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden mb-2">
              <motion.div
                className="bg-surface-400 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {steps.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 p-2.5 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-100 transition-all group"
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded flex items-center justify-center transition-all shrink-0",
                    item.done
                      ? "bg-surface-400 text-surface-0"
                      : "border border-surface-300 text-transparent"
                  )}
                >
                  {item.done && (
                    <CheckCircle className="w-3.5 h-3.5 text-surface-0" weight="bold" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium tracking-tight flex-1",
                    item.done
                      ? "text-surface-300 line-through"
                      : "text-surface-400 group-hover:text-black"
                  )}
                >
                  {item.label}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
