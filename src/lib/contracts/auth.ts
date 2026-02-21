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

export const signupVerificationSchema = z.object({
  channel: z.literal("email"),
  codeLength: z.number().int().positive(),
  expiresAt: z.string().datetime(),
  resendAvailableAt: z.string().datetime(),
});

export const signupStartResponseSchema = z.object({
  signupToken: z.string(),
  email: z.email(),
  verification: signupVerificationSchema,
});

export const signupVerifyCodeInputSchema = z.object({
  signupToken: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
});

export const signupVerifyCodeResponseSchema = z.object({
  signupToken: z.string(),
  emailVerified: z.boolean(),
});

export const signupResendCodeInputSchema = z.object({
  signupToken: z.string().min(1),
});

export const signupCompleteProfileInputSchema = z.object({
  signupToken: z.string().min(1),
  fullName: z.string().trim().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const forgotPasswordInputSchema = z.object({
  email: z.email(),
});

export const resetPasswordInputSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(8),
});

export type Session = z.infer<typeof sessionSchema>;
export type SignupVerification = z.infer<typeof signupVerificationSchema>;
export type SignupStartResponse = z.infer<typeof signupStartResponseSchema>;
export type SignupVerifyCodeResponse = z.infer<typeof signupVerifyCodeResponseSchema>;
