"use client";

import type { ThemeMode } from "@/lib/contracts";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
};

const OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
