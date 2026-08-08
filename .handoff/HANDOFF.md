# Handoff: OfferPath Resume Editor

**Date:** 2026-08-08
**Agent:** Antigravity
**Branch:** main
**Latest commit:** 51c9c59 "fix(resume): solve edit panel button overflow and add per-section rich text toggles"
**Remote:** https://github.com/alexjiaguo/offerpath.git

## Session Summary

Two-part goal completed:

### 1. Rich Text Feature Fix

The rich text editor was hardwired to only edit `data.summary`. Switching to "Rich Text" mode showed a single editor and hid all other sections. Now fixed:

- Section tabs are always visible in both Form and Rich Text modes
- **Summary**: Full `RichTextEditor` (TipTap) with headings, lists, colors, highlights, blockquotes
- **Experience bullets**: Compact `RichTextField` per bullet (bold, italic, underline, strikethrough, lists, highlight)
- **Project descriptions**: Same compact `RichTextField`
- Structured sections (skills, languages, certs, education, identity) keep form inputs
- `sanitizeHtml` updated to allow `a`, `p`, `s` tags and `href`/`target`/`rel` attributes
- Form mode strips HTML for display; Rich Text mode stores HTML; mode switching is safe

### 2. Resume-Pro Quality Parity

All 9 templates standardized to match resume-pro's design system:

- **Bullet indicators**: `listStyleType: 'disc'` in 8 templates, `'circle'` in ElegantTwoColumn (Tailwind v4 preflight was stripping list-style)
- **Experience header**: Title-first two-line format across all 9 templates (title bold + dates on line 1, **Company** bold accent + em-dash on line 2)
- **Typography**: 10px font, 1.3 line-height, 36px padding, 28px header, 12px section title (matching resume-pro's golden presets)
- **Education**: School always bold, degree never bold, per-template single-line (single-column) vs two-line (two-column)
- **Contact lines**: Emoji removed from all templates, plain text format
- **Bullet spacing**: 4px consistent across all templates (was 1px, 2px, 2.5px, 5px in various templates)

### 3. New Quality Features

- **Content validation** (`src/lib/resumeValidation.ts`): banned words, metric grounding, skill count limits, first-person pronoun detection
- **Validation panel** (`src/components/resume/ValidationPanel.tsx`): shows issues in editor toolbar with expandable details
- **Page fit indicator** (`src/components/resume/PageFitIndicator.tsx`): measures resume against A4, shows fill percentage with 96%-105% gate
- **ATS plaintext layer** (`src/lib/atsTextLayer.ts`): generates linear plaintext, injected as near-invisible layer in print-only preview for ATS parser compatibility

## New Files Created

| File | Purpose |
|------|---------|
| `src/components/resume/RichTextField.tsx` | Compact TipTap editor for individual fields (bullets, descriptions) |
| `src/components/resume/ValidationPanel.tsx` | Shows content validation issues in editor toolbar |
| `src/components/resume/PageFitIndicator.tsx` | Shows A4 fill percentage (96%-105% gate) |
| `src/lib/resumeValidation.ts` | Banned words, metric grounding, skill count, first-person checks |
| `src/lib/atsTextLayer.ts` | Generates linear plaintext for ATS PDF compatibility |

## Key Files Modified

| File | Changes |
|------|---------|
| `src/app/dashboard/resume/[id]/page.tsx` | Section tabs always shown, editorMode passed to editors, removed unused RichTextEditor dynamic import, added ValidationPanel + PageFitIndicator + ATS layer |
| `src/components/resume/ResumeSectionEditors.tsx` | Added editorMode prop, conditional rich text rendering for summary/bullets/descriptions, dynamic imports for RichTextEditor + RichTextField |
| `src/components/resume/templates/shared.ts` | sanitizeHtml allows more tags (a, p, s) + attributes (href, target, rel); paperStyle defaults updated (10px font, 1.3 line-height, 36px padding) |
| `src/store/resumeStore.ts` | DEFAULT_THEME values updated (baseFontSize: 10, lineHeight: 1.3, pagePadding: 36, headerFontSize: 28, sectionTitleSize: 12) |
| `src/app/dashboard/resume/new/page.tsx` | Theme values updated to match new defaults |
| All 9 template files | Bullet indicators, title-first experience headers, education formatting, emoji removal, bullet spacing, font size updates |

## Git State (Verified)

- **Branch:** main
- **Uncommitted changes:** 151 files changed (modified + untracked)
- **Stashes:** 1 (`stash@{0}: On main: main branch uncommitted changes (favicon.svg, logo-mark.svg deletion)`)
- **Cannot commit:** `.git` is read-only in sandbox environment
- **Untracked new files:** RichTextField.tsx, ValidationPanel.tsx, PageFitIndicator.tsx, resumeValidation.ts, atsTextLayer.ts (plus many other untracked files from previous sessions)

## Build & Test

- **Build:** `rm -rf .next && npm run build` - PASS (27 routes, 0 errors)
- **Tests:** `npm test` - 27/27 PASS
- **Server:** `cd .next/standalone && PORT=<port> HOSTNAME=localhost node server.js`

### Critical: Dev server does NOT work

`next dev` fails due to stuck node processes exhausting macOS FSEvents limit. Always use production build:

```bash
rm -rf .next && npm run build
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cd .next/standalone && PORT=3022 HOSTNAME=localhost node server.js
```

## Dead Ends & Ruled-Out Approaches

1. **`next dev` (Turbopack) does not work** - macOS FSEvents limit exhausted by stuck node processes. Use production build + standalone server instead.
2. **`.git` is read-only in sandbox** - Cannot commit, stash, or `git worktree prune`. All changes remain uncommitted.
3. **Python string matching with JSX backticks** - Python's `in` operator can silently fail when matching strings containing backtick template literals. Use line-by-line replacement by index instead of `content.replace()`.
4. **`grep` with emoji patterns** - Some emoji characters don't match reliably with grep. Use `grep -F` (fixed string) or Python instead.
5. **`ps` command not permitted** in sandbox - Use `lsof` or `pkill` instead to find/kill processes.
6. **Previous worktrees were discarded** - The user explicitly said worktree changes (resume-flowcv, resume-resumecom, resume-resumeio) are discardable. The `worktrees/` directory was removed.

## Decisions Made

1. **Rich text stores HTML; form mode stores plain text** - When switching from rich text to form mode, HTML is stripped for display. This means formatting is lost if edited in form mode after rich text. This is acceptable: form mode is for quick edits, rich text is for formatted content.
2. **Bullet `listStyleType: 'disc'`** - Used `disc` for 8 templates and kept `circle` for ElegantTwoColumn (which already had it). `disc` is the standard, ATS-friendly choice.
3. **Typography defaults match resume-pro's golden presets** - 10px base font (was 11px), 1.3 line-height (was 1.4), 36px padding (was 30px). This produces denser, more professional layouts.
4. **ATS layer uses near-invisible styling** - `fontSize: 1px`, `color: white`, `opacity: 0.01`, `zIndex: -1`. This may not work perfectly with all browser print-to-PDF implementations. resume-pro uses Puppeteer which reliably preserves hidden text.
5. **Experience header: title leads, company follows** - Matches resume-pro's v4.0/v5.0/v7.0 format. Previously, 3 templates had company-first, 3 had title-first with italic company, 3 used single-line.
6. **Education: degree never bold** - Matches resume-pro's hard rule. University is always bold, degree is italic (single-line) or normal weight (two-line).

## Environment Changes

- `package.json` dev script changed from `next dev --turbopack` to `next dev` (from previous session)
- No new dependencies installed
- No migrations run
- No env vars set

## Known Issues & Risks

1. **151 uncommitted files** - All work is uncommitted. If someone runs `git checkout .` or `git reset --hard`, all changes will be lost. Commit as soon as possible.
2. **Multiple node servers on ports 3014-3021** - Servers were started during development. `pkill -f "node server.js"` was run but may not have killed all processes. Check with `lsof -i :3014-3021`.
3. **ATS layer untested with actual ATS parsers** - The near-invisible text layer is injected but hasn't been verified with real ATS parsing tools (pdf-parse, pdftotext).
4. **`companyFontSize || 11` fallbacks remain** - Some templates still have `companyFontSize || 11` (not updated to 10). This is intentional: company font size is 11px in resume-pro's presets, separate from base font size (10px).
5. **`.agents/` directory has many untracked agent artifacts** - These are from previous sessions and should not be touched.

## Do-Not-Touch Zones

1. **Template hex colors** - Hardcoded hex colors in templates are intentional for PDF export. Do not tokenize or replace with CSS variables.
2. **`.agents/` directory** - Contains agent artifacts from previous sessions. Leave as-is.
3. **`.git`** - Read-only in sandbox. Do not attempt git operations that require write access.
4. **`worktrees/` directory** - Was removed per user request. Do not recreate.
5. **`AGENTS.md` and `CLAUDE.md`** - Not modified during this session. Already contain project-specific instructions.

## Next Steps

1. **Commit all changes** - 151 files are uncommitted. Commit with a descriptive message covering the rich text fix and template quality improvements.
2. **Test rich text editing end-to-end** - Verify that formatting (bold, italic, lists) persists through to the rendered resume preview and PDF export.
3. **Test ATS layer with real PDF** - Export a PDF and verify the ATS plaintext layer is extractable with `pdftotext` or `pdf-parse`.
4. **Test page fit indicator** - Verify the fill percentage updates correctly as content is added/removed.
5. **Consider CSS variable contract** - The remaining gap vs resume-pro is the interactive control panel with CSS variables for live font size/spacing adjustment. This would require refactoring templates from inline styles to CSS classes.
6. **Consider full content validation suite** - resume-pro has additional checks (experience grounding, ATS cross-section) that could be added to `resumeValidation.ts`.

## Resume-Pro Skill Reference

The resume-pro skill is at `/Volumes/Download/ai-skills-hub/resume-pro/`. Key files:
- `SKILL.md` - Comprehensive spec (50KB)
- `writing-style.md` - Writing standards, banned words, bullet format
- `layout-presets.json` - Golden CSS presets per template
- `renderer.py` - Template rendering logic (87KB)
- `style_rules.py` - Banned words, validation regexes

## Skills Hub

- AI Skills Hub: `/Volumes/Download/ai-skills-hub/`
- Skills are synced to `~/.codex/skills/` via `bash /Volumes/Download/ai-skills-hub/sync_skills.sh ~/.codex/skills`
- No new skills were installed during this session
