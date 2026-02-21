"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/app/[locale]/(auth)/hooks/use-session-query";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

type RequireSessionProps = {
  children: React.ReactNode;
};

export function RequireSession({ children }: RequireSessionProps) {
  const t = useTranslations("status");
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = useSessionQuery();

  React.useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`${routes.auth.login}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, pathname, router, session]);

  if (isLoading) {
    return <LoadingState label={t("loadingWorkspace")} fullScreen />;
  }

  if (!session) {
    return <LoadingState label={t("redirectingToSignIn")} fullScreen />;
  }

  return <>{children}</>;
}

