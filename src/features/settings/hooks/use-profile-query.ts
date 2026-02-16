"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.settings.profile(),
    queryFn: apiClient.settings.getProfile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.settings.updateProfile,
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
