"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/app/[locale]/(auth)/hooks/use-session-query";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

type RequireOnboardingCompleteProps = {
  children: React.ReactNode;
};

export function RequireOnboardingComplete({
  children,
}: RequireOnboardingCompleteProps) {
  const t = useTranslations("status");
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = useSessionQuery();

  React.useEffect(() => {
    if (isLoading || !session) {
      return;
    }

    if (!session.onboardingComplete && pathname !== routes.workspace.onboarding) {
      router.replace(routes.workspace.onboarding);
    }
  }, [isLoading, pathname, router, session]);

  if (isLoading) {
    return <LoadingState label={t("preparingWorkspace")} fullScreen />;
  }

  if (!session) {
    return <LoadingState label={t("checkingAccess")} fullScreen />;
  }

  if (!session.onboardingComplete) {
    return <LoadingState label={t("redirectingToOnboarding")} fullScreen />;
  }

  return <>{children}</>;
}

