# BRIEFING — 2026-08-05T21:27:00Z

## Mission
Remediate main app visual slop in owned files by removing blur-3xl, bg-gradient-to-br, shadow-2xl, and rounded-full badges, replacing them with crisp hairline borders, rectangular badges, eyebrow tags, and editorial buttons.

## 🔒 My Identity
- Archetype: implementer / qa / specialist
- Roles: implementer, qa, specialist
- Working directory: /Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/.agents/worker_remed_main_app_slop
- Original parent: 22e705fb-2929-4353-abfd-ca39e0e60a41
- Milestone: Remediation of main app visual slop

## 🔒 Key Constraints
- Owned files only:
  - `src/app/dashboard/resume/[id]/page.tsx`
  - `src/app/page.tsx`
  - `src/app/dashboard/interview/[jobId]/page.tsx`
  - `src/app/dashboard/discover/page.tsx`
  - `src/components/landing/BentoPreviews.tsx`
- Remove `blur-3xl`, `bg-gradient-to-br`, `shadow-2xl`, `rounded-full` pill badges
- Replace with `border-surface-200`, `rounded-md` / `rounded-sm`, `.eyebrow-tag`, `.btn-editorial-primary`
- Must pass `npx tsc --noEmit` and `npm test` (27/27 tests pass)

## Current Parent
- Conversation ID: 22e705fb-2929-4353-abfd-ca39e0e60a41
- Updated: 2026-08-05T21:27:00Z

## Task Summary
- **What to build**: Remediation of visual slop in 5 owned files in main app
- **Success criteria**: 0 tsc errors, 27/27 tests pass, no slop patterns in owned files
- **Code layout**: `/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath`

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Pending
- **Tests added/modified**: Pending

## Loaded Skills
- None
