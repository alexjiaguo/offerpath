# Agent Handoff Document

> This file is the bridge between agents working on the same project.
> The outgoing agent fills it in. The incoming agent reads it first.
> Location: `.handoff/HANDOFF.md` in the project root.
> If a section is genuinely empty, write "none" - do not delete it.

## Metadata

- **Project**: OfferPath
- **Project path**: `/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath`
- **From agent**: Codex (Claude-Code handoff, Aug 22 freeze)
- **To agent**: any (Codex | Claude Code | Antigravity | OpenCode | Cursor | Windsurf)
- **Date**: 2026-08-22 10:20 GMT+8
- **Session summary**: Landed the full landing redesign on `main`, deleted the now-redundant `lp_redesign` branch, pushed and let Vercel auto-deploy, captured wide-desktop verification, and froze the repo for handoff.

## Git State (verified against actual `git status`)

- **Branch**: `main` (confirmed via `git branch --show-current`)
- **HEAD**: `e2734b1` — `feat: landing page redesign with system font and responsive desktop layout`
- **Remote**: `origin/main` — **up to date** (`## main...origin/main`)
- **Uncommitted changes at freeze**: 1-line timestamp bump inside the auto-injected `claude-mem-context` block of `AGENTS.md` (no semantic change; folded into the freeze commit).
- **Stashes**: `stash@{0}: On main: main branch uncommitted changes (favicon.svg, logo-mark.svg deletion)` — pre-existing, untouched.
- **Branch status**:
  - `main` (e2734b1) — clean, in sync with `origin/main`.
  - `lp_redesign` — **deleted** (local + remote; never had unique commits relative to main, deletion was safe).
  - `codex/new-resume-studio` (5ea9530) — diverged: 3 commits ahead, 3 behind. Carries `fix(editor): pass full theme to preview, split export into PDF + DOC buttons in 3-col row`; not on main. Needs explicit decision before next work.
- **Recent commits**:
  ```
  e2734b1 feat: landing page redesign with system font and responsive desktop layout
  4434458 docs: update agent handoff document
  7e01151 feat: optimize landing page, align templates with resume-pro, and fix download export
  40257e6 fix(supabase): accept sb_publishable_ key format in checkIsConfigured
  7c94a0c fix(auth): clean slate on signup/login and ensure Supabase profile row
  ```

### Verified vs. Assumed

- **Verified working**:
  - `npm test` → 21 test files / 160 unit tests pass.
  - `npm run lint` → passes (pre-existing unused-import warnings only).
  - `npm run build` → Next 15.5.15 production bundle, 29 routes generated.
  - Local production server (`npm run start -- -p 3001`) → 200 on `/`, 200 on `/preview-templates`.
  - Vercel production (`https://offerpath.cc.cd`) → HTTP 200, new landing markup served (template preview alt present, system-font CSS shipped).
  - Wide-viewport screenshot before/after confirms 1600px content rail and expanded template preview; previous empty-side problem resolved.
- **Assumed / unverified**:
  - Supabase live auth/webhook flows on the production URL (only verified via env presence; not exercised end-to-end in this session).
  - Vercel CLI auth token (the stored token is invalid; manual `vercel login` would be required to re-enable CLI deploys — auto-deploy via the Git integration works).

## What Was Done

1. **Landing template preview fix** — replaced the repeated mock resume with the actual per-template thumbnail (`/images/templates/{1..6}.png`).
2. **System font unification for the landing** — added a `--font-landing-system` token and a scoped override on `#main-content, #main-content *` so only the landing uses the native stack (other product areas keep Plus Jakarta Sans / Playfair / JetBrains).
3. **Wide-desktop layout pass** — widened the landing rail to `max-w-[1600px]` at the `2xl` breakpoint, increased grid gaps/padding, expanded the template preview up to 620px, and rebalanced the footer to 5 columns.
4. **Commit + push** — single commit `e2734b1` on `main`; pushed to `origin/main`; Vercel auto-deploy confirmed via live HTTP 200.
5. **Branch cleanup** — local and remote `lp_redesign` removed (safe: no unique commits).
6. **Handoff freeze** — this document written; `AGENTS.md` and `CLAUDE.md` synced with the handoff protocol block; previous `HANDOFF.md` archived under `.handoff/archive/`.

## In Progress / Incomplete

- **None on `main`.** All session deliverables are committed and live.
- `codex/new-resume-studio` is the only open branch with diverging work; merge or rebase decision is deferred to the next agent.

## Dead Ends & Ruled-Out Approaches

- **Vercel CLI deploy with stored token** — fails with `The specified token is not valid`. Do not retry CLI deploys without first running `vercel login`. Auto-deploy from the Git integration is the working path.
- **Headless Playwright (bundled Chromium) for visual QA** — `npx playwright install chromium` runs to ~30%+ and then the session was aborted before it finished. Wide-viewport verification was instead done with a one-off `Google Chrome --headless=new --screenshot` against the local prod server. Continue using that path; do not re-trigger the full Chromium install.
- **Wide-layout redesign via per-section component rewrites** — the 2xl rail expansion was the smaller, safer diff. Do not move the landing onto a 12-col full-bleed framework unless the user asks for a broader redesign.
- **Dev server with the default Next.js dev compiler** — repeatedly hit `EMFILE: too many open files, watch` under this machine’s file-descriptor limit. Don’t rely on `npm run dev`; use `npm run build && npm run start -- -p 3001`.

## Next Steps

1. Decide on `codex/new-resume-studio`: rebase onto current `main`, fast-forward merge, or close. The 3-row PDF/DOC export split and theme-passing fix are the headline changes.
2. When picking up any new landing work, start by re-running the wide-viewport screenshot (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome --headless=new --screenshot=... --window-size=1920,1080 http://localhost:3001/`) — that is the canonical regression check for the desktop empty-space class of bugs.
3. If the Vercel CLI is needed again, run `vercel login` once to refresh the stored token; until then, rely on the Git push → auto-deploy flow.

## Decisions Made (and why)

- **Single landing commit, not a series of fix-ups** — the user explicitly asked for a merge + push, so the work shipped as one reviewable commit rather than 4–5 small ones.
- **`#main-content *` font override rather than replacing the global font tokens** — only the landing needed the system font, and changing `--font-sans` globally would have broken resume templates and dashboard UI that depend on the existing brand fonts.
- **2xl breakpoint for the wide rail instead of bumping the default `max-w-7xl`** — the 1280px default is correct for laptop; widening to 1600px only above 1536px keeps the design tight on smaller widescreens.

## Environment Changes

- No new dependencies installed.
- No env vars added or rotated.
- No Supabase migrations run.
- `package.json` / `package-lock.json` were committed as part of the landing commit (pre-existing on the branch; not authored this session).

## Known Broken / Blocked

- Vercel CLI deploys fail with an invalid stored token (see Dead Ends). Workaround: Git-push auto-deploy.
- macOS file-descriptor limit interferes with `next dev`. Workaround: use `next start` against a fresh build (see Dead Ends).

## Do-Not-Touch Zones

- `.handoff/archive/` — historical hand-offs. Read-only.
- `public/images/templates/{1..9}.png` — the 816×1056 template thumbnails. The landing preview now binds to these; replacing the assets requires re-validating the wide-desktop layout.
- The auto-injected `claude-mem-context` block at the bottom of `AGENTS.md` is environment-managed; do not rewrite it manually.

## Restart Cheat Sheet

- Build: `npm run build`
- Serve locally: `npm run start -- -p 3001`
- Wide-viewport screenshot: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --screenshot=/tmp/<name>.png --window-size=1920,1080 --hide-scrollbars http://localhost:3001/`
- Tests: `npm test`
- Lint: `npm run lint`
- Push to deploy: `git push origin main` (Vercel auto-deploys)
