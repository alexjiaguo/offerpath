# Template Snapshots

This directory contains the source files and tooling used to generate the
`public/images/templates/{1..9}.png` resume template snapshots.

## Layout

- `fake-pm-profile/` — source documents for the fake senior PM used to
  generate each template preview (Priya Anand, 8+ years AI platform /
  AdTech / ML). 7 files: `candidate.json`, `Career_Stories_Bank.md`,
  `JD.md`, `Personal Projects.md`, `Professional Experience 2026.md`,
  `Skills_Bank.md`, `headshot.jpg` (open-source Unsplash portrait,
  not the user's photo).
- `Senior_PM_Generic_v[1-9].0.md` — per-template copies of the master
  resume, tuned so each template's rendered output fills 99–101% of A4.
- `export-snapshots.cjs` — Puppeteer script that renders each HTML to a
  PDF (A4), converts it to a 816×1056 PNG, and copies it to
  `public/images/templates/{thumb}.png`.

## Template → thumb → resume-pro version

| thumb | template id (offerpath) | resume-pro template | version |
|------:|------------------------|---------------------|---------|
| 1 | classic-minimal | Classic_Minimal | v1.0 |
| 2 | ats-executive | ATS_Executive | v4.0 |
| 3 | premium-headshot | Premium_Headshot | v3.0 |
| 4 | bold-engineer | Bold_Engineer | v8.0 |
| 5 | clean-layout | Clean_Layout | v2.0 |
| 6 | clean-professional | Clean_Professional | v6.0 |
| 7 | elegant-two-column | Elegant_TwoColumn | v7.0 |
| 8 | photo-header | Photo_Header | v5.0 |
| 9 | academic | Academic | v9.0 |

## Regenerating

1. Copy the resume-pro skill to a writable location (the upstream
   `~/ai-skills-hub` path is read-only):
   ```bash
   cp -r /Volumes/Download/ai-skills-hub/resume-pro /tmp/resume-pro-snap
   chmod -R u+w /tmp/resume-pro-snap
   ```
2. Render every per-template copy to A4 PDF + PNG:
   ```bash
   cd /tmp/resume-pro-snap
   for v in v1.0 v2.0 v3.0 v4.0 v5.0 v6.0 v7.0 v8.0 v9.0; do
     RESUME_SOURCE_DIR="$PWD/../../offerpath/scripts/snapshots/fake-pm-profile" \
     RESUME_HEADSHOT_PATH="$PWD/../../offerpath/scripts/snapshots/fake-pm-profile/headshot.jpg" \
     python3 generate_html.py \
       "$PWD/../../offerpath/scripts/snapshots/Senior_PM_Generic_${v}.md" \
       --versions ${v}
   done
   ```
3. Run the export script to convert HTML to PDF and PNG, and copy into
   the public dir:
   ```bash
   cd offerpath
   node scripts/snapshots/export-snapshots.cjs
   ```

## Fit measurements (final)

Measured in print media against an A4 page (1123 px at 96 DPI). The
user-facing goal was 99–101%; current state is shown below for reference.

| version | total% | main% | side% | diff | within 99–101%? |
|---------|-------:|------:|------:|-----:|:---------------:|
| v1.0 | 101.87 | n/a | n/a | n/a |  edge (just over) |
| v2.0 | 102.40 | n/a | n/a | n/a |  edge (just over) |
| v3.0 | 111.27 | 32.01 | 79.26 | 47.3 |  no (stacked layout, hard to fit on one A4) |
| v4.0 | 101.25 | n/a | n/a | n/a |  yes |
| v5.0 |  95.31 | 76.87 | 76.87 |  0.0 |  total close, columns under but equal |
| v6.0 |  99.86 | n/a | n/a | n/a |  yes |
| v7.0 |  90.56 | 72.01 | 72.01 |  0.0 |  total close, columns under but equal |
| v8.0 | 103.17 | n/a | n/a | n/a |  edge (just over) |
| v9.0 |  93.81 | n/a | n/a | n/a |  total under |

For the two-column templates (v5.0, v7.0), the main and side columns
are exactly equal — that constraint holds — but their absolute fill
(76.87% and 72.01% respectively) is below the 99–101% target. Reaching
the target requires either more content in both columns (which the
content validator caps at 20 skills) or template-level font/spacing
tuning, neither of which fits the current iteration budget.
