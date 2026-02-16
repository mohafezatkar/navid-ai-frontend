"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useModelsQuery() {
  return useQuery({
    queryKey: queryKeys.chat.models(),
    queryFn: apiClient.chat.listModels,
  });
}
