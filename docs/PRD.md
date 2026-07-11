# OfferPath — Product Requirements Document

**Version:** 1.0 · **Status:** v3 Architecture  
**Last updated:** June 17, 2026  
**Owners:** Product, Design, Engineering  
**Target launch:** General Availability (live in beta at offerpath-ubkywtxwz.vercel.app)

---

## 1. Executive Summary

OfferPath is a **premium, utilitarian career operating system** that consolidates the modern job search into a single workspace. It treats the search like a high-stakes project: structured, measurable, and powered by AI. The product replaces chaotic spreadsheets, scattered Google Docs, and siloed tools (LinkedIn, Notion, Sheets, ChatGPT) with a unified, opinionated surface for tracking applications, tailoring resumes, discovering opportunities, and preparing for interviews.

### 1.1 Problem statement

The modern job search is data-heavy, high-stakes, and poorly served by current tools:

- 60% of candidates use **3+ disconnected tools** to manage a search (spreadsheet + docs + LinkedIn + ChatGPT).
- The average senior candidate runs **40–80 active applications** at a time, with no shared state.
- Tailoring a resume to a single JD takes **45–90 minutes** and is the #1 cause of low-quality applications.
- Interview prep is reactive (the night before) and not anchored to the actual JD.

### 1.2 Solution

OfferPath is a single, opinionated workspace with four integrated modules — **Tracker, Resume Studio, Job Search, Interview Simulator** — wrapped in a Dashboard hub and unified design system. Every artifact (job, resume, story, prep) is a first-class object that the AI can reason across.

### 1.3 Differentiators

1. **End-to-end loop** — Discovery → Tailoring → Application → Interview → Offer. No other tool closes this loop in one product.
2. **AI anchored to the user's own data** — Every score, summary, and mock question is generated from the user's base resume, base stories, and the live JD.
3. **Multi-provider BYOK** — Bring your own OpenAI/Anthropic/Gemini/Perplexity keys. No vendor lock-in.
4. **Editorial-luxury aesthetic** — Soft structuralism design system. Quiet, dense, made for daily use.

---

## 2. Goals, Non-Goals, and Success Metrics

### 2.1 Product goals (12 months)

| # | Goal | Primary metric |
|---|------|----------------|
| G1 | Land more interviews per user | Median applications-to-interview conversion lift from baseline 18% → 32% |
| G2 | Reduce time spent tailoring | Time to tailored resume per JD: 45m → 90s |
| G3 | Become the daily workspace | DAU/MAU ratio ≥ 0.45 |
| G4 | Drive word-of-mouth | NPS ≥ 55, K-factor ≥ 0.35 |
| G5 | Convert to Pro | Free→Pro conversion ≥ 6% within 30 days |

### 2.2 Non-goals (out of scope for v3)

- Recruiter-facing ATS / applicant tracking for companies
- Job board marketplace (we aggregate, not host)
- Salary benchmarking datasets (we surface what users paste)
- Mobile native apps (responsive web only in v3)
- Calendar/scheduling integrations (deferred to v4)

### 2.3 Success metrics

- **Activation:** % of new signups who add ≥ 1 job + complete 1 resume within 7 days — target 60%
- **Engagement:** Median session length ≥ 6 minutes, ≥ 3 sessions per week
- **Retention:** D30 retention ≥ 35%, D90 ≥ 22%
- **Quality:** Average ATS score of tailored resumes ≥ 88
- **Reliability:** AI feature p95 latency ≤ 8s, error rate ≤ 1.5%

---

## 3. Target Users and Personas

### 3.1 Primary persona — "Strategic Senior"

**Maya, 32 · Senior Product Designer · Brooklyn, NY**

- 8 years experience, ex-Stripe, ex-Airbnb, targeting Staff/Lead roles at $200k+.
- Runs a structured search across 5–8 target companies, plus 30–50 "spray and pray" applications.
- Pain: tailoring eats her evenings; loses track of which company wants what; no consolidated view of where she stands.
- **Jobs to be done:** (1) "Show me which 3 applications to focus on today" (2) "Tailor this resume in 90 seconds" (3) "Help me prep for the Meta onsite on Friday."

### 3.2 Secondary persona — "Career Switcher"

**Devon, 28 · Data Analyst → PM · Austin, TX**

- 4 years experience, transitioning from analytics to product.
- 60–80 active applications, high anxiety, low response rate.
- Pain: doesn't know what to highlight; sends generic resumes; no interview pipeline.
- **Jobs to be done:** (1) "Score my fit so I stop applying to dead ends" (2) "Translate my analytics wins into PM language" (3) "Practice behavioral questions."

### 3.3 Tertiary persona — "International Newcomer"

**Priya, 26 · CS New Grad · Toronto, ON · targeting US roles**

- Strong technical skills, weaker US resume conventions.
- 80+ applications, response rate < 8%.
- Pain: doesn't know how to format a US resume; no network; interview skills not US-normed.
- **Jobs to be done:** (1) "Convert my CV to a US-style resume" (2) "Find roles open to sponsorship" (3) "Practice behavioral questions US-style."


---

## 4. Product Architecture and Information Architecture

### 4.1 IA overview

```
/                              Marketing landing
/login, /register              Auth
/dashboard                     Career HQ (hub)
/dashboard/pipeline            Tracker · Board (default)
/dashboard/pipeline/[id]       Tracker · Job Detail
/dashboard/pipeline/add        Tracker · Add Job (modal route)
/dashboard/pipeline/analytics  Tracker · Analytics
/dashboard/pipeline/compare    Tracker · Compare
/dashboard/discover            Job Search · Smart Feed
/dashboard/discover/[id]       Job Search · Job Detail
/dashboard/resume              Resume Studio · Library
/dashboard/resume/new          Resume Studio · New
/dashboard/resume/[id]         Resume Studio · Editor
/preview-templates             Public template gallery
/dashboard/interview           Interview Prep · Hub
/dashboard/interview/[jobId]   Interview Prep · Mock Session
/dashboard/interview/stories   Interview Prep · Story Bank
/dashboard/settings            Settings · Profile
/dashboard/settings/billing    Settings · Billing & Plans
/dashboard/settings/api-keys   Settings · API Configuration
```

### 4.2 Bounded contexts (DDD)

| Context | Owns | Dependencies |
|---------|------|--------------|
| **Identity** | Auth, profile, preferences, API keys | None |
| **Pipeline** | Job entities, status transitions, fit scoring | Identity, AI |
| **Resume** | Resume entities, tailoring, ATS scoring, templates | Identity, AI |
| **Discovery** | External job matches, company research | Identity, AI, Pipeline |
| **Interview** | Mock sessions, story bank, prep packs | Identity, AI, Pipeline |
| **Analytics** | Aggregated rollups across all contexts | All |

### 4.3 Tech stack

- **Framework:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS 4, custom design system (`globals.css` soft structuralism theme)
- **State:** Zustand (per-domain stores)
- **DB/Auth:** Supabase (Postgres + Auth + RLS)
- **AI:** Multi-provider (OpenAI, Anthropic, Gemini, Perplexity) — BYOK with managed fallback
- **Rich text:** TipTap
- **PDF/Word export:** pdfjs, docx, server-side Chromium
- **DnD:** @dnd-kit (Kanban)
- **Charts:** Recharts
- **Hosting:** Vercel (Fluid Compute)

---

## 5. Design System

### 5.1 Aesthetic — "Soft Structuralism / Editorial Luxury"

OfferPath is **not** a marketing site. It is a workspace. The aesthetic reflects this:

- **Surfaces:** Warm cream `#FDFBF7` for page backgrounds; white cards on top. Not pure white, not gray. *Readable for 8 hours a day.*
- **Text:** Deep espresso-navy `#0F172A` for primary; muted slate `#64748B` for secondary.
- **Accents:** Burnt amber `#B5793B` (the only non-neutral color), forest green `#1F7A4D` for positive, dusty red `#B33A3A` for negative, muted blue `#3B6CB7` for info.
- **Typography:** Plus Jakarta Sans (UI), Playfair Display (display + serif emphasis). Letter-spacing -0.02em on headlines, +0.1em uppercase on labels.
- **Geometry:** Generous 18–24px border-radius, soft 8/16/24/32px spacing scale, glass-morphism sidebar (`backdrop-blur-2xl`).
- **Motion:** 700ms `cubic-bezier(0.32, 0.72, 0, 1)` for state transitions; `framer-motion` for layout shifts.

### 5.2 Iconography

Phosphor icons (`weight="light"` in nav, `regular` in body). No emoji as UI icons. The amber sparkle ✨ is the one concession.

### 5.3 Component primitives

- **Card:** white bg, 1px `#E6E4DD` border, 18px radius, 24px padding.
- **Chip:** 11px font, 3/10px padding, full pill, semantic variants (green/amber/red/blue/neutral).
- **Button:** Full pill, three variants (primary navy, secondary outline, ghost text).
- **Stat card:** uppercase 11px label + Playfair 32px value + small delta.
- **Modal:** 24px radius, 32px padding, blurred dark scrim.

---

## 6. Features

Each feature below follows a consistent structure: **Purpose · User stories · Use cases · Workflow · UI design (with screenshot) · Edge cases · Success criteria**.


---

### Feature 1 — Marketing Landing Page

#### 1.1 Purpose
Convert first-time visitors to signups. Establish the brand: serious, editorial, premium.

#### 1.2 User stories
- As a **prospective user**, I want to understand the product in 5 seconds.
- As a **prospective user**, I want to see the product in action (not marketing copy).
- As a **prospective user**, I want one obvious next step (Get Started).

#### 1.3 Use cases
- **UC1.1** Anonymous visitor arrives from a tweet. Sees the hero, two CTAs. Clicks "Get Started Free" → `/register`.
- **UC1.2** Visitor scrolls. Reads the bento grid of 5 features. Identifies their pain (e.g. "I need to tailor faster"). Clicks "Open Resume Studio" in card 2.

#### 1.4 User journey
```
Tweet / SEO / referral
    ↓
Hero (3-second scan)
    ↓ [Get Started Free]
Register
    ↓ [Learn More]
Bento features scroll
    ↓ [Tailor & apply] from card
App (logged in)
```

#### 1.5 Workflow
1. Visitor lands. Hero is above the fold; floats are decorative but reveal product affordances.
2. "Get Started Free" → `/register`. No paywall, no card.
3. "Learn More" smooth-scrolls to the bento features.
4. Bento cards use gentle "Read more →" CTAs that lead to the relevant module in the app.

#### 1.6 UI design

![Landing Page Hero](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-landing-hero.png)

*Hero — OfferPath wordmark, "The Career Operating System" tagline, two CTAs, and three floating product previews (Kanban, Resume, Interview) on a soft cream background with dot grid.*

![Landing Page Features Bento](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-landing-features.png)

*Features bento — a 2-up hero card (Tracker) + 3 secondary cards (Resume Studio, Discover, Interview, Analytics) on the cream editorial canvas. Dark navy hero card creates hierarchy.*

#### 1.7 Edge cases
- Visitor on mobile: bento collapses to vertical stack; hero floats hide (perf).
- Visitor on slow connection: hero shows static text-only fallback.

#### 1.8 Success criteria
- ≥ 8% visitor → signup conversion.
- ≤ 35% bounce rate from `/`.

---

### Feature 2 — Authentication (Sign In & Sign Up)

#### 2.1 Purpose
Lower friction to first session. Magic-link, email/password, and Google OAuth.

#### 2.2 User stories
- As a **new user**, I want to create an account in < 60 seconds.
- As a **returning user**, I want to sign in via Google in one click.

#### 2.3 Use cases
- **UC2.1** New user lands on `/register`. Sees the editorial left rail ("Your career, finally organized"), picks "Job seeker" or "Recruiter" persona, signs up.
- **UC2.2** Returning user opens `/login`. Signs in with email/password OR Google. Middleware (`src/middleware.ts`) checks Supabase session and routes to `/dashboard`.

#### 2.4 User journey
```
/ (landing) → /register → (verify email optional) → /dashboard
/ (landing) → /login → /dashboard
/dashboard (no session) → /login (middleware redirect)
```

#### 2.5 Workflow
1. Form input validated client-side (Zod) and server-side (Server Action).
2. On submit, Supabase `signUp` / `signInWithPassword` called.
3. Success → `/dashboard` with a one-time "Welcome to OfferPath" toast.
4. Failure → inline error under the offending field, never a redirect.

#### 2.6 UI design

![Sign In](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-login.png)

*Sign in — split-screen editorial layout. Dark navy left rail with brand pitch and feature bullets; cream right with a focused form (email, password, primary CTA, Google OAuth).*

![Create Account](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-register.png)

*Create account — same editorial shell. Adds Full name, Work email, Password, and an "I am a…" persona selector (Job seeker / Recruiter).*

#### 2.7 Edge cases
- Email already in use → "This email is already registered. [Sign in instead]"
- Magic link expired → resend button
- OAuth user without profile → default persona is "Job seeker"; user can change in settings
- Session lost on protected route → middleware redirects to `/login?returnTo=...`

#### 2.8 Success criteria
- ≥ 75% of new accounts complete profile setup in the same session.

---

### Feature 3 — Dashboard Hub

#### 3.1 Purpose
The single daily-entry screen. Shows: where the user is, what's important today, what needs attention.

#### 3.2 User stories
- As a **user**, I want to see my pipeline health in 2 seconds.
- As a **user**, I want to know which 3 actions to take today.
- As a **user**, I want to track my weekly application goal.

#### 3.3 Use cases
- **UC3.1** Maya opens the app. Sees Total Jobs 42, Interview Rate 28.6%, Avg Fit Score 74.2, "This Week +9 (90% of weekly goal)". She clicks Tailoring Queue to see which jobs need a tailored resume.
- **UC3.2** Devon opens the app. Quick-action cards take him straight to "Find Jobs" (his weak area). One click.

#### 3.4 User journey
```
/login → /dashboard
/dashboard
   ├→ Module card "Open Tracker" → /dashboard/pipeline
   ├→ Module card "Open Builder" → /dashboard/resume
   ├→ Module card "Search Jobs" → /dashboard/discover
   └→ Tailoring queue item → /dashboard/resume?tailorFor=...
```

#### 3.5 Workflow
1. `usePipelineStore.getStats()` returns aggregates: total, byStatus, interviewRate, avgScore, addedThisWeek.
2. `useResumeStore` returns base/tailored counts.
3. `useDiscoveryStore` returns lead counts.
4. `useInterviewStore` returns story count.
5. Cards are computed in `useMemo`; mini-stats update reactively.

#### 3.6 UI design

![Dashboard Hub](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-dashboard.png)

*Dashboard — left rail nav (Overview / Modules / Account), top bar with greeting + weekly goal chip + avatar. Four stat cards (Total Jobs, Interview Rate, Avg Fit Score, This Week). Three module cards with mini-stats and CTAs. Tailoring queue panel at the bottom highlights jobs that still need a tailored resume.*

#### 3.7 Edge cases
- New user with 0 jobs → empty state copy: "Add your first job to get your AI fit score." CTA: "+ Add job"
- 100+ jobs → paginate or virtualize (v4)
- API key missing → subtle banner: "AI features are paused. Add a key in Settings."

#### 3.8 Success criteria
- ≥ 60% of DAU land on `/dashboard` first
- Median time-to-first-action from login ≤ 15 seconds


---

### Feature 4 — Job Pipeline (Kanban Board)

#### 4.1 Purpose
The single most-used screen. Visual, drag-and-drop tracker for the entire job search.

#### 4.2 User stories
- As a **user**, I want to drag a job from "Saved" to "Applied" in one motion.
- As a **user**, I want to see my fit score on every card.
- As a **user**, I want to search/filter/sort 40+ jobs instantly.

#### 4.3 Use cases
- **UC4.1** Maya receives a recruiter email about a Meta role. She clicks "+ Add job" → modal → pastes the JD → AI scores her fit at 91 → job lands in "Saved". She drags it to "Interviewing" two weeks later.
- **UC4.2** Devon uses the filter chip "Remote (14)" to find only remote jobs. Sorts by Fit Score desc. Applies to the top 5.
- **UC4.3** Devon imports 30 leads from a CSV (job title, company, URL). They land in "Saved". He bulk-drags them to "Applied" with a single drag from the "Saved" column.

#### 4.4 User journey
```
+ Add job
   ↓
Modal (URL, company, role, location, salary, JD)
   ↓ [Add & analyze]
AI analysis (4–8s) → fit score, skills match, recommended resume
   ↓
Job created in "Saved"
   ↓
Drag → "Applied" → "Interviewing" → "Offer"
   ↓
On "Offer" → auto-create Deal record + prompt to add comp details
```

#### 4.5 Workflow
1. **Drag-and-drop** is powered by `@dnd-kit/core` with a 8px activation distance (so cards are clickable on tap).
2. `moveJob(jobId, newStatus)` mutates the pipeline store, persists to Supabase, and emits an event for analytics.
3. **Add Job modal** opens via route `/dashboard/pipeline/add` (deep-linkable). URL, company, role are required; location, salary, JD are optional but unlock AI features.
4. **AI analysis** is invoked via Server Action. Falls back across providers per user config.
5. **CSV import** parses with `csvUtility.ts`; supports the same columns as Export.

#### 4.6 UI design

![Pipeline Kanban Board](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-kanban.png)

*Pipeline — 4-column Kanban (Saved / Applied / Interviewing / Offer). Each card shows title, company, tags (UI/UX, Remote, etc.), relative time, and a Fit Score pill (green/amber/red). Toolbar exposes search, filters, sort, and view-mode toggle (Board / Analytics / Compare).*

#### 4.7 Edge cases
- Drop on the same column → no-op
- Drop outside any column → snap back, no change
- AI analysis fails → job is still saved; user can retry "Analyze" from job detail
- 100+ jobs in one column → column scrolls independently; counts always shown
- Concurrent edit (two devices) → last-write-wins, conflict toast on second device

#### 4.8 Success criteria
- Median time from "+ Add job" to job card visible ≤ 10s
- ≤ 0.5% drag-and-drop misfires (dropped in wrong column)

---

### Feature 5 — Add Job (Modal)

#### 5.1 Purpose
Fastest path to get a new job into the system, with optional AI analysis.

#### 5.2 User stories
- As a **user**, I want to paste a JD and let AI extract everything.
- As a **user**, I want to save a job with just a URL.

#### 5.3 Use cases
- **UC5.1** Maya pastes a JD. AI extracts company, role, salary range, required skills, and scores fit. She reviews and saves.
- **UC5.2** Devon wants to quickly stash a job. Types only the URL and clicks "Save as saved" — done.

#### 5.4 User journey
```
Pipeline / Discover / Dashboard "+ Add job"
   ↓
Modal opens, URL field auto-focused
   ↓
User pastes URL or full JD
   ↓
[Add & analyze] → spinner for 4–8s
   ↓
AI extracts: company, role, salary, skills, score
   ↓
Job lands in "Saved" with toast "Added · Fit 91"
   ↓
Card click → /dashboard/pipeline/[id]
```
#### 5.5 Workflow
1. Modal opens via "+ Add job" or Cmd/Ctrl-K → "Add job".
2. URL field is sticky focus. If a known job board URL is detected, offer "Import from {LinkedIn, Greenhouse, Lever}".
3. AI extraction is async; user can save in parallel.
4. On save, server validates schema and inserts into Supabase.

#### 5.6 UI design

![Add Job Modal](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-addjob.png)

*Add job modal — centered 560px card on a blurred scrim. URL field on top, then 2×2 grid (Company, Role / Location, Salary), then a tall JD textarea. AI reassurance banner at the bottom: "AI will analyze the JD, extract required skills, score fit against your base resume, and create an interview prep pack." Three CTAs: Cancel / Save as saved / Add & analyze.*

#### 5.7 Edge cases
- Network timeout on paste → fall back to manual fields
- AI extracted wrong company → editable, manual override always wins
- URL is a job board listing that 404s → toast warning, still saves what was extracted

#### 5.8 Success criteria
- ≥ 80% of jobs added with a JD (unlocks AI)
- ≥ 70% of AI analyses accepted as-is or with ≤ 2 edits

---

### Feature 6 — Job Detail

#### 6.1 Purpose
Single source of truth for one job. Tabs separate concerns; side panel shows AI insights.

#### 6.2 User stories
- As a **user**, I want to see the full JD, status, next step, and contact in one place.
- As a **user**, I want to see my fit score and skill gaps at a glance.
- As a **user**, I want to see all related artifacts (documents, resume match, AI email, questions).

#### 6.3 Use cases
- **UC6.1** Maya is preparing for her Meta onsite. Opens the job → Status tab → updates to "Final round", sets next-step date.
- **UC6.2** Devon opens the Notion EM job. Tabs to "AI Email" → clicks "Generate recruiter follow-up" → pastes into Gmail.
- **UC6.3** Maya opens the Stripe job → Documents tab → uploads the take-home spec → it joins the JD as a context file.
- **UC6.4** Devon opens the Airbnb job → Questions tab → reviews the 6 AI-generated likely questions → "Add to mock interview prep."

#### 6.4 User journey
```
Pipeline card click → /dashboard/pipeline/[id]
   ↓
Tab navigation
   ├ Status       → stage, next step, last contact
   ├ Overview     → JD, responsibilities, requirements
   ├ Documents    → uploaded files + JD context
   ├ Resume Match → base vs tailored, gap analysis
   ├ AI Email     → recruiter follow-up, thank-you, offer negotiation
   └ Questions    → likely questions + add to prep
```

#### 6.5 Workflow
1. Server component fetches the job + related documents via Supabase joins.
2. AI fit score is computed on job creation and re-computed on resume update (debounced).
3. Tab state is in URL (`?tab=documents`) for deep-linking and back-button support.
4. Documents upload goes to Supabase Storage; max 10 MB / file; PDF/DOCX/MD.

#### 6.6 UI design

![Job Detail](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-jobdetail.png)

*Job detail — breadcrumb at top, header with logo / title / company / status chips / actions. Six tabs. Main column shows the full JD; right rail shows the AI Fit Score (91/100, donut), job meta (Applied, Source, Recruiter, Stage, Next step), and Skills Match (with green check, amber triangle, red plus).*

#### 6.7 Edge cases
- Job deleted while in another tab → toast on next interaction, redirect to pipeline
- Fit score stale (base resume updated 3 weeks ago) → "Re-score" button, "Last scored 3w ago" inline
- AI email generation failure → retry button, never blocks save

#### 6.8 Success criteria
- ≥ 50% of jobs have a "Next step" set within 24h of "Interviewing"
- Median time on Job Detail per session ≥ 90s (proxy for real engagement)

---

### Feature 7 — Pipeline Analytics

#### 7.1 Purpose
Show the user where they are winning and where they are leaking.

#### 7.2 User stories
- As a **user**, I want to know my conversion rate from application to interview.
- As a **user**, I want to know which source (referral, LinkedIn, boards) is yielding the most interviews.
- As a **user**, I want to see my search velocity over time.

#### 7.3 Use cases
- **UC7.1** Maya notices her interview rate dropped from 32% → 24% in March. Looks at the bar chart. Identifies a 2-week gap in applications. Realizes she paused her search during a project crunch.
- **UC7.2** Devon sees "Referral: 62% conversion" in the sources panel. Decides to spend the next 2 weeks asking for referrals instead of cold-applying.

#### 7.4 User journey
```
Pipeline → Analytics tab
   ↓
Top stats (Applications, Response rate, Time to offer, Avg fit)
   ↓
Two charts: Apps over time, Conversion funnel
   ↓
Two charts: Best sources, Top companies by stage
   ↓
Export PDF (for coaching calls)
```

#### 7.5 Workflow
1. Aggregations run on read (Recharts + Zustand selectors) for v3; v4 will pre-compute daily rollups.
2. Time range selector (30 / 90 / 365 days / all-time) is in the top-right.
3. Export PDF renders a print-friendly version of the same view.

#### 7.6 UI design

![Pipeline Analytics](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-analytics.png)

*Analytics — top row of 4 stat cards. Bar chart (Applications over time, last 12 weeks) + conversion funnel (Saved → Applied → Interviewing → Final → Offer, with shrinking widths). Bottom row: best sources by interview conversion (Referral 62%, Direct 44%, LinkedIn 31%, Boards 18%) and top companies by stage (Meta Final, Notion Onsite, Figma Phone, Stripe Phone).*

#### 7.7 Edge cases
- < 5 applications → charts show "Not enough data yet" with a CTA to add more
- Date range with 0 data → empty state, not a broken chart

#### 7.8 Success criteria
- ≥ 30% of users open Analytics at least once per week

---

### Feature 8 — Pipeline Compare

#### 8.1 Purpose
Side-by-side offer comparison for the moment of truth.

#### 8.2 User stories
- As a **user with multiple offers**, I want to compare comp, stage, fit in one screen.
- As a **user**, I want a clear "best" indicator.

#### 8.3 Use cases
- **UC8.1** Maya has 3 offers: Meta, Spotify, Linear. She selects all three on the board → clicks "Compare" → side-by-side breakdown of base, equity, bonus, total comp, fit, stage, team, stack, remote, PTO. The system highlights "Best overall" (Meta, 92/100).

#### 8.4 User journey
```
Pipeline board (multi-select checkboxes)
   ↓
Toolbar "Compare (3)" button activates
   ↓
/dashboard/pipeline/compare renders 3-up grid
   ↓
Best card highlighted with navy outline + verdict
   ↓
User shares with partner or coach via link
```
#### 8.5 Workflow
1. Select 2–4 jobs on the Kanban (checkboxes on hover, or multi-select with shift-click).
2. Click "Compare" in the toolbar.
3. `/dashboard/pipeline/compare` shows the comparison.
4. "Best" badge is determined by a weighted score: fit (30%) + total comp (30%) + remote flexibility (15%) + team/scope (15%) + stage readiness (10%).

#### 8.6 UI design

![Compare Jobs](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-compare.png)

*Compare — three side-by-side cards (Meta / Spotify / Linear) with identical row layout. 11 rows: Base salary, Equity, Bonus, Total comp, Fit score, Stage, Team size, Tech stack, Remote policy, PTO. Each card ends in a verdict pill (green "Best overall", amber "Good", red "Decent"). The "best" card has a 2px navy outline.*

#### 8.7 Edge cases
- 1 job selected → prompt to select more
- 5+ jobs selected → cap at 4 (best by fit score), show a "+N more" chip
- Different currencies → normalize to user's preferred currency

#### 8.8 Success criteria
- ≥ 20% of users with ≥ 2 offers use Compare before deciding


---

### Feature 9 — Resume Studio Library

#### 9.1 Purpose
A home for all resumes: base versions, tailored variants, and the "tailoring queue" that ties Tailoring to the Pipeline.

#### 9.2 User stories
- As a **user**, I want one base resume to anchor all tailoring.
- As a **user**, I want a tailored version per job I'm seriously applying to.
- As a **user**, I want to see ATS scores at a glance.

#### 9.3 Use cases
- **UC9.1** Maya maintains 1 base resume + 5 tailored variants (one per target company). Library shows 7 cards, with a "Tailored" badge on the variants and ATS scores on every card.
- **UC9.2** Devon has 3 jobs in the Tailoring queue (from the Dashboard). He clicks "View queue" → picks a base → generates tailored variants for each in 90s.

#### 9.4 User journey
```
Dashboard → Tailoring queue → "View queue"
   ↓
Resume Studio Library (with tailoring banner)
   ↓
Pick base resume → "Tailor to {Job}"
   ↓
Resume editor opens with JD in side panel
   ↓
AI suggests edits → user accepts/regenerates
   ↓
Save → tailored version added to library
```

#### 9.5 Workflow
1. "New resume" opens a choice: start from blank, import PDF, or duplicate existing.
2. Library filter persists in URL (`?filter=tailored`).
3. Click any card → editor at `/dashboard/resume/[id]`.

#### 9.6 UI design

![Resume Library](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-resume-list.png)

*Resume library — header with "Resume Studio" + library stats. Black "tailoring queue" banner at the top with 3 jobs pending. Filter bar (All / Base / Tailored). 3-column grid of resume cards, each with a 8.5×11 aspect-ratio thumbnail, a badge (BASE or TAILORED), title, last-edited time, and ATS chip. Final card is a dashed "+ New tailored resume" tile.*

#### 9.7 Edge cases
- 0 resumes → onboarding: "Create your base resume to unlock tailoring"
- 50+ resumes → paginate, 24 per page

#### 9.8 Success criteria
- ≥ 90% of users have ≥ 1 base resume within 7 days of signup
- Median time to first tailored resume ≤ 3 days after first job in "Applied"

---

### Feature 10 — Resume Editor

#### 10.1 Purpose
Live editor with AI suggestions, real-time preview, and ATS scoring.

#### 10.2 User stories
- As a **user**, I want to write resume content in a clean rich-text editor.
- As a **user**, I want a side-by-side preview that updates as I type.
- As a **user**, I want the AI to suggest bullet improvements for a specific JD.
- As a **user**, I want an ATS score to guide my edits.

#### 10.3 Use cases
- **UC10.1** Maya is tailoring her resume for Meta. The JD is loaded in the right panel. She clicks "AI suggest" on a bullet → AI rewrites it with quantification and JD-aligned keywords → she accepts.
- **UC10.2** Devon finishes a draft. The right panel shows ATS 88. He sees "Action verb strength 74%" as the weak area. Replaces "Was responsible for" with "Led" and the score jumps to 92.

#### 10.4 User journey
```
Resume Studio library
   ↓
Click resume card → /dashboard/resume/[id]
   ↓
Editor loads with current content + last JD context
   ↓
Type in main editor → debounced auto-save
   ↓
Click "✨ AI suggest" on a bullet
   ↓
Side drawer opens with 3 rewrite options
   ↓
Accept → bullet replaced, ATS score recalculates
   ↓
Export PDF / DOCX
```
#### 10.5 Workflow
1. TipTap rich-text editor in the main column. Toolbar (B / I / U, H1/H2/H3, lists, links) is sticky.
2. Right column: Preview, ATS, Tailoring tabs.
3. "Target job: Meta" chip in the toolbar sets the JD context.
4. "✨ AI suggest" opens a side-drawer with structured prompt (rewrite this bullet for impact / quantify / shorten).
5. Save is debounced (2s) + persisted on blur.
6. Export buttons: PDF, DOCX.

#### 10.6 UI design

![Resume Editor](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-resume-editor.png)

*Resume editor — left rail (nav). Center: editor with sticky toolbar (B/I/U, H1-3, lists, link, AI suggest, Target job) and a 60% width A4-styled document (Summary, Experience, Skills). Right: Preview/ATS/Tailoring tabs. The visible ATS panel shows 95/100 with four sub-scores: Keywords matched 92%, Skills coverage 88%, Action verb strength 74% (amber, weak area), Quantified impact 96%.*

#### 10.7 Edge cases
- Editor offline → local autosave to IndexedDB; sync on reconnect
- AI suggest for a bullet the user just edited → confirmation prompt
- PDF export fails → fallback to DOCX

#### 10.8 Success criteria
- Median ATS score of final saved resume ≥ 88
- ≥ 60% of users use AI suggest at least once

---

### Feature 11 — Resume Templates Gallery

#### 11.1 Purpose
Let users start fast with a curated, ATS-safe template set.

#### 11.2 User stories
- As a **user**, I want to see all templates before picking one.
- As a **user**, I want a template that matches my discipline (Design, Engineering, Executive).

#### 11.3 Use cases
- **UC11.1** Priya is a new user. She opens `/preview-templates` (public) to see all 9 templates. Picks "Clean Professional" (ATS 98). Gets a fully-formatted resume, then customizes.

#### 11.4 User journey
```
/preview-templates (public) OR /dashboard/resume "+ New resume"
   ↓
Browse gallery · filter by category
   ↓
Click thumbnail → larger preview with sample data
   ↓
"Use this template" CTA
   ↓
If logged out → /register?template=...&returnTo=...
   ↓
If logged in → /dashboard/resume/new?template=...
   ↓
Editor opens with template skeleton + sample content
```

#### 11.4a The 9 templates

| Template | Best for | Tone |
|----------|----------|------|
| Clean Professional | All-purpose, senior ICs | Quiet, dense, neutral |
| Classic Minimal | First-time job seekers | Sparse, single-column, very safe |
| Bold Engineer | Senior engineers | Dark accent, technical hierarchy |
| Elegant Two-Column | Senior PMs, designers | Two-column, sidebar for skills/awards |
| ATS Executive | C-suite, VP+ | Centered name, refined rules |
| Premium Headshot | Designers, client-facing | Avatar-led, contemporary |
| Clean Layout | Engineering, ICs | Light, lots of whitespace |
| Photo Header | Designers | Header band with avatar |
| Academic | PhDs, research roles | Publication-heavy, formal |

#### 11.5 Workflow
1. Public route `/preview-templates` (no auth).
2. Each card hover-lifts and shows a "Use this template →" CTA.
3. Clicking CTA when logged-in opens "New resume" pre-filled with that template; when not logged-in, routes to `/register?returnTo=...`.
#### 11.6 UI design

![Templates Gallery](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-templates.png)

*Templates gallery — large Playfair display headline "Pick your template", supporting copy "9 ATS-friendly designs · crafted for senior ICs and leaders", category filter chips (All / Executive / Engineering / Design / Academic / Two-column), 3-column grid of 9 thumbnails. Each card shows the template's actual structure (name block, sections, lines), plus the name and a tag (e.g. "Most popular", "ATS 98", "Engineering") in the footer.*


#### 11.7 Edge cases
- Template rendering bug for specific data shapes → render with placeholder data, never block
- New template added → canary to 10% of users for a week

#### 11.8 Success criteria
- ≥ 50% of new users pick a template rather than blank
- Avg time from `/preview-templates` to "New resume" created ≤ 90s

---

### Feature 12 — Job Search (Smart Feed)

#### 12.1 Purpose
Proactive, AI-matched job discovery. Reduce time spent browsing job boards.

#### 12.2 User stories
- As a **user**, I want to see jobs that match my profile, ranked.
- As a **user**, I want to see which skills I have and which I'm missing.
- As a **user**, I want to "Tailor & apply" in one click.

#### 12.3 Use cases
- **UC12.1** Devon searches. Filter: Remote, $150k+, Senior. Sees 6 results. Anthropic 88%, Vercel 91%, Ramp 78%, OpenAI 84%, Figma 72%, Linear 68%. Clicks "Tailor & apply" on Vercel → Resume Studio opens with Vercel JD context.
- **UC12.2** Priya dismisses 5 jobs that don't sponsor. The Discover feed learns and deprioritizes similar listings.

#### 12.4 User journey
```
Discover feed
   ↓
Filter (Remote / Salary / Seniority / Discipline / Location)
   ↓
Card click → /dashboard/discover/[id]
   ├ View full JD
   ├ Save to pipeline
   ├ Dismiss (with reason)
   └ Tailor & apply (creates job in pipeline, opens Resume Studio)
```

#### 12.5 Workflow
1. Server queries the discovery store + external API (Perplexity / job board integrations).
2. Match % is computed against the user's base resume, with skill coverage, comp alignment, and seniority fit.
3. "Tailor & apply" creates a job in the Pipeline (`status: "Saved"`) and opens Resume Studio pre-bound to the JD.
4. "Dismiss" writes a negative signal to refine future feeds.

#### 12.6 UI design

![Job Search Smart Feed](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-discover.png)

*Discover feed — header with lead count, search input, and category filter chips. 2-column grid of job cards. Each card: company logo (gradient monogram), title, company, salary chip, full-time chip, stage chip, 2-line JD preview, skill chips (green = match, red = "to learn"), and a horizontal match bar (0–100%). Three CTAs: Save / Dismiss / Tailor & apply.*

#### 12.7 Edge cases
- No external API key → fallback to manual saved searches
- New user with no base resume → prompt to create one first; show only "browse" mode

#### 12.8 Success criteria
- ≥ 25% of pipeline additions originate from Discover
- Avg match % of clicked jobs ≥ 70%

---



---

### Feature 13 — Interview Prep Hub

#### 13.1 Purpose
Bring together all interview prep activity across active applications.

#### 13.2 User stories
- As a **user**, I want to see which interviews I'm ready for and which need prep.
- As a **user**, I want to see my average mock score and trend.
- As a **user**, I want to launch a new mock session for a specific job.

#### 13.3 Use cases
- **UC13.1** Maya has 3 jobs ready (Meta, Notion, Stripe) and 2 that need prep generated. She opens the hub and clicks "Generate pack" on Vercel.
- **UC13.2** Devon sees "Avg mock score 82, +6 since first mock". Tries a new mock for Notion to push it higher.

#### 13.4 User journey
```
Pipeline job status → "Interviewing"
   ↓
Interview Hub: prep card auto-created ("Need more prep")
   ↓
User clicks "Generate pack" → AI builds question set, company brief, story matches
   ↓
Card flips to "Ready"
   ↓
User clicks "Start mock" → /dashboard/interview/[jobId]
```

#### 13.5 Workflow
1. Hub pulls from `useInterviewStore` (stories, mockSessions, preps) and `usePipelineStore` (jobs in `interviewing` / `applied` / `offered`).
2. "Generate pack" calls AI to produce: 8–12 questions mapped to JD, 1-page company brief, 3 story suggestions.
3. Card auto-flips to "Ready" on success.

#### 13.6 UI design

![Interview Prep Hub](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-interview-hub.png)

*Interview hub — header with chip icon + "Interview Prep" title. 4 stat cards: Active preps, Mock sessions, Avg mock score, STAR stories. Two sections: "Ready to practice" (3 jobs with green "Ready" pill) and "Need more prep" (2 jobs with amber "Generate pack" pill). Recent mock sessions row with date, score chip, and meta.*

#### 13.7 Edge cases
- Mock session interrupted (browser close) → session is saved as "in progress" with last answered question
- All preps deleted → empty state with CTA "Add a job to start prepping"

#### 13.8 Success criteria
- ≥ 70% of "Interviewing" jobs have a generated prep within 48h

---

### Feature 14 — Mock Interview Session

#### 14.1 Purpose
The single highest-leverage screen. Practice real questions with an AI that scores you.

#### 14.2 User stories
- As a **user**, I want to practice questions in a realistic chat format.
- As a **user**, I want live feedback (Clarity, STAR structure, Specificity) as I answer.
- As a **user**, I want a final score and per-question notes at the end.

#### 14.3 Use cases
- **UC14.1** Maya opens "Meta · Lead PD · Round 2 Mock". 8 questions queued. She answers one at a time. The right rail updates live: Clarity "Strong", STAR structure "Developing", Specificity "Strong". After Q3 (Multi-persona onboarding), the AI follows up: "How do you decide when a persona's divergence is deep enough to warrant a separate flow?"
- **UC14.2** Devon finishes a mock. Submits → final score 86/100. Per-question notes: "Q1 great opener; Q2 weak quantification; Q3 strong systems thinking".

#### 14.4 User journey
```
Interview hub → click "Start mock" on a job
   ↓
/dashboard/interview/[jobId] loads with 6–12 questions
   ↓
AI sends Q1 → user types/speaks answer
   ↓
Live feedback panel updates (Clarity / STAR / Specificity)
   ↓
AI optionally asks a follow-up
   ↓
User proceeds through Q2…Qn
   ↓
Submit → final score + per-question notes
   ↓
Session saved to history (replayable)
```
#### 14.5 Workflow
1. Session has 6–12 questions, dynamically selected by difficulty, role, and JD.
2. Each question has a target duration (1–3 min) and is timed.
3. User types or speaks; AI scores in real time.
4. After submit, session is saved to history with full transcript + scores.

#### 14.6 UI design

![Mock Interview Session](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-mock-interview.png)

*Mock interview — top bar with company logo, role title, timer (22:14 elapsed), and End / Submit buttons. Progress bar shows 3/8. Main chat area: question chip at top, then alternating AI/User bubbles. User bubble is dark navy (matching brand), AI bubble is white card. Right rail: question list with done (green check) / active (navy pill) / pending states, plus a Live Feedback panel with three categories. Bottom: input bar with mic icon, placeholder, and send button.*

#### 14.7 Edge cases
- Mic permission denied → fall back to typed input
- AI response timeout (>15s) → "Skip this question" button
- Network disconnect mid-session → "Resume where you left off" on next login

#### 14.8 Success criteria
- Median mock session length ≥ 12 minutes
- ≥ 50% of users complete a full mock within 14 days of signup

---

### Feature 15 — Story Bank (STAR)

#### 15.1 Purpose
A reusable vault of career stories, auto-formatted to the STAR (Situation–Task–Action–Result) frame. The atomic unit of interview prep.

#### 15.2 User stories
- As a **user**, I want to capture a story once and reuse it forever.
- As a **user**, I want AI to draft a story from a brief prompt.
- As a **user**, I want to tag stories by skill, outcome, or company.

#### 15.3 Use cases
- **UC15.1** Maya interviews for Meta. The AI pulls 3 stories from her bank ("Rebuilt Stripe dashboard", "Disagreement with PM", "Mentored junior") and matches them to Meta's likely questions.
- **UC15.2** Devon just had a great outcome. He clicks "+ New story", types 3 sentences, and the AI reformats them into a STAR draft for him to refine.

#### 15.4 User journey
```
Interview hub → "+ New story" OR "Import from resume"
   ↓
Story editor (situation / task / action / result)
   ↓
Save → card added to library
   ↓
Tag with skills + rate 1–5 stars
   ↓
Mock interview session pulls matching stories via AI
   ↓
"Used in: Meta, Notion" counter increments
```
#### 15.5 Workflow
1. Cards show: title, tags, star-rating (1–5), "Used N times", and a 3-line preview with the bolded STAR labels.
2. Click → modal/expanded view with the full story + edit + delete + "Used in" history.
3. "Import from resume" auto-drafts 4–6 stories from base resume bullets.

#### 15.6 UI design

![Story Bank](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-stories.png)

*Story bank — header with "★ STAR Story Bank" + library stats + Import / New buttons. Search bar with category filters (All / Leadership / Conflict / Failure / Starred). 2-column grid of 6 stories. Each card: title, star rating (1–5 in amber), tag chips (incl. "Used 4×" green), 3-line preview with bold STAR labels, outcome footer.*

#### 15.7 Edge cases
- Story > 1500 chars → prompt to split into two
- Bulk delete → confirmation, no undo (use archive instead)
- Story used in mock → automatically tagged with that session

#### 15.8 Success criteria
- ≥ 8 stories per user within 30 days
- ≥ 60% of mock sessions reference ≥ 1 story from the bank

---

### Feature 16 — Settings · Profile

#### 16.1 Purpose
Identity, persona, defaults, and preferences. Powers all AI features.

#### 16.2 User stories
- As a **user**, I want to keep my profile up to date.
- As a **user**, I want to set my compensation target, weekly goal, and email preferences.

#### 16.3 Use cases
- **UC16.1** Devon updates his target role from "Data Analyst" to "Product Manager" → all future Discover feeds and AI tailors adjust.
- **UC16.2** Priya changes her weekly goal from 10 → 5 (visa-imposed bandwidth) → Dashboard tracker reflects.

#### 16.4 User journey
```
Settings → Profile (default tab on first visit)
   ↓
Edit any field (name, headline, target role, comp, goal)
   ↓
Sticky "Save changes" activates when dirty
   ↓
Save → toast "Profile updated" → profile store syncs
   ↓
All AI features immediately use new values
```
#### 16.5 Workflow
1. Left rail nav: Profile / Preferences / Billing / API Keys / Privacy / Sign out.
2. Each setting row: title + description on the left, control on the right.
3. Save is explicit (sticky bottom-right "Save changes" button) to prevent accidental overwrites.

#### 16.6 UI design

![Settings Profile](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-settings.png)

*Settings — left rail nav (Profile, Preferences, Billing, API Keys, Privacy, Sign out). Main panel: avatar block at top, then a series of setting rows (Full name, Headline, Target role, Compensation target with min/max/currency, Weekly application goal with slider, Email weekly summary toggle, Dark mode toggle). Sticky bottom-right "Save changes" button.*

#### 16.7 Edge cases
- Compensation target in foreign currency → show converted USD in parentheses
- Target role too long (>120 chars) → inline warning, allow save

#### 16.8 Success criteria
- ≥ 80% of users complete ≥ 5 profile fields within 7 days

---

### Feature 17 — Settings · Billing & Plans

#### 17.1 Purpose
Subscription management, plan comparison, usage visibility.

#### 17.2 User stories
- As a **user**, I want to know which plan I'm on and when it renews.
- As a **user**, I want to upgrade or downgrade without contacting support.
- As a **user**, I want to see my AI usage to avoid surprise overages.

#### 17.3 Use cases
- **UC17.1** Maya hits her 100-AI-analyses limit on the Free plan. Sees the "Upgrade to Pro" card and the value comparison.
- **UC17.2** Devon downloads the November invoice PDF for expense reporting.

#### 17.4 User journey
```
Settings → Billing
   ↓
View current plan + renewal date
   ↓
Click "Upgrade" on Career OS → Stripe Checkout
   ↓
Complete payment → redirect back
   ↓
Webhook syncs plan to Supabase
   ↓
New limits reflected in usage bars
   ↓
Invoice PDF available in history
```

#### 17.4a The three plans

| Plan | Price | Best for | Limit |
|------|-------|----------|-------|
| Free | $0/mo | Casual seekers, 1–5 apps | 5 active jobs, 1 resume, 3 mocks/mo, basic ATS |
| **Pro** ⭐ | $19/mo | Serious job hunters | Unlimited jobs, resumes, mocks, 9 templates, full Discover |
| Career OS | $39/mo | Coaches, power users | Pro + multi-seat (5), custom prompts, API access, white-glove |

#### 17.5 Workflow
1. Stripe Checkout for plan changes.
2. Customer Portal for payment method updates and invoice downloads.
3. Webhook syncs plan state to Supabase via a server-side handler.
#### 17.6 UI design

![Billing and Plans](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-billing.png)

*Billing — header with current plan + renewal date. 3-up pricing grid: Free (current, muted), Pro (featured — dark navy card with "RECOMMENDED" ribbon and inverted text), Career OS (upgrade CTA). Below: usage card with 4 horizontal progress bars (Tailored resumes 5/∞ green, Mocks 14/∞, AI analyses 42/100 amber, Discover 8/30 blue). Then payment method (Visa ending 4242) and 3 recent invoices.*


#### 17.7 Edge cases
- Downgrade with usage over new plan's limits → 14-day grace period with banner
- Failed payment → retry schedule (1d, 3d, 7d) then downgrade to Free
- Coupon code → only in annual plans, applied at checkout

#### 17.8 Success criteria
- ≥ 6% Free → Pro conversion in 30 days
- ≥ 4% Pro → Career OS upgrade in 90 days for users with multi-seat usage signals

---

### Feature 18 — Settings · API Configuration (BYOK)

#### 18.1 Purpose
Bring-your-own-key for AI providers. No vendor lock-in, full cost control.

#### 18.2 User stories
- As a **power user**, I want to use my own OpenAI / Anthropic / Gemini / Perplexity keys.
- As a **user**, I want a fallback chain so my flow never breaks.

#### 18.3 Use cases
- **UC18.1** Maya plugs in her Anthropic key, picks "Claude Sonnet 4.5" as primary, and "GPT-4o" as fallback. If Anthropic rate-limits, requests auto-route to OpenAI.
- **UC18.2** Devon has no keys. He enables "Allow OfferPath to use its managed key" and the system routes to the hosted pool.

#### 18.4 User journey
```
Settings → API Configuration
   ↓
Paste OpenAI/Anthropic/Gemini/Perplexity key
   ↓
"Connect" → server tests key with cheap request
   ↓
Key encrypted and stored in profile.api_keys
   ↓
Set primary model + fallback chain
   ↓
All subsequent AI calls route through this config
```
#### 18.5 Workflow
1. Keys are stored encrypted in the `profile.api_keys` JSONB column.
2. Server-side AI router reads the user's config, picks the primary model, and falls back on errors.
3. Per-provider usage is logged for the Billing page.

#### 18.6 UI design

![API Configuration](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-api-keys.png)

*API Keys — left rail nav. Main: "AI provider configuration" with key rows (OpenAI connected with masked `sk-proj-…gK2m`, Anthropic connected with `sk-ant-…vQ3k`, Gemini and Perplexity as "Not connected" with input field + Connect button). Then "Primary model" select, "Fallback chain" with chips in order (Sonnet 4.5, GPT-4o, Gemini Pro), and a "Allow OfferPath to use its managed key" toggle.*

#### 18.7 Edge cases
- Invalid key → red error, "Test connection" button
- All keys exhausted → toast "AI is paused. Add a key or wait for next billing cycle."
- Key rotation → new key replaces, old key is soft-deleted (retained 7 days for recovery)

#### 18.8 Success criteria
- ≥ 25% of Pro users connect at least one BYOK key
- AI feature error rate (BYOK) ≤ 2% (vs ≤ 1.5% for managed)

---



### Feature 19 — Public Templates Gallery (`/preview-templates`)

#### 19.1 Purpose
A high-intent, unauthenticated landing surface for users to evaluate the templates before signing up. Doubles as SEO-fueled marketing.

#### 19.2 User stories
- As a **prospective user**, I want to browse all templates without an account.
- As a **prospective user**, I want to see real examples (not just lorem ipsum).

#### 19.3 Use cases
- **UC19.1** Priya finds the site via Google "best ATS resume template". Sees a gallery of 9 designs. Clicks one → sees a full preview with real sample data → "Use this template" → prompted to sign up.

#### 19.4 User journey
```
Prospective user lands on /preview-templates (SEO / Twitter / referral)
   ↓
Browse 9-template gallery · filter by category
   ↓
Click thumbnail → expanded preview with sample data
   ↓
"Use this template" CTA
   ↓
If logged out → /register?template=...&returnTo=...
   ↓
If logged in → /dashboard/resume/new?template=...
   ↓
Editor opens pre-filled with template + sample
```
#### 19.5 Workflow
1. Public route, no auth required, server-rendered for SEO.
2. Renders with the same `ResumePreview` component used in the editor, so what-you-see-is-what-you-get.
3. CTA on each card deep-links to `/register?template={id}&returnTo=/dashboard/resume/new?template={id}`.

#### 19.6 UI design

![Public Templates Gallery](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-templates.png)

*Public templates gallery (`/preview-templates`) — the same 3-column grid of 9 cards as the in-app templates library, but rendered server-side with no auth, no sidebar, and a single "Use this template" CTA on each card. The "Most popular" and "ATS 98" tags become the conversion lever for SEO-driven traffic.*

#### 19.7 Edge cases
- `template` query param is invalid → silently fall back to "Clean Professional" default
- Sample data fails to load for a template → render with empty placeholder, never block
- User signed in but no `resumes` write permission → toast "Upgrade to create resumes"
- Bot/crawler hits the page → serve static SSR snapshot; skip the "Use this template" CTA
- Concurrent sign-up + template click → `returnTo` includes the template param, applied on first login

#### 19.8 Success criteria
- ≥ 12% of `/preview-templates` visitors sign up

---

### Feature 20 — Onboarding (Implicit)

#### 20.1 Purpose
Move a brand-new user from "blank slate" to "first AI fit score" in under 5 minutes, without ever blocking them.

#### 20.2 User stories
- As a **new user**, I want to know what to do first.
- As a **new user**, I want to skip steps I don't care about.
- As a **new user**, I want progress to feel rewarding, not bureaucratic.

#### 20.3 Use cases
- **UC20.1** Priya signs up. Lands on an empty Dashboard. A 4-step banner at the top walks her through Profile → Base resume → First job → First tailor. She completes all 4 in 6 minutes.
- **UC20.2** Devon signs up. Sees the banner. Skips everything. Adds his first job manually from a referral. Comes back later; the banner has collapsed to a small "Resume setup" reminder.

#### 20.4 User journey
```
/register → /dashboard (empty state)
   ↓
Step 1 banner: "Tell us about yourself" → /dashboard/settings
   ↓
Step 2 banner: "Create your base resume" → /dashboard/resume/new
   ↓
Step 3 banner: "Add your first job" → Add Job modal
   ↓
Step 4 banner: "Tailor your first resume" → /dashboard/resume?tailorFor=...
   ↓
Banner collapses to "Tailoring queue (3)" widget
   ↓
All 4 steps hidden permanently
```

#### 20.5 Workflow
1. **Step 1 — Profile setup** (Settings): full name, headline, target role, comp target, weekly goal. Pre-filled with sensible defaults from the auth provider.
2. **Step 2 — Base resume** (Resume Studio → New): template picker → editor opens with skeleton. "Import PDF" path is one click if a PDF is on disk.
3. **Step 3 — First job** (Add Job modal): paste URL or JD. AI extracts + scores. Job lands in "Saved" with a celebratory toast.
4. **Step 4 — First tailor** (Resume Studio, bound to the new job): editor opens with JD in the right panel. AI suggests 3 bullet rewrites. Save → tailored version added to library.
5. **Skip behavior:** each step has a "Skip for now" link. Skipped steps reappear as a compact "Setup reminders" widget at the top of the Dashboard, dismissible individually.
6. **Completion:** all 4 banners collapse; "Tailoring queue" widget takes their place; an email is sent at 7 days if the user hasn't completed all 4.

#### 20.6 UI design

![Onboarding Dashboard](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/m-onboarding.png)

*First-run Dashboard — same Career HQ layout but with a prominent 4-step onboarding banner at the top, a "Tailoring queue (3)" widget prominent in the main column, and a celebratory first-job toast (added in Feature 5). The onboarding banner collapses to a compact "Setup reminders" widget as steps are completed.*

#### 20.7 Edge cases
- User signs up via Google OAuth → prefill name + email from the Google profile
- User already has resumes imported via LinkedIn → skip Step 2, mark complete
- User is on Free plan and hits the 5-job limit during Step 3 → "Save as saved" still works, the job stays in "Saved" not "Applied"
- User abandons mid-flow → re-login shows the same step state from `profile.onboarding_state`
- Bot / test signups → onboarding steps auto-complete

#### 20.8 Success criteria
- ≥ 60% of new users complete all 4 steps within 7 days
- Median time from signup to "first AI fit score" ≤ 5 minutes for users who complete all 4 steps
- ≥ 30% of users who complete Step 4 return to the app within 48 hours

---


## 7. Cross-Cutting Concerns

### 7.1 Authentication & authorization

- **Provider:** Supabase Auth (email/password + Google OAuth + magic link).
- **Session:** JWT in HTTP-only cookie; middleware (`src/middleware.ts`) guards `/dashboard/*`.
- **RLS:** Every Supabase table has row-level security scoped to `auth.uid()`. No raw client queries.
- **Public routes:** `/`, `/login`, `/register`, `/preview-templates`, marketing assets.

### 7.2 AI feature architecture

```
User request
   ↓
AI Router (server-side)
   ↓
1. Read user.api_keys, plan, rate limit
2. Build prompt with: user profile, base resume, JD, conversation history
3. Pick primary model (e.g. Sonnet 4.5)
4. Stream response
   ↓
On error/timeout (8s p95)
   ↓
5. Try fallback 1 (GPT-4o)
6. Try fallback 2 (Gemini Pro)
7. Last resort: managed key, mark as "free tier"
8. Never block UI; show "AI unavailable, try again" inline
```

- All AI calls are logged for cost + debugging (provider, model, latency, tokens, success).
- Streaming via Server-Sent Events so users see tokens in real time.

### 7.3 Data model (key entities)

```typescript
// Pipeline
type Job = {
  id: string;
  user_id: string;
  company: { name: string; logo_url?: string };
  title: string;
  url?: string;
  location?: string;
  salary_range?: { min: number; max: number; currency: string };
  status: 'saved' | 'applied' | 'interviewing' | 'offered' | 'archived';
  score?: number;             // 0-100, AI fit
  next_step?: { date: string; label: string };
  applied_at?: string;
  source?: string;
  jd_text?: string;           // full text for AI
  required_skills?: string[];
  created_at: string;
};

// Resume
type Resume = {
  id: string;
  user_id: string;
  title: string;
  is_base: boolean;
  data: { personal, summary, experience[], education[], skills[] };
  template_id: string;
  ats_score?: number;
  tailored_for_job_id?: string;
  created_at: string;
};

// Story
type Story = {
  id: string;
  user_id: string;
  title: string;
  situation: string; task: string; action: string; result: string;
  tags: string[];
  rating: 1|2|3|4|5;
  used_in_mock_ids: string[];
};

// Mock session
type MockSession = {
  id: string;
  user_id: string;
  job_id: string;
  questions: { id: string; text: string; answer?: string; score?: number; feedback?: string }[];
  overall_score?: number;
  duration_sec?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  created_at: string;
};

// Profile
type Profile = {
  id: string;                 // = user_id
  full_name: string;
  headline: string;
  target_role: string;
  target_comp?: { min: number; max: number; currency: string };
  weekly_goal: number;
  api_keys?: { openai?: string; anthropic?: string; gemini?: string; perplexity?: string };
  primary_model: string;
  fallback_chain: string[];
  use_managed_fallback: boolean;
};
```

### 7.4 Performance budgets

| Page | TTFB | LCP | TTI | Bundle (initial) |
|------|------|-----|-----|------------------|
| Landing | < 200ms | < 1.2s | < 1.5s | < 80 KB gz |
| Dashboard | < 300ms | < 1.5s | < 2.0s | < 140 KB gz |
| Pipeline | < 400ms | < 1.8s | < 2.2s | < 160 KB gz |
| Editor | < 400ms | < 2.0s | < 2.5s | < 200 KB gz |
| Mock interview | < 300ms | < 1.5s | < 2.0s | < 120 KB gz |

### 7.5 Security & privacy

- All inputs validated at the system boundary (Zod schemas in Server Actions).
- API keys encrypted at rest (Supabase Vault or pgcrypto).
- File uploads: type, size, and content sniffing validated. Stored in private Supabase Storage buckets with signed URLs.
- PII handling: CV/JD text is not used to train any third-party model. OpenAI/Anthropic API calls use their zero-retention endpoints by default.
- No secrets in source. `.env.local` is gitignored. Production secrets live in Vercel + Supabase dashboards.

### 7.6 Accessibility

- WCAG 2.1 AA target.
- Color contrast: all body text ≥ 4.5:1, all UI components ≥ 3:1.
- All interactive elements keyboard-navigable, with visible focus rings.
- Screen reader: semantic landmarks (`<nav>`, `<main>`, `<aside>`), aria-labels on icons, live regions for toasts.
- Motion: respect `prefers-reduced-motion` (disable parallax, soft-reveal animations).
- Forms: labels above inputs, error messages adjacent to inputs, never color-only.

### 7.7 Internationalization

- v3 ships English-only.
- v4: i18n via `next-intl` (or equivalent). All copy lives in dictionaries.

### 7.8 Observability

- **Errors:** Sentry (client + server).
- **Performance:** Vercel Analytics + Web Vitals.
- **AI usage:** custom logger → Supabase `ai_usage` table.
- **Product analytics:** PostHog (events: job_added, tailor_started, mock_completed, etc.).

---

## 8. Launch Plan

### 8.1 Phased rollout

| Phase | Audience | Gate to next |
|-------|----------|--------------|
| **Closed alpha** (current) | 50 hand-picked users | NPS ≥ 40, < 3 critical bugs/week |
| **Open beta** | Anyone with invite code | Activation ≥ 50%, Pro conversion ≥ 4% |
| **GA** | Public | Activation ≥ 60%, NPS ≥ 55, p95 latency < 8s |

### 8.2 Pre-launch checklist

- [ ] All 18 features pass acceptance criteria
- [ ] All flows accessibility-audited
- [ ] SLO: p95 AI latency < 8s in load test (1k concurrent)
- [ ] Disaster recovery: DB backups run daily, RTO < 1h
- [ ] Security review: BYOK keys never logged; RLS verified on all tables
- [ ] Legal: ToS, Privacy Policy, GDPR + CCPA disclosures
- [ ] Pricing page live
- [ ] Status page live
- [ ] Support: in-app help widget (Intercom) + Discord for Pro+ users

### 8.3 Post-launch (first 30 days)

- Weekly NPS pulse + open-text survey.
- 5 user interviews per week.
- Hot-fix SLA: P0 within 4h, P1 within 24h.
- Feature flag everything new; ship to 10% canary first.

---

## 9. Roadmap (12 months)

| Quarter | Theme | Major features |
|---------|-------|----------------|
| **Q1 (now)** | v3 GA | All 18 features above ship |
| **Q2** | Network effects | Referral tracker, public profile page, "shared wins" social feed |
| **Q3** | Coach & team | Career OS multi-seat, coach dashboard, client assignments |
| **Q4** | Mobile + integration | iOS app, calendar integration, Gmail/Outlook mail merge |

---

## 10. Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| AI provider outage | High (core feature broken) | Med | Multi-provider fallback chain; graceful degradation with offline mode |
| User shares sensitive JD with personal info | Med (privacy) | Med | Clear copy: "Don't paste SSN/financial info." Client-side scrub for obvious PII |
| Tailored resume too generic, users churn | High (NPS) | Med | Compare side-by-side; explicit "what changed" diff view; thumbs-down feedback loop |
| Pricing too high for new users | Med (conversion) | Med | 14-day free trial, monthly first, annual discount; usage-based downgrade |
| ATS score inaccuracy | Med (trust) | High | Calibrate against 100 real ATS submissions quarterly; publish methodology |
| Kanban perf at scale (500+ jobs) | Med (UX) | Low | v4: virtualize, paginate, archive default |

---

## 11. Open Questions

1. **Multi-language support timing** — can we ship ES + FR at GA, or push to v4?
2. **Coach marketplace** — should Career OS include a marketplace of vetted coaches, or stay focused on tooling?
3. **Public profile pages** — opt-in only? Default off? SEO indexable?
4. **Mobile app priority** — iOS first, or responsive web first?
5. **i18n approach** — `next-intl` vs. Crowdin-managed dictionaries?

---

## 12. Appendices

### A. Glossary

- **ATS:** Applicant Tracking System. Software employers use to filter resumes. OfferPath optimizes for the most common (Greenhouse, Lever, Workday).
- **Fit score:** A 0–100 AI-generated estimate of how well the user's base resume matches a given JD.
- **STAR:** Situation, Task, Action, Result. A standard interview answer structure.
- **BYOK:** Bring Your Own Key. Users supply their own AI provider API keys.
- **Pipeline:** The user's complete set of job applications across all stages.
- **Tailoring queue:** The set of jobs in the user's pipeline that don't yet have a tailored resume.
- **Mock session:** A simulated interview driven by AI, scored on multiple axes.
- **Story bank:** A user's reusable collection of STAR-formatted career stories.

### B. Source-of-truth file map

| Concept | Primary files |
|---------|---------------|
| Auth | `src/app/(auth)/*`, `src/middleware.ts`, `src/lib/auth.ts` |
| Dashboard | `src/app/dashboard/page.tsx`, `src/components/dashboard/*` |
| Pipeline | `src/app/dashboard/pipeline/**`, `src/components/pipeline/*`, `src/store/pipelineStore.ts` |
| Resume | `src/app/dashboard/resume/**`, `src/components/resume/*`, `src/store/resumeStore.ts` |
| Discovery | `src/app/dashboard/discover/**`, `src/store/discoveryStore.ts` |
| Interview | `src/app/dashboard/interview/**`, `src/store/interviewStore.ts` |
| Settings | `src/app/dashboard/settings/**`, `src/store/profileStore.ts` |
| AI | `src/app/api/ai/**`, `src/app/api/jobs/parse`, `src/app/api/resume/export` |
| Design system | `src/app/globals.css`, `tailwind.config`, `src/components/ui/*` |
| Layout | `src/components/layout/{Sidebar,Topbar,MobileNav}.tsx` |

### C. Mockup index

All 20 feature mockups used in this PRD live in [`docs/prd-screenshots/`](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-screenshots/) and are generated from [`docs/prd-mockups/index.html`](/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/prd-mockups/index.html) using Playwright. To regenerate:

```bash
node scripts/screenshot.cjs
```

The mockups use OfferPath's actual design tokens (`globals.css` colors, Plus Jakarta Sans + Playfair Display fonts) and approximate the production layout for PRD review.

### D. Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | May 2026 | Product | Initial outline from `competitor-research-report.md` |
| 0.5 | Jun 8, 2026 | Product | Drafted in `project-status.md` after v3 launch |
| 1.0 | Jun 17, 2026 | Product/Design | Full PRD with all 18 features, 20 mockup screenshots |

---

*End of document. For questions or comments, contact the OfferPath product team.*
