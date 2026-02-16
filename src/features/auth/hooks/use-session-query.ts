"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => apiClient.auth.me(),
  });
}
