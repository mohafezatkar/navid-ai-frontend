"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/features/auth/hooks/use-session-query";

type RequireOnboardingCompleteProps = {
  children: React.ReactNode;
};

export function RequireOnboardingComplete({
  children,
}: RequireOnboardingCompleteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = useSessionQuery();

  React.useEffect(() => {
    if (isLoading || !session) {
      return;
    }

    if (!session.onboardingComplete && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [isLoading, pathname, router, session]);

  if (isLoading) {
    return <LoadingState label="Preparing workspace..." fullScreen />;
  }

  if (!session) {
    return <LoadingState label="Checking access..." fullScreen />;
  }

  if (!session.onboardingComplete) {
    return <LoadingState label="Redirecting to onboarding..." fullScreen />;
  }

  return <>{children}</>;
}
