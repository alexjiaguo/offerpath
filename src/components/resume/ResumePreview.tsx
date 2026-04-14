"use client";

import React from "react";
import type { ResumeData, ResumeTheme, SectionKey } from "@/types";
import { DEFAULT_SECTION_VISIBILITY } from "@/types";
import { cn } from "@/lib/utils";

/* ─── Lazy import all 9 templates ─── */
import ClassicMinimal from "./templates/ClassicMinimal";
import ATSExecutive from "./templates/ATSExecutive";
import PremiumHeadshot from "./templates/PremiumHeadshot";
import BoldEngineer from "./templates/BoldEngineer";
import CleanLayout from "./templates/CleanLayout";
import CleanProfessional from "./templates/CleanProfessional";
import ElegantTwoColumn from "./templates/ElegantTwoColumn";
import PhotoHeader from "./templates/PhotoHeader";
import Academic from "./templates/Academic";
import type { TemplateProps } from "./templates/shared";

/* ═══════════════════════════════════════════════════
   ResumePreview — Live template-based resume rendering
   Renders a scaled A4 paper simulation
   ═══════════════════════════════════════════════════ */

interface ResumePreviewProps {
  data: ResumeData;
  template: string;
  theme?: ResumeTheme;
  themeColor?: string;
  sectionOrder?: SectionKey[];
  sectionVisibility?: Record<SectionKey, boolean>;
  className?: string;
  fullScale?: boolean;
}

// ── Default theme values ─────────────────────────────

const DEFAULT_THEME: ResumeTheme = {
  primaryColor: "#2c3e50",
  accentColor: "#7f8c8d",
  backgroundColor: "#ffffff",
  textColor: "#1a1a2e",
  fontFamily: "'Inter', sans-serif",
  baseFontSize: 11,
  headerFontSize: 24,
  sectionTitleSize: 11,
  companyFontSize: 11,
  lineHeight: 1.4,
  pagePadding: 30,
  sectionSpacing: 12,
  itemSpacing: 6,
};

const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "technicalSkills",
  "skills",
  "languages",
  "certifications",
  "projects",
];

// ── Template Registry ────────────────────────────────

const TEMPLATES: Record<string, React.FC<TemplateProps>> = {
  "classic-minimal": ClassicMinimal,
  "ats-executive": ATSExecutive,
  "premium-headshot": PremiumHeadshot,
  "bold-engineer": BoldEngineer,
  "clean-layout": CleanLayout,
  "clean-professional": CleanProfessional,
  "elegant-two-column": ElegantTwoColumn,
  "photo-header": PhotoHeader,
  "academic": Academic,
};

// ── Main Component ───────────────────────────────────

export default function ResumePreview({
  data,
  template,
  theme,
  themeColor,
  sectionOrder,
  sectionVisibility,
  className,
  fullScale = false,
}: ResumePreviewProps) {
  const TemplateComponent = TEMPLATES[template] || ClassicMinimal;

  // Build merged theme: defaults → theme prop → themeColor override
  const mergedTheme: ResumeTheme = {
    ...DEFAULT_THEME,
    ...theme,
    ...(themeColor ? { primaryColor: themeColor } : {}),
  };

  const mergedOrder = sectionOrder || DEFAULT_SECTION_ORDER;
  const mergedVisibility = sectionVisibility || DEFAULT_SECTION_VISIBILITY;

  return (
    <div className={cn("print-preview", className, "flex justify-center")}>
      {/* A4 paper simulation — uses transform for scaling in editor */}
      <div 
        className={cn(
          "relative bg-white shadow-2xl transition-all duration-500",
          fullScale ? "w-[210mm] min-h-[297mm]" : "w-full overflow-hidden"
        )} 
        style={!fullScale ? { aspectRatio: "210/297" } : {}}
      >
        <div 
          className={cn(
            "origin-top-left",
            !fullScale ? "absolute inset-0 overflow-hidden" : "w-full h-full"
          )} 
          style={!fullScale ? { 
            transform: "scale(0.38)", 
            width: "210mm", 
            height: "297mm" 
          } : {}}
        >
          <TemplateComponent
            data={data}
            theme={mergedTheme}
            sectionOrder={mergedOrder}
            sectionVisibility={mergedVisibility}
          />
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview,
          .print-preview * {
            visibility: visible;
          }
          .print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-preview > div {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .print-preview > div > div {
            transform: none !important;
            width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

// Export template names for the picker
export const TEMPLATE_CONFIGS = [
  { id: "classic-minimal", name: "Classic Minimal", desc: "Clean, centered header — universally ATS-friendly", tag: "Popular", pro: false },
  { id: "ats-executive", name: "ATS Executive", desc: "Left-aligned, optimized for executive-level ATS", tag: "ATS", pro: false },
  { id: "premium-headshot", name: "Premium Headshot", desc: "Dark sidebar with photo and contact block", tag: "Photo", pro: false },
  { id: "bold-engineer", name: "Bold Engineer", desc: "Bold header, contact badges, colored section pills", tag: "Tech", pro: false },
  { id: "clean-layout", name: "Clean Layout", desc: "Centered header, clear section separation", tag: "Clean", pro: false },
  { id: "clean-professional", name: "Clean Professional", desc: "Generous spacing, refined for senior roles", tag: "Senior", pro: false },
  { id: "elegant-two-column", name: "Elegant Two-Column", desc: "Playfair Display header, timeline experience", tag: "Elegant", pro: false },
  { id: "photo-header", name: "Photo Header", desc: "Banner header with photo, sidebar + timeline", tag: "Creative", pro: false },
  { id: "academic", name: "Academic", desc: "Serif font, traditional academic layout", tag: "Academic", pro: false },
];
