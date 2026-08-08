# OfferPath UI/UX Audit Report - codex/login-redesign (merged to main)

**Date:** 2026-08-07
**Scope:** Full frontend audit of the `codex/login-redesign` branch (now on `main`), evaluated against the frontend-studio Minimalist Editorial protocol, Hallmark anti-slop gate checks, and Vibe Code Guardian pre-ship checklist.
**Method:** Source code inspection + anti-pattern grep scans + build output analysis. No fixes applied.

---

## Executive Summary

The M2 "Minimalist Editorial" overhaul successfully established a cohesive design token system in `globals.css` and redesigned the core dashboard layout, sidebar, and primary pages. However, the overhaul is **incomplete**: multiple components and pages still carry legacy anti-patterns from the previous "Vanguard" design system, the mobile navigation uses an entirely different visual language, and several Hallmark anti-slop gates fail.

**Issue counts:** P0 (Critical) x7 | P1 (Major) x9 | P2 (Minor) x8 | P3 (Info) x5

---

## P0 - Critical Issues

### P0-1. Massive token discipline failure: 569 non-token color references

**Evidence:** `rg -n 'zinc-|gray-|slate-' src/ -g '*.tsx'` returns 569 hits across 15+ files. Worst offenders:
- `src/components/ui/ConfirmDialog.tsx` - entire component uses `zinc-*` and `dark:*` classes
- `src/components/resume/ThemePicker.tsx` - `zinc-200`, `zinc-900`, `zinc-500`, `dark:` variants
- `src/components/resume/ATSCheckerPanel.tsx` - same pattern
- `src/components/resume/RichTextEditor.tsx` - `zinc-200`, `dark:border-white/10`
- `src/components/layout/MobileNav.tsx` - `zinc-500`, `zinc-600`, `dark:text-gray-500`
- `src/app/dashboard/error.tsx` - `zinc-900`, `zinc-500`, `dark:text-white`

**Impact:** The design system defines `surface-*` and `brand-*` tokens specifically to prevent ad-hoc color usage. These 569 references bypass the token system entirely, creating visual inconsistency and making theme changes impossible without a full audit. The `dark:` variants are also dead code (see P0-3).

**Fix:** Global find-and-replace mapping: `zinc-900`/`gray-900` -> `surface-400`, `zinc-500`/`gray-500` -> `surface-300`, `zinc-200`/`gray-200` -> `surface-200`, etc. Remove all `dark:` variants.

### P0-2. 102 `rounded-full` instances violating minimalist protocol

**Evidence:** `rg -n 'rounded-full' src/ -g '*.tsx'` returns 102 hits. Key locations:
- `src/app/page.tsx` - nav bar container, feature badges, icon containers, CTA arrow buttons, testimonial avatars
- `src/components/landing/BentoPreviews.tsx` - 8+ instances (badges, dots, progress bars)
- `src/components/landing/AnnouncementBar.tsx` - badge and close button
- `src/components/dashboard/GuestBanner.tsx` - banner and close button
- `src/components/resume/ThemePicker.tsx` - range slider tracks
- `src/components/pipeline/JobDetail.tsx` - status indicator dots (acceptable for tiny dots)
- `src/app/loading.tsx` - spinner

**Impact:** The minimalist protocol explicitly bans `rounded-full` for "large containers, cards, or primary buttons." The landing page nav bar (`rounded-full` on a full-width container) and feature badges are the worst violations. Small status dots (1.5px) are acceptable.

**Fix:** Replace `rounded-full` with `rounded-md` or `rounded-lg` for containers, badges, and buttons. Keep `rounded-full` only for tiny indicator dots (w-1.5 h-1.5) and the loading spinner.

### P0-3. 509 dead `dark:` classes (dark mode is forced off)

**Evidence:**
- `globals.css`: `color-scheme: light !important` on `html`
- `src/components/layout/Topbar.tsx:24`: `document.documentElement.classList.remove("dark")` in useEffect
- `rg -n 'dark:' src/ -g '*.tsx'` returns 509 hits across ConfirmDialog, ThemePicker, ATSCheckerPanel, RichTextEditor, MobileNav, error.tsx, and more

**Impact:** 509 `dark:` class variants add ~15-20KB of dead CSS to the bundle. They create maintenance confusion (developers think dark mode is supported) and contradict the forced-light behavior. The `!important` on `color-scheme` is also a heavy-handed hack.

**Fix:** Strip all `dark:` classes. If dark mode is desired later, implement it properly with a theme toggle and token-level dark variants rather than per-class overrides.

### P0-4. MobileNav uses a completely different design language than Sidebar

**Evidence:** Compare `src/components/layout/Sidebar.tsx` (desktop) vs `src/components/layout/MobileNav.tsx` (mobile):
- Sidebar uses `surface-*` tokens; MobileNav uses `zinc-*` and `gray-*` tokens
- Sidebar active state: `bg-surface-400 text-surface-0` (solid charcoal); MobileNav: `bg-brand-500/10 text-brand-300` (semi-transparent)
- Sidebar nav items: `rounded-md`; MobileNav: `rounded-lg`
- MobileNav uses `border-white/[0.06]` and `border-white/[0.04]` for borders - semi-transparent white on a light background = virtually invisible
- MobileNav references `text-gradient-futuristic` class (line 79) which is **not defined** in `globals.css` - the "Path" text renders unstyled
- MobileNav uses `gradient-brand` for the avatar (line 154) - a gradient, violating the no-gradient rule

**Impact:** Mobile users see a visually inconsistent, lower-quality interface. Invisible borders make the drawer structure hard to perceive. The undefined `text-gradient-futuristic` class is a silent bug.

**Fix:** Rewrite MobileNav to mirror Sidebar's token usage, border styles, active states, and border-radius scale. Remove `text-gradient-futuristic` reference. Replace `border-white/[0.06]` with `border-surface-200`.

### P0-5. Blur filters in landing page animations

**Evidence:** `src/app/page.tsx`:
- Line 131: `hidden: { opacity: 0, y: 64, filter: "blur(8px)" }` (revealVariants)
- Line 135: `filter: "blur(0px)"` (visible state)
- Line 321-322: `initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}` / `animate={{ ... filter: "blur(0px)" }}`

**Impact:** The M2 overhaul explicitly removed blur from the `globals.css` `reveal-up` keyframe (changed from `filter: blur(8px)` to no blur), but the landing page's framer-motion variants still use it. Blur filters are GPU-expensive and were identified as an anti-pattern in the design brief. Also, `y: 64` is excessive (the toned-down animations use `translateY(12px)`).

**Fix:** Remove `filter: "blur(8px)"` and `filter: "blur(0px)"` from all framer-motion variants. Reduce `y: 64` to `y: 12` to match the globals.css animation scale.

### P0-6. Fabricated testimonials violate honest-copy rule

**Evidence:** `src/app/page.tsx:88-107` - three testimonials with fabricated names, roles, and quotes:
- "Sarah Chen, PM -> Meta"
- "Michael Park, Eng -> Stripe"
- "Aisha Patel, Designer -> Apple"

**Impact:** Hallmark gate 46 explicitly bans invented metrics and testimonials. These are clearly fake and undermine credibility, especially for a job-hunting tool where authenticity is the value proposition.

**Fix:** Remove testimonials entirely, or replace with real user quotes (even internal/beta testers) with explicit permission. If no real testimonials exist yet, replace the section with a different macrostructure (e.g., feature comparison or product screenshots).

### P0-7. `prefers-reduced-motion` ignored except in one component

**Evidence:** `rg -n 'prefers-reduced-motion|useReducedMotion' src/` returns hits only in `src/components/landing/PasteDemo.tsx` (line 29: `const reduce = useReducedMotion()`). All other animated components (Sidebar, Topbar, Dashboard, Pipeline, Landing page sections, etc.) use framer-motion animations without checking `useReducedMotion()`.

**Impact:** WCAG 2.1 AA (SC 2.3.3) requires respecting `prefers-reduced-motion`. Users with vestibular disorders or motion sensitivity get no accommodation across 90%+ of the app.

**Fix:** Add `useReducedMotion()` check to all components using framer-motion `initial`/`animate` props. When reduced, set `initial={false}` or provide static fallbacks.

---

## P1 - Major Issues

### P1-1. Italic headers on landing page (Hallmark gate 38a)

**Evidence:** `src/app/page.tsx`:
- Line 335: `<span className="font-display italic font-medium">dream offer.</span>`
- Line 365: `<span className="font-display italic font-medium">need to win.</span>`
- Line 397: `font-display text-xl md:text-2xl italic` (testimonials)
- Line 431: `<span className="font-display italic font-medium">your next role?</span>`

**Impact:** Hallmark gate 38a bans italic headers as a reliable AI tell. The Playfair Display italic is loaded specifically for these uses.

**Fix:** Replace italic emphasis with weight contrast, accent color, or a drawn underline. Keep italic only for body-copy emphasis.

### P1-2. Hardcoded hex colors in globals.css utility classes

**Evidence:** `src/app/globals.css`:
- `.btn-editorial-primary` hover: `hover:bg-[#2A2A2A]` (line ~91)
- `.btn-primary` hover: `hover:bg-[#2A2A2A]`
- `.btn-ember` hover: `hover:bg-[#9A330A]`
- `.tag-blue` through `.tag-ember`: hardcoded `#E1F3FE`, `#1F6C9F`, `#FDEBEC`, `#9F2F2D`, etc. instead of `var(--color-pastel-*)`
- `.gradient-brand`: `linear-gradient(135deg, #111111 0%, #2A2A2A 50%, #1A1A1A 100%)`

**Impact:** Violates Hallmark's "locked tokens" discipline (gate 48). The `--color-pastel-*` tokens exist but are bypassed. The `.gradient-brand` class uses a gradient (banned by minimalist protocol) and is referenced by 30+ components per the comment.

**Fix:** Replace hardcoded hex values with CSS variable references. For hover states, add `--color-surface-400-hover: #2A2A2A` to the token block. Replace `.gradient-brand` with a solid `bg-surface-400`.

### P1-3. Glassmorphism on landing page nav

**Evidence:** `src/app/page.tsx:288`:
```
className="mx-auto max-w-[90rem] grid ... bg-white/85 backdrop-blur-2xl border border-white/40 shadow-[0_10px_40px_-12px_rgba(15,23,42,0.12)] rounded-full ..."
```
Also line 353: `bg-surface-50/95 backdrop-blur-3xl` for mobile menu overlay.

**Impact:** The minimalist protocol allows "subtle navbar blurs" but `backdrop-blur-2xl` and `backdrop-blur-3xl` are heavy. The `bg-white/85` semi-transparency with `border-white/40` creates a glassmorphism effect. The custom shadow is also heavy.

**Fix:** Reduce to `backdrop-blur-md` (or remove). Use `bg-surface-0/90` instead of `bg-white/85`. Replace `border-white/40` with `border-surface-200`. Remove custom shadow or reduce to `shadow-sm`.

### P1-4. `console.log`/`console.error` in 10+ production files

**Evidence:**
- `src/store/resumeStore.ts` (3), `src/lib/aiService.ts` (3), `src/app/actions/resume.ts` (3)
- `src/store/pipelineStore.ts` (2), `src/lib/supabase-sync.ts` (2), `src/hooks/useSupabaseSync.ts` (2)
- `src/components/resume/ExportButtons.tsx` (2), `src/app/dashboard/pipeline/page.tsx` (2)
- `src/app/api/jobs/parse/route.ts` (2), `src/lib/supabase-migration.ts` (1)

**Impact:** Console output in production leaks internal state to anyone with devtools open. Vibe Code Guardian flags this as a code hygiene issue.

**Fix:** Remove all `console.log` statements. For `console.error`, wrap in a logging utility that can be disabled in production, or use a proper error tracking service (Sentry, etc.).

### P1-5. 1349-line client component (resume editor)

**Evidence:** `src/app/dashboard/resume/[id]/page.tsx` is 1349 lines - the largest file in the app. It's a `"use client"` component with 7 shadow instances, 4 blur instances, and 7 heavy shadow instances.

**Impact:** This single file is larger than the 500-line limit specified in AGENTS.md. It bundles all resume editor logic (toolbar, preview, template switching, theming, ATS checker, export) into one client component, increasing bundle size and making the code hard to maintain.

**Fix:** Split into sub-components: `ResumeEditorToolbar`, `ResumePreviewPane`, `ResumeTemplateSwitcher`, `ResumeThemePanel`, `ATSCheckerDrawer`, `ExportPanel`. Use dynamic imports for the preview and ATS checker.

### P1-6. Limited code splitting - only 3 dynamic imports

**Evidence:** Only 3 `dynamic()` imports in the entire app:
- `src/app/dashboard/layout.tsx`: AddJobDialog (ssr: false)
- `src/app/dashboard/resume/[id]/page.tsx`: RichTextEditor
- `src/app/dashboard/pipeline/analytics/page.tsx`: AnalyticsCharts

**Impact:** Heavy components like KanbanBoard (with @dnd-kit), JobDetail (445 lines), all resume templates, and the interview mock page are eagerly loaded. The build output shows `/dashboard/interview/[jobId]` at 41.4 kB and `/dashboard/resume/[id]` at 31 kB - these could be split.

**Fix:** Add `dynamic()` imports for KanbanBoard, JobDetail, resume templates, StoryDialog, and the mock interview page. Use `ssr: false` for interactive-only components.

### P1-7. No per-page metadata for SEO

**Evidence:** Only `src/app/layout.tsx` exports `metadata`. No other page exports `metadata` or `generateMetadata`. Build warning: `metadataBase property in metadata export is not set`.

**Impact:** All pages share the same title/description. Dynamic routes (`/dashboard/pipeline/[id]`, `/dashboard/resume/[id]`) have no unique metadata. OG/Twitter images won't resolve without `metadataBase`.

**Fix:** Add `metadata` exports to each page route. Set `metadataBase` in the root layout. Add `generateMetadata` for dynamic routes.

### P1-8. `<img>` tag used instead of `next/image` in resume editor

**Evidence:** `src/app/dashboard/resume/[id]/page.tsx:696`:
```tsx
<img src={data.personal.photo_url} alt="Headshot" className="w-full h-full object-cover" />
```

**Impact:** Bypasses Next.js image optimization (no lazy loading, no responsive sizes, no format conversion). For user-uploaded headshots, this means full-resolution images are served unoptimized.

**Fix:** Replace with `<Image>` from `next/image` with appropriate `width`/`height` or `fill` prop.

### P1-9. Error boundaries use non-token colors and expose error messages

**Evidence:** `src/app/dashboard/error.tsx` (and likely other error.tsx files):
- Uses `zinc-900`, `zinc-500`, `dark:text-white` (non-token, dead dark classes)
- Uses `gradient-brand` (gradient)
- Uses `rounded-xl` (inconsistent with the `rounded-md`/`rounded-lg` scale)
- Shows `error.message` directly to the user (potential info leak)
- Uses emoji "!" instead of a proper icon

**Fix:** Rewrite error boundaries with token-based classes, proper Phosphor icon, and generic error messages (log the detailed error server-side).

---

## P2 - Minor Issues

### P2-1. Legacy utility classes still in globals.css

**Evidence:** `globals.css` still defines `.doppel-shell`, `.doppel-core`, `.glass-card`, `.liquid-glass` - remnants of the old "Vanguard" design system. The comment says "Mappings to support existing component classnames" but these names are misleading (glass-card is not glassmorphism, it's a flat border).

**Fix:** Audit usage with `rg 'doppel-shell|doppel-core|glass-card|liquid-glass' src/`, replace with `card-editorial` or `card-clay`, and remove the legacy definitions.

### P2-2. `--color-brand-500` through `--color-brand-900` are all `#111111`

**Evidence:** `globals.css` lines 18-22: brand-500 through brand-900 are all `#111111`. This makes the brand scale meaningless - there's no gradient from light to dark.

**Fix:** Either collapse to a single `--color-brand` token, or define a proper scale (e.g., 500: `#333333`, 600: `#222222`, 700: `#111111`, etc.) if hover/active states need variation.

### P2-3. Emojis in mock discovery data

**Evidence:** `src/store/mockDiscoveryData.ts` lines 11-16: company logos use emojis (`🔍` Google, `🍎` Apple, `📦` Amazon, etc.) via `logo_emoji` field.

**Fix:** Replace with company logo images or Phosphor icons. The `logo_emoji` field should be phased out in favor of `logo_url`.

### P2-4. `Inter` font reference in mock resume data

**Evidence:** `src/lib/mockResumeData.ts:91`: `fontFamily: "Inter, sans-serif"`. The minimalist protocol bans Inter. However, this is for resume template rendering (not the app UI), so it may be intentional for ATS compatibility.

**Fix:** If ATS compatibility requires Inter, document this as an intentional exception. Otherwise, replace with the app's font stack.

### P2-5. Hardcoded hex colors in resume templates

**Evidence:** `src/components/resume/ThemePicker.tsx:23-32` (theme presets with hardcoded colors), `src/components/resume/templates/PremiumHeadshot.tsx` (multiple inline `style={{ color: '#fff' }}`, `'#a0a0b4'`, `'#c0c0cc'`, etc.).

**Impact:** Resume templates use inline styles with hardcoded colors, bypassing the token system. This is somewhat acceptable for resume templates (which need to be self-contained for PDF export) but should be documented.

### P2-6. Topbar profile shows hardcoded "Demo User"

**Evidence:** `src/components/layout/Topbar.tsx:84-87`: profile shows "DU" initials and "Demo User" text, not dynamic user data.

**Fix:** Wire to the profile store's `fullName` and compute initials dynamically.

### P2-7. Notifications button is non-functional

**Evidence:** `src/components/layout/Topbar.tsx:71-77`: bell icon button has no `onClick` handler, no dropdown, no badge count.

**Fix:** Either implement a notifications dropdown or remove the button until the feature is ready.

### P2-8. `useSupabaseSync` uses `as never` type assertions

**Evidence:** `src/hooks/useSupabaseSync.ts`: multiple `as never` casts when hydrating stores (lines ~58, ~72, ~85, ~95). This bypasses TypeScript's type safety for store hydration.

**Fix:** Define proper type-safe hydration interfaces instead of `as never` casts.

---

## P3 - Info / Nice-to-have

### P3-1. `Playfair Display` loaded with italic style

The root layout loads Playfair Display with `style: ["normal", "italic"]`. If italic headers are removed (P1-1), the italic style can be dropped, saving ~30KB of font data.

### P3-2. Toaster uses hardcoded colors

`src/app/layout.tsx`: Toaster `toastOptions` uses `"#111111"` and `"#EAEAEA"` instead of CSS variables. Minor, but inconsistent with the token system.

### P3-3. Landing page footer links are placeholders

Most footer links point to `#features` or `/register` - not real pages. This is acceptable for a pre-launch product but should be flagged.

### P3-4. `useUIStore` not persisted

`src/store/uiStore.ts` doesn't use `persist` middleware, so sidebar collapse state resets on page reload. Minor UX issue.

### P3-5. Unused `cn` import

`src/components/dashboard/NeedsTailoringWidget.tsx:6` imports `cn` but doesn't use it (ESLint warning during build).

---

## Build Output Analysis

The production build compiles cleanly (27 routes, TypeScript valid, 23/23 tests pass). Notable bundle sizes:

| Route | Size | First Load JS | Notes |
|-------|------|---------------|-------|
| `/` (landing) | 15.6 kB | 236 kB | Heaviest - framer-motion + blur animations |
| `/dashboard/interview/[jobId]` | 41.4 kB | 193 kB | Large - could benefit from code splitting |
| `/dashboard/pipeline` | 36.3 kB | 177 kB | @dnd-kit adds weight |
| `/dashboard/resume/[id]` | 31 kB | 235 kB | 1349-line component |
| `/dashboard/interview/stories` | 11.1 kB | 292 kB | High shared JS - investigate |
| `/dashboard/resume/new` | 10.4 kB | 303 kB | Highest First Load JS |

Shared JS: 102 kB (acceptable). Middleware: 88.9 kB (includes auth + Supabase).

---

## Anti-Pattern Scorecard

| Check | Status | Count |
|-------|--------|-------|
| `rounded-full` on containers/buttons | FAIL | 102 instances |
| Non-token colors (`zinc-`/`gray-`/`slate-`) | FAIL | 569 instances |
| Dead `dark:` classes | FAIL | 509 instances |
| Blur in animations | FAIL | 4 instances (landing page) |
| Italic headers | FAIL | 4 instances (landing page) |
| Fabricated testimonials | FAIL | 3 fake testimonials |
| `prefers-reduced-motion` | FAIL | Only 1/20+ components respect it |
| `console.log` in production | FAIL | 10+ files |
| Heavy shadows (`shadow-md`+) | WARN | 8+ files |
| `backdrop-blur` | WARN | 10+ files |
| Emojis in UI data | WARN | mockDiscoveryData.ts |
| `<img>` instead of `next/image` | WARN | 1 instance |
| Per-page metadata | WARN | Only root layout |
| Error boundary quality | WARN | Non-token colors, raw errors |
