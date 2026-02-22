import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { hasLocale } from "next-intl";
import localFont from "next/font/local";

import { isRtlLanguage, routing } from "@/i18n/routing";
import "./globals.css";

const sfProDisplayFont = localFont({
  variable: "--font-sf-pro-display",
  src: [
    {
      path: "../../public/fonts/SFProDisplay/SFProDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/SFProDisplay/SFProDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/SFProDisplay/SFProDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/SFProDisplay/SFProDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const danaFont = localFont({
  variable: "--font-dana",
  src: [
    {
      path: "../../public/fonts/DanaFont/DanaFaNum-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/DanaFont/DanaFaNum-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/DanaFont/DanaFaNum-DemiBold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/DanaFont/DanaFaNum-Bold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Navid AI",
    template: "%s | Navid AI",
  },
  description: "Navid AI workspace.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

function resolveLocale(locale: string | null | undefined): string {
  if (locale && hasLocale(routing.locales, locale)) {
    return locale;
  }

  return routing.defaultLocale;
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale: requestedLocale } = await params;
  const locale = resolveLocale(requestedLocale);
  const dir = isRtlLanguage(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${sfProDisplayFont.variable} ${ibmPlexMono.variable} ${danaFont.variable}`}
      suppressHydrationWarning
    >
      <body data-dir={dir} className="antialiased">
        {children}
      </body>
    </html>
  );
}
