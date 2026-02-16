"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/features/auth/hooks/use-session-query";

type PublicOnlyGuardProps = {
  children: React.ReactNode;
};

export function PublicOnlyGuard({ children }: PublicOnlyGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = useSessionQuery();

  React.useEffect(() => {
    if (!session) {
      return;
    }

    const destination = session.onboardingComplete ? "/chat" : "/onboarding";
    if (pathname !== destination) {
      router.replace(destination);
    }
  }, [pathname, router, session]);

  if (isLoading) {
    return <LoadingState label="Checking session..." fullScreen />;
  }

  if (session) {
    return <LoadingState label="Redirecting..." fullScreen />;
  }

  return <>{children}</>;
}
