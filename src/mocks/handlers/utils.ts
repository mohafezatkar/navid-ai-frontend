import { HttpResponse } from "msw";

import { MockHttpError } from "@/mocks/data/errors";

export function asMockErrorResponse(error: unknown): Response {
  if (error instanceof MockHttpError) {
    return HttpResponse.json(
      {
        message: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status },
    );
  }

  return HttpResponse.json(
    {
      message: "Unexpected mock error.",
      code: "UNEXPECTED",
    },
    { status: 500 },
  );
}
