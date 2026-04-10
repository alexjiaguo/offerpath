"use client";

import { useState } from "react";
import {
  Palette,
  ChevronDown,
  ChevronUp,
  Check,
  Type,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeTheme } from "@/types";

/* ═══════════════════════════════════════════════════
   Theme Picker — Color palettes, custom colors, fonts
   Integrates into the Resume Editor sidebar
   ═══════════════════════════════════════════════════ */

// ── Preset Palettes ─────────────────────────────────

interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  sidebarBg?: string;
  sidebarText?: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "corporate-navy",
    name: "Corporate Navy",
    primary: "#1e3a5f",
    accent: "#5b8fb9",
  },
  {
    id: "tech-blue",
    name: "Tech Blue",
    primary: "#1a73e8",
    accent: "#5f9ea0",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "#1b5e20",
    accent: "#4caf50",
  },
  {
    id: "sunset-warm",
    name: "Sunset Warm",
    primary: "#d84315",
    accent: "#ff8a65",
  },
  {
    id: "midnight-purple",
    name: "Midnight Purple",
    primary: "#4a148c",
    accent: "#9c27b0",
  },
  {
    id: "classic-black",
    name: "Classic Black",
    primary: "#2c3e50",
    accent: "#7f8c8d",
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    primary: "#006064",
    accent: "#00bcd4",
  },
  {
    id: "wine-red",
    name: "Wine Red",
    primary: "#7b1fa2",
    accent: "#ce93d8",
  },
  {
    id: "slate-modern",
    name: "Slate Modern",
    primary: "#37474f",
    accent: "#78909c",
  },
  {
    id: "emerald-pro",
    name: "Emerald Pro",
    primary: "#00695c",
    accent: "#26a69a",
  },
];

// ── Font Options ────────────────────────────────────

const FONT_OPTIONS = [
  { id: "inter", name: "Inter", value: "'Inter', sans-serif" },
  { id: "roboto", name: "Roboto", value: "'Roboto', sans-serif" },
  { id: "georgia", name: "Georgia", value: "'Georgia', serif" },
  { id: "merriweather", name: "Merriweather", value: "'Merriweather', serif" },
  { id: "lato", name: "Lato", value: "'Lato', sans-serif" },
  { id: "open-sans", name: "Open Sans", value: "'Open Sans', sans-serif" },
  { id: "poppins", name: "Poppins", value: "'Poppins', sans-serif" },
  { id: "source-serif", name: "Source Serif", value: "'Source Serif 4', serif" },
];

// ── Component ───────────────────────────────────────

interface ThemePickerProps {
  theme: ResumeTheme;
  onChange: (updates: Partial<ResumeTheme>) => void;
}

export default function ThemePicker({ theme, onChange }: ThemePickerProps) {
  const [expanded, setExpanded] = useState(true);
  const [showCustom, setShowCustom] = useState(false);

  // Find which preset is active (if any)
  const activePreset = COLOR_PRESETS.find(
    (p) =>
      p.primary.toLowerCase() === theme.primaryColor?.toLowerCase() &&
      p.accent.toLowerCase() === theme.accentColor?.toLowerCase()
  );

  const handlePresetSelect = (preset: ColorPreset) => {
    const updates: Partial<ResumeTheme> = {
      primaryColor: preset.primary,
      accentColor: preset.accent,
      preset: preset.id,
    };
    if (preset.sidebarBg) {
      updates.sidebarBg = preset.sidebarBg;
      updates.sidebarText = preset.sidebarText || "#ffffff";
    }
    onChange(updates);
    setShowCustom(false);
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header — toggle collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-all"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Color Theme
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {/* Preset Palette Grid */}
          <div>
            <p className="text-[10px] text-gray-500 font-medium mb-2">
              Presets
            </p>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((preset) => {
                const isActive = activePreset?.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    title={preset.name}
                    className={cn(
                      "relative w-full aspect-square rounded-lg overflow-hidden transition-all border-2",
                      isActive
                        ? "border-brand-400 ring-1 ring-brand-400/30 scale-105"
                        : "border-transparent hover:border-white/20 hover:scale-105"
                    )}
                  >
                    {/* Two-tone swatch */}
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-tl-md"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {activePreset && (
              <p className="text-[10px] text-gray-500 mt-1.5">
                {activePreset.name}
              </p>
            )}
          </div>

          {/* Custom Color Toggle */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors font-medium"
          >
            {showCustom ? "Hide custom colors ↑" : "Custom colors →"}
          </button>

          {showCustom && (
            <div className="space-y-3 animate-fade-in">
              {/* Primary Color */}
              <div>
                <label className="text-[10px] text-gray-500 font-medium block mb-1.5">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor || "#2c3e50"}
                    onChange={(e) =>
                      onChange({
                        primaryColor: e.target.value,
                        preset: undefined,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor || "#2c3e50"}
                    onChange={(e) =>
                      onChange({
                        primaryColor: e.target.value,
                        preset: undefined,
                      })
                    }
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-200 border border-white/[0.04] text-xs text-gray-300 font-mono focus:outline-none focus:border-brand-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="text-[10px] text-gray-500 font-medium block mb-1.5">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.accentColor || "#7f8c8d"}
                    onChange={(e) =>
                      onChange({ accentColor: e.target.value, preset: undefined })
                    }
                    className="w-8 h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.accentColor || "#7f8c8d"}
                    onChange={(e) =>
                      onChange({ accentColor: e.target.value, preset: undefined })
                    }
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-surface-200 border border-white/[0.04] text-xs text-gray-300 font-mono focus:outline-none focus:border-brand-500/40 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Font Family */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Type className="w-3 h-3 text-gray-500" />
              <label className="text-[10px] text-gray-500 font-medium">
                Font Family
              </label>
            </div>
            <select
              value={theme.fontFamily || "'Inter', sans-serif"}
              onChange={(e) => onChange({ fontFamily: e.target.value })}
              className="w-full px-2.5 py-2 rounded-lg bg-surface-200 border border-white/[0.04] text-xs text-gray-300 focus:outline-none focus:border-brand-500/40 transition-all cursor-pointer appearance-none"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.id} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick size controls */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 font-medium block mb-1">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={9}
                  max={14}
                  step={0.5}
                  value={theme.baseFontSize || 11}
                  onChange={(e) =>
                    onChange({ baseFontSize: Number(e.target.value) })
                  }
                  className="flex-1 accent-brand-400"
                />
                <span className="text-[10px] text-gray-400 font-mono w-6 text-right">
                  {theme.baseFontSize || 11}
                </span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-medium block mb-1">
                Line Height
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1.1}
                  max={1.8}
                  step={0.05}
                  value={theme.lineHeight || 1.4}
                  onChange={(e) =>
                    onChange({ lineHeight: Number(e.target.value) })
                  }
                  className="flex-1 accent-brand-400"
                />
                <span className="text-[10px] text-gray-400 font-mono w-6 text-right">
                  {(theme.lineHeight || 1.4).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
