export const API_PREFIX = "/api/v1";

export function toApiPath(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath.startsWith(`${API_PREFIX}/`) || normalizedPath === API_PREFIX) {
    return normalizedPath;
  }
  return `${API_PREFIX}${normalizedPath}`;
}
