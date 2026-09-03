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
- **Date**: 2026-08-28 22:08 GMT+8
- **Session summary**: Added OpenAI/Anthropic compatible BYOK endpoints, tiered AI quotas (Free: 0/BYOK only, Pro: 50, Ultra: 250), optimized Create Account (`/register`) layout, redesigned Billing dashboard (`/dashboard/settings/billing`) with live quota tracking, committed (`fc81f8b`), merged into `main` (`5f5e64d`), and pushed to GitHub `origin/main` triggering Vercel production deployment. All 214 unit/integration tests pass.

## Git State (verified against actual `git status`)

- **Branch**: `main` (confirmed via `git branch --show-current`)
- **HEAD**: `5f5e64d` — Merge branch 'audit-fix-0824'
- **Remote**: pushed — `main...origin/main` in sync (`fc81f8b` merged and pushed)
- **Uncommitted changes**: none (working tree clean)
- **Stashes**: `stash@{0}: On main: main branch uncommitted changes (favicon.svg, logo-mark.svg deletion)` — PRE-EXISTING, untouched.
- **Recent commits**:
  ```
  5f5e64d Merge branch 'audit-fix-0824'
  fc81f8b feat: add BYOK compatible endpoints, tiered AI quotas, and billing usage dashboard
  9778b8e docs(handoff): update handoff state after database consistency fixes
  0a70db2 fix(database): resolve full-stack schema inconsistencies and protect user data
  18aafa3 feat(ci): add supabase keep-alive scheduled workflow
  ```

### Verified vs. Assumed

- **Verified working**:
  - `npm run build` succeeds cleanly (31/31 routes, 0 type errors, 0 lint errors).
  - Unit tests: **214/214 across 30 files** passed (`src/tests/lib/aiQuota.test.ts` added with 7 tests).
  - API Key proxy validation and call dispatching for `openai-compatible` and `anthropic-compatible` endpoints tested against live and mock endpoints.
  - Quota engine correctly distinguishes Free (0 managed credits, BYOK required), Pro (50 credits/month), and Ultra (250 credits/month, $5\times$ Pro quota).
  - Billing UI (`/dashboard/settings/billing`) verified visually via screenshot with real-time AI quota meter, BYOK active indicator, and upgrade reminders.
  - Git push to `origin/main` succeeded (`9778b8e..5f5e64d`).
- **Assumed / unverified**:
  - Vercel production deployment webhook completes build on Vercel infrastructure.

## What Was Done

1. **OpenAI & Anthropic Compatible BYOK Endpoints** (`src/lib/llmProviders.ts`, `src/lib/aiService.ts`, `src/app/dashboard/settings/api-keys/page.tsx`):
   - Added `"openai-compatible"` and `"anthropic-compatible"` to provider registry with customizable `baseUrl` and `model`.
   - Added color branding and UI badges in the API Keys management page.
   - Added SSRF security assertions in `src/tests/lib/llmProvidersSecurity.test.ts` and dispatch tests in `src/tests/lib/aiProviders.test.ts`.
2. **Create Account Page Optimization** (`src/app/(auth)/register/page.tsx`):
   - Shortened value proposition bullet points to clean single-line phrases.
   - Center-aligned the feature grid (`max-w-[280px] mx-auto`) for balanced visual symmetry.
3. **Tiered AI Quotas & BYOK Access Rules** (`src/lib/aiQuota.ts`, `src/app/api/ai/route.ts`, `src/types/index.ts`, `supabase/schema.sql`):
   - Updated `Tier` type and database constraint to `"free" | "pro" | "ultra" | "team"`.
   - Free / Guest users have `0` managed credits and must provide their own API key (BYOK) for AI features; standard non-AI features (regex parsing, local ATS keyword scoring) work without keys.
   - Pro plan: `50` managed AI credits/month.
   - Ultra plan: `250` managed AI credits/month ($5\times$ Pro quota).
   - Once quota is exhausted, users can continue using all AI features with zero rate limits by connecting their own API key (BYOK).
4. **Billing Dashboard Upgrade** (`src/app/dashboard/settings/billing/page.tsx`):
   - Integrated live tier-aware AI usage meter (`0/0 BYOK Only`, `used/50`, or `used/250`).
   - Added dynamic banner alerts: Free tier BYOK reminder, active BYOK confirmation banner, and quota exhaustion warnings with direct `[Connect API Key]` links.
   - Updated pricing plan feature comparison cards.
5. **Unit Tests & Verification** (`src/tests/lib/aiQuota.test.ts`):
   - 7 unit tests covering Free (0 quota), Pro (50), Ultra (250, $5\times$ Pro), quota exhaustion blocking, and BYOK bypassing server limits.

## In Progress

- none — all requested features and deployments are complete.

## Dead Ends & Ruled-Out Approaches

- Do NOT attempt to run `vercel` CLI directly without credentials; pushing to `origin/main` automatically triggers Vercel CI/CD via GitHub integration.
- Do NOT block local non-AI fallback engines (e.g. `ResumeParserService.parse`) when users have no API key; Free and Guest users must be able to use core non-AI features.

## Do Not Touch

- `.handoff/archive/` — historical handoff documents, read-only.
- Pre-existing stash `stash@{0}` — untouched.
- RLS policies and server-authoritative profile guards in `src/lib/supabase-sync.ts`.
- Rate limiting rules in `src/lib/rateLimit.ts`.

## Next Steps

1. Verify live Vercel production deployment at https://offerpath.cc.cd reflects commit `5f5e64d`.
2. Backlog: Stripe billing checkout integration for Pro/Ultra subscriptions.

## Decisions Made

- **BYOK Priority & Quota Bypass**: User-supplied API keys bypass server quota limits and proxy calls directly to external provider APIs, ensuring unlimited access for BYOK users across all tiers.
- **5x Ultra Quota Multiplier**: Ultra plan is set to 250 requests/month ($5\times$ the Pro limit of 50 requests/month).
- **Graceful Non-AI Degradation**: When no API key is provided on Free tier, AI callers gracefully fall back to local rule-based parsing and keyword matching without runtime exceptions.

## Environment Notes

- **Dependencies installed**: none
- **Migrations run**: none (schema constraint updated in `supabase/schema.sql`)
- **Env vars set**: `PRO_TIER_MONTHLY_AI_USES` (optional, defaults to 50), `ULTRA_TIER_MONTHLY_AI_USES` (optional, defaults to 250)
- **Dev server command**: `npm run dev` on port 3000
- **Node version**: v25.6.0
- **Framework**: Next.js 15.5.15 (App Router)
- **Database**: Supabase PostgreSQL (`ubkywtxwzrudstqvpafh`)
- **Hosting**: Vercel (`https://offerpath.cc.cd`)

## Known Issues / Blockers

- none

## Agent Config Changes

Check all config files that were modified during this session:

- [x] `AGENTS.md` (Codex, OpenCode)
- [x] `CLAUDE.md` (Claude Code)
- [x] `GEMINI.md` (Antigravity)
- [ ] None modified

**Summary of changes**: Synced Agent Handoff Protocol idempotency blocks across agent configuration files.

## Scratch Files

- `scratch/take_preview_screenshots.js`: Ephemeral screenshot capture script for visual verification. Safe to keep or delete.
