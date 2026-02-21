import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "fa"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof routing.locales)[number];

export const localeDirection: Record<AppLocale, "ltr" | "rtl"> = {
  en: "ltr",
  fa: "rtl",
};

const RTL_LANGUAGE_PREFIXES = ["fa", "ar", "he", "ur", "ps", "ku"] as const;

export function isRtlLanguage(locale: string): boolean {
  const normalized = locale.toLowerCase();
  return RTL_LANGUAGE_PREFIXES.some(
    (prefix) =>
      normalized === prefix ||
      normalized.startsWith(`${prefix}-`) ||
      normalized.startsWith(`${prefix}_`),
  );
}
