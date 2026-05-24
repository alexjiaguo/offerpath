"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BsArrowLeft, BsBarChartFill, BsChatSquareText, BsClock, BsExclamationTriangle, BsGraphUp, BsLightbulb, BsSend, BsSquare, BsTrophy } from 'react-icons/bs';
import { usePipelineStore } from "@/store/pipelineStore";
import { useInterviewStore } from "@/store/interviewStore";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/* ═══════════════════════════════════════════════════
   Mock Interview — Chat-based AI interview session
   /dashboard/interview/[jobId]/mock
   ═══════════════════════════════════════════════════ */

function MockInterviewContent({ jobId }: { jobId: string }) {
  const searchParams = useSearchParams();
  const existingSessionId = searchParams.get("session");

  const { getJobById } = usePipelineStore();
  const {
    startMockSession,
    addMockMessage,
    endMockSession,
    getMockById,
  } = useInterviewStore();

  const job = getJobById(jobId);

  const [sessionId, setSessionId] = useState<string | null>(existingSessionId);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const session = sessionId ? getMockById(sessionId) : null;
  const isCompleted = session?.feedback != null;

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.transcript.length]);

  const handleStart = () => {
    const id = startMockSession(jobId);
    setSessionId(id);
  };

  const handleSend = () => {
    if (!userInput.trim() || !sessionId || isCompleted) return;

    addMockMessage(sessionId, "candidate", userInput.trim());
    setUserInput("");

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500);
  };

  const handleEnd = () => {
    if (!sessionId) return;
    endMockSession(sessionId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/interview/${jobId}`}
            className="p-1.5 rounded-lg text-zinc-500 dark:text-gray-500 hover:text-zinc-700 dark:hover:text-zinc-700 dark:hover:text-gray-300 hover:bg-white/[0.04] transition-all"
          >
            <BsArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <BsChatSquareText className="w-5 h-5 text-brand-400" />
              Mock Interview
            </h1>
            {job && (
              <p className="text-xs text-zinc-500 dark:text-gray-500">
                {job.title} · {job.company?.name}
              </p>
            )}
          </div>
        </div>

        {session && !isCompleted && (
          <button
            onClick={handleEnd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            <BsSquare className="w-3.5 h-3.5" />
            End Session
          </button>
        )}
      </div>

      {/* No session yet */}
      {!session ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="liquid-glass rounded-2xl p-12 text-center max-w-lg">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
              <BsChatSquareText className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ready for Practice?</h2>
            <p className="text-sm text-zinc-500 dark:text-gray-500 mb-8 leading-relaxed">
              The AI interviewer will ask you questions based on the job description.
              Type your answers naturally — you&apos;ll receive a detailed scorecard
              when you end the session.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white font-medium hover:opacity-90 transition-opacity"
            >
              <BsChatSquareText className="w-4 h-4" />
              Start Mock Interview
            </button>
          </div>
        </div>
      ) : isCompleted && session.feedback ? (
        /* Scorecard View */
        <div className="flex-1 overflow-y-auto space-y-5 animate-fade-in">
          {/* Overall Score */}
          <div className="liquid-glass rounded-2xl p-8 text-center">
            <BsTrophy className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <p className="text-sm text-zinc-500 dark:text-gray-500 mb-1">Overall Score</p>
            <p className="text-5xl font-bold gradient-text mb-2">
              {session.feedback.overall_score.toFixed(1)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-gray-500">
              out of 5.0
              {session.duration_seconds && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <BsClock className="w-3 h-3" />
                  {Math.ceil(session.duration_seconds / 60)} minutes
                </span>
              )}
            </p>
          </div>

          {/* Category Scores */}
          {session.feedback.category_scores && (
            <div className="liquid-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BsBarChartFill className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-semibold">Category Breakdown</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(session.feedback.category_scores).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-gray-400">{category}</span>
                      <span className="font-medium">{(score as number).toFixed(1)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-400 transition-all duration-500"
                        style={{ width: `${((score as number) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="liquid-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BsGraphUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-semibold">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {session.feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-gray-300">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="liquid-glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BsExclamationTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold">Areas to Improve</h3>
              </div>
              <ul className="space-y-2">
                {session.feedback.improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-gray-300">
                    <span className="text-amber-400 mt-0.5">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tips */}
          <div className="liquid-glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BsLightbulb className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-semibold">Tips for Next Time</h3>
            </div>
            <ul className="space-y-2">
              {session.feedback.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-gray-300">
                  <BsLightbulb className="w-3.5 h-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Back to Prep */}
          <div className="text-center pb-4">
            <Link
              href={`/dashboard/interview/${jobId}`}
              className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              ← Back to Prep Package
            </Link>
          </div>
        </div>
      ) : (
        /* Chat View */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            {session.transcript.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex animate-slide-up",
                  msg.role === "candidate" ? "justify-end" : "justify-start"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.role === "candidate"
                      ? "bg-brand-600/30 border border-brand-500/20 text-zinc-900 dark:text-gray-100"
                      : "liquid-glass text-zinc-800 dark:text-gray-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider",
                      msg.role === "candidate" ? "text-brand-300" : "text-zinc-500 dark:text-gray-500"
                    )}>
                      {msg.role === "candidate" ? "You" : "Interviewer"}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{msg.message}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="liquid-glass rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 liquid-glass rounded-2xl p-3 flex items-end gap-3">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer…"
              rows={2}
              className="flex-1 bg-transparent text-sm text-zinc-800 dark:text-gray-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!userInput.trim()}
              className="p-2.5 rounded-xl gradient-brand text-white hover:opacity-90 transition-opacity disabled:opacity-30 flex-shrink-0"
            >
              <BsSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MockInterviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto animate-fade-in flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MockInterviewContent jobId={jobId} />
    </Suspense>
  );
}
