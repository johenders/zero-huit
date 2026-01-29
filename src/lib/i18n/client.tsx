"use client";

import { createContext, useContext } from "react";
import type { Locale } from "./shared";

type I18nContextValue = {
  locale: Locale;
  dictionary: Record<string, string>;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Record<string, string>;
  children: React.ReactNode;
}) {
  const t = (key: string, fallback?: string) => dictionary[key] ?? fallback ?? key;

  return (
    <I18nContext.Provider value={{ locale, dictionary, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
