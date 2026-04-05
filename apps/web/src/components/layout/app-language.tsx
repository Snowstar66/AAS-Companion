"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { appChromeContent, type AppLanguage } from "@/components/layout/app-language.data";

const APP_LANGUAGE_STORAGE_KEY = "aas-app-language";
const LEGACY_HELP_LANGUAGE_STORAGE_KEY = "aas-help-language";

type AppLanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const AppLanguageContext = createContext<AppLanguageContextValue>({
  language: "en",
  setLanguage: () => {}
});

function readStoredLanguage() {
  const storedLanguage = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
  if (storedLanguage === "en" || storedLanguage === "sv") {
    return storedLanguage;
  }

  const legacyLanguage = window.localStorage.getItem(LEGACY_HELP_LANGUAGE_STORAGE_KEY);
  if (legacyLanguage === "en" || legacyLanguage === "sv") {
    return legacyLanguage;
  }

  return "en";
}

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    setLanguage(readStoredLanguage());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
    window.localStorage.setItem(LEGACY_HELP_LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage
    }),
    [language]
  );

  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
  return useContext(AppLanguageContext);
}

export function useAppChromeLanguage() {
  const { language, setLanguage } = useAppLanguage();

  return {
    language,
    setLanguage,
    content: appChromeContent[language]
  };
}
