"use client";

import { useTranslations } from "next-intl";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProfileForm } from "@/app/[locale]/(protected)/(workspace)/settings/components/profile-form";
import { useProfileQuery } from "@/app/[locale]/(protected)/(workspace)/settings/hooks/use-profile-query";

export default function ProfileSettingsPage() {
  const t = useTranslations();
  const profileQuery = useProfileQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.settings.profileTitle")}
        description={t("pages.settings.profileDescription")}
      />

      {profileQuery.isLoading ? <LoadingState label={t("status.loadingProfile")} /> : null}

      {profileQuery.isError ? (
        <ErrorState
          title={t("errors.settings.failedLoadProfileTitle")}
          description={t("errors.settings.failedLoadProfileDescription")}
          onRetry={() => void profileQuery.refetch()}
        />
      ) : null}

      {profileQuery.data ? (
        <SectionCard
          title={t("pages.settings.profileCardTitle")}
          description={t("pages.settings.profileCardDescription")}
        >
          <ProfileForm initialValues={profileQuery.data} />
        </SectionCard>
      ) : null}
    </div>
  );
}


