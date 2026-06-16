/* ═══════════════════════════════════════════════════
   Template config — lives outside "use client" so it
   can be safely imported by server components during
   static prerendering (e.g. /preview-templates).
   ═══════════════════════════════════════════════════ */

export interface TemplateConfig {
  id: string;
  name: string;
  desc: string;
  tag: string;
  pro: boolean;
  thumbnail: string;
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  { id: "classic-minimal", name: "Classic Minimal", desc: "Clean, centered header — universally ATS-friendly", tag: "Popular", pro: false, thumbnail: "1" },
  { id: "ats-executive", name: "ATS Executive", desc: "Left-aligned, optimized for executive-level ATS", tag: "ATS", pro: false, thumbnail: "2" },
  { id: "premium-headshot", name: "Premium Headshot", desc: "Dark sidebar with photo and contact block", tag: "Photo", pro: false, thumbnail: "3" },
  { id: "bold-engineer", name: "Bold Engineer", desc: "Bold header, contact badges, colored section pills", tag: "Tech", pro: false, thumbnail: "4" },
  { id: "clean-layout", name: "Clean Layout", desc: "Centered header, clear section separation", tag: "Clean", pro: false, thumbnail: "5" },
  { id: "clean-professional", name: "Clean Professional", desc: "Generous spacing, refined for senior roles", tag: "Senior", pro: false, thumbnail: "6" },
  { id: "elegant-two-column", name: "Elegant Two-Column", desc: "Playfair Display header, timeline experience", tag: "Elegant", pro: false, thumbnail: "7" },
  { id: "photo-header", name: "Photo Header", desc: "Banner header with photo, sidebar + timeline", tag: "Creative", pro: false, thumbnail: "8" },
  { id: "academic", name: "Academic", desc: "Serif font, traditional academic layout", tag: "Academic", pro: false, thumbnail: "9" },
];
