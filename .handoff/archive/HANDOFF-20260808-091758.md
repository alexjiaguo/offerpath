# OfferPath Resume Studio Handoff

## Session Summary

This session covered the OfferPath resume studio redesign work across three separate worktrees. Each worktree is an independent git repo on its own branch and implements a redesign inspired by one of the reference resume builders:

- `worktrees/resume-flowcv` -> `codex/resume-studio-flowcv` -> FlowCV-inspired redesign
- `worktrees/resume-resumecom` -> `codex/resume-studio-resumecom` -> Resume.com-inspired redesign
- `worktrees/resume-resumeio` -> `codex/resume-studio-resumeio` -> Resume.io-inspired redesign

All three branches contain the full R1-R137 polish history. The most recent shared work is R119-R137: per-bullet personal-pronoun warning, per-bullet punctuation hint, same-company grouping hint, overlapping-dates hint, active-section pulse dot, compact mode toggle, missing-degree hint, missing-company hint, long-skill-name warning, skill-category suggestion, long-bullet comma hint, missing-school hint, skill category grouping action, education field hint, summary pronoun warning, experience grouping action, compact skill guidance, graduation-date hint, and a role label rendering fix.

Dev servers were started, verified on ports 3001/3002/3003, then stopped for the handoff. The parent repo also picked up pre-existing snapshot artifacts from a prior resume-pro task; those were committed separately.

## Git State

### Parent repo

- Branch: `codex/login-redesign`
- HEAD: `codex/login-redesign` latest commit (see `git log`)
- Untracked: `worktrees/` only. This is intentional: the worktrees are separate git repos and must not be committed into the parent.

### Worktrees

| Worktree | Branch | HEAD | Status |
|---|---|---|---|
| `worktrees/resume-flowcv` | `codex/resume-studio-flowcv` | `266d1aa` | Clean |
| `worktrees/resume-resumecom` | `codex/resume-studio-resumecom` | `629c153` | Clean (untracked `node_modules` symlink only) |
| `worktrees/resume-resumeio` | `codex/resume-studio-resumeio` | `ae21dab` | Clean (untracked `node_modules` symlink only) |

Worktrees have no stashes. The parent has one pre-existing `stash@{0}` from `main` (`favicon.svg`, `logo-mark.svg` deletion); do not pop it.

## What Was Done

- Verified all three worktree branches are committed through R137.
- Confirmed all three worktree dev servers return `200` for `/`, `/dashboard`, and `/dashboard/resume`.
- Fixed the earlier all-404 issue by starting the dev servers outside the sandbox with `ulimit -n 65536`.
- Stopped all three dev servers before writing this handoff.
- Committed the parent snapshot artifacts (`scripts/snap-r8.cjs` and CJK font/image snapshot files).

## In Progress / Incomplete

- No uncommitted resume studio work remains in the three branches.
- R137 (role label and duration hints now render outside the title input) is fixed and committed on all three branches.
- The requested resume studio redesign work is complete through R137.

## Next Steps

- None required: the three worktree redesigns are committed and validated.
- If the next agent resumes visual work, restart the three servers outside the sandbox:
  - `cd worktrees/resume-flowcv && ulimit -n 65536 && exec env PORT=3001 npx next dev --turbopack`
  - `cd worktrees/resume-resumecom && ulimit -n 65536 && exec env PORT=3002 npx next dev --turbopack`
  - `cd worktrees/resume-resumeio && ulimit -n 65536 && exec env PORT=3003 npx next dev --turbopack`
- Optional future polish can continue with R138+ using the established one-feature-per-round pattern.

## Dead Ends and Ruled-Out Approaches

- Clearing `.next` in the worktrees did not fix the all-404 state.
- Removing `output: "standalone"` from `next.config.ts` did not fix the all-404 state.
- The root cause was Watchpack `EMFILE` from the sandbox. Route discovery failed while the dev server ran inside the sandbox. Starting outside the sandbox with `ulimit -n 65536` fixed it.

## Do Not Touch

- Do not commit `worktrees/` into the parent repo. Each worktree has its own `.git`.
- Do not commit `node_modules` symlinks in the worktrees.
- Do not blindly run `next build` from the parent with the worktrees present: the parent build type-check phase includes `worktrees/**/*` and can fail on branch-specific store differences.

## Environment

- Node: 25.6.0
- Next.js: 15.5.15
- Dev ports: 3001 (FlowCV), 3002 (Resume.com), 3003 (Resume.io)
- `.env.local` is present in each worktree and ignored by git.

## Validation

- `GET /`, `GET /dashboard`, and `GET /dashboard/resume` returned `200` on all three worktree servers before shutdown.
- Typechecks on the three branches only show the pre-existing `src/tests/lib/csvUtility.test.ts` errors, unrelated to resume studio work.

## Agent Config Sync

- No project-level agent config files were modified in this session, so no sync was needed.

---

# Session Addendum — M2 + Resume Studio Polish (2026-08-06)

## Session Summary

Picked up the M2 minimalist editorial UI overhaul (`ad68d80`) and shipped the long-tail of small UX fixes the user requested in the dashboard. The work also repaired a broken `computeATSScore` that had been left half-finished in the store by a previous worker (missing closing brace and the `return 45 + (seed % 44);` line, with `PLACEHOLDER_RESUME_DATA` accidentally inserted inside the broken function).

## Git State (verified)

- Branch: `codex/login-redesign`
- HEAD: `38cac4c fix(resume): repair store, add delete + headshot + empty preview, compact UI`
- Working tree: clean after the commit. Only untracked items are the `worktrees/` directory (intentional, each worktree is its own git repo) and `.agents/.../` scratch artifacts from earlier remediation runs.
- Stashes: none from this session. The pre-existing `stash@{0}` from the prior session is still in place — do not pop.

## What Was Shipped

### 1. Store repair (`src/store/resumeStore.ts`)

- Reconstructed `computeATSScore` so the function actually closes and returns the deterministic mock score.
- Promoted the placeholder to a real module-scope export: `export const PLACEHOLDER_RESUME_DATA: ResumeData = MOCK_RESUMES[0].data;` (was previously wedged inside the broken function).
- Carried the section-management history guard from the M2 commit into the same file: `moveSection` only pushes a history snapshot on a real re-order, not on a no-op click at the boundary or with an invalid key.

### 2. Career Asset Studio — Delete button (`src/app/dashboard/resume/page.tsx`)

- Each resume card now has a Trash icon button next to the Edit / Preview actions.
- Tapping the trash opens a confirm dialog (`card-editorial` with the resume title quoted in monospace) before calling `deleteResume(id)`. The dialog respects `card-editorial` styling so it matches the rest of the asset studio, not the editor's `liquid-glass` look.
- `deleteResume` is wired through the existing store action, which also syncs to the backend via `deleteResumeAction` (already in place from earlier work).

### 3. Empty-preview placeholder (`src/app/dashboard/resume/[id]/page.tsx`)

- New module-scope `isResumeEmpty(data: ResumeData): boolean` helper: true when personal name, summary, and experience are all missing/empty.
- `effectiveData` swaps in `PLACEHOLDER_RESUME_DATA` whenever the resume is empty. Used by all three `<ResumePreview>` call sites (regular, ThemePicker modal, fullscreen) **and** the print-only `.print-resume` block so PDF export of an empty resume produces a real template, not a blank page.
- A subtle `· Sample preview` pill appears next to the Base/Tailored label when the placeholder is active, so the state is visible without being loud.

### 4. Template select compaction (`src/app/dashboard/resume/[id]/page.tsx`)

- `<select>` capped at `max-w-[200px]` (down from `max-w-xs` ≈ 320px), padding `px-3 py-2`, text `text-xs uppercase tracking-wider`, with a smaller leading `<Browser>` icon and `right-2.5` chevron. Reads as a compact control next to the section tabs.

### 5. Headshot upload for photo templates (`src/app/dashboard/resume/[id]/page.tsx`)

- Added a circular avatar preview + Upload button to the Identity tab.
- File input is gated to `image/*`, capped at 2 MB (toast on overflow), read as a data URL via `FileReader`, and stored on `data.personal.photo_url`.
- A Remove button clears the photo and saves history before the mutation. The existing `PremiumHeadshot` and `PhotoHeader` templates already read `data.personal?.photo_url`, so no template changes were needed.

## Tests

- `src/tests/stores/resumeStore.test.ts` was added in the same commit and covers the `moveSection` history guard: no-op on invalid key, no-op at boundary, real change pushes history and reorders, `toggleVisibility` flips a per-template flag.
- 4/4 store tests green. Full vitest run: 7 files, 27/27 tests green.

## Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — 27 routes, clean.
- `npx vitest run` — 7 files, 27/27 tests.
- `npx next lint` — 2 unrelated pre-existing warnings (one unused import in `NeedsTailoringWidget.tsx`, one untyped placeholder JSX in `BentoPreviews.tsx`). No new warnings from this commit.

## Outstanding / Known Limitations

- The `<img>` element used for the headshot preview is a data URL so `next/image` would not be able to optimize it; the warning is suppressed inline. If a future agent wants to switch to `next/image`, route the upload through a server action that returns a CDN URL.
- The empty-state preview uses `MOCK_RESUMES[0]` as the placeholder. If the user wants a different sample (e.g. blank with `Your Name` and `Your Title` placeholders), the constant can be swapped without touching call sites.
- The headshot upload stores a data URL directly in the resume state, which bloats `localStorage` for users on the persist middleware. The 2 MB cap keeps it bounded, but the long-term path is to upload to a CDN. The `deleteResumeAction` / `saveResumeAction` server actions would also need to be updated to handle binary photo data.
- The dev server inside the sandbox hits `EMFILE: too many open files` from Watchpack. Build, typecheck, and tests do not have that problem. To run a dev server locally, use `ulimit -n 65536` outside the sandbox.

## Environment

- Node: 25.6.0
- Next.js: 15.5.15
- Branch: `codex/login-redesign`
- HEAD: `38cac4c`

## Next Steps for the Resuming Agent

- None required: the user-requested polish pass is complete and committed.
- If a follow-up session wants to remove the `<img>` warning for the headshot preview, switch the upload to a server action that returns a URL (the existing `saveResumeAction` is the right place to host the new endpoint).
- The user previously asked for visual work to continue on `codex/login-redesign`. Any new feature requests can be branched off `38cac4c` and merged back into this branch.
