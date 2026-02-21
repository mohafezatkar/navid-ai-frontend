"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  const t = useTranslations();
  const resolvedTitle = title ?? t("errors.generic.sectionTitle");
  const resolvedDescription =
    description ?? t("errors.generic.sectionDescription");

  return (
    <div className="flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center">
      <AlertCircle className="size-5 text-destructive" />
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{resolvedTitle}</h3>
        <p className="max-w-xl text-sm text-muted-foreground">{resolvedDescription}</p>
      </div>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {t("actions.tryAgain")}
        </Button>
      ) : null}
    </div>
  );
}
