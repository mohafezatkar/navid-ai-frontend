import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LandingPage } from "@/app/[locale]/(marketing)/landing";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("common.appName"),
    description: t("pages.landing.heroDescription"),
  };
}

export default function HomePage() {
  return <LandingPage />;
}



