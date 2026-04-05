"use client";

import type { ReactNode } from "react";
import { useAppChromeLanguage } from "@/components/layout/app-language";

type LocalizedTextProps = {
  en: ReactNode;
  sv: ReactNode;
};

export function LocalizedText({ en, sv }: LocalizedTextProps) {
  const { language } = useAppChromeLanguage();

  return <>{language === "sv" ? sv : en}</>;
}
