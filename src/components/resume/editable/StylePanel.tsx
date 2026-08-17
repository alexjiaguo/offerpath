"use client";

import { useState } from "react";
import {
  Palette,
  TextT,
  ArrowsOutCardinal,
  CaretDown,
  CaretUp,
  Plus,
  Minus,
  FrameCorners,
  Sparkle,
  Check,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ResumeTheme, ResumeData } from "@/types";
import type { TailorResult } from "@/lib/aiService";
import { EditorChrome } from "@/components/resume/EditorChrome";
import { useTranslation } from "@/i18n";

const COLOR_PRESETS = [
  { id: "corporate-navy", name: "Navy", primary: "#1e3a5f", accent: "#5b8fb9" },
  { id: "tech-blue", name: "Blue", primary: "#1a73e8", accent: "#5f9ea0" },
  { id: "forest-green", name: "Green", primary: "#1b5e20", accent: "#4caf50" },
  { id: "sunset-warm", name: "Orange", primary: "#d84315", accent: "#ff8a65" },
  { id: "midnight-purple", name: "Purple", primary: "#4a148c", accent: "#9c27b0" },
  { id: "classic-black", name: "Charcoal", primary: "#2c3e50", accent: "#7f8c8d" },
  { id: "ocean-teal", name: "Teal", primary: "#006064", accent: "#00bcd4" },
  { id: "slate-modern", name: "Slate", primary: "#37474f", accent: "#78909c" },
  { id: "emerald-pro", name: "Emerald", primary: "#00695c", accent: "#26a69a" },
  { id: "wine-red", name: "Burgundy", primary: "#7b1fa2", accent: "#ce93d8" },
];

const FONT_OPTIONS = [
  { id: "inter", name: "Inter (Modern Sans)", value: "'Inter', sans-serif" },
  { id: "roboto", name: "Roboto (Neutral Sans)", value: "'Roboto', sans-serif" },
  { id: "georgia", name: "Georgia (Classic Serif)", value: "'Georgia', serif" },
  { id: "merriweather", name: "Merriweather (Editorial Serif)", value: "'Merriweather', serif" },
  { id: "lato", name: "Lato (Clean Sans)", value: "'Lato', sans-serif" },
  { id: "poppins", name: "Poppins (Geometric Sans)", value: "'Poppins', sans-serif" },
];

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  accentColor?: string;
  onChange: (v: number) => void;
}

function ParameterSlider({
  label,
  value,
  min,
  max,
  step,
  unit = "px",
  accentColor = "brand",
  onChange,
}: StepperProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const displayVal = Number.isInteger(value) ? value : value.toFixed(unit === "x" ? 2 : 1);

  return (
    <div className="p-2.5 rounded-xl bg-white border border-surface-200/80 shadow-2xs space-y-1.5 transition-all hover:border-surface-300 w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-1 min-w-0">
        <label className="text-[10px] font-bold text-surface-400 tracking-tight truncate min-w-0">
          {label}
        </label>
        <span className="text-[10px] font-bold font-mono text-surface-400 bg-surface-100 px-1.5 py-0.2 rounded tabular-nums shrink-0">
          {displayVal}{unit}
        </span>
      </div>

      <div className="flex items-center gap-1.5 min-w-0 w-full">
        <button
          type="button"
          onClick={() => onChange(clamp(Number((value - step).toFixed(2))))}
          className="shrink-0 w-4 h-4 rounded bg-surface-50 border border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all flex items-center justify-center"
          title="Decrease"
        >
          <Minus size={8} weight="bold" />
        </button>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
          className={cn(
            "w-0 min-w-0 flex-1 h-1 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-500",
            accentColor === "emerald" && "accent-emerald-600",
            accentColor === "indigo" && "accent-indigo-600",
            accentColor === "amber" && "accent-amber-500",
            accentColor === "sky" && "accent-sky-600",
            accentColor === "fuchsia" && "accent-fuchsia-600"
          )}
        />

        <button
          type="button"
          onClick={() => onChange(clamp(Number((value + step).toFixed(2))))}
          className="shrink-0 w-4 h-4 rounded bg-surface-50 border border-surface-200 text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all flex items-center justify-center"
          title="Increase"
        >
          <Plus size={8} weight="bold" />
        </button>
      </div>
    </div>
  );
}

type SectionTheme = "emerald" | "indigo" | "amber" | "sky" | "fuchsia";

const SECTION_THEME_STYLES: Record<
  SectionTheme,
  { badge: string; iconBg: string; text: string }
> = {
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    iconBg: "bg-emerald-500 text-white",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  indigo: {
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    iconBg: "bg-indigo-500 text-white",
    text: "text-indigo-700 dark:text-indigo-400",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    iconBg: "bg-amber-500 text-white",
    text: "text-amber-700 dark:text-amber-400",
  },
  sky: {
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    iconBg: "bg-sky-500 text-white",
    text: "text-sky-700 dark:text-sky-400",
  },
  fuchsia: {
    badge: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/20",
    iconBg: "bg-fuchsia-500 text-white",
    text: "text-fuchsia-700 dark:text-fuchsia-400",
  },
};

function PanelSection({
  title,
  themeType = "indigo",
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  themeType?: SectionTheme;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const styles = SECTION_THEME_STYLES[themeType];

  return (
    <div className="rounded-xl bg-surface-50 border border-surface-200/90 overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3.5 py-2.5 bg-surface-50 hover:bg-surface-100/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-2xs",
              styles.iconBg
            )}
          >
            {icon}
          </div>
          <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider font-display">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border", styles.badge)}>
            {themeType}
          </span>
          {open ? (
            <CaretUp size={11} className="text-surface-300" />
          ) : (
            <CaretDown size={11} className="text-surface-300" />
          )}
        </div>
      </button>

      {open && <div className="p-3 pt-1 space-y-3 border-t border-surface-200/60 bg-surface-50/50">{children}</div>}
    </div>
  );
}

export interface StylePanelProps {
  theme: ResumeTheme;
  onThemeChange: (updates: Partial<ResumeTheme>) => void;
  selectedTemplate: string;
  onTemplateChange: (tmplId: string) => void;
  resumeData: ResumeData;
  resumeId: string;
  resumeTitle: string;
  profileSummary: string;
  onApplyTailor: (result: TailorResult) => void;
  saveToHistory: (id: string) => void;
  onSave: () => void;
  saved: boolean;
  preview?: React.ReactNode;
}

export function StylePanel({
  theme,
  onThemeChange,
  selectedTemplate,
  onTemplateChange,
  resumeData,
  resumeId,
  resumeTitle,
  profileSummary,
  onApplyTailor,
  saveToHistory,
  onSave,
  saved,
  preview,
}: StylePanelProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activePreset = COLOR_PRESETS.find(
    (p) =>
      p.primary.toLowerCase() === theme.primaryColor?.toLowerCase() &&
      p.accent.toLowerCase() === theme.accentColor?.toLowerCase(),
  );

  const PRESET_KEY_MAP: Record<string, keyof typeof t.resumeStudio.stylePanel.presets> = {
    "corporate-navy": "navy",
    "tech-blue": "blue",
    "forest-green": "green",
    "sunset-warm": "orange",
    "midnight-purple": "purple",
    "classic-black": "charcoal",
    "ocean-teal": "teal",
    "slate-modern": "slate",
    "emerald-pro": "emerald",
    "wine-red": "burgundy",
  };

  return (
    <div className="@container space-y-3">
      <EditorChrome
        data={resumeData}
        resumeId={resumeId}
        profileSummary={profileSummary}
        onApplyTailor={onApplyTailor}
        saveToHistory={saveToHistory}
      />

      <div className="space-y-3">
        {/* 🎨 1. Colors & Palette (Emerald Theme) */}
        <PanelSection
          title={t("resumeStudio.stylePanel.colorPalette")}
          themeType="emerald"
          icon={<Palette size={11} weight="fill" className="text-white" />}
        >
          <div className="flex flex-wrap gap-1.5 justify-start">
            {COLOR_PRESETS.map((preset) => {
              const isActive = activePreset?.id === preset.id;
              const pKey = PRESET_KEY_MAP[preset.id];
              const presetName = pKey ? t.resumeStudio.stylePanel.presets[pKey] : preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    onThemeChange({
                      primaryColor: preset.primary,
                      accentColor: preset.accent,
                      preset: preset.id,
                    })
                  }
                  title={`${presetName} (${preset.primary})`}
                  className={cn(
                    "relative w-7 h-7 rounded-lg overflow-hidden transition-all shrink-0 border border-black/10",
                    isActive
                      ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-surface-0 scale-105 shadow-sm"
                      : "opacity-75 hover:opacity-100 hover:scale-105"
                  )}
                >
                  <div className="absolute inset-0" style={{ backgroundColor: preset.primary }} />
                  <div
                    className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-tl-sm"
                    style={{ backgroundColor: preset.accent }}
                  />
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check size={11} weight="bold" className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 @[240px]:grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded-xl bg-white border border-surface-200/80 space-y-1 min-w-0">
              <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block truncate">
                {t("resumeStudio.stylePanel.primaryColor")}
              </label>
              <div className="flex items-center gap-1.5 min-w-0">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    onThemeChange({ primaryColor: e.target.value, preset: undefined })
                  }
                  className="w-5 h-5 rounded-md border-none bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-[10px] font-mono font-bold text-surface-400 uppercase truncate">
                  {theme.primaryColor}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white border border-surface-200/80 space-y-1 min-w-0">
              <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block truncate">
                {t("resumeStudio.stylePanel.accentColor")}
              </label>
              <div className="flex items-center gap-1.5 min-w-0">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) =>
                    onThemeChange({ accentColor: e.target.value, preset: undefined })
                  }
                  className="w-5 h-5 rounded-md border-none bg-transparent cursor-pointer shrink-0"
                />
                <span className="text-[10px] font-mono font-bold text-surface-400 uppercase truncate">
                  {theme.accentColor}
                </span>
              </div>
            </div>
          </div>
        </PanelSection>

        {/* 🔤 2. Typography (Indigo Theme) */}
        <PanelSection
          title={t("resumeStudio.stylePanel.typography")}
          themeType="indigo"
          icon={<TextT size={11} weight="bold" className="text-white" />}
        >
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block">
              {t("resumeStudio.stylePanel.fontFamily")}
            </label>
            <select
              value={theme.fontFamily}
              onChange={(e) => onThemeChange({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-surface-200 text-xs font-semibold text-surface-400 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-2xs"
            >
              {FONT_OPTIONS.map((font) => {
                const desc = t.resumeStudio.stylePanel.fontDescriptions?.[font.id as keyof typeof t.resumeStudio.stylePanel.fontDescriptions] || font.name;
                return (
                  <option key={font.id} value={font.value}>
                    {desc}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 @[260px]:grid-cols-2 gap-2 pt-1">
            <ParameterSlider
              label={t("resumeStudio.stylePanel.baseFontSize")}
              value={theme.baseFontSize ?? 10}
              min={8}
              max={14}
              step={0.5}
              unit="px"
              accentColor="indigo"
              onChange={(v) => onThemeChange({ baseFontSize: v })}
            />
            <ParameterSlider
              label={t("resumeStudio.stylePanel.headerFontSize")}
              value={theme.headerFontSize ?? 24}
              min={18}
              max={36}
              step={1}
              unit="px"
              accentColor="indigo"
              onChange={(v) => onThemeChange({ headerFontSize: v })}
            />
            <ParameterSlider
              label={t("resumeStudio.stylePanel.sectionTitleSize")}
              value={theme.sectionTitleSize ?? 12}
              min={9}
              max={16}
              step={0.5}
              unit="px"
              accentColor="indigo"
              onChange={(v) => onThemeChange({ sectionTitleSize: v })}
            />
            <ParameterSlider
              label={t("resumeStudio.stylePanel.companyFontSize")}
              value={theme.companyFontSize ?? 11}
              min={9}
              max={16}
              step={0.5}
              unit="px"
              accentColor="indigo"
              onChange={(v) => onThemeChange({ companyFontSize: v })}
            />
          </div>
        </PanelSection>

        {/* 📐 3. Spacing & Rhythm (Amber Theme) */}
        <PanelSection
          title={t("resumeStudio.stylePanel.spacingRhythm")}
          themeType="amber"
          icon={<ArrowsOutCardinal size={11} weight="bold" className="text-white" />}
        >
          <div className="grid grid-cols-1 @[260px]:grid-cols-2 gap-2">
            <ParameterSlider
              label={t("resumeStudio.stylePanel.sectionGap")}
              value={theme.sectionSpacing ?? 12}
              min={0}
              max={30}
              step={1}
              unit="px"
              accentColor="amber"
              onChange={(v) => onThemeChange({ sectionSpacing: v })}
            />
            <ParameterSlider
              label={t("resumeStudio.stylePanel.itemGap")}
              value={theme.itemSpacing ?? 8}
              min={0}
              max={20}
              step={1}
              unit="px"
              accentColor="amber"
              onChange={(v) => onThemeChange({ itemSpacing: v })}
            />
            <ParameterSlider
              label={t("resumeStudio.stylePanel.lineHeight")}
              value={theme.lineHeight ?? 1.3}
              min={1.05}
              max={1.8}
              step={0.05}
              unit="x"
              accentColor="amber"
              onChange={(v) => onThemeChange({ lineHeight: v })}
            />
            <ParameterSlider
              label={t("resumeStudio.stylePanel.bulletGap")}
              value={theme.bulletSpacing ?? 4}
              min={0}
              max={12}
              step={1}
              unit="px"
              accentColor="amber"
              onChange={(v) => onThemeChange({ bulletSpacing: v })}
            />
          </div>
        </PanelSection>

        {/* 📄 4. Page Margins & Geometry (Sky Theme) */}
        <PanelSection
          title={t("resumeStudio.stylePanel.pageGeometry")}
          themeType="sky"
          icon={<FrameCorners size={11} weight="bold" className="text-white" />}
        >
          <div className="space-y-2">
            <ParameterSlider
              label={t("resumeStudio.stylePanel.pageMargins")}
              value={theme.pagePadding ?? 24}
              min={12}
              max={48}
              step={1}
              unit="px"
              accentColor="sky"
              onChange={(v) => onThemeChange({ pagePadding: v })}
            />
          </div>
        </PanelSection>

        {/* ✨ 5. Advanced / Template-Specific Options (Fuchsia Theme) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-[10px] font-bold text-surface-300 hover:text-surface-400 uppercase tracking-widest transition-colors"
          >
            <Sparkle size={12} className="text-fuchsia-500" />
            <span>{showAdvanced ? t("resumeStudio.stylePanel.fewerTemplateOptions") : t("resumeStudio.stylePanel.moreTemplateOptions")}</span>
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-2 p-3 rounded-xl bg-surface-50 border border-fuchsia-200/60">
              <div className="grid grid-cols-1 @[240px]:grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-white border border-surface-200/80 space-y-1 min-w-0">
                  <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block truncate">
                    {t("resumeStudio.stylePanel.sidebarBg")}
                  </label>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <input
                      type="color"
                      value={theme.sidebarBg || "#16213e"}
                      onChange={(e) => onThemeChange({ sidebarBg: e.target.value })}
                      className="w-5 h-5 rounded-md border-none bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono font-bold text-surface-400 uppercase truncate">
                      {theme.sidebarBg || "#16213e"}
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-white border border-surface-200/80 space-y-1 min-w-0">
                  <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block truncate">
                    {t("resumeStudio.stylePanel.sidebarText")}
                  </label>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <input
                      type="color"
                      value={theme.sidebarText || "#d0d0dc"}
                      onChange={(e) => onThemeChange({ sidebarText: e.target.value })}
                      className="w-5 h-5 rounded-md border-none bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono font-bold text-surface-400 uppercase truncate">
                      {theme.sidebarText || "#d0d0dc"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 @[260px]:grid-cols-2 gap-2 pt-1">
                <ParameterSlider
                  label={t("resumeStudio.stylePanel.headshotSize")}
                  value={theme.headshotSize ?? 80}
                  min={40}
                  max={160}
                  step={5}
                  unit="px"
                  accentColor="fuchsia"
                  onChange={(v) => onThemeChange({ headshotSize: v })}
                />
                <ParameterSlider
                  label={t("resumeStudio.stylePanel.headshotRadius")}
                  value={theme.headshotRadius ?? 4}
                  min={0}
                  max={80}
                  step={2}
                  unit="px"
                  accentColor="fuchsia"
                  onChange={(v) => onThemeChange({ headshotRadius: v })}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
