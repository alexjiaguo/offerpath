# Agent Handoff Document

> This file is the bridge between agents working on the same project.
> The outgoing agent fills it in. The incoming agent reads it first.
> Location: `.handoff/HANDOFF.md` in the project root.
> If a section is genuinely empty, write "none" - do not delete it.

## Metadata

- **Project**: OfferPath
- **Project path**: `/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath`
- **From agent**: OpenCode (ox-alpha)
- **To agent**: any (Codex | Claude Code | Antigravity | Cursor | Windsurf)
- **Date**: 2026-08-25 20:45 GMT+8
- **Session summary**: Full-stack audit → remediation engagement. Four audit rounds (security, resume/tailor correctness, feature completeness, fabrication/dead-capability sweep) produced ~30 findings; ALL code-level findings fixed across 12 commits merged to `main` and pushed to GitHub (Vercel auto-deploys). Test suite grown 160→205 unit tests + new 7-spec Playwright E2E suite.

## Git State (verified against actual `git status`)

- **Branch**: `main` (confirmed via `git branch --show-current`)
- **HEAD**: `d7974c0` — feat(parsing): conservative multi-column PDF reading + Playwright smoke suite
- **Remote**: pushed — `main...origin/main` in sync (`58586bf..d7974c0` pushed this session)
- **Uncommitted changes**: none (working tree clean)
- **Stashes**: `stash@{0}: On main: main branch uncommitted changes (favicon.svg, logo-mark.svg deletion)` — PRE-EXISTING from before this session, untouched. Leave it alone or ask the user.
- **Branches**: `audit-fix-0824` still exists locally, fully merged into main (safe to delete with `git branch -d audit-fix-0824`)
- **Recent commits** (all this session):
  ```
  d7974c0 feat(parsing): conservative multi-column PDF reading + Playwright smoke suite
  21b7f32 feat(discovery): live career-board scanning via open-source OSS stack
  d1622cc fix(interview): replace random mock-interview scorecards with LLM transcript analysis
  3675e0b chore(resume): purge zombie editor surfaces and dead model-field UI
  026df7c feat(discovery): bridge Job Radar to the pipeline via prefilled Track action
  4a02924 fix(dashboard): drop hero Add Job duplicate of global Topbar quick-add
  3a1ebc1 fix(dashboard): hero CTA opens shared Add Job dialog; unify label
  9db445a fix(pipeline): remove duplicate Add Job button from page header
  8f2a034 fix(parsing): harden legacy formats, CJK sections, quality signals, consent, real job evaluation
  1ff166e fix(resume): prevent AI tailor erasing experience dates + silent failures
  01ede4d fix(pipeline): restore creation-time job metadata (tier/notes/career_url)
  83ba86f fix(security): close AI proxy abuse vectors and untrack leaked env files
  ```

### Verified vs. Assumed

- **Verified**:
  - `npx tsc --noEmit` clean; `npm run build` succeeds; lint = 3 pre-existing warnings only (UserProfile in useSupabaseSync, Academic/ClassicMinimal in itemSpacing test)
  - Unit: **205/205 across 29 files**; E2E: **7/7** Playwright specs (`npm run test:e2e`, chromium cached)
  - Push to `origin/main` succeeded; Vercel auto-deploy triggers on push (per project convention) — deployment completion itself NOT verified (CLI auth expired)
  - Live scan endpoint verified end-to-end: invalid board org returns graceful per-company error
- **Assumed / unverified**:
  - Vercel production deployment of `d7974c0` completed successfully at https://offerpath.cc.cd (check dashboard/URL)
  - Leaked API keys NOT yet rotated (user-side action, still outstanding)

## What Was Done (this session)

1. **Security hardening** (`83ba86f`): untracked leaked `.env` files from public repo; `/api/ai` + `/api/jobs/parse` auth gates; LLM baseUrl pinning/allowlisting (kills key-exfiltration SSRF); server-side free-tier quota (`src/lib/aiQuota.ts`, 3/wk env-overridable); rate limiter (`src/lib/rateLimit.ts`); CSP `unsafe-eval` dropped in prod; HSTS added.
2. **Resume/tailor fixes** (`1ff166e`): tailor prompt now requests real `ExperienceEntry` schema + `normalizeTailorResult()` defensive merge (can no longer wipe dates); errors surface instead of silent mock fallback when a key is configured; skillsToHighlight actually applies; 100-page cap in primary PDF path.
3. **Feature completeness** (`8f2a034`, `371bae1`, `01ede4d`, `21b7f32`): password-reset E2E flow (`/reset-password`); interview store cloud-sync wired; zombies deleted (`/api/resume/export` + playwright deps, SocialLoginButtons, MOCK_JOBS, ThemePicker, MarkdownEditor); discovery live crawler (Greenhouse/Lever/Ashby/Workable JSON APIs + cheerio fallback, `src/lib/jobBoards.ts` + `/api/discover/scan`); URL-mode job import with SSRF guards (`/api/jobs/fetch-url`); enriched AddJobDialog (tier/TA-notes/career_url) as single add-job flow with prefill support; mock interviews use LLM question generation + transcript scoring.
4. **Fabrication purge** (`49c535c`, `d1622cc`): hash-based fake ATS scores replaced by persisted real evaluations (`src/lib/localAts.ts` local engine + LLM upgrade path, one number everywhere); random mock-interview scorecards replaced by grounded LLM transcript analysis with labeled deterministic heuristic fallback.
5. **UX consistency**: single "Add Job" entry point (Topbar global + contextual "+"); labels unified en/zh; demo-vs-live honesty banners in Discovery; "Practice mode"/"AI-analyzed" badges on scorecards.
6. **Parser robustness** (`8f2a034`, `d7974c0`): CJK PDF section detection + bilingual extractor aliases; RTF `\uN` unicode decoding; chunked `.doc` extraction (no stack overflow); CN phone regex; sparse-parse warnings; PII consent gate for AI parse fallback; guarded multi-column PDF reading (fullWidth→left→right).
7. **Testing infrastructure**: `npm run test:e2e` (Playwright, reuses running :3001); unit suite expanded with security/parser/ATS tests.

## In Progress

- none — all work items committed and shipped.

## Dead Ends & Ruled-Out Approaches

- **Vercel CLI deploys**: stored token expired; `vercel whoami` starts interactive login. Do NOT attempt CLI deploy — push to `main` auto-deploys via Git integration.
- **Naive multi-column gutter detection without guards**: misfires catastrophically on right-aligned-date layouts (dates detach from jobs). Solved only via strict guards in `splitIntoColumns()` (right-side ≥15% of chars, ≤25% crossed text). Don't loosen guards without a labeled PDF corpus.
- **Restoring legacy `/pipeline/add` form**: it collected level/type/company_url but never submitted them (dead inputs) and was the only tier-setter — superseded by enriched dialog + redirect. Do not resurrect.
- **Silent mock fallbacks for AI features**: removed wherever a key is configured (they masked quota/provider failures with fabricated content). Mock/demo mode remains ONLY for keyless guests, clearly badged.
- **`rg` is not on PATH** in this zsh environment — use grep/Grep tool.
- **Subagent (Task tool) provider network errors** during first audit round — fell back to direct serial investigation; retrying agents may work now.

## Do Not Touch

- `.handoff/archive/` — historical handoffs, read-only.
- `public/images/templates/{1..9}.png` — template previews rendered by landing/gallery.
- Auto-injected `claude-mem-context` block at bottom of `AGENTS.md` — environment-managed.
- `supabase/schema.sql` RLS policies (lines ~133-161) — tenant-isolation invariant; app logic assumes `auth.uid() = user_id` policies stay enabled on all tables.
- Security semantics in `src/lib/rateLimit.ts`, `src/lib/aiQuota.ts`, `src/lib/jobBoards.ts` (`isPrivateHostname` blocking), `normalizeLLMBaseUrl`/`resolveProviderBaseUrl` pinning — these close the exfiltration/SSRF/quota holes; loosening them reintroduces Criticals.
- Pre-existing stash `stash@{0}` (favicon/logo-mark deletions) — not ours to drop.

## Next Steps

1. **ROTATE LEAKED KEYS (P0, user-side)**: Stripe secret + webhook, OPENAI_API_KEY, GOOGLE_API_KEY, DEEPSEEK_API_KEY are in public git history (commit `3ebc835`, files `.env (1).local`/`.env.local.bak`, since removed at HEAD). Rotate in each provider dashboard, then update Vercel env vars. Optionally purge history (`git filter-repo`) + force-push afterwards.
2. Verify Vercel deployed `d7974c0` at https://offerpath.cc.cd (spot-check `/reset-password`, Discover live scan, Job Detail "Analyze with AI").
3. Optional cleanup: `git branch -d audit-fix-0824`; investigate/drop stash@{0} with user.
4. Backlog (product decisions/resources required):
   - Stripe billing buildout (needs Stripe account/products) — plan limits already enforced server-side via `aiQuota`.
   - Error monitoring (Sentry DSN) + product analytics.
   - i18n consolidation program (~259 inline `isZh ? :` ternaries bypass locales).
   - Marketing stats ("2.8× response rate") need substantiation or softening — copy owner decision.
   - Expand discovery beyond the four supported boards if target companies use others.

## Decisions Made

- **Single add-job flow**: Topbar quick-add (global) + enriched dialog (tier/notes/career_url + AI parse + URL import) is the only creation path; page-level duplicates removed; `/pipeline/add` redirects into dialog.
- **One AI unit per tailor run**: keyword-match preview computed locally post-tailoring; LLM reasoning opt-in via JobDetail "Analyze with AI".
- **Fabrication policy**: any displayed score must be real computation or explicitly labeled heuristic/demo. Enforced for ATS + interview feedback; keep this invariant for new features.
- **Crawler approach**: public ATS JSON APIs over HTML scraping; cheerio only as generic fallback; per-company error isolation.
- **Theme**: landing already used ink-black primaries + ember spot accents matching the app token system — no redesign needed (corrected an initial wrong read based on raw hex counting).

## Environment Notes

- **Node**: v25.6.0
- **Dependencies added**: `cheerio` (runtime), `@playwright/test` (dev). Removed: `playwright-core`, `@sparticuz/chromium`. Chromium browser binaries cached under `~/Library/Caches/ms-playwright`.
- **Env vars referenced** (set in Vercel/local): Supabase URL+anon, OPENAI/ANTHROPIC/DEEPSEEK/GOOGLE keys (BYOK-or-server model), `FREE_TIER_WEEKLY_AI_USES` (optional, default 3), `NEXT_PUBLIC_APP_URL`.
- **Dev/prod commands**: `npm run dev -- -p 3002` · `npm run build && npm run start -- -p 3001` · `npm test -- --run` · `npm run test:e2e` (reuses a running :3001).
- **Migrations run**: none (schema untouched).

## Known Issues / Blockers

- Vercel CLI auth expired — Git-integration deploys only until `vercel login`.
- 3 pre-existing lint warnings (unused UserProfile import, two unused imports in itemSpacing test) — cosmetic.
- Multi-column PDF detector is synthetic-test-covered; tune thresholds further only with real-world samples.

## Agent Config Changes

- [x] `AGENTS.md` / `CLAUDE.md` — verified both contain intact `AGENT_HANDOFF_PROTOCOL` markers; no modifications made this session, nothing to sync.

## Scratch Files

- Local server logs at `/var/folders/.../T/opencode/*.log` (outside repo, ephemeral temp dir) — safe to ignore.
- Playwright artifacts land in `test-results/` (gitignored).
