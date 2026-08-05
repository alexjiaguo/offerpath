# Project: OfferPath Minimalist Editorial UI Overhaul

## Architecture
- **Core Stack**: Next.js 15 App Router, React 19, Tailwind CSS v4, Zustand 5, Vitest 4, TypeScript 5.8.
- **Multi-Workspace Topology**:
  - Main Application: `/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath`
  - Worktree 1 (FlowCV Studio): `worktrees/resume-flowcv`
  - Worktree 2 (Resume.com Studio & Cover Letters): `worktrees/resume-resumecom`
  - Worktree 3 (Resume.io Studio & Diagnostics): `worktrees/resume-resumeio`
- **Design System Architecture**:
  - Global `@theme` in `globals.css` replicated across main repo and all 3 worktrees.
  - Typography: `Plus Jakarta Sans` (Sans), `Playfair Display` (Display Serif), System Mono (`font-mono`).
  - Color Palette: Warm off-white canvas (`#FBFBFA`), crisp white cards (`#FFFFFF`), dark charcoal text (`#111111`), hairline borders (`#EAEAEA` / `#E2E8F0`), Ember Terracotta desaturated spot accenting (`#C2410C`).
  - Structural Borders: Hairline 1px borders (`border-surface-200`), 4px-12px radii scale (banning `rounded-full` container pills and `rounded-[2rem]` bloated cards). Zero floating island margins.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Baseline Test & Type Integrity | Fix `csvUtility.test.ts` missing `kanban_order: 0` property and `tsconfig.json` excludes across all repos | M1 | survey |
| 2 | Design Tokens & Global CSS Harmonization | Standardize `@theme`, typography scales, monochrome colors, and editorial utility classes across all 4 targets | M1 | survey |
| 3 | Core Navigation & Layout Overhaul | Replace double-bezel `doppel-shell` and floating rounded pills in `Sidebar.tsx`, `Topbar.tsx`, and `layout.tsx` with edge-aligned structural borders | M2 | survey |
| 4 | Dashboard Overview & Metrics Grid | Transform `src/app/dashboard/page.tsx` into a high data-density editorial layout with crisp metrics and Notion-inspired proportions | M2 | survey |
| 5 | Drag-and-Drop Pipeline Kanban Board | Refactor 8-column Kanban board (`src/components/pipeline/*`) into sleek editorial cards with high contrast status badges | M2 | survey |
| 6 | Multi-Tab Job Detail & AI Outreach Studio | Redesign Job Detail tabs, timeline activity log, ATS score preview, and AI Outreach Email generator | M2 | survey |
| 7 | Core Resume Studio Hub & Tools | Redesign resume asset listing, 9 template preview grid, Interview Prep, and STAR Story Studio | M2 | survey |
| 8 | FlowCV Studio Overhaul (`resume-flowcv`) | Redesign 6 FlowCV category gallery, Free Plan grid, FAQ accordion, pronoun/graduation hints, and AutoScaledPreview container | M3 | survey |
| 9 | Resume.com Studio & Cover Letters (`resume-resumecom`) | Redesign Cover Letter Studio (`/dashboard/resume/cover-letters`), Pre-built Resume Samples loader, and Save/Sync status pills | M4 | survey |
| 10 | Resume.io Studio & Diagnostics (`resume-resumeio`) | Redesign circular SVG `ScoreRing` gauge, template classification, bullet quality diagnostic engine, and skills auto-suggest | M5 | survey |
| 11 | Programmatic Build & Unit Test Verification | Verify `npm test` (23/23 passing) and `npx tsc --noEmit` (clean compilation) across main repo and all 3 worktrees | M6 | survey |
| 12 | Agent-as-Judge Minimalist Editorial UI Rubric Audit | Independent evaluation of visual typography, structural framing, data density, color discipline, and cross-workspace cohesion | M6 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Foundation — Type Integrity & Design Tokens | Fix test mocks, tsconfig, and unify `globals.css` design tokens across main repo + 3 worktrees | None | DONE |
| 2 | M2: Core Application UI Overhaul | Redesign main app layout, sidebar, topbar, dashboard, kanban, job detail, and resume tools | M1 | PLANNED |
| 3 | M3: FlowCV Resume Studio Overhaul | Redesign `worktrees/resume-flowcv` UI, categories, FAQ, hints, and preview container | M1 | PLANNED |
| 4 | M4: Resume.com Studio & Cover Letters | Redesign `worktrees/resume-resumecom` UI, Cover Letter Studio, samples loader, and status pills | M1 | PLANNED |
| 5 | M5: Resume.io Studio & ScoreRing Gauge | Redesign `worktrees/resume-resumeio` UI, circular `ScoreRing`, bullet quality engine, and skills auto-suggest | M1 | PLANNED |
| 6 | M6: QA & Minimalist Editorial Rubric Audit | Comprehensive build/test verification and independent Agent-as-Judge UI Rubric evaluation | M2, M3, M4, M5 | PLANNED |

## Interface Contracts
### Main App ↔ Resume Studio Worktrees
- Shared `@theme` design tokens in `src/app/globals.css` (and worktree equivalents).
- Shared navigation paths (`/dashboard`, `/dashboard/pipeline`, `/dashboard/resume`, `/dashboard/interview`, `/dashboard/stories`, `/dashboard/settings`).
- Standardized store interfaces (Zustand `useProfileStore`, `useResumeStore`, `usePipelineStore`).
- Uniform export formats (ATS-friendly PDF / JSON schema).

## Code Layout
- Core App: `src/app/`, `src/components/`, `src/lib/`, `src/stores/`, `src/tests/`
- Worktree 1: `worktrees/resume-flowcv/src/`
- Worktree 2: `worktrees/resume-resumecom/src/`
- Worktree 3: `worktrees/resume-resumeio/src/`
