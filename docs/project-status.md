# OfferPath — Project Status & Handoff Guide

**Last updated:** 2026-05-19  
**Version:** 0.1.0  
**Repo:** `/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath`

This document captures everything you need to resume work on OfferPath: what it is, what works, what's stubbed, what's uncommitted, and what to do next.

---

## Executive Summary

OfferPath is a **Next.js 15 job-hunt operating system** — a single app for tracking applications, building resumes, discovering jobs, and preparing for interviews. The UI is polished and most client-side flows work end-to-end in the browser.

**Current maturity:** functional **client-side prototype** moving toward production. Data lives in Zustand + `localStorage` by default. Supabase auth/sync and real LLM calls are **implemented but optional** — they activate only when env vars and API keys are configured.

**Last committed work:** `d7abb33` — security audit fixes (XSS, headers, file upload, IDs).  
**Since then:** a large uncommitted diff adds auth middleware, Supabase scaffolding, tests, CI, error/loading boundaries, and several audit remediations. **Commit or review this work before treating `main` as authoritative.**

| Check | Status (2026-05-19) |
|-------|---------------------|
| `npm run build` | Passes (19 routes) |
| `npm run lint` | Passes (1 React hooks warning in `useSupabaseSync.ts`) |
| `npm test` | 8 tests pass (2 files — minimal coverage) |
| Production-ready | No — backend, billing, discovery, and E2E testing remain |

---

## Quick Start

```bash
cd products/offerpath
npm install
npm run dev          # http://localhost:3000 (Turbopack)
npm run build        # production build
npm run lint
npm test
```

### Auth without Supabase (default dev mode)

If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are **not** set:

1. Register or log in with any email/password.
2. A mock `auth_token` cookie is set (`src/lib/auth.ts`).
3. `src/middleware.ts` protects `/dashboard/*` using that cookie.
4. All data persists in browser `localStorage` via Zustand `persist`.

### Auth with Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. Set env vars (see [Environment Variables](#environment-variables)).
4. Register/login uses real Supabase auth; middleware validates session cookies.
5. `useSupabaseSync()` in dashboard layout hydrates/syncs stores when logged in.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router, Turbopack dev) |
| UI | React 19, Tailwind CSS 4, Framer Motion |
| State | Zustand + `persist` middleware → `localStorage` |
| Backend (planned) | Supabase (Postgres + Auth + RLS) |
| Rich text | TipTap |
| Drag & drop | @dnd-kit |
| PDF parsing | pdfjs-dist (worker bundled locally) |
| DOCX | mammoth, docx export |
| Charts | Recharts |
| Toasts | sonner |
| Tests | Vitest + Testing Library + jsdom |
| Output | `standalone` (Docker-friendly) |

---

## Product Modules

OfferPath markets four modules (see landing page `src/app/page.tsx`):

| Module | Route prefix | Purpose |
|--------|--------------|---------|
| Job Tracker | `/dashboard/pipeline` | Kanban pipeline, JD analysis UI, analytics, offer comparison |
| Resume Studio | `/dashboard/resume` | Editor, templates, import/export, ATS checker, tailoring |
| Job Search | `/dashboard/discover` | Company/job discovery, scan UI, save/dismiss |
| Interview Simulator | `/dashboard/interview` | Prep guides, STAR story bank, mock interviews |

Account: `/dashboard/settings`, `/dashboard/settings/billing`, `/dashboard/settings/api-keys`

---

## Route Map

| Route | Type | Notes |
|-------|------|-------|
| `/` | Static | Landing page |
| `/login`, `/register` | Static | Auth; redirects to dashboard if authenticated |
| `/dashboard` | Static | Overview stats, CTAs |
| `/dashboard/pipeline` | Static | Kanban board |
| `/dashboard/pipeline/add` | Static | Add job page (audit fix — was missing) |
| `/dashboard/pipeline/[id]` | Dynamic | Job detail |
| `/dashboard/pipeline/analytics` | Static | Recharts analytics |
| `/dashboard/pipeline/compare` | Static | Offer comparison |
| `/dashboard/resume` | Static | Resume list; `?tailorFor=<jobId>` for tailoring context |
| `/dashboard/resume/new` | Static | Create/import resume |
| `/dashboard/resume/[id]` | Dynamic | Editor + preview (heavy bundle ~229 kB) |
| `/dashboard/discover` | Static | Discovery feed (mock data) |
| `/dashboard/discover/[id]` | Dynamic | Job detail; links to pipeline/resume |
| `/dashboard/interview` | Static | Interview overview |
| `/dashboard/interview/[jobId]` | Dynamic | Per-job prep |
| `/dashboard/interview/[jobId]/mock` | Dynamic | Mock interview session |
| `/dashboard/interview/stories` | Static | STAR story bank |
| `/dashboard/settings` | Static | Profile & preferences |
| `/dashboard/settings/billing` | Static | Plan cards (no Stripe) |
| `/dashboard/settings/api-keys` | Static | BYO LLM keys |

Navigation source of truth: `src/lib/navConfig.ts`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (React client components)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Zustand     │  │ aiService    │  │ FileParser      │ │
│  │ stores      │  │ (mock or LLM)│  │ (PDF/DOCX/txt)  │ │
│  └──────┬──────┘  └──────────────┘  └─────────────────┘ │
│         │ persist → localStorage                          │
│         │ useSupabaseSync (optional)                      │
└─────────┼───────────────────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase (when NEXT_PUBLIC_SUPABASE_* set)              │
│  Auth │ profiles │ resumes │ companies │ jobs │ …        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  middleware.ts — protects /dashboard/*                   │
│  Supabase session OR mock auth_token cookie              │
└─────────────────────────────────────────────────────────┘
```

**Design choice:** stores are the source of truth in the browser. Supabase sync is **additive** — it loads on mount and debounces writes back (500 ms). If Supabase is unavailable, the app still works offline-first via `localStorage`.

---

## State Management (Zustand Stores)

| Store | File | Persisted | Supabase sync | Notes |
|-------|------|-----------|---------------|-------|
| Pipeline | `src/store/pipelineStore.ts` | Yes | Yes (`jobs`, `companies`) | Kanban statuses, stats, resume linkage |
| Resume | `src/store/resumeStore.ts` | Yes | Yes (`resumes`) | CRUD, undo, ATS cache, tailoring |
| Profile | `src/store/profileStore.ts` | Yes | Yes (`profiles`) | User profile, API keys, tier |
| Discovery | `src/store/discoveryStore.ts` | Yes | Partial (`companies` only) | **Seeded from mock data** |
| Interview | `src/store/interviewStore.ts` | Yes | **No** | Stories, preps, mock sessions — all local/mock |

Sync hook: `src/hooks/useSupabaseSync.ts` (wired in `src/app/dashboard/layout.tsx`)

Sync layer: `src/lib/supabase-sync.ts` — `StoreName = "pipeline" | "resume" | "profile" | "discovery"`

**Gap:** Interview data (`stories`, `interview_preps`, `mock_sessions`) has DB tables in `supabase/schema.sql` but **no sync implementation** yet.

---

## Authentication

| File | Role |
|------|------|
| `src/middleware.ts` | Route guard for `/dashboard/*` and auth-route redirects |
| `src/lib/auth.ts` | `signInWithEmail`, `signUpWithEmail`, `signOut`; mock cookie helpers |
| `src/lib/supabase.ts` | Browser Supabase client; `isSupabaseConfigured()` |
| `src/app/(auth)/login/page.tsx` | Login form |
| `src/app/(auth)/register/page.tsx` | Registration form |

**Mock mode:** cookie `auth_token` = base64 JSON `{ email, ts }`.

**Not implemented:**
- Password reset (login shows error: "Password reset is not implemented yet")
- Social login — Google/LinkedIn buttons toast "Social login coming soon!" (`SocialLoginButtons.tsx`)
- Change password flow in settings — toast stub

---

## AI Service

**File:** `src/lib/aiService.ts`

Behavior:
1. If user has an **active API key** in `profileStore.apiKeys` → calls real provider (priority: OpenAI → Anthropic → DeepSeek → Gemini).
2. Else if `NEXT_PUBLIC_*_API_KEY` env vars exist → uses those.
3. Else → **mock implementations** with simulated delay.

Capabilities (real when keys present):
- Resume tailoring (`TailorRequest` → `TailorResult`)
- Interview prep generation
- ATS scoring
- Mock interview responses (partial — store still uses canned flow)

**Security note:** LLM calls run **from the browser** when using profile API keys or `NEXT_PUBLIC_*` env vars. CSP in `next.config.ts` explicitly allows `connect-src` to provider APIs. For production, move AI calls to **Next.js API routes** or Supabase Edge Functions so keys never ship to clients.

Key validation helper: `src/lib/validateApiKey.ts`

---

## Supabase Backend

**Schema:** `supabase/schema.sql`

Tables:
- `profiles` — extends auth.users; tier, AI usage counters, Stripe IDs (unused)
- `resumes` — JSONB resume data + template
- `companies` — pipeline + discovery companies
- `jobs` — pipeline jobs with kanban status, evaluation JSONB
- `interview_preps` — per-job prep (not synced from app yet)
- `mock_sessions` — interview transcripts (not synced yet)
- `stories` — STAR story bank (not synced yet)

Includes RLS policies (user owns own rows), `handle_new_user` trigger, `updated_at` triggers, indexes.

**To deploy:**
1. Create Supabase project.
2. Paste and run full `schema.sql`.
3. Enable Email auth (and OAuth providers when ready).
4. Add env vars to `.env.local` (never commit):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
5. Log in via app; verify rows appear in Supabase tables after editing pipeline/resumes.

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | For cloud sync | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For cloud sync | Supabase anon key |
| `NEXT_PUBLIC_OPENAI_API_KEY` | Optional | Fallback LLM (dev only — prefer profile keys) |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | Optional | Fallback LLM |
| `NEXT_PUBLIC_DEEPSEEK_API_KEY` | Optional | Fallback LLM |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Optional | Fallback LLM |

Create `.env.local` at repo root. No `.env.example` exists yet — add one when committing env documentation.

---

## Feature Maturity Matrix

| Feature | Status | Details |
|---------|--------|---------|
| Landing / marketing | Done | `src/app/page.tsx` |
| Mock auth + middleware | Done | Works without Supabase |
| Supabase auth | Ready | Needs env + schema deploy |
| Pipeline Kanban | Done | dnd-kit, status transitions |
| Add job (URL/JD/manual) | Done | `AddJobDialog`, `/pipeline/add` |
| Job detail & analytics | Done | Recharts, compare offers |
| Resume editor (TipTap) | Done | 9 templates in `src/components/resume/templates/` |
| PDF/DOCX import | Done | Worker bundled; 10 MB limit; max 100 PDF pages |
| PDF/DOCX export | Done | `ExportButtons`, `exportDocx.ts` |
| Resume tailoring | Partial | UI works; resolves pipeline **and** discovery job IDs; needs LLM key for real AI |
| ATS checker | Partial | Mock without keys |
| Job Discovery | **Mock** | `src/store/mockDiscoveryData.ts` — no real scraping |
| Interview prep | Partial | Mock preps in store; real generation if LLM configured |
| Mock interviews | **Mock** | Canned questions + `generateMockFeedback()` in `interviewStore` |
| STAR story bank | Done (local) | CRUD in store; not cloud-synced |
| Settings / profile | Done | localStorage + optional Supabase |
| API key management | Done | Stored in profileStore; validated via `validateApiKey` |
| Billing / Stripe | **Mock** | Static plan UI; `currentPlan = "free"` hardcoded |
| Plan limit enforcement | **Not built** | Billing page describes limits; nothing gates usage |
| Social OAuth | Stub | Toast only |
| Password reset | Not built | — |
| Job AI evaluation | Stub | `JobDetail` → "AI Evaluation feature coming soon!" |
| E2E tests | None | Audit planned Playwright smoke — not implemented |
| Unit tests | Minimal | `src/tests/lib/utils.test.ts`, `src/tests/stores/profileStore.test.ts` |

---

## Audit History

Two audit artifacts live in `docs/audits/`:

- `offerpath-product-audit-plan.md` — methodology and file checklist
- `offerpath-audit-report.md` — findings from 2026-05-17

### Phase 1 (ship-blocking) — largely done in working tree

| ID | Issue | Status |
|----|-------|--------|
| OP-001 | No auth middleware | Fixed — `src/middleware.ts` |
| OP-002 | CSP `unsafe-eval` | Fixed — removed from `next.config.ts` |
| OP-003 | PDF.js CDN vs CSP | Fixed — local worker in `FileParserService.ts` |
| OP-004 | Missing `/pipeline/add` | Fixed — `src/app/dashboard/pipeline/add/page.tsx` |
| OP-005 | Resume tailor discovery IDs | Fixed — `resume/page.tsx` checks both stores |
| OP-006 | BsFilter icon text leak | Fixed (per audit) |
| OP-007 | `alert()` stubs | Fixed — replaced with sonner toasts |
| OP-010 | Store persist gaps | Fixed — all stores use `persist` |

### Phase 2 (core workflow) — in progress

| ID | Issue | Status |
|----|-------|--------|
| OP-008 | Supabase integration | Scaffolding done; needs deploy + interview sync |
| OP-009 | Real AI service | Done when keys set; mock fallback remains |

### Phase 3 (polish) — pending

Error/loading boundaries added for dashboard sections. Still open: bundle size, E2E tests, ESLint CLI migration, README, rate limiting, Next/Image in templates.

---

## Remaining Work (Prioritized Roadmap)

### P0 — Stabilize & commit current work

- [ ] Review and commit uncommitted changes (see [Git State](#git-state))
- [ ] Add `.env.example` with required/optional vars
- [ ] Add project README with setup steps (or extend this doc)

### P1 — Production backend

- [ ] Deploy Supabase; run `schema.sql`; verify RLS
- [ ] Test full sync loop: login → hydrate → edit pipeline/resume → verify DB rows
- [ ] Implement interview store sync (`stories`, `interview_preps`, `mock_sessions`)
- [ ] Sync discovery **jobs** to Supabase (currently only companies sync)
- [ ] Password reset via Supabase Auth
- [ ] Google/LinkedIn OAuth via Supabase

### P2 — Replace mocks with real features

- [ ] **Job Discovery engine** — replace `mockDiscoveryData.ts` with career-page crawl or job board API
- [ ] **Mock interviews** — LLM-driven Q&A, scoring, transcript persistence
- [ ] **Job AI evaluation** in pipeline (`JobDetail`)
- [ ] **Stripe billing** — checkout, webhooks, enforce tier limits (`profiles.tier`, `ai_uses_this_week`)

### P3 — Security & architecture

- [ ] Move LLM calls to server-side API routes (never expose keys in browser)
- [ ] Rate limiting on AI endpoints
- [ ] Audit API key storage (encrypt at rest if server-side)

### P4 — Quality & performance

- [ ] Playwright E2E smoke tests for all routes (see audit plan route list)
- [ ] Expand Vitest coverage (stores, aiService mocks, middleware)
- [ ] Code-split resume editor routes (316 kB first load on `/resume/new`)
- [ ] Migrate from deprecated `next lint` to ESLint CLI
- [ ] Replace `<img>` with `next/image` in resume templates
- [ ] Add favicon / web manifest

---

## Known Stubs & UX Gaps

| Location | Behavior |
|----------|----------|
| `SocialLoginButtons.tsx` | "Social login coming soon!" toast |
| `login/page.tsx` | Password reset not implemented |
| `settings/page.tsx` | Change password coming soon |
| `JobDetail.tsx` | AI Evaluation coming soon |
| `discoveryStore.ts` | All data from `mockDiscoveryData.ts` |
| `interviewStore.ts` | `MOCK_STORIES`, `MOCK_PREPS`, scripted mock interview pool |
| `billing/page.tsx` | Static UI; no payment integration |
| `AddJobDialog.tsx` | JD evaluation uses mock/heuristic scoring |

---

## Testing & CI

**Vitest config:** `vitest.config.ts`  
**Setup:** `src/tests/setup.ts`  
**Current tests:**
- `src/tests/lib/utils.test.ts` — `cn`, `formatDate`, `statusColor`
- `src/tests/stores/profileStore.test.ts` — profile store behavior

**CI:** `.github/workflows/ci.yml` (uncommitted) runs on push/PR to `main`:
```yaml
npm ci → npm run lint → npm run build → npm test
```

**Not present:** Playwright/Cypress, typecheck script, coverage gates.

Suggested audit E2E route list (from `docs/audits/offerpath-product-audit-plan.md`):
`/`, `/login`, `/register`, all `/dashboard/**` routes listed in [Route Map](#route-map).

---

## Security Posture

**Implemented (`next.config.ts`):**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`, `Permissions-Policy`
- CSP: no `unsafe-eval`; `worker-src 'self' blob:`; restricted `connect-src`

**Concerns:**
- API keys usable from browser (profile store + `NEXT_PUBLIC_*` fallbacks)
- No server-side rate limiting
- Mock auth cookie is not cryptographically secure (dev only)
- Billing/tier limits not enforced

**File upload:** 10 MB max, extension/MIME validation in `FileParserService.ts`. Rich HTML sanitized via DOMPurify in AI output paths.

---

## Performance Notes

Build output (approximate First Load JS):

| Route | Size |
|-------|------|
| `/dashboard/resume/new` | ~316 kB |
| `/dashboard/interview/stories` | ~289 kB |
| `/dashboard/resume/[id]` | ~229 kB |
| `/` (landing) | ~179 kB |
| Shared | ~102 kB |

Heavy routes: TipTap, resume templates, Framer Motion on landing. Consider dynamic imports and route-level splitting.

---

## Git State

**Last commit:** `d7abb33` — `fix(security): comprehensive audit — XSS, headers, file upload, IDs, bugs, perf`

**Significant uncommitted work (as of 2026-05-19):**

Modified:
- Auth pages, dashboard layout, pipeline/resume/settings pages
- `next.config.ts`, `package.json`, AI/file parser libs
- Pipeline components, resume templates, stores

New (untracked):
- `src/middleware.ts`, `src/lib/auth.ts`, `src/lib/supabase.ts`, `src/lib/supabase-sync.ts`
- `src/hooks/useSupabaseSync.ts`, `src/lib/validateApiKey.ts`
- `src/app/dashboard/pipeline/add/`
- Dashboard `error.tsx` / `loading.tsx` for interview, pipeline, resume, settings
- `src/tests/`, `vitest.config.ts`
- `.github/workflows/ci.yml`
- `docs/` (audits + this file)

**Do not commit:** `.playwright-mcp/`, `.swarm/`, `.hive-mind/`, `.claude-flow/` runtime state, `test_buttons.py` (root — move or delete before ship).

---

## Key Files Reference

| Concern | Path |
|---------|------|
| App entry / layout | `src/app/layout.tsx`, `src/app/dashboard/layout.tsx` |
| Auth middleware | `src/middleware.ts` |
| Auth helpers | `src/lib/auth.ts` |
| Supabase client | `src/lib/supabase.ts` |
| Supabase sync | `src/lib/supabase-sync.ts`, `src/hooks/useSupabaseSync.ts` |
| AI | `src/lib/aiService.ts`, `src/lib/validateApiKey.ts` |
| File import | `src/lib/FileParserService.ts`, `src/lib/ResumeParserService.ts` |
| Export | `src/lib/exportDocx.ts`, `src/components/resume/ExportButtons.tsx` |
| Navigation | `src/lib/navConfig.ts` |
| Types | `src/types/index.ts` |
| DB schema | `supabase/schema.sql` |
| Security headers | `next.config.ts` |
| Audit reports | `docs/audits/offerpath-audit-report.md` |

---

## Suggested Pick-Up Sequence

When returning to this project, follow this order:

1. **Run health checks** — `npm install && npm run build && npm test && npm run lint`
2. **Decide on git** — commit or stash the uncommitted audit-remediation work
3. **Choose auth mode** — mock-only local dev vs. Supabase (create `.env.local`)
4. **If Supabase** — run schema, test login, verify sync on pipeline + resume edits
5. **If AI features** — add API key in Settings → API Configuration; test tailor + interview prep
6. **Pick one P2 feature** — Discovery engine OR real mock interviews OR Stripe (highest product impact)
7. **Add E2E smoke test** — one Playwright spec covering login → dashboard → add job → create resume

---

## Related Documentation

- `docs/audits/offerpath-audit-report.md` — detailed findings (OP-001 through OP-025)
- `docs/audits/offerpath-product-audit-plan.md` — audit methodology and workflow test checklist
- `CLAUDE.md` / `AGENTS.md` — agent/swarm conventions (not product docs)

---

*This file should be updated whenever a major milestone ships (Supabase live, Stripe, discovery engine, etc.) or when the default dev/prod setup changes.*
