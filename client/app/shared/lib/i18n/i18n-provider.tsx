"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  messages,
  SUPPORTED_LOCALES,
  type AppLocale,
} from "./messages";

const LOCALE_STORAGE_KEY = "game-hub-locale";

type TranslateFn = (key: string, fallback?: string) => string;

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isSupportedLocale(locale: string): locale is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

function normalizeLocale(locale: string | null | undefined): AppLocale {
  if (!locale) {
    return DEFAULT_LOCALE;
  }

  if (isSupportedLocale(locale)) {
    return locale;
  }

  const matchedLocale = SUPPORTED_LOCALES.find((item) =>
    locale.toLowerCase().startsWith(item.toLowerCase().split("-")[0]),
  );

  return matchedLocale ?? DEFAULT_LOCALE;
}

function resolveMessage(locale: AppLocale, key: string) {
  return key.split(".").reduce<unknown>((current, part) => {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    return (current as Record<string, unknown>)[part];
  }, messages[locale]);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    const storedLocale =
      typeof window !== "undefined"
        ? window.localStorage.getItem(LOCALE_STORAGE_KEY)
        : null;
    const browserLocale =
      typeof navigator !== "undefined" ? navigator.language : null;

    return normalizeLocale(storedLocale ?? browserLocale);
  });

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    }
  }, []);

  const t = useCallback<TranslateFn>(
    (key, fallback) => {
      const value = resolveMessage(locale, key);
      return typeof value === "string" ? value : (fallback ?? key);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n 必须在 I18nProvider 内使用");
  }

  return context;
}

export type { TranslateFn };
