"use client";

import type { ReactNode } from "react";
import {
  IntlErrorCode,
  NextIntlClientProvider,
  type AbstractIntlMessages,
} from "next-intl";

import { DEFAULT_TIME_ZONE } from "@/i18n/config";

type IntlProviderProps = {
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
};

export function IntlProvider({
  locale,
  messages,
  children,
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={DEFAULT_TIME_ZONE}
      onError={(error) => {
        if (error.code === IntlErrorCode.MISSING_MESSAGE) {
          return;
        }

        console.error(error);
      }}
      getMessageFallback={({ namespace, key }) =>
        namespace ? `${namespace}.${key}` : key
      }
    >
      {children}
    </NextIntlClientProvider>
  );
}
