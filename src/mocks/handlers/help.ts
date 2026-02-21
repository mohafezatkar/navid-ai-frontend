import { delay, http, HttpResponse } from "msw";

import { API_PREFIX } from "@/lib/api/config";
import { mockDb } from "@/mocks/data/db";
import { asMockErrorResponse } from "@/mocks/handlers/utils";

const apiPath = (path: string) => `${API_PREFIX}${path}`;

export const helpHandlers = [
  http.get(apiPath("/help/articles"), async () => {
    try {
      await delay(120);
      return HttpResponse.json(mockDb.help.listArticles());
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),
];
