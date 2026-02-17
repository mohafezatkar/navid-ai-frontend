"use client";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { useProfileQuery } from "@/features/settings/hooks/use-profile-query";

export default function ProfileSettingsPage() {
  const profileQuery = useProfileQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your account identity and display preferences."
      />

      {profileQuery.isLoading ? <LoadingState label="Loading profile..." /> : null}

      {profileQuery.isError ? (
        <ErrorState
          title="Failed to load profile"
          description="Refresh this page and try again."
          onRetry={() => void profileQuery.refetch()}
        />
      ) : null}

      {profileQuery.data ? (
        <SectionCard
          title="Account profile"
          description="Your email is managed by your authentication provider."
        >
          <ProfileForm initialValues={profileQuery.data} />
        </SectionCard>
      ) : null}
    </div>
  );
}

