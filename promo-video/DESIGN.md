# Design System — OfferPath

## Overview

OfferPath is the "career operating system" for serious job seekers — a structured, AI-augmented workspace that turns the mess of a job search into a measurable pipeline. The visual identity is **Soft Structuralism / Editorial Luxury**: a warm cream canvas, deep espresso text, and the deliberate pairing of a humanist serif (Playfair Display) with a clean neo-grotesque sans (Plus Jakarta Sans). The interface is dense but breathable — rounded "double-bezel" cards, generous tracking on labels, and pastel accent chips for status.

## Colors

- **Cream (Primary Surface)**: `#FDFBF7` — the entire product background
- **Soft Beige (Secondary Surface)**: `#F5F3ED` — section bands, inner card backgrounds
- **Border Whisper**: `#E6E4DD` — 1px card and section dividers
- **Espresso (Primary Text)**: `#1C1B1A` — body copy, headings, primary buttons
- **Mid Slate (Secondary Text)**: `#64748B` — metadata, captions, helper text
- **Match Green (Success)**: `#10B981` — match-score chips, positive deltas
- **Match Blue (Info)**: `#3B82F6` — saved leads, secondary accents
- **Match Amber (Warning)**: `#F59E0B` — "needs prep" markers
- **Ink Black (Deep)**: `#020617` — primary buttons, dark accents

## Typography

- **Display Serif**: Playfair Display (400, 500, 600; italic). Module headings ("Dashboard", "Job Discovery", "Career Asset Studio"), brand wordmark, hero statements.
- **Body Sans**: Plus Jakarta Sans (400, 500, 600, 700). All body copy, nav labels, table data, button text.
- **Hierarchy**: hero 80-120px / module 56-72px / subhead 24-32px / body 18-22px / data 14-18px / eyebrow 10-12px (uppercase, 0.2em tracking).

## Elevation

- **Borders over shadows**: cards are defined by 1px `#E6E4DD` borders on cream surfaces, not drop shadows. The "double-bezel" pattern wraps a card in a slightly darker shell then an inset core.
- **Subtle ambient shadow**: `0 20px 40px -15px rgba(0,0,0,0.03)` is the only depth — soft, almost imperceptible.
- **Inset highlights**: `inset 0 1px 1px rgba(255,255,255,1)` on card cores for a paper-on-paper feel.
- **Generous radius**: 16px on module cards, 9999px (pill) on buttons and chips.

## Components

- **Double-Bezel Card (Doppel-Shell)**: outer wrapper in `bg-black/5` with `rounded-[2rem] p-2 ring-1 ring-black/5`; inner core in cream with `rounded-[calc(2rem-0.5rem)]` and inset highlight.
- **Pipeline Card (Job Card)**: white card with 1px border, soft radius, 24px padding. Header row: company avatar (colored square with letter), name, weeks-old pill. Body: job title (serif 22px), location row with pin icon. Footer: match-score chip + tag chips.
- **Stat Card (Bento Tile)**: cream card with a small outlined icon tile, a large serif numeral (60-80px), and a small uppercase eyebrow label.
- **Eyebrow Tag**: 10px uppercase, 0.2em tracking, pill-shaped, `bg-black/5` with `border border-black/5`. Used for "BASE", "TAILORED", "AD TECH", "REMOTE", "T1", "T2".
- **Primary Button**: pill, espresso background, white text, 16px padding-y, 24px padding-x. `transition 700ms cubic-bezier(0.32,0.72,0,1)`.
- **Search Field**: pill-shaped input with leading magnifier icon, beige background, very soft border.
- **Top Nav Rail**: 240px left sidebar with logo + "Overview" / "Modules" / "Account" groupings. Top bar: search, cmd-K hint, plus button, notification bell, user chip.

## Do's and Don'ts

### Do's
- Use the cream `#FDFBF7` background everywhere — never pure white `#FFFFFF` for full-bleed surfaces.
- Pair Playfair Display (serif) with Plus Jakarta Sans (sans). The contrast IS the brand.
- Use 1px `#E6E4DD` borders to define cards; reserve shadows for very subtle ambient lift.
- Show product UI as actual screenshots — never abstract mockups. Real pixels win.

### Don'ts
- Don't use drop shadows on cards — borders only.
- Don't use saturated backgrounds (no purple, no blue gradients, no neon).
- Don't use generic tech gradients or stock photography. Stay editorial.
- Don't use the system default sans. Plus Jakarta Sans and Playfair Display are non-negotiable.
- Don't overload a beat with text — let the UI screenshot do the talking.
