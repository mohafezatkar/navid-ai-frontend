"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useHelpArticlesQuery() {
  return useQuery({
    queryKey: queryKeys.help.articles(),
    queryFn: apiClient.help.listArticles,
  });
}
