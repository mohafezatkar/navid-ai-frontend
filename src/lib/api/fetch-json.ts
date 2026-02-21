import { z } from "zod";
import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";

import { toApiPath } from "@/lib/api/config";
import { http } from "@/lib/http-client";

const apiErrorSchema = z.object({
  message: z.string().optional(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

const CSRF_ERROR_PATTERN = /csrf/i;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

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

function getRequestMethod(init?: RequestInit): string {
  return (init?.method ?? "GET").toUpperCase();
}

function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.split("=")[1] ?? "";
  return decodeURIComponent(value);
}

function normalizeHeaders(initHeaders: HeadersInit | undefined): Record<string, string> {
  const normalized: Record<string, string> = {};
  if (!initHeaders) {
    return normalized;
  }

  if (initHeaders instanceof Headers) {
    initHeaders.forEach((value, key) => {
      normalized[key] = value;
    });
    return normalized;
  }

  if (Array.isArray(initHeaders)) {
    for (const [key, value] of initHeaders) {
      normalized[key] = value;
    }
    return normalized;
  }

  for (const [key, value] of Object.entries(initHeaders)) {
    if (typeof value === "string") {
      normalized[key] = value;
    }
  }

  return normalized;
}

function findHeaderKey(headers: Record<string, string>, name: string): string | undefined {
  const normalizedName = name.toLowerCase();
  return Object.keys(headers).find((key) => key.toLowerCase() === normalizedName);
}

function buildHeaders(initHeaders: HeadersInit | undefined, method: string): Record<string, string> {
  const headers = normalizeHeaders(initHeaders);

  if (!findHeaderKey(headers, "Content-Type")) {
    headers["Content-Type"] = "application/json";
  }

  if (isMutatingMethod(method) && !findHeaderKey(headers, "X-CSRFToken")) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }

  return headers;
}

function parseContentType(
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders | undefined,
): string {
  if (!headers) {
    return "";
  }

  if ("get" in headers && typeof headers.get === "function") {
    const value = headers.get("content-type");
    return typeof value === "string" ? value : "";
  }

  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === "content-type" && typeof value === "string") {
      return value;
    }
  }

  return "";
}

function buildApiError(
  status: number,
  data: unknown,
): {
  message: string;
  code: string | undefined;
  details: unknown;
} {
  const parsed = apiErrorSchema.safeParse(data);
  const fallbackCode =
    status === 401
      ? "UNAUTHORIZED"
      : status === 403
        ? "FORBIDDEN"
        : status === 429
          ? "RATE_LIMITED"
          : undefined;
  const message =
    parsed.success && parsed.data.message
      ? parsed.data.message
      : `Request failed with status ${status}`;

  return {
    message,
    code: parsed.success ? parsed.data.code ?? fallbackCode : fallbackCode,
    details: parsed.success ? parsed.data.details : data,
  };
}

function isCsrfFailure(status: number, code?: string, message?: string): boolean {
  if (status !== 403) {
    return false;
  }
  return CSRF_ERROR_PATTERN.test(code ?? "") || CSRF_ERROR_PATTERN.test(message ?? "");
}

function parseResponseData(response: {
  status: number;
  headers?: RawAxiosResponseHeaders | AxiosResponseHeaders;
  data: unknown;
}): unknown {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = parseContentType(response.headers);
  if (!contentType.includes("application/json")) {
    return null;
  }

  return response.data;
}

type JsonRequestResult = {
  status: number;
  data: unknown;
};

async function executeJsonRequest(path: string, init?: RequestInit): Promise<JsonRequestResult> {
  const method = getRequestMethod(init);
  const headers = buildHeaders(init?.headers, method);

  try {
    const response = await http.request<unknown>({
      url: toApiPath(path),
      method,
      data: init?.body as unknown,
      headers,
      signal: init?.signal ?? undefined,
      validateStatus: () => true,
    });

    return {
      status: response.status,
      data: parseResponseData(response),
    };
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0,
      "NETWORK_ERROR",
    );
  }
}

async function refreshCsrfCookie(): Promise<void> {
  await http.request({
    url: toApiPath("/auth/me"),
    method: "GET",
    validateStatus: () => true,
  });
}

export async function fetchJson<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const method = getRequestMethod(init);
  let response = await executeJsonRequest(path, init);

  if (isMutatingMethod(method) && path !== "/auth/me" && response.status === 403) {
    const parsedError = apiErrorSchema.safeParse(response.data);
    const errorCode = parsedError.success ? parsedError.data.code : undefined;
    const errorMessage = parsedError.success ? parsedError.data.message : undefined;
    if (isCsrfFailure(response.status, errorCode, errorMessage)) {
      await refreshCsrfCookie();
      response = await executeJsonRequest(path, init);
    }
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const isOk = response.status >= 200 && response.status < 300;
  if (!isOk) {
    const error = buildApiError(response.status, response.data);
    throw new ApiError(error.message, response.status, error.code, error.details);
  }

  return response.data as TResponse;
}
