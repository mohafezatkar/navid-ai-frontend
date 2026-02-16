import { delay, http, HttpResponse } from "msw";

import {
  forgotPasswordInputSchema,
  loginInputSchema,
  resetPasswordInputSchema,
  signupInputSchema,
} from "@/lib/contracts";
import { API_PREFIX } from "@/lib/api/constants";
import { mockDb } from "@/mocks/data/db";
import { asMockErrorResponse } from "@/mocks/handlers/utils";

const apiPath = (path: string) => `${API_PREFIX}${path}`;

export const authHandlers = [
  http.get(apiPath("/auth/me"), async () => {
    await delay(120);
    return HttpResponse.json(mockDb.auth.me());
  }),

  http.post(apiPath("/auth/login"), async ({ request }) => {
    try {
      await delay(300);
      const body = loginInputSchema.parse(await request.json());
      const session = mockDb.auth.login(body);
      return HttpResponse.json(session);
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/auth/signup"), async ({ request }) => {
    try {
      await delay(320);
      const body = signupInputSchema.parse(await request.json());
      const session = mockDb.auth.signup(body);
      return HttpResponse.json(session, { status: 201 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/auth/logout"), async () => {
    await delay(100);
    mockDb.auth.logout();
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(apiPath("/auth/forgot-password"), async ({ request }) => {
    try {
      await delay(220);
      forgotPasswordInputSchema.parse(await request.json());
      mockDb.auth.forgotPassword();
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/auth/reset-password"), async ({ request }) => {
    try {
      await delay(220);
      const body = resetPasswordInputSchema.parse(await request.json());
      mockDb.auth.resetPassword(body);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/auth/google/start"), async () => {
    await delay(260);
    const session = mockDb.auth.googleStart();
    return HttpResponse.json(session);
  }),
];
