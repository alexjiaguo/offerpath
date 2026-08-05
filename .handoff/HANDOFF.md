# OfferPath Resume Studio Handoff

## Session Summary

This session covered the OfferPath resume studio redesign work across three separate worktrees. Each worktree is an independent git repo on its own branch and implements a redesign inspired by one of the reference resume builders:

- `worktrees/resume-flowcv` -> `codex/resume-studio-flowcv` -> FlowCV-inspired redesign
- `worktrees/resume-resumecom` -> `codex/resume-studio-resumecom` -> Resume.com-inspired redesign
- `worktrees/resume-resumeio` -> `codex/resume-studio-resumeio` -> Resume.io-inspired redesign

All three branches contain the full R1-R118 polish history. The most recent shared work is R102-R118: section drag-and-drop, per-bullet quality dots, education GPA/date checks, per-experience role/duration/quality labels, keyboard undo/redo, per-section visibility toggles, per-bullet warnings, per-skill badge counts/duplicates, and phone validation.

Dev servers were started and verified on ports 3001/3002/3003, then stopped for the handoff. The parent repo also picked up pre-existing snapshot artifacts from a prior resume-pro task; those were committed separately.

## Git State

### Parent repo

- Branch: `codex/login-redesign`
- HEAD: `3b03992` (`chore(snapshots): add snapshot build artifacts and R8 script`)
- Untracked: `worktrees/` only. This is intentional: the worktrees are separate git repos and must not be committed into the parent.

### Worktrees

| Worktree | Branch | HEAD | Status |
|---|---|---|---|
| `worktrees/resume-flowcv` | `codex/resume-studio-flowcv` | `7173bb9` | Clean |
| `worktrees/resume-resumecom` | `codex/resume-studio-resumecom` | `dcd36bf` | Clean (untracked `node_modules` symlink only) |
| `worktrees/resume-resumeio` | `codex/resume-studio-resumeio` | `7f4bf1d` | Clean (untracked `node_modules` symlink only) |

No stashes exist in the parent or worktrees.

## What Was Done

- Verified all three worktree branches are committed through R118.
- Confirmed all three worktree dev servers return `200` for `/`, `/dashboard`, and `/dashboard/resume`.
- Fixed the earlier all-404 issue by starting the dev servers outside the sandbox with `ulimit -n 65536`.
- Stopped all dev servers before writing this handoff.
- Committed the parent snapshot artifacts (`scripts/snap-r8.cjs` and CJK font/image snapshot files).

## In Progress / Incomplete

- No uncommitted resume studio work remains in the three branches.
- R119 (per-bullet personal-pronoun warning for `I`/`My`/`Me`) was planned but not implemented. The branch heads are all at R118.

## Next Steps

1. If resuming visual work, restart the three servers outside the sandbox:
   - `cd worktrees/resume-flowcv && ulimit -n 65536 && exec env PORT=3001 npx next dev --turbopack`
   - `cd worktrees/resume-resumecom && ulimit -n 65536 && exec env PORT=3002 npx next dev --turbopack`
   - `cd worktrees/resume-resumeio && ulimit -n 65536 && exec env PORT=3003 npx next dev --turbopack`
2. Continue R119+ polish in all three branches using the established one-feature-per-round pattern.
3. Typecheck each affected worktree with `npx tsc --noEmit -p worktrees/<name>/tsconfig.json` before committing.

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
