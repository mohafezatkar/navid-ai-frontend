import { z } from "zod";

import { idSchema } from "@/lib/contracts/common";

export const sessionSchema = z.object({
  userId: idSchema,
  email: z.email(),
  name: z.string().nullable(),
  onboardingComplete: z.boolean(),
});

export const loginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const signupInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const forgotPasswordInputSchema = z.object({
  email: z.email(),
});

export const resetPasswordInputSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(8),
});

export type Session = z.infer<typeof sessionSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type SignupInput = z.infer<typeof signupInputSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;
