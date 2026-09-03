"use client";

import React from "react";
import { Globe, Translate } from "@phosphor-icons/react";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "compact" | "pill" | "select" | "inline";
  className?: string;
}

export default function LanguageSwitcher({
  variant = "compact",
  className,
}: LanguageSwitcherProps) {
  const { locale, setLocale, toggleLocale, isZh, isEn, mounted } = useTranslation();

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-7 w-16 rounded-md bg-surface-100 animate-pulse",
          className
        )}
      />
    );
  }

  if (variant === "select") {
    return (
      <div className={cn("relative inline-block w-full", className)}>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as "en" | "zh")}
          aria-label={isZh ? "选择界面语言" : "Select Interface Language"}
          className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-sm text-surface-400 focus:outline-none focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/20 transition-all appearance-none cursor-pointer"
        >
          <option value="en">English (US)</option>
          <option value="zh">简体中文 (Chinese)</option>
        </select>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-between p-2 rounded-lg border border-surface-200 bg-surface-50/50", className)}>
        <div className="flex items-center gap-2 text-xs font-medium text-surface-400">
          <Globe weight="regular" className="w-4 h-4 text-surface-300" />
          <span>Language / 语言</span>
        </div>
        <div className="flex items-center gap-1 bg-surface-100 p-0.5 rounded-md border border-surface-200">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={cn(
              "px-2 py-0.5 text-[11px] font-mono font-medium rounded transition-all",
              isEn
                ? "bg-surface-0 text-surface-400 shadow-xs font-bold"
                : "text-surface-300 hover:text-surface-400"
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLocale("zh")}
            className={cn(
              "px-2 py-0.5 text-[11px] font-mono font-medium rounded transition-all",
              isZh
                ? "bg-surface-0 text-surface-400 shadow-xs font-bold"
                : "text-surface-300 hover:text-surface-400"
            )}
          >
            中文
          </button>
        </div>
      </div>
    );
  }

  if (variant === "pill") {
    return (
      <div className={cn("inline-flex items-center gap-1 bg-surface-100 p-1 rounded-lg border border-surface-200", className)}>
        <button
          type="button"
          onClick={() => setLocale("en")}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all",
            isEn
              ? "bg-surface-0 text-surface-400 shadow-xs font-semibold"
              : "text-surface-300 hover:text-surface-400"
          )}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLocale("zh")}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all",
            isZh
              ? "bg-surface-0 text-surface-400 shadow-xs font-semibold"
              : "text-surface-300 hover:text-surface-400"
          )}
        >
          简体中文
        </button>
      </div>
    );
  }

  // Compact variant (default for Topbar & Navbar)
  return (
    <button
      type="button"
      onClick={toggleLocale}
      title={isZh ? "切换到 English" : "Switch to 简体中文"}
      aria-label={isZh ? "切换语言" : "Switch Language"}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-surface-200 bg-surface-0 hover:bg-surface-100 text-surface-400 text-xs font-mono font-semibold transition-all duration-150 active:scale-[0.98] group",
        className
      )}
    >
      <Translate weight="bold" className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-400 transition-colors" />
      <span className="tracking-tight text-[11px]">
        {isEn ? "中文" : "EN"}
      </span>
    </button>
  );
}
