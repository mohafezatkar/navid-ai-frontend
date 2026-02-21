"use client";

import { useTranslations } from "next-intl";

import type { Model } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ModelSelectorProps = {
  models: Model[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  triggerClassName?: string;
};

export function ModelSelector({
  models,
  value,
  onChange,
  disabled,
  placeholder,
  triggerClassName,
}: ModelSelectorProps) {
  const t = useTranslations();
  const resolvedPlaceholder = placeholder ?? t("actions.selectModel");

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn("w-[220px]", triggerClassName)}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
