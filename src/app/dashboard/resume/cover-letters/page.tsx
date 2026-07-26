"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  EnvelopeSimple,
  Plus,
  Sparkle,
  Trash,
  CheckCircle,
  Briefcase,
  ChatCircleText,
  Code,
  UserCircle,
  X,
  FloppyDisk,
  ArrowRight,
  Clock,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ─── Cover Letter types + sample data — resume.com's signature affordance ─── */
type CoverLetter = {
  id: string;
  title: string;
  recipient: string;
  company: string;
  role: string;
  greeting: string;
  body: string;
  closing: string;
  signoff: string;
  updatedAt: number;
};

const STORAGE_KEY = "offerpath:cover-letters:v1";

const SAMPLE_LETTERS: Array<Omit<CoverLetter, "id" | "updatedAt"> & { icon: typeof Briefcase; tag: string; reason: string }> = [
  {
    title: "Product Manager — Tech Lead Track",
    icon: Briefcase,
    tag: "Most popular",
    reason: "Use this if you're a senior PM stepping into a tech-lead role.",
    recipient: "Hiring Manager",
    company: "Acme Robotics",
    role: "Senior Product Manager, Platform",
    greeting: "Dear Hiring Team,",
    body: "I have spent the last six years building the kind of cross-functional bridges your job description describes — between product, platform engineering, and go-to-market — and I would love to bring that lens to Acme Robotics. Most recently at Lumen Labs I owned the platform pricing tier that grew ARR 38% YoY while reducing infra cost per tenant by 22%.\n\nThree things I would lean on in the first 90 days: (1) a clean inventory of the platform surface area and the cost-to-serve per workload, (2) a written north-star metric the team can defend, and (3) tighter feedback loops with the robotics-customer advisory board you mention in the JD.\n\nI would welcome the chance to walk through any of this in more depth — and to hear how you are thinking about the platform's next inflection.",
    closing: "Thank you for your time and consideration.",
    signoff: "Best regards,\nAvery Chen",
  },
  {
    title: "Software Engineer — Backend",
    icon: Code,
    tag: "SWE",
    reason: "Backend engineer moving into a new domain (e.g. ML infra, payments).",
    recipient: "Engineering Hiring Committee",
    company: "Northstar Payments",
    role: "Senior Software Engineer, Payments",
    greeting: "Hello Northstar team,",
    body: "I write because your payments role lines up with the work I have been doing for the past four years: idempotent distributed systems, audit-grade ledgers, and the kind of on-call hygiene that keeps a payments platform boring in the right way.\n\nIn my current role at Vellum I led the rewrite of the merchant settlement service from a cron-based night job to an event-sourced pipeline — same throughput, four nines instead of three, and ~$1.4M/year lower reconciliation labor. I would love to talk through how you are thinking about the next chapter of the ledger.\n\nHappy to share code samples, design docs, or the post-mortem that drove the rewrite.",
    closing: "Looking forward to hearing from you.",
    signoff: "Kind regards,\nMarcus Hill",
  },
  {
    title: "UX Designer — Senior IC",
    icon: UserCircle,
    tag: "Design",
    reason: "Senior designer making a portfolio-led case for the role.",
    recipient: "Design Lead",
    company: "Lumen Labs",
    role: "Senior UX Designer, Consumer",
    greeting: "Hi Design team,",
    body: "I have been following Lumen's design writing for a while, and the recent rebrand essay is what made me decide to apply directly. The point about taste as a forcing function for product decisions is the same lens I have been bringing to my work at Forge & Field for the past three years.\n\nI would love to walk you through the consumer-onboarding redesign I led last year — it cut day-7 retention 27% and won a Fast Company Innovation by Design award — and to hear how you are thinking about the next set of consumer surfaces at Lumen.\n\nPortfolio and case studies attached; happy to send a working prototype ahead of the interview.",
    closing: "Thanks for reading — talk soon.",
    signoff: "Warmly,\nPriya Anand",
  },
  {
    title: "Career Switcher — PM to Solutions Architect",
    icon: ChatCircleText,
    tag: "Pivot",
    reason: "You are switching roles. Lead with transferable wins, not title history.",
    recipient: "Talent Team",
    company: "Helios Cloud",
    role: "Solutions Architect, EMEA",
    greeting: "Dear Helios Talent Team,",
    body: "I am writing as a product manager with seven years of platform work who is making a deliberate move into a solutions architect role — and the EMEA scope on this team is exactly the kind of customer-facing technical leadership I have been building toward.\n\nThe skills that translate cleanly: I have shipped to enterprise customers in three regions, I can read a Swagger file and a Postgres plan without flinching, and I have spent two years embedded with the SRE org at my current company learning how the back of the house actually fails. What I am still building is the deep cert coverage, and that is on my plan for the next two quarters.\n\nI would love to talk through how you onboard architects who are strong on the customer side and still building out the deep technical stack.",
    closing: "Thank you for considering an adjacent background.",
    signoff: "With appreciation,\nD. Whitford",
  },
];

const TIPS = [
  "Open with the role you want next — not the role you have.",
  "Quantify one win per paragraph. Numbers earn the second read.",
  "Mirror 2-3 keywords from the JD verbatim. Recruiters scan for them.",
  "Keep it under 350 words. Long letters don't get finished.",
];

export default function CoverLettersPage() {
  const [tab, setTab] = useState<"mine" | "samples" | "new">("mine");
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [editing, setEditing] = useState<CoverLetter | null>(null);
  const [draft, setDraft] = useState<Omit<CoverLetter, "id" | "updatedAt"> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLetters(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (next: CoverLetter[]) => {
    setLetters(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const startNew = () => {
    setDraft({
      title: "Untitled cover letter",
      recipient: "Hiring Manager",
      company: "",
      role: "",
      greeting: "Dear Hiring Team,",
      body: "",
      closing: "Thank you for your time and consideration.",
      signoff: "Best regards,\n",
    });
    setTab("new");
  };

  const useSample = (sample: typeof SAMPLE_LETTERS[number]) => {
    setDraft({
      title: sample.title,
      recipient: sample.recipient,
      company: sample.company,
      role: sample.role,
      greeting: sample.greeting,
      body: sample.body,
      closing: sample.closing,
      signoff: sample.signoff,
    });
    setTab("new");
  };

  const saveDraft = () => {
    if (!draft) return;
    const id = `cl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const next: CoverLetter = { ...draft, id, updatedAt: Date.now() };
    persist([next, ...letters]);
    setEditing(next);
    setDraft(null);
    setTab("mine");
  };

  const removeLetter = (id: string) => {
    persist(letters.filter((l) => l.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);
  const bodyWords = draft ? wordCount(draft.body) : 0;
  const bodyTone = bodyWords === 0 ? "neutral" : bodyWords < 120 ? "tight" : bodyWords <= 350 ? "sweet spot" : "too long";

  return (
    <div className="max-w-6xl mx-auto py-8 px-2">
      <Link
        href="/dashboard/resume"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-surface-500 hover:text-brand-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Resume Studio
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">
            <Sparkle weight="fill" className="w-3 h-3" />
            Pair with any resume
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-brand-900 font-display tracking-tight">
            Cover Letters
          </h1>
          <p className="text-[14px] text-surface-500 font-medium mt-2 max-w-xl leading-relaxed">
            One-click drafts, JD-aware tone, ready to email. Resume.com users who attach a cover letter are 2x more likely to hear back.
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 hover:scale-[1.02] active:scale-95 shadow-md transition-all"
        >
          <Plus weight="bold" className="w-4 h-4" /> New cover letter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.05] rounded-2xl p-1.5 mb-6 w-fit">
        {[
          { key: "mine",    label: `My Letters · ${letters.length}` },
          { key: "samples", label: "Samples" },
          { key: "new",     label: draft ? "Editor" : "Tips" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "mine" | "samples" | "new")}
            className={cn(
              "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
              tab === t.key ? "bg-white dark:bg-white/[0.05] text-brand-900 dark:text-white shadow-sm" : "text-surface-500 hover:text-brand-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "mine" && (
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
          <div className="space-y-3">
            {letters.length === 0 ? (
              <div className="doppel-shell">
                <div className="doppel-core bg-white p-8 text-center relative z-10">
                  <EnvelopeSimple weight="duotone" className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                  <p className="text-sm text-surface-500">No cover letters yet. Start a new one, or fork a sample.</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button onClick={startNew} className="px-3 py-1.5 rounded-xl bg-brand-900 text-white text-[11px] font-bold uppercase tracking-widest">Start blank</button>
                    <button onClick={() => setTab("samples")} className="px-3 py-1.5 rounded-xl border border-surface-200 text-surface-500 text-[11px] font-bold uppercase tracking-widest hover:border-brand-200">Browse samples</button>
                  </div>
                </div>
              </div>
            ) : (
              letters.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setEditing(l)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all group",
                    editing?.id === l.id ? "border-brand-500/40 bg-brand-500/5" : "border-surface-200/50 bg-white hover:border-brand-200/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-900 truncate">{l.title}</p>
                      <p className="text-[11px] text-surface-500 truncate">{l.role}{l.company ? ` — ${l.company}` : ""}</p>
                      <p className="text-[10px] text-zinc-400 mt-1 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(l.updatedAt).toLocaleDateString()} · {wordCount(l.body)} words
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeLetter(l.id); }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Preview */}
          <div className="doppel-shell">
            <div className="doppel-core bg-white p-10 relative z-10 min-h-[480px]">
              {editing ? (
                <article className="prose prose-sm max-w-none">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">{editing.role}{editing.company ? ` at ${editing.company}` : ""}</p>
                  <p className="text-[14px] text-zinc-900 mb-4 whitespace-pre-line">{editing.greeting}</p>
                  {editing.body.split("\n\n").map((para, i) => (
                    <p key={i} className="text-[14px] text-zinc-700 leading-relaxed mb-3 whitespace-pre-line">{para}</p>
                  ))}
                  <p className="text-[14px] text-zinc-700 leading-relaxed mb-3 whitespace-pre-line">{editing.closing}</p>
                  <p className="text-[14px] text-zinc-900 mt-6 whitespace-pre-line">{editing.signoff}</p>
                </article>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-surface-500 py-16">
                  <EnvelopeSimple weight="duotone" className="w-12 h-12 mb-3 text-zinc-300" />
                  <p className="text-sm">Pick a letter on the left to preview it here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "samples" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {SAMPLE_LETTERS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="doppel-shell">
                <div className="doppel-core bg-white p-6 relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                      <Icon weight="duotone" className="w-5 h-5 text-brand-500" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600 px-2 py-1 rounded-full bg-brand-500/10">{s.tag}</span>
                  </div>
                  <h3 className="text-base font-bold text-brand-900 font-display tracking-tight">{s.title}</h3>
                  <p className="text-[12px] text-surface-500 mt-1 leading-relaxed">{s.reason}</p>
                  <p className="text-[10px] text-zinc-400 mt-2">{s.role} — {s.company}</p>
                  <button
                    onClick={() => useSample(s)}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-brand-900 hover:bg-brand-800 transition-all"
                  >
                    Fork this letter <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "new" && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Editor */}
          {draft ? (
            <div className="doppel-shell">
              <div className="doppel-core bg-white p-6 relative z-10 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Title</label>
                    <input className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-surface-200 text-sm focus:outline-none focus:border-brand-500/40" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Role</label>
                    <input className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-surface-200 text-sm focus:outline-none focus:border-brand-500/40" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Company</label>
                    <input className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-surface-200 text-sm focus:outline-none focus:border-brand-500/40" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Greeting</label>
                  <input className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-surface-200 text-sm focus:outline-none focus:border-brand-500/40" value={draft.greeting} onChange={(e) => setDraft({ ...draft, greeting: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Body</label>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest",
                      bodyTone === "sweet spot" ? "text-emerald-500" : bodyTone === "too long" ? "text-amber-500" : "text-zinc-400")}>
                      {bodyWords} words · {bodyTone}
                    </span>
                  </div>
                  <textarea rows={10} className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-surface-200 text-sm focus:outline-none focus:border-brand-500/40 leading-relaxed resize-none" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Two short paragraphs that open with the role you want next, and close with a number that proves the win." />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Closing</label>
                  <input className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-surface-200 text-sm focus:outline-none focus:border-brand-500/40" value={draft.closing} onChange={(e) => setDraft({ ...draft, closing: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sign-off</label>
                  <textarea rows={2} className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-surface-200 text-sm focus:outline-none focus:border-brand-500/40 resize-none" value={draft.signoff} onChange={(e) => setDraft({ ...draft, signoff: e.target.value })} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={saveDraft} className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 transition-all">
                    <FloppyDisk className="w-4 h-4" /> Save to My Letters
                  </button>
                  <button onClick={() => { setDraft(null); setTab("mine"); }} className="px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="doppel-shell">
              <div className="doppel-core bg-white p-8 relative z-10">
                <h2 className="text-base font-bold font-display text-brand-900 uppercase tracking-widest mb-4">4 things that make a cover letter worth reading</h2>
                <ul className="space-y-3">
                  {TIPS.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-zinc-700 leading-relaxed">
                      <CheckCircle weight="fill" className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={startNew} className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 transition-all">
                  <Plus weight="bold" className="w-4 h-4" /> Start a new letter
                </button>
              </div>
            </div>
          )}

          {/* Live preview */}
          {draft && (
            <div className="doppel-shell">
              <div className="doppel-core bg-white p-8 relative z-10 min-h-[480px]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Live preview</p>
                <article>
                  <p className="text-[14px] text-zinc-900 mb-3 whitespace-pre-line">{draft.greeting}</p>
                  {draft.body.split("\n\n").filter(Boolean).map((para, i) => (
                    <p key={i} className="text-[14px] text-zinc-700 leading-relaxed mb-3 whitespace-pre-line">{para}</p>
                  ))}
                  <p className="text-[14px] text-zinc-700 leading-relaxed mb-3 whitespace-pre-line">{draft.closing}</p>
                  <p className="text-[14px] text-zinc-900 mt-4 whitespace-pre-line">{draft.signoff}</p>
                </article>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
