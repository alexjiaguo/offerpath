"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Locale, TranslationSchema } from "./types";
import { en } from "./locales/en";
import { zh } from "./locales/zh";

export type TranslationFunction = ((key: string) => string) & TranslationSchema;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: TranslationFunction;
  isZh: boolean;
  isEn: boolean;
  mounted: boolean;
}

const STORAGE_KEY = "offerpath-locale";

const dictionaries: Record<Locale, TranslationSchema> = {
  en,
  zh,
};

function createTranslationFunction(dict: TranslationSchema): TranslationFunction {
  const fn = ((key: string): string => {
    if (!key) return "";
    const parts = key.split(".");
    let current: unknown = dict;
    for (const part of parts) {
      if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof current === "string" ? current : key;
  }) as TranslationFunction;

  return Object.assign(fn, dict);
}

const defaultTranslation = createTranslationFunction(en);

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  toggleLocale: () => {},
  t: defaultTranslation,
  isZh: false,
  isEn: true,
  mounted: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (stored === "en" || stored === "zh") {
        setLocaleState(stored);
        document.documentElement.lang = stored;
      } else {
        // Detect browser language
        const browserLang = navigator.language.toLowerCase();
        const initialLocale: Locale = browserLang.startsWith("zh") ? "zh" : "en";
        setLocaleState(initialLocale);
        localStorage.setItem(STORAGE_KEY, initialLocale);
        document.documentElement.lang = initialLocale;
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const nextLocale: Locale = prev === "en" ? "zh" : "en";
      try {
        localStorage.setItem(STORAGE_KEY, nextLocale);
        document.documentElement.lang = nextLocale;
      } catch {
        /* ignore */
      }
      return nextLocale;
    });
  }, []);

  const contextValue = useMemo<LanguageContextType>(() => {
    const dict = dictionaries[locale] || en;
    return {
      locale,
      setLocale,
      toggleLocale,
      t: createTranslationFunction(dict),
      isZh: locale === "zh",
      isEn: locale === "en",
      mounted,
    };
  }, [locale, mounted, setLocale, toggleLocale]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
