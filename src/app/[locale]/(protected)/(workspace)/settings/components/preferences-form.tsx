"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import type { Model } from "@/lib/api/types";
import type { ThemeMode } from "@/lib/contracts";
import { ModelSelector } from "@/app/[locale]/(protected)/(workspace)/chat/components/model-selector";
import { ThemeToggle } from "@/app/[locale]/(protected)/(workspace)/settings/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useUpdatePreferencesMutation } from "@/app/[locale]/(protected)/(workspace)/settings/hooks/use-preferences-query";

type PreferencesFormProps = {
  initialValues: {
    theme: ThemeMode;
    defaultModelId: string;
  };
  models: Model[];
};

export function PreferencesForm({ initialValues, models }: PreferencesFormProps) {
  const t = useTranslations();
  const { setTheme } = useTheme();
  const mutation = useUpdatePreferencesMutation();
  const [theme, setThemeValue] = React.useState<ThemeMode>(initialValues.theme);
  const [defaultModelId, setDefaultModelId] = React.useState(initialValues.defaultModelId);

  React.useEffect(() => {
    setThemeValue(initialValues.theme);
    setDefaultModelId(initialValues.defaultModelId);
  }, [initialValues.defaultModelId, initialValues.theme]);

  const onSubmit = async () => {
    await mutation.mutateAsync({
      theme,
      defaultModelId,
    });
    setTheme(theme);
    toast.success(t("status.preferencesSaved"));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">{t("common.theme")}</p>
        <ThemeToggle
          value={theme}
          onChange={(value) => {
            setThemeValue(value);
            setTheme(value);
          }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{t("common.defaultModel")}</p>
        <ModelSelector models={models} value={defaultModelId} onChange={setDefaultModelId} />
      </div>

      <Button onClick={() => void onSubmit()} disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
        {t("actions.savePreferences")}
      </Button>
    </div>
  );
}


