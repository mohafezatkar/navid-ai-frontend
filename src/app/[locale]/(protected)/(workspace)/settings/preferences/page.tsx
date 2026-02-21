"use client";

import { useTranslations } from "next-intl";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { PreferencesForm } from "@/app/[locale]/(protected)/(workspace)/settings/components/preferences-form";
import { useModelsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-models-query";
import { usePreferencesQuery } from "@/app/[locale]/(protected)/(workspace)/settings/hooks/use-preferences-query";

export default function PreferencesPage() {
  const t = useTranslations();
  const modelsQuery = useModelsQuery();
  const preferencesQuery = usePreferencesQuery();
  const isLoading = modelsQuery.isLoading || preferencesQuery.isLoading;
  const isError = modelsQuery.isError || preferencesQuery.isError;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.settings.preferencesTitle")}
        description={t("pages.settings.preferencesDescription")}
      />

      {isLoading ? <LoadingState label={t("status.loadingPreferences")} /> : null}

      {isError ? (
        <ErrorState
          title={t("errors.settings.failedLoadPreferencesTitle")}
          description={t("errors.settings.failedLoadPreferencesDescription")}
          onRetry={() => {
            void modelsQuery.refetch();
            void preferencesQuery.refetch();
          }}
        />
      ) : null}

      {modelsQuery.data && preferencesQuery.data ? (
        <SectionCard
          title={t("pages.settings.preferencesCardTitle")}
          description={t("pages.settings.preferencesCardDescription")}
        >
          <PreferencesForm
            initialValues={preferencesQuery.data}
            models={modelsQuery.data}
          />
        </SectionCard>
      ) : null}
    </div>
  );
}


