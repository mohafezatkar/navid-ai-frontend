"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ThemeMode } from "@/lib/contracts";
import { queryKeys } from "@/lib/query-keys";
import { getPreferences, updatePreferences } from "@/app/[locale]/(protected)/(workspace)/settings/services/settingsService";

type Preferences = {
  theme: ThemeMode;
  defaultModelId: string;
};

export function usePreferencesQuery() {
  return useQuery({
    queryKey: queryKeys.settings.preferences(),
    queryFn: getPreferences,
  });
}

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePreferences,
    onMutate: async (nextPreferences: Preferences) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.settings.preferences(),
      });
      const previousPreferences = queryClient.getQueryData<Preferences>(
        queryKeys.settings.preferences(),
      );
      queryClient.setQueryData(queryKeys.settings.preferences(), nextPreferences);
      return { previousPreferences };
    },
    onError: (_error, _next, context) => {
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          queryKeys.settings.preferences(),
          context.previousPreferences,
        );
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.settings.preferences(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.session(),
        }),
      ]);
    },
  });
}

