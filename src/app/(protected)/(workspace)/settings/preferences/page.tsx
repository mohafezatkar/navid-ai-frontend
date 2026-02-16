"use client";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { useModelsQuery } from "@/features/chat/hooks/use-models-query";
import { usePreferencesQuery } from "@/features/settings/hooks/use-preferences-query";

export default function PreferencesPage() {
  const modelsQuery = useModelsQuery();
  const preferencesQuery = usePreferencesQuery();
  const isLoading = modelsQuery.isLoading || preferencesQuery.isLoading;
  const isError = modelsQuery.isError || preferencesQuery.isError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Preferences"
        description="Configure app theme and your default conversation model."
      />

      {isLoading ? <LoadingState label="Loading preferences..." /> : null}

      {isError ? (
        <ErrorState
          title="Failed to load preferences"
          description="Refresh and try again."
          onRetry={() => {
            void modelsQuery.refetch();
            void preferencesQuery.refetch();
          }}
        />
      ) : null}

      {modelsQuery.data && preferencesQuery.data ? (
        <SectionCard title="Workspace defaults" description="These settings apply to new chats.">
          <PreferencesForm
            initialValues={preferencesQuery.data}
            models={modelsQuery.data}
          />
        </SectionCard>
      ) : null}
    </div>
  );
}
