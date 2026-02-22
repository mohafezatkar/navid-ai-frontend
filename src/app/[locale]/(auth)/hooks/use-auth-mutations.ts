"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  signupCompleteProfile,
  signupResendCode,
  signupStart,
  signupVerifyCode,
} from "@/app/[locale]/(auth)/services/authService";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.auth.session(),
      });
    },
  });
}

type UseSignupCompleteProfileMutationOptions = {
  invalidateSessionOnSuccess?: boolean;
};

export function useSignupStartMutation() {
  return useMutation({
    mutationFn: signupStart,
  });
}

export function useSignupVerifyCodeMutation() {
  return useMutation({
    mutationFn: signupVerifyCode,
  });
}

export function useSignupResendCodeMutation() {
  return useMutation({
    mutationFn: signupResendCode,
  });
}

export function useSignupCompleteProfileMutation(
  options?: UseSignupCompleteProfileMutationOptions,
) {
  const queryClient = useQueryClient();
  const invalidateSessionOnSuccess = options?.invalidateSessionOnSuccess ?? true;

  return useMutation({
    mutationFn: signupCompleteProfile,
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
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: queryKeys.chat.conversations() });
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
    mutationFn: forgotPassword,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

