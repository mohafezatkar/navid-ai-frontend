"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/app/[locale]/(auth)/hooks/use-session-query";

type RequireOnboardingCompleteProps = {
  children: React.ReactNode;
};

export function RequireOnboardingComplete({
  children,
}: RequireOnboardingCompleteProps) {
  const t = useTranslations("status");
  const { data: session, isLoading } = useSessionQuery();

  if (isLoading) {
    return <LoadingState label={t("preparingWorkspace")} fullScreen />;
  }

  if (!session) {
    return <LoadingState label={t("checkingAccess")} fullScreen />;
  }

  // TODO: Re-enable onboarding completion guard and redirect incomplete users to routes.workspace.onboarding.

  return <>{children}</>;
}

