"use client";

import { useState, useEffect } from "react";
import { Check, CaretRight, Palette, SlidersHorizontal, TextT, X } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import type { ResumeTheme } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════
   Theme Picker v3 - Robotic BsPalette Control
   ═══════════════════════════════════════════════════ */

interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  sidebarBg?: string;
  sidebarText?: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { id: "corporate-navy", name: "Navy Protocol", primary: "#1e3a5f", accent: "#5b8fb9" },
  { id: "tech-blue", name: "Cyber Blue", primary: "#1a73e8", accent: "#5f9ea0" },
  { id: "forest-green", name: "Bio Green", primary: "#1b5e20", accent: "#4caf50" },
  { id: "sunset-warm", name: "Solar Flare", primary: "#d84315", accent: "#ff8a65" },
  { id: "midnight-purple", name: "Neural Void", primary: "#4a148c", accent: "#9c27b0" },
  { id: "classic-black", name: "Monolith", primary: "#2c3e50", accent: "#7f8c8d" },
  { id: "ocean-teal", name: "Deep Drift", primary: "#006064", accent: "#00bcd4" },
  { id: "wine-red", name: "Vortex Red", primary: "#7b1fa2", accent: "#ce93d8" },
  { id: "slate-modern", name: "Kinetic Slate", primary: "#37474f", accent: "#78909c" },
  { id: "emerald-pro", name: "Vector Emerald", primary: "#00695c", accent: "#26a69a" },
];

const FONT_OPTIONS = [
  { id: "inter", name: "Inter (Technical)", value: "'Inter', sans-serif" },
  { id: "roboto", name: "Roboto (Modern)", value: "'Roboto', sans-serif" },
  { id: "georgia", name: "Georgia (Classic)", value: "'Georgia', serif" },
  { id: "merriweather", name: "Merriweather (Academic)", value: "'Merriweather', serif" },
  { id: "lato", name: "Lato (Refined)", value: "'Lato', sans-serif" },
  { id: "poppins", name: "Poppins (Geometric)", value: "'Poppins', sans-serif" },
  { id: "source-serif", name: "Source Serif (Executive)", value: "'Source Serif 4', serif" },
];

interface ThemePickerProps {
  theme: ResumeTheme;
  onChange: (updates: Partial<ResumeTheme>) => void;
  preview?: React.ReactNode;
}

export default function ThemePicker({ theme, onChange, preview }: ThemePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  // ESC to close + lock body scroll while the modal is open.
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showModal]);

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

  const subtitle = activePreset ? `${activePreset.name} active` : "Tune colors, fonts, and density.";

  return (
    <>
      {/* Slim card - always visible, opens the modal */}
      <button
        onClick={() => setShowModal(true)}
        className="group w-full flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 dark:border-white/[0.05] bg-surface-0 dark:bg-white/[0.03] p-2.5 text-left transition-all hover:border-brand-500/30 hover:bg-zinc-100/60 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Palette className="w-4 h-4 text-brand-400" />
          </div>
          <div className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wide truncate text-zinc-900 dark:text-white">Visual DNA</span>
            <span className="block text-[10px] text-zinc-500 mt-0.5 truncate">{subtitle}</span>
          </div>
        </div>
        <CaretRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-400 transition-colors flex-shrink-0" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/[0.08] bg-surface-50 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-white/[0.05] sticky top-0 bg-surface-50 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-brand-400" />
                </div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Visual DNA</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-[1.1fr_1fr] gap-6">
              {/* Left: controls */}
              <div className="space-y-6">
                {/* Presets */}
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">
                    Color Protocols
                  </p>
                  <div className="grid grid-cols-5 gap-2.5">
                    {COLOR_PRESETS.map((preset) => {
                      const isActive = activePreset?.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          title={preset.name}
                          className={cn(
                            "relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-500",
                            isActive
                              ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-surface-0 scale-110 shadow-lg shadow-brand-500/20"
                              : "opacity-60 hover:opacity-100 hover:scale-105"
                          )}
                        >
                          <div className="absolute inset-0" style={{ backgroundColor: preset.primary }} />
                          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-tl-lg" style={{ backgroundColor: preset.accent }} />
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                              <Check className="w-4 h-4 text-zinc-900 dark:text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {activePreset && (
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-3 text-center">
                      {activePreset.name} Active
                    </p>
                  )}
                </div>

                {/* Custom Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCustom(!showCustom)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.05] text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {showCustom ? "Close Custom" : "Custom DNA"}
                  </button>
                </div>

                <AnimatePresence>
                  {showCustom && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 pt-2 overflow-hidden">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">Primary Spectrum</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={theme.primaryColor} onChange={(e) => onChange({ primaryColor: e.target.value, preset: undefined })} className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer" />
                            <div className="flex-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 p-2 rounded-lg text-center uppercase border border-zinc-200 dark:border-white/5">{theme.primaryColor}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">Accent Spectrum</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={theme.accentColor} onChange={(e) => onChange({ accentColor: e.target.value, preset: undefined })} className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer" />
                            <div className="flex-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 p-2 rounded-lg text-center uppercase border border-zinc-200 dark:border-white/5">{theme.accentColor}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Font Config */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <TextT className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Font Archetype</span>
                  </div>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => onChange({ fontFamily: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] text-[11px] font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-brand-500/40 transition-all cursor-pointer appearance-none"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.id} value={font.value} className="bg-surface-100">{font.name}</option>
                    ))}
                  </select>
                </div>

                {/* Geometry Config */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">Core Size</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min={9} max={14} step={0.5} value={theme.baseFontSize} onChange={(e) => onChange({ baseFontSize: Number(e.target.value) })} className="flex-1 accent-brand-500 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full" />
                      <span className="text-[10px] font-bold font-mono text-zinc-900 dark:text-white w-6 text-right">{theme.baseFontSize}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block ml-1">Flow Height</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min={1.1} max={1.8} step={0.05} value={theme.lineHeight} onChange={(e) => onChange({ lineHeight: Number(e.target.value) })} className="flex-1 accent-brand-500 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full" />
                      <span className="text-[10px] font-bold font-mono text-zinc-900 dark:text-white w-6 text-right">{theme.lineHeight.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: live preview */}
              {preview && (
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/[0.05] p-4 overflow-hidden flex items-start justify-center md:sticky md:top-24 md:self-start md:max-h-[70vh] md:overflow-y-auto">
                  <div className="w-full">{preview}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
