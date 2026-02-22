"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/app/[locale]/(auth)/hooks/use-session-query";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

type PublicOnlyGuardProps = {
  children: React.ReactNode;
};

export function PublicOnlyGuard({ children }: PublicOnlyGuardProps) {
  const t = useTranslations("status");
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = useSessionQuery();

  React.useEffect(() => {
    if (!session) {
      return;
    }

    // TODO: Route users with incomplete onboarding back to routes.workspace.onboarding once onboarding is re-enabled.
    const destination = routes.workspace.chat;
    if (pathname !== destination) {
      router.replace(destination);
    }
  }, [pathname, router, session]);

  if (isLoading) {
    return <LoadingState label={t("checkingSession")} fullScreen />;
  }

  if (session) {
    return <LoadingState label={t("redirecting")} fullScreen />;
  }

  return <>{children}</>;
}

