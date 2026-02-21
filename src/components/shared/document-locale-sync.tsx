"use client";

import { useEffect } from "react";

import { isRtlLanguage } from "@/i18n/routing";

type DocumentLocaleSyncProps = {
  locale: string;
};

export function DocumentLocaleSync({ locale }: DocumentLocaleSyncProps) {
  const dir = isRtlLanguage(locale) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.body.dataset.dir = dir;
  }, [dir, locale]);

  return null;
}
