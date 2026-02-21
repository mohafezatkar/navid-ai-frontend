export const API_PREFIX = "/api/v1";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  ""
).trim().replace(/\/+$/, "");
const API_MODE = process.env.NEXT_PUBLIC_API_MODE === "mock" ? "mock" : "live";
export const IS_MOCK_MODE = API_MODE === "mock";

function withApiPrefix(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.startsWith(`${API_PREFIX}/`) || normalizedPath === API_PREFIX) {
    return normalizedPath;
  }
  return `${API_PREFIX}${normalizedPath}`;
}

export function toApiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const apiPath = withApiPrefix(path);
  return API_BASE_URL ? `${API_BASE_URL}${apiPath}` : apiPath;
}
