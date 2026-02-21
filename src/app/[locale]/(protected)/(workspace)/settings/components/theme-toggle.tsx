"use client";

import { useTranslations } from "next-intl";

import type { ThemeMode } from "@/lib/contracts";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
};

const OPTIONS: ThemeMode[] = ["light", "dark", "system"];

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  const t = useTranslations();

  return (
    <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === option
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(option)}
        >
          {option === "light"
            ? t("pages.settings.themeLight")
            : option === "dark"
              ? t("pages.settings.themeDark")
              : t("pages.settings.themeSystem")}
        </button>
      ))}
    </div>
  );
}
