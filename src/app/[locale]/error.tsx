"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: ErrorPageProps) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("errors.generic.rootTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("errors.generic.rootDescription")}
        </p>
        <Button onClick={reset}>{t("actions.tryAgain")}</Button>
      </div>
    </main>
  );
}
