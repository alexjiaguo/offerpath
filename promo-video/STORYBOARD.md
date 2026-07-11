# STORYBOARD — OfferPath 20s Promo

**Format:** 1920x1080
**Audio:** Kokoro TTS voiceover (af_nova) + light underscore + minimal SFX
**VO direction:** Calm, confident, mid-adult voice. Linear/Vercel product-video register. Economy of words. Brief silence between sentences is a feature.
**Style basis:** DESIGN.md (Soft Structuralism / Editorial Luxury — cream + espresso + serif/sans pairing)

---

## Global Direction

- **Canvas:** cream `#FDFBF7` background throughout. Never pure white.
- **Type:** Playfair Display (serif) for module names and stat numerals; Plus Jakarta Sans for body.
- **Motion:** restrained, editorial. Slow Ken Burns on screenshots (scale 1→1.03 over beat). 600-800ms ease-out entrances. Whip-pan CSS transitions between beats. One subtle ambient float on the persistent logo.
- **Persistence:** A small "OfferPath" wordmark lives bottom-left for the entire video, fading in at beat 1, holding, and brightening in beat 6.
- **Music direction:** Soft warm synth pad, very low volume. Sits under everything. Single rising swell during beat 6 CTA. No percussion.
- **Color presence:** at least one accent chip color per beat (green match-score, blue saved-lead, amber needs-prep).

## Asset Audit

| Asset | Type | Assign to Beat | Role |
| ----- | ---- | -------------- | ---- |
| `capture/assets/logo.png` | Brand mark (square) | Beat 1, Beat 6 | Logo opener & closer |
| `capture/assets/wordmark.svg` | Brand wordmark SVG | All beats (persistent) | Bottom-left persistent wordmark |
| `capture/assets/dashboard.png` | Product UI screenshot | Beat 2 | The "system" reveal |
| `capture/assets/discover.png` | Product UI screenshot | Beat 3 | Job Discovery module |
| `capture/assets/resume.png` | Product UI screenshot | Beat 4 | Career Asset Studio |
| `capture/assets/interview.png` | Product UI screenshot | Beat 5 | Interview Prep |
| `capture/assets/tracker.png` | Product UI screenshot | Beat 6 (background) | Pipeline Tracker to close on |

**Minimum utilization:** 5/5 product screenshots used (100%). Logo appears in Beat 1 and Beat 6.

---

## Beat 1 — THE HOOK (0.0-3.0s)

**VO:** "Job hunting shouldn't feel like guesswork."

**Concept:** A still, almost quiet moment. The viewer lands on a generous cream canvas with the OfferPath logo centered, slightly lifted. The wordmark hangs in negative space. This is the moment of *arrival* — a calm promise before the storm of features. A single serif statement appears under the logo: "From search to signed offer."

**Visual:**
- BG: cream `#FDFBF7` with very faint radial gradient (warmer at center).
- MG: logo-square (200x200) at frame center, slight drop-shadow (the one allowed shadow — the logo card).
- FG: serif statement "From search to signed offer." in Playfair Display Italic, 56px, espresso, 80px below logo.
- Persistent wordmark bottom-left in Plus Jakarta Sans, 14px, slate.
- A small eyebrow tag "INTRODUCING" appears above the logo, 10px uppercase, 0.2em tracking.

**Camera:** Static. No drift. The stillness IS the beat.

**Animation choreography:**
- LOGO: rises from `y: +30, opacity: 0` → CSS center, 800ms `power3.out` at 0.2s.
- EYEBROW: fades in from `opacity: 0` → 1, 500ms `power2.out` at 0.4s.
- STATEMENT: typewriter-style line draw (clip-path width 0→100%, 900ms `power2.out` at 0.9s).
- Persistent wordmark: fades in at 1.5s, 600ms.

**Transition OUT:** Whip-pan left — `x: -1200, blur: 18px, opacity: 0.4, 0.4s power3.in` (the system is fast).

**SFX:** A single soft analog "shutter click" at 0.4s. Otherwise silence.

---

## Beat 2 — THE PROMISE (3.0-6.2s)

**VO:** "With OfferPath, your search becomes a system."

**Concept:** The cream canvas now reveals a complete product dashboard — the screenshot floats in, gently scaled, with a stat callout (3 jobs, 4.5 score) pinned over it. The promise: this is not a list, this is an operating system.

**Visual:**
- BG: cream `#FDFBF7`.
- MG: full dashboard screenshot at 80% width, centered, 1px `#E6E4DD` border, 16px radius. Slow Ken Burns `scale 1 → 1.02` over beat.
- FG top-right: a small stat card "8 ACTIVE JOBS" with serif numeral.
- FG top-left: serif heading "A workspace that thinks with you." Playfair 38px.
- FG bottom-right: pill chip "A I — A N C H O R E D" with green dot.
- Persistent wordmark bottom-left.

**Animation choreography:**
- SCREENSHOT: rises from `y: +60, opacity: 0, scale: 0.96` → CSS center, 900ms `expo.out` at 3.2s.
- HEADING: rises from `y: +24, opacity: 0` → in place, 700ms `power2.out` at 3.6s.
- STAT CARD: rises + fades, 600ms `power2.out` at 4.2s.
- CHIP: fades in, 400ms at 4.8s.

**Transition OUT:** Velocity-matched upward — `y: -100, blur: 16px, 0.35s power2.in`.

**SFX:** Subtle "whoosh" as the screenshot lands.

---

## Beat 3 — DISCOVERY (6.2-10.0s)

**VO:** "Thirty leads from thirty companies, scored against your profile."

**Concept:** Swap the dashboard for the Job Discovery screen. Three stat tiles cascade in (30 / 30 / 82%) while the screen floats below them like a piece of editorial. The numbers do the talking.

**Visual:**
- BG: cream `#FDFBF7`.
- Top row: three stat tiles side-by-side, 280px wide each:
  - "30 / TOTAL LEADS" (slate eyebrow, serif 72px numeral)
  - "30 / COMPANIES" (slate eyebrow, serif 72px numeral)
  - "82% / AVG. MATCH" (green eyebrow, serif 72px numeral)
- MG: discover.png screenshot at 75% width, below the tiles, with 1px border.
- Persistent wordmark bottom-left.

**Animation choreography:**
- TILE 1 ("30"): rises from `y: +40, opacity: 0` → in place, 600ms `power3.out` at 6.4s. Numeral counters from 0 to 30 over 700ms.
- TILE 2 ("30"): same pattern, offset +200ms.
- TILE 3 ("82%"): same pattern, offset +400ms, counter 0 → 82.
- SCREENSHOT: rises from `y: +60, opacity: 0` → in place, 800ms `expo.out` at 7.6s.
- All tiles: gentle ambient float `y: ±3px, 3s, sine.inOut, yoyo` once visible.

**Transition OUT:** Velocity-matched downward — `y: +100, blur: 16px, 0.35s power2.in`.

**SFX:** A soft chime for each counter that finishes. Three ascending chimes.

---

## Beat 4 — RESUME (10.0-12.5s)

**VO:** "Tailored resumes in ninety seconds."

**Concept:** Tighter, more focused beat. A single hero number "90s" anchors the left, the resume studio floats on the right, and a tag bar underneath reads "BASE → TAILORED". The transformation is the message.

**Visual:**
- BG: cream.
- Left half: huge serif numeral "90" (180px Playfair, espresso) with a small "SECONDS" eyebrow above and "Tailored resume" caption below in italic Playfair 32px.
- Right half: resume.png screenshot at 50% width, 1px border, 16px radius, slow Ken Burns.
- Below: pill chips "BASE RESUME" → arrow → "TAILORED FOR GOOGLE ADS PM" (10px uppercase).
- Persistent wordmark bottom-left.

**Animation choreography:**
- "90": rises from `scale: 0.5, opacity: 0` → 1, 700ms `back.out(1.7)` at 10.2s.
- "SECONDS" eyebrow: fades in, 400ms at 10.6s.
- Italic caption: rises from `y: +20, opacity: 0` → in place, 600ms `power2.out` at 10.8s.
- SCREENSHOT: rises from `y: +40, opacity: 0, scale: 0.97` → in place, 800ms `expo.out` at 11.0s.
- CHIP BAR: stagger-fade, 80ms between chips, total 800ms starting at 11.6s.

**Transition OUT:** Whip-pan right — `x: +1200, blur: 18px, opacity: 0.4, 0.35s power3.in`.

**SFX:** A short "transform" tone — a low-to-mid sweep.

---

## Beat 5 — INTERVIEW (12.5-15.0s)

**VO:** "Mock interviews that score every answer."

**Concept:** The screen swaps to Interview Prep. A small trophy + "4.2 AVG SCORE" callout floats to the side. The mock session is the proof.

**Visual:**
- BG: cream.
- MG: interview.png screenshot at 78% width, 1px border, 16px radius, Ken Burns 1→1.02.
- FG top-right: stat card "4.2 / AVG SCORE" in serif + a small amber trophy icon.
- FG top-left: eyebrow tag "AI MOCK SESSIONS".
- Persistent wordmark bottom-left.

**Animation choreography:**
- SCREENSHOT: rises from `y: +60, opacity: 0` → in place, 800ms `expo.out` at 12.7s.
- EYEBROW: fades in, 400ms at 13.2s.
- STAT CARD: rises from `y: +20, opacity: 0` → in place, 600ms `power2.out` at 13.4s. Numeral 0 → 4.2 over 600ms.
- Trophy icon: gentle pulse `scale: 1 → 1.05 → 1`, 1.4s `sine.inOut`, yoyo, from 14.0s.

**Transition OUT:** Velocity-matched upward — `y: -80, blur: 14px, 0.3s power2.in`.

**SFX:** A soft "ding" as 4.2 lands.

---

## Beat 6 — CTA / CLOSER (15.0-20.0s)

**VO:** "From first scan to signed offer. OfferPath. The career operating system."

**Concept:** This is the hero moment. A pipeline tracker is the visual proof of the whole loop. The logo returns, larger. The final statement holds in stillness.

**Visual:**
- BG: cream, with a very gentle warm radial glow from center.
- MG: tracker.png screenshot at 70% width, centered, 1px border, 16px radius.
- FG top-center: serif statement "From first scan to signed offer." Playfair 56px, espresso.
- FG bottom-center: large logo-square (140x140) + wordmark "OfferPath" 42px Playfair underneath.
- FG bottom-left: persistent wordmark stays.
- A faint dotted line/arrow path could connect the four stages of the kanban to imply progression. Optional — keep minimal.

**Animation choreography:**
- SCREENSHOT: rises from `y: +60, opacity: 0, scale: 0.96` → in place, 900ms `expo.out` at 15.2s.
- STATEMENT: rises from `y: +24, opacity: 0` → in place, 800ms `power2.out` at 16.0s.
- LOGO + WORDMARK: rises from `y: +30, opacity: 0` → in place, 800ms `power3.out` at 16.4s.
- Final hold from 18.0s-20.0s — all elements breathing, slow ambient float on the logo.

**Transition OUT:** None — this is the final beat. Allowed fade-to-cream or gentle ambient drift only.

**SFX:** Music swell begins at 15.0s, peaks at 18.0s, resolves softly at 20.0s.

---

## Production Architecture

```
promo-video/
├── index.html                    root — VO + orchestration
├── DESIGN.md                     brand reference
├── SCRIPT.md                     narration text
├── STORYBOARD.md                 THIS FILE
├── narration.txt                 TTS-ready spoken text
├── narration.wav                 TTS output
├── transcript.json               word-level timestamps
├── capture/                      captured website data
│   ├── assets/
│   │   ├── logo.png
│   │   ├── wordmark.svg
│   │   ├── mark.svg
│   │   ├── dashboard.png
│   │   ├── discover.png
│   │   ├── resume.png
│   │   ├── interview.png
│   │   ├── tracker.png
│   │   └── hero.png
│   ├── extracted/                (original capture metadata)
│   └── screenshots/
└── compositions/
    ├── beat-1-hook.html
    ├── beat-2-promise.html
    ├── beat-3-discovery.html
    ├── beat-4-resume.html
    ├── beat-5-interview.html
    └── beat-6-cta.html
```
