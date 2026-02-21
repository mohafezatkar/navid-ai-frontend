"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getProfile, updateProfile } from "@/app/[locale]/(protected)/(workspace)/settings/services/settingsService";

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.settings.profile(),
    queryFn: getProfile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.settings.profile(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.session(),
        }),
      ]);
    },
  });
}

