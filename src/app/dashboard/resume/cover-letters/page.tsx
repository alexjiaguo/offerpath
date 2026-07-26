"use client";

import Link from "next/link";
import { ArrowLeft, EnvelopeSimple, Sparkle } from "@phosphor-icons/react";

export default function CoverLettersPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <Link
        href="/dashboard/resume"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-surface-500 hover:text-brand-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Resumes
      </Link>

      <div className="doppel-shell">
        <div className="doppel-core bg-white p-10 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-5">
            <Sparkle weight="fill" className="w-3 h-3" />
            Coming soon
          </div>

          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-5">
            <EnvelopeSimple weight="bold" className="w-7 h-7 text-purple-500" />
          </div>

          <h1 className="text-2xl md:text-3xl font-light text-brand-900 font-display tracking-tight">
            Cover Letters
          </h1>
          <p className="text-[14px] text-surface-500 font-medium mt-3 max-w-md mx-auto leading-relaxed">
            Generate a matching cover letter from any resume in one click.
            Tailored to the JD, in your voice, ready to send.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-surface-500">
            <span className="inline-flex items-center gap-1.5"><Sparkle weight="fill" className="w-3.5 h-3.5 text-purple-500" /> One-click draft</span>
            <span className="text-surface-300">|</span>
            <span>JD-aware tone</span>
            <span className="text-surface-300">|</span>
            <span>Email-ready</span>
          </div>

          <div className="mt-8 pt-6 border-t border-surface-200/50">
            <Link
              href="/dashboard/resume"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-md transition-all"
            >
              Back to Resume Studio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
