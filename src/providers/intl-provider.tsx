"use client";

import type { ReactNode } from "react";
import {
  IntlErrorCode,
  NextIntlClientProvider,
  type AbstractIntlMessages,
} from "next-intl";

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
