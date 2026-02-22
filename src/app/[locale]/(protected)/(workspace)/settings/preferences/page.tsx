"use client";

import { useTranslations } from "next-intl";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { PreferencesForm } from "@/app/[locale]/(protected)/(workspace)/settings/components/preferences-form";
import { usePreferencesQuery } from "@/app/[locale]/(protected)/(workspace)/settings/hooks/use-preferences-query";

export default function PreferencesPage() {
  const t = useTranslations();
  const preferencesQuery = usePreferencesQuery();
  const isLoading = preferencesQuery.isLoading;
  const isError = preferencesQuery.isError;

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
            void preferencesQuery.refetch();
          }}
        />
      ) : null}

      {preferencesQuery.data ? (
        <SectionCard
          title={t("pages.settings.preferencesCardTitle")}
          description={t("pages.settings.preferencesCardDescription")}
        >
          <PreferencesForm initialValues={preferencesQuery.data} />
        </SectionCard>
      ) : null}
    </div>
  );
}


