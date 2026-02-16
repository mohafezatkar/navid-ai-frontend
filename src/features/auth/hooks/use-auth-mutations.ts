"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.auth.login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
  });
}

type UseSignupMutationOptions = {
  invalidateSessionOnSuccess?: boolean;
};

export function useSignupMutation(options?: UseSignupMutationOptions) {
  const queryClient = useQueryClient();
  const invalidateSessionOnSuccess = options?.invalidateSessionOnSuccess ?? true;

  return useMutation({
    mutationFn: apiClient.auth.signup,
    onSuccess: async () => {
      if (invalidateSessionOnSuccess) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.auth.session(),
        });
      }
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.auth.logout,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: queryKeys.chat.conversations() });
      queryClient.removeQueries({ queryKey: queryKeys.chat.models() });
      queryClient.removeQueries({ queryKey: queryKeys.settings.profile() });
      queryClient.removeQueries({ queryKey: queryKeys.settings.preferences() });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: apiClient.auth.forgotPassword,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: apiClient.auth.resetPassword,
  });
}
