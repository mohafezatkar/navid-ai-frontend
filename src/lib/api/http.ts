import { z } from "zod";

import { toApiPath } from "@/lib/api/constants";

const apiErrorSchema = z.object({
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(toApiPath(path), {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(data);
    const message =
      parsed.success && parsed.data.message
        ? parsed.data.message
        : `Request failed with status ${response.status}`;
    throw new ApiError(
      message,
      response.status,
      parsed.success ? parsed.data.code : undefined,
      parsed.success ? parsed.data.details : data,
    );
  }

  return data as TResponse;
}
