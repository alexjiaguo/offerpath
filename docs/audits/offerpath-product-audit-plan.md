# OfferPath Product Audit Plan

## Context

User asked for full project audit against product requirements: missing features, broken buttons, bad jump links, architecture issues, instability, and latency. Exploration shows OfferPath promises an end-to-end job hunt OS: auth, dashboard, job pipeline, resume studio/import/export/ATS/tailoring, discovery, interview prep, stories, mock interviews, offer comparison, billing, and API keys.

Initial read shows app is mostly client-side prototype: Zustand stores, mock auth, mock AI, Supabase schema not wired to runtime, no tests found, and several likely broken user flows. Goal is produce prioritized audit findings with evidence and remediation roadmap before any code changes.

## Recommended Approach

Run audit in five passes:

1. **Static product traceability** — map product claims to routes, files, data stores, and backend support.
2. **Broken UX/link audit** — inspect buttons, links, query params, dynamic routes, placeholder actions.
3. **Runtime browser audit** — start app, click critical flows, capture console/network/CSP errors and latency issues.
4. **Architecture/security/performance audit** — review auth, data ownership, API boundaries, CSP, localStorage, heavy client bundles, large files.
5. **Findings report** — rank issues by severity and group remediation into release blockers, core workflow fixes, production architecture, and performance/UX polish.

## Critical Files and Routes to Audit

### Product and config

- [package.json](package.json) — scripts/dependencies; currently no `test`, `typecheck`, or coverage scripts.
- [next.config.ts](next.config.ts) — security headers/CSP; current `unsafe-inline`, `unsafe-eval`, `connect-src 'self'`, CDN PDF worker mismatch.
- [src/lib/navConfig.ts](src/lib/navConfig.ts) — route/nav source.
- [supabase/schema.sql](supabase/schema.sql) — intended backend schema/RLS, not yet verified as wired.

### Auth and dashboard shell

- [src/app/(auth)/login/page.tsx](src/app/(auth)/login/page.tsx) — mock login routes to dashboard.
- [src/app/(auth)/register/page.tsx](src/app/(auth)/register/page.tsx) — mock registration.
- [src/app/dashboard/layout.tsx](src/app/dashboard/layout.tsx) — no auth guard found in initial read.
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx#L108-L114) — `Add New Job` links to missing `/dashboard/pipeline/add`.
- [src/components/layout/Topbar.tsx](src/components/layout/Topbar.tsx) — global search/add/notification/profile actions.
- [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx) and [src/components/layout/MobileNav.tsx](src/components/layout/MobileNav.tsx) — nav, active states, mobile UX.

### Pipeline

- [src/app/dashboard/pipeline/page.tsx](src/app/dashboard/pipeline/page.tsx) — query params likely ignored; `BsFilter` text leak at lines 76-92.
- [src/components/pipeline/AddJobDialog.tsx](src/components/pipeline/AddJobDialog.tsx) — URL/JD add flow and mock evaluation.
- [src/components/pipeline/KanbanBoard.tsx](src/components/pipeline/KanbanBoard.tsx) — drag/drop, applied resume gate, reorder behavior.
- [src/components/pipeline/JobDetail.tsx](src/components/pipeline/JobDetail.tsx) — status changes, resume/interview links, placeholder AI evaluation.
- [src/components/pipeline/ResumePicker.tsx](src/components/pipeline/ResumePicker.tsx) — applying with/without linked resume.
- [src/store/pipelineStore.ts](src/store/pipelineStore.ts) — status transitions, persistence, stats, referential integrity.

### Discovery

- [src/app/dashboard/discover/page.tsx](src/app/dashboard/discover/page.tsx) — scan/filter/save/company flows; likely icon text leak.
- [src/app/dashboard/discover/[id]/page.tsx](src/app/dashboard/discover/[id]/page.tsx#L140-L145) — Add to Pipeline sends query params likely not consumed.
- [src/app/dashboard/discover/[id]/page.tsx](src/app/dashboard/discover/[id]/page.tsx) — verify tailor links, external links, related jobs.
- [src/store/discoveryStore.ts](src/store/discoveryStore.ts) and [src/store/mockDiscoveryData.ts](src/store/mockDiscoveryData.ts) — mock scan/job data.

### Resume Studio

- [src/app/dashboard/resume/page.tsx](src/app/dashboard/resume/page.tsx#L57-L73) — `tailorFor` only resolves pipeline jobs, so discovery IDs likely fail.
- [src/app/dashboard/resume/new/page.tsx](src/app/dashboard/resume/new/page.tsx) — import/create UX.
- [src/app/dashboard/resume/[id]/page.tsx](src/app/dashboard/resume/[id]/page.tsx) — large editor, save/undo/export/AI/ATS/template flows.
- [src/components/resume/RichTextEditor.tsx](src/components/resume/RichTextEditor.tsx) — TipTap content sync; verify non-summary edits persist.
- [src/components/resume/ResumePreview.tsx](src/components/resume/ResumePreview.tsx) — templates and sanitized rich HTML render paths.
- [src/components/resume/ExportButtons.tsx](src/components/resume/ExportButtons.tsx) and [src/lib/exportDocx.ts](src/lib/exportDocx.ts) — PDF/DOCX fidelity.
- [src/lib/FileParserService.ts](src/lib/FileParserService.ts#L36-L40) — PDF.js CDN worker conflicts with CSP; DOC/DOCX parsing.
- [src/lib/ResumeParserService.ts](src/lib/ResumeParserService.ts) — heuristic parsing accuracy.
- [src/store/resumeStore.ts](src/store/resumeStore.ts) — CRUD, undo/redo, tailoring, ATS cache.

### Interview, settings, production claims

- [src/app/dashboard/interview/page.tsx](src/app/dashboard/interview/page.tsx), [src/app/dashboard/interview/[jobId]/page.tsx](src/app/dashboard/interview/%5BjobId%5D/page.tsx), [src/app/dashboard/interview/[jobId]/mock/page.tsx](src/app/dashboard/interview/%5BjobId%5D/mock/page.tsx), [src/app/dashboard/interview/stories/page.tsx](src/app/dashboard/interview/stories/page.tsx) — prep/story/mock flows.
- [src/store/interviewStore.ts](src/store/interviewStore.ts) — prep/session/story persistence and invalid job handling.
- [src/app/dashboard/settings/page.tsx](src/app/dashboard/settings/page.tsx), [src/app/dashboard/settings/billing/page.tsx](src/app/dashboard/settings/billing/page.tsx), [src/app/dashboard/settings/api-keys/page.tsx](src/app/dashboard/settings/api-keys/page.tsx) — mock vs production claims, secrets, billing.
- [src/store/profileStore.ts](src/store/profileStore.ts) — profile/API/billing state.
- [src/lib/aiService.ts](src/lib/aiService.ts) — mock AI behavior and sanitized output paths.

## Audit Execution Steps

### 1. Static inventory

Run read-only searches for:

- missing routes and query params: `/dashboard/pipeline/add`, `addJob=`, `tailorFor`, `view=`
- placeholders: `TODO`, `FIXME`, `mock`, `coming soon`, `alert(`
- security surfaces: raw HTML render APIs, `DOMPurify`, `sanitize`, `localStorage`, `process.env`
- browser/CSP risks: `pdfjs`, `workerSrc`, `cdnjs`, `unsafe-inline`, `unsafe-eval`
- visible icon-name leaks: `BsFilter`, `BsUpload`, `BsBullseye`
- API/backend wiring: `route.ts`, `supabase`, `createClient`, `fetch(`

### 2. Build/tooling checks

Run:

- `npm run lint`
- `npm run build`
- `npx tsc --noEmit` if acceptable as audit command

Record command output as evidence. Do not fix during audit unless user separately approves remediation.

### 3. Browser smoke routes

Start dev server with `npm run dev`, then test:

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/dashboard/pipeline`
- `/dashboard/pipeline/add`
- `/dashboard/pipeline/analytics`
- `/dashboard/pipeline/compare`
- `/dashboard/discover`
- `/dashboard/discover/[known-id]`
- `/dashboard/resume`
- `/dashboard/resume/new`
- `/dashboard/resume/[known-id]`
- `/dashboard/interview`
- `/dashboard/interview/[known-job-id]`
- `/dashboard/interview/[known-job-id]/mock`
- `/dashboard/interview/stories`
- `/dashboard/settings`
- `/dashboard/settings/billing`
- `/dashboard/settings/api-keys`

For each route capture: render status, console errors, network errors, CSP violations, mobile layout, and obvious broken CTAs.

### 4. Critical workflow tests

Validate core product flows end-to-end:

1. Register/login mock path and direct dashboard access without auth.
2. Dashboard CTAs, especially Add New Job.
3. Add job from URL and pasted JD.
4. Filter/sort/search pipeline.
5. Drag job across statuses; verify applied resume picker and timestamps.
6. Open job detail; test status, resume, interview, delete, evaluate actions.
7. Discovery scan/save/dismiss/detail/add-to-pipeline.
8. Discovery detail to resume tailoring; verify ID mismatch.
9. Create resume from scratch; edit/save/reload.
10. Import PDF/DOCX/TXT/MD; test invalid and oversized files.
11. Rich text edits; verify which fields persist.
12. ATS checker, AI tailoring, export PDF/DOCX.
13. Interview prep/story bank/mock interview flows.
14. Offer comparison with zero/one/multiple offered jobs.
15. Settings/billing/API key claims and persistence.

### 5. Performance and stability probes

Use browser DevTools/Lighthouse/performance trace for:

- `/dashboard/resume/[id]` — TipTap, live preview, localStorage writes, export.
- `/dashboard/discover` — large page, mock data, filters/modals.
- `/dashboard/pipeline` — dnd-kit rerenders and drag stability.
- `/dashboard/pipeline/analytics` — dynamic Recharts.
- `/` — Framer Motion/icons/marketing bundle.

Check slow network/mobile viewport and hard reload persistence. Note heavy client-only modules and routes with large JS or jank.

## Findings Severity Model

- **Critical** — core product blocked, severe privacy/security risk, app cannot build.
- **High** — primary workflow broken or UI claims production capability without backing.
- **Medium** — important workflow degraded, confusing UX, invalid route, maintainability risk.
- **Low** — polish/accessibility/copy/layout issue.
- **Info** — future improvement or architectural recommendation.

Each finding will include:

- ID (`OP-001` etc.)
- severity
- product area
- route/file references
- user impact
- reproduction steps
- expected vs actual
- evidence
- likely root cause
- recommended fix direction
- verification step
- fix effort
- release-blocker yes/no

## Expected Deliverable

Return concise audit report in chat, organized as:

1. Executive summary
2. Product coverage scorecard
3. Release blockers
4. High-priority broken workflows
5. Missing production features
6. Security/privacy risks
7. Performance/stability risks
8. UX/accessibility issues
9. Architecture/maintainability issues
10. Testing/CI gaps
11. Prioritized remediation roadmap

No code changes during audit unless user approves follow-up fixes.

## Verification

Audit complete when:

- All listed routes checked statically and in browser.
- Build/lint results recorded.
- Console/network/CSP issues captured.
- Critical workflows tested from UI, not only code read.
- Findings include evidence and severity.
- Remediation roadmap separates quick fixes from architecture work.

## Permission Notes

Later execution needs permission for commands that generate `.next` or run local server: `npm run build`, `npm run dev`, browser automation, and optional `npx tsc --noEmit`. No commits or file edits are part of audit execution.
