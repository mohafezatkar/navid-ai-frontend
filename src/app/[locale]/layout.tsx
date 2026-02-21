import type { ReactNode } from "react";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { isRtlLanguage, routing, type AppLocale } from "@/i18n/routing";
import { AppProviders } from "@/providers/app-providers";
import { IntlProvider } from "@/providers/intl-provider";
import { DocumentLocaleSync } from "@/components/shared/document-locale-sync";

const messageLoaders = {
  en: () => import("@/i18n/messages/en.json"),
  fa: () => import("@/i18n/messages/fa.json"),
} as const;

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await messageLoaders[locale as AppLocale]()).default;
  const dir = isRtlLanguage(locale) ? "rtl" : "ltr";

  return (
    <IntlProvider locale={locale} messages={messages}>
      <DocumentLocaleSync locale={locale} />
      <div lang={locale} dir={dir} className="min-h-screen">
        <AppProviders>{children}</AppProviders>
      </div>
    </IntlProvider>
  );
}
