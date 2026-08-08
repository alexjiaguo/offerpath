# Original User Request

## Initial Request — 2026-08-05T03:57:53Z

Conduct a comprehensive frontend UI/UX audit and design aesthetic overhaul across the entire OfferPath project—including the primary repository and all three resume studio worktrees (`resume-flowcv`, `resume-resumecom`, and `resume-resumeio`). Transform all features from basic/poor UI into distinctive, premium, production-grade frontend interfaces adopting a **Minimalist Editorial** design language based on frontend-studio anti-slop principles.

Working directory: /Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath
Integrity mode: development

## Requirements

### R1. Comprehensive UI Audit & Minimalist Editorial Redesign
Conduct a systematic frontend UI/UX audit across the core OfferPath web application and all three resume studio worktrees (`resume-flowcv`, `resume-resumecom`, and `resume-resumeio`). Replace existing poor, inconsistent, or unrefined interface elements with a cohesive **Minimalist Editorial** design language characterized by high data density, crisp structural borders, Notion-inspired typography and spacing, and a clean monochrome aesthetic with purposeful, high-contrast accenting.

### R2. Core Application & Workspace UI Refoundation
Refactor visual layouts, navigation components, dashboard grids, and interactive form controls across all four targets (main repository and three worktrees). Ensure that each resume studio variant maintains its dedicated direct-action workflow while achieving exceptional visual clarity, typographic hierarchy, and premium tactile feedback.

### R3. Quality Assurance & Independent Rubric Verification
Maintain rigorous build integrity and unit test compliance across all repositories, while subjecting all redesigned interfaces to an independent evaluation against a strict anti-slop UI design rubric.

---

## Verification Resources
- Existing unit test suite across all repositories: `npm test` (`vitest run`).
- TypeScript compiler type checking across all repositories: `npx tsc --noEmit`.
- Local development servers on ports 3000 (main), 3001 (`resume-flowcv`), 3002 (`resume-resumecom`), and 3003 (`resume-resumeio`) for interactive visual verification.

---

## Acceptance Criteria

### Programmatic Build & Test Integrity
- [ ] In the main repository (`/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath`), running `npm test` and `npx tsc --noEmit` completes cleanly without introducing regressions.
- [ ] In all three worktrees (`worktrees/resume-flowcv`, `worktrees/resume-resumecom`, and `worktrees/resume-resumeio`), running `npm test` and `npx tsc --noEmit` exits cleanly with all unit tests passing.

### Agent-as-Judge Minimalist Editorial UI Rubric (Independent Evaluation)
- [ ] **Typography & Structural Framing**: All pages demonstrate strict typographic hierarchy and crisp, structural border styling rather than generic AI gradients, muddy drop-shadows, or soft rounded slop cards.
- [ ] **Data Density & Editorial Layouts**: Views are optimized for professional data density (Notion-like proportions and alignment), ensuring tools, controls, and resume sections are accessible above the fold without extraneous promotional copy or empty padding.
- [ ] **Anti-AI-Slop & Color Discipline**: UI styling adheres strictly to curated monochrome palettes with refined, high-contrast states and subtle micro-interactions, avoiding uncurated out-of-the-box utility classes or inconsistent spacing scales.
- [ ] **Cross-Workspace Visual Cohesion**: The main dashboard and the three specialized studio worktrees feel like an integrated, high-end product family sharing unified design system tokens, typography scales, and structural layouts.
