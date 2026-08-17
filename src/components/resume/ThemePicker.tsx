"use client";

import { useState, useEffect } from "react";
import { Check, CaretRight, Palette, SlidersHorizontal, TextT, X } from '@phosphor-icons/react';
import { cn } from "@/lib/utils";
import type { ResumeTheme } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";

/* Theme picker — colors, fonts, and spacing */

interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  sidebarBg?: string;
  sidebarText?: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { id: "corporate-navy", name: "Navy", primary: "#1e3a5f", accent: "#5b8fb9" },
  { id: "tech-blue", name: "Blue", primary: "#1a73e8", accent: "#5f9ea0" },
  { id: "forest-green", name: "Green", primary: "#1b5e20", accent: "#4caf50" },
  { id: "sunset-warm", name: "Orange", primary: "#d84315", accent: "#ff8a65" },
  { id: "midnight-purple", name: "Purple", primary: "#4a148c", accent: "#9c27b0" },
  { id: "classic-black", name: "Charcoal", primary: "#2c3e50", accent: "#7f8c8d" },
  { id: "ocean-teal", name: "Teal", primary: "#006064", accent: "#00bcd4" },
  { id: "wine-red", name: "Burgundy", primary: "#7b1fa2", accent: "#ce93d8" },
  { id: "slate-modern", name: "Slate", primary: "#37474f", accent: "#78909c" },
  { id: "emerald-pro", name: "Emerald", primary: "#00695c", accent: "#26a69a" },
];

const FONT_OPTIONS = [
  { id: "inter", name: "Inter", value: "'Inter', sans-serif" },
  { id: "roboto", name: "Roboto", value: "'Roboto', sans-serif" },
  { id: "georgia", name: "Georgia", value: "'Georgia', serif" },
  { id: "merriweather", name: "Merriweather", value: "'Merriweather', serif" },
  { id: "lato", name: "Lato", value: "'Lato', sans-serif" },
  { id: "poppins", name: "Poppins", value: "'Poppins', sans-serif" },
  { id: "source-serif", name: "Source Serif", value: "'Source Serif 4', serif" },
];

interface ThemePickerProps {
  theme: ResumeTheme;
  onChange: (updates: Partial<ResumeTheme>) => void;
  preview?: React.ReactNode;
  className?: string;
}

export default function ThemePicker({ theme, onChange, preview, className }: ThemePickerProps) {
  const { t } = useTranslation();
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

  return (
    <>
      {/* Compact card - matches template select height */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={cn(
          "group flex items-center justify-between gap-2 rounded-lg border border-surface-200 bg-surface-50 px-2.5 py-1.5 text-left transition-all hover:border-brand-500/30 hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 min-w-0 shadow-2xs",
          className
        )}
        title={t("resumeStudio.modes.design") || "Open Design & Theme Settings"}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-5 h-5 rounded-md bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Palette className="w-3 h-3 text-brand-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider truncate text-surface-400">{t("resumeStudio.modes.design")}</span>
        </div>
        <CaretRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-brand-400 transition-colors flex-shrink-0" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/[0.08] bg-surface-50 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-surface-200 sticky top-0 bg-surface-50 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-brand-400" />
                </div>
                <h2 className="text-base font-bold text-surface-400 uppercase tracking-widest">{t("resumeStudio.modes.design")}</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-surface-300 hover:text-surface-400 hover:bg-surface-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] gap-6 items-start">
              {/* Left: controls */}
              <div className="space-y-6 min-w-0">
                {/* Presets */}
                <div>
                  <p className="text-[10px] font-bold text-surface-300 uppercase tracking-widest mb-3 ml-1">
                    {t("resumeStudio.stylePanel.colorPalette")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLOR_PRESETS.map((preset) => {
                      const isActive = activePreset?.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handlePresetSelect(preset)}
                          title={preset.name}
                          className={cn(
                            "relative w-7 h-7 rounded-md overflow-hidden transition-all shrink-0",
                            isActive
                              ? "ring-2 ring-brand-500 ring-offset-1 ring-offset-surface-0"
                              : "opacity-70 hover:opacity-100"
                          )}
                        >
                          <div className="absolute inset-0" style={{ backgroundColor: preset.primary }} />
                          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-tl-sm" style={{ backgroundColor: preset.accent }} />
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {activePreset && (
                    <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mt-3">
                      {activePreset.name}
                    </p>
                  )}
                </div>

                {/* Custom Toggles */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCustom(!showCustom)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-surface-50 border border-surface-200 text-[10px] font-bold uppercase tracking-widest text-surface-300 hover:text-surface-400 transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {showCustom ? t("resumeStudio.dialogs.cancel") : t("resumeStudio.stylePanel.customColors")}
                  </button>
                </div>

                <AnimatePresence>
                  {showCustom && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 pt-2 overflow-hidden">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block ml-1">{t("resumeStudio.stylePanel.primaryColor")}</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={theme.primaryColor} onChange={(e) => onChange({ primaryColor: e.target.value, preset: undefined })} className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer" />
                            <div className="flex-1 text-[10px] font-mono text-surface-300 bg-surface-100 p-2 rounded-lg text-center uppercase border border-surface-200">{theme.primaryColor}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block ml-1">{t("resumeStudio.stylePanel.accentColor")}</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={theme.accentColor} onChange={(e) => onChange({ accentColor: e.target.value, preset: undefined })} className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer" />
                            <div className="flex-1 text-[10px] font-mono text-surface-300 bg-surface-100 p-2 rounded-lg text-center uppercase border border-surface-200">{theme.accentColor}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Font Config */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-surface-300">
                    <TextT className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t("resumeStudio.stylePanel.fontFamily")}</span>
                  </div>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => onChange({ fontFamily: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-50 border border-surface-200 text-[11px] font-bold uppercase tracking-widest text-surface-400 focus:outline-none focus:border-brand-500/40 transition-all cursor-pointer appearance-none"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.id} value={font.value} className="bg-surface-100">{font.name}</option>
                    ))}
                  </select>
                </div>

                {/* Geometry Config */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block ml-1">{t("resumeStudio.stylePanel.baseFontSize")}</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min={9} max={14} step={0.5} value={theme.baseFontSize} onChange={(e) => onChange({ baseFontSize: Number(e.target.value) })} className="flex-1 accent-brand-500 h-1.5 bg-surface-200 rounded-full" />
                      <span className="text-[10px] font-bold font-mono text-surface-400 w-6 text-right">{theme.baseFontSize}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-bold text-surface-300 uppercase tracking-widest block ml-1">{t("resumeStudio.stylePanel.lineHeight")}</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min={1.1} max={1.8} step={0.05} value={theme.lineHeight} onChange={(e) => onChange({ lineHeight: Number(e.target.value) })} className="flex-1 accent-brand-500 h-1.5 bg-surface-200 rounded-full" />
                      <span className="text-[10px] font-bold font-mono text-surface-400 w-6 text-right">{theme.lineHeight.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: live preview */}
              {preview && (
                <div className="min-w-0 w-full rounded-2xl bg-surface-100/50 border border-surface-200/80 p-4 shadow-inner overflow-hidden flex flex-col items-center justify-start max-h-[75vh] overflow-y-auto">
                  <div className="w-full flex justify-center">{preview}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
