# Agent Handoff Document

> This file is the bridge between agents working on the same project.
> The outgoing agent fills it in. The incoming agent reads it first.
> Location: `.handoff/HANDOFF.md` in the project root.
> If a section is genuinely empty, write "none" - do not delete it.

## Metadata

- **Project**: OfferPath
- **Project path**: `/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath`
- **From agent**: Antigravity
- **To agent**: any (Codex | Claude Code | Antigravity | Cursor | Windsurf)
- **Date**: 2026-08-26 17:55 GMT+8
- **Session summary**: Full database & full-stack schema consistency audit completed and remediated. Fixed 13 inconsistencies across Server Actions, Supabase sync layer, hydration hooks, Zustand stores, and Postgres schemas. Applied `supabase/migration_2026_08_26.sql` to remote Supabase (`ubkywtxwzrudstqvpafh`), ran full test suite (213/213 unit tests passed), compiled clean Next.js production build (31/31 routes), committed (`0a70db2`), and pushed to GitHub `main` (auto-deploying to Vercel).

## Git State (verified against actual `git status`)

- **Branch**: `main` (confirmed via `git branch --show-current`)
- **HEAD**: `0a70db2` — fix(database): resolve full-stack schema inconsistencies and protect user data
- **Remote**: pushed — `main...origin/main` in sync (`18aafa3..0a70db2` pushed this session)
- **Uncommitted changes**: none (working tree clean)
- **Stashes**: `stash@{0}: On main: main branch uncommitted changes (favicon.svg, logo-mark.svg deletion)` — PRE-EXISTING, untouched.
- **Recent commits**:
  ```
  0a70db2 fix(database): resolve full-stack schema inconsistencies and protect user data
  18aafa3 feat(ci): add supabase keep-alive scheduled workflow
  7c85bab docs(handoff): freeze state after audit-remediation engagement
  d7974c0 feat(parsing): conservative multi-column PDF reading + Playwright smoke suite
  21b7f32 feat(discovery): live career-board scanning via open-source OSS stack
  ```

### Verified vs. Assumed

- **Verified**:
  - `npm run build` succeeds (31/31 routes, 0 type/lint errors).
  - Unit tests: **213/213 across 30 files** passed (`src/tests/lib/supabaseSync.test.ts` added with 8 tests).
  - Remote Supabase database updated: columns `mock_sessions.question_pool` (jsonb) and `resumes.ats_evaluations` (jsonb) verified in remote schema (`information_schema.columns`).
  - Git push to `origin/main` succeeded (`18aafa3..0a70db2`).
  - Vercel production site responding 200 OK at https://offerpath.cc.cd (`server: Vercel`, `x-vercel-cache: PRERENDER`).
- **Assumed / unverified**:
  - Vercel production build for commit `0a70db2` finishes in ~2 minutes via GitHub webhook.
  - User rotation of previously leaked API keys (still pending user action).

## What Was Done (this session)

1. **Job Creation Action Sanitization** (`src/app/actions/pipeline.ts`):
   - Stripped frontend relation objects (`company`, `resume`) from SQL insert payload, preventing `column "company" does not exist` runtime errors.
   - Added automatic company resolution/creation if a company was provided without `company_id`.
   - Added lifecycle milestone timestamp tracking (`applied_at`, `interviewed_at`, `offered_at`) in `updateJobStatusAction` and `pipelineStore.moveJobDirect`.
2. **Server-Authoritative Profile Protection** (`src/lib/supabase-sync.ts`):
   - Switched profile sync to use SQL `update` on user-editable fields (`full_name`, `email`, `avatar_url`, `preferences`), completely protecting `tier`, `ai_uses_this_week`, and `week_reset_at` from client overwrites.
3. **Profile Hydration & Data Unpacking** (`src/hooks/useSupabaseSync.ts`):
   - Unpacked all 19 personal background fields from `preferences` into `profileStore.profile`, preventing cloud data wipeouts on login.
4. **Pipeline & Discovery Decoupling** (`src/lib/supabase-sync.ts`, `src/hooks/useSupabaseSync.ts`):
   - Synced companies from `pipelineStore` to Supabase.
   - Removed destructive company deletion sweep from discovery sync that was deleting pipeline companies and setting job references to `NULL`.
   - Stopped querying pipeline jobs into `useDiscoveryStore.jobs`.
   - Cleaned up duplicate `break;`.
5. **UUID Compatibility & Safe Migration** (`src/lib/supabase-migration.ts`, `src/components/pipeline/AddJobDialog.tsx`, `src/store/*`):
   - Added relational ID remapper in `migrateGuestDataToSupabase` to convert non-UUID IDs (`"r1"`, `"c1"`, `"j1"`) to valid v4 UUIDs while preserving foreign key relationships.
   - Added `isUUID` validator in `supabase-sync.ts`.
   - Updated store initializers to use standard UUIDs.
6. **Schema Persistence & Migration** (`supabase/migration_2026_08_26.sql`, `supabase/schema.sql`):
   - Added `question_pool` to `mock_sessions` and `ats_evaluations` to `resumes`.
   - Executed migration on remote Supabase instance (`ubkywtxwzrudstqvpafh`).
   - Aligned `interview_preps` conflict target to `onConflict: "user_id,job_id"`.
7. **Settings Cloud Sync** (`src/app/dashboard/settings/page.tsx`):
   - Persisted UI preferences (`notificationsEnabled`, `weeklyDigest`, `defaultTemplate`) to `profiles.preferences` on Supabase.

## In Progress

- none — all planned items implemented, verified, committed, and deployed.

## Dead Ends & Ruled-Out Approaches

- Do NOT run `npx vercel` directly without login credentials; pushing to `main` auto-deploys via GitHub integration.
- Do NOT run client-side full row upserts on `profiles` table without guarding `tier` and `ai_uses_this_week`, as it resets subscription and AI quota states.

## Do Not Touch

- `.handoff/archive/` — historical handoffs, read-only.
- Pre-existing stash `stash@{0}` — untouched.
- RLS policies on Supabase tables — critical for multi-tenant isolation.
- Security rate limits and AI quota guards in `src/lib/aiQuota.ts` and `src/lib/rateLimit.ts`.

## Next Steps

1. User rotation of leaked API keys (Stripe, OpenAI, Google, DeepSeek) in provider dashboards.
2. Verify live Vercel production deployment at https://offerpath.cc.cd reflects commit `0a70db2`.
3. Backlog: Stripe billing checkout buildout, Sentry error monitoring.

## Decisions Made

- **Client vs Server Profile Authority**: Client profile edits only modify user preferences and contact details. Subscription tiers and usage counters are server-authoritative.
- **Relational Guest Migration**: Legacy string IDs from guest sessions are mapped to v4 UUIDs using an ID dictionary to guarantee referential integrity across jobs, companies, resumes, and interview preps.
- **Non-Destructive Discovery Sync**: Discovery sync upserts newly found companies but never deletes existing companies in the database.

## Environment

- **Node**: v25.6.0
- **Framework**: Next.js 15.5.15 (App Router)
- **Database**: Supabase PostgreSQL (`ubkywtxwzrudstqvpafh`)
- **Hosting**: Vercel (`https://offerpath.cc.cd`)

## Restart Cheat Sheet

- Run dev server: `npm run dev` (starts on port 3000)
- Run unit tests: `npm test`
- Run build check: `npm run build`
