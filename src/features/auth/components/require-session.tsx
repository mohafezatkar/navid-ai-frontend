"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { LoadingState } from "@/components/shared/loading-state";
import { useSessionQuery } from "@/features/auth/hooks/use-session-query";

type RequireSessionProps = {
  children: React.ReactNode;
};

export function RequireSession({ children }: RequireSessionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = useSessionQuery();

  React.useEffect(() => {
    if (!isLoading && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, pathname, router, session]);

  if (isLoading) {
    return <LoadingState label="Loading workspace..." fullScreen />;
  }

  if (!session) {
    return <LoadingState label="Redirecting to sign in..." fullScreen />;
  }

  return <>{children}</>;
}
