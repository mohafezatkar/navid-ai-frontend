import { delay, http, HttpResponse } from "msw";

import { updatePreferencesInputSchema, updateProfileInputSchema } from "@/lib/contracts";
import { API_PREFIX } from "@/lib/api/config";
import { mockDb } from "@/mocks/data/db";
import { asMockErrorResponse } from "@/mocks/handlers/utils";

const apiPath = (path: string) => `${API_PREFIX}${path}`;

export const settingsHandlers = [
  http.get(apiPath("/settings/profile"), async () => {
    try {
      await delay(120);
      return HttpResponse.json(mockDb.settings.getProfile());
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.patch(apiPath("/settings/profile"), async ({ request }) => {
    try {
      await delay(200);
      const body = updateProfileInputSchema.parse(await request.json());
      mockDb.settings.updateProfile(body);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.get(apiPath("/settings/preferences"), async () => {
    try {
      await delay(120);
      return HttpResponse.json(mockDb.settings.getPreferences());
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.patch(apiPath("/settings/preferences"), async ({ request }) => {
    try {
      await delay(200);
      const body = updatePreferencesInputSchema.parse(await request.json());
      mockDb.settings.updatePreferences(body);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),
];
