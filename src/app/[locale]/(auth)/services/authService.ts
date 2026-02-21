import type { Session, SignupStartResponse, SignupVerifyCodeResponse } from "@/lib/api/types";
import { IS_MOCK_MODE } from "@/lib/api/config";
import { fetchJson } from "@/lib/api/fetch-json";
import {
  sessionSchema,
  signupStartResponseSchema,
  signupVerifyCodeResponseSchema,
} from "@/lib/contracts";
import { routes } from "@/lib/routes";

export async function me(): Promise<Session | null> {
  const data = await fetchJson<Session | null>("/auth/me");
  if (!data) {
    return null;
  }
  return sessionSchema.parse(data);
}

export async function login(input: { email: string; password: string }): Promise<Session> {
  const data = await fetchJson<Session>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return sessionSchema.parse(data);
}

export async function signupStart(input: {
  email: string;
  password: string;
}): Promise<SignupStartResponse> {
  const data = await fetchJson<SignupStartResponse>("/auth/signup/start", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return signupStartResponseSchema.parse(data);
}

export async function signupVerifyCode(input: {
  signupToken: string;
  code: string;
}): Promise<SignupVerifyCodeResponse> {
  const data = await fetchJson<SignupVerifyCodeResponse>("/auth/signup/verify-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return signupVerifyCodeResponseSchema.parse(data);
}

export async function signupResendCode(input: { signupToken: string }): Promise<void> {
  await fetchJson<void>("/auth/signup/resend-code", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function signupCompleteProfile(input: {
  signupToken: string;
  fullName: string;
  birthDate: string;
}): Promise<Session> {
  const data = await fetchJson<Session>("/auth/signup/complete-profile", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return sessionSchema.parse(data);
}

export async function logout(): Promise<void> {
  await fetchJson<void>("/auth/logout", {
    method: "POST",
  });
}

export async function forgotPassword(input: { email: string }): Promise<void> {
  await fetchJson<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  await fetchJson<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function startGoogleOAuth(): void {
  if (!IS_MOCK_MODE) {
    if (typeof window !== "undefined") {
      window.location.assign(routes.auth.login);
    }
    return;
  }

  void fetchJson<Session>("/auth/google/start", {
    method: "POST",
  }).then(() => {
    if (typeof window !== "undefined") {
      window.location.assign(routes.workspace.chat);
    }
  }).catch(() => {
    if (typeof window !== "undefined") {
      window.location.assign(routes.auth.login);
    }
  });
}
