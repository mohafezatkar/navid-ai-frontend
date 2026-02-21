"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { type AppLocale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
};

const SUPPORTED_LOCALES: AppLocale[] = ["en", "fa"];

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const t = useTranslations("navigation");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-md border p-1", className)}>
      {SUPPORTED_LOCALES.map((nextLocale) => (
        <Button
          key={nextLocale}
          type="button"
          size="sm"
          variant={nextLocale === locale ? "secondary" : "ghost"}
          disabled={isPending}
          onClick={() =>
            startTransition(() => {
              router.replace(pathname, { locale: nextLocale });
            })
          }
        >
          {nextLocale === "en" ? t("english") : t("persian")}
        </Button>
      ))}
    </div>
  );
}
