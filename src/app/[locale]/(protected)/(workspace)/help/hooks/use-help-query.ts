"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { listArticles } from "@/app/[locale]/(protected)/(workspace)/help/services/helpService";

export function useHelpArticlesQuery() {
  return useQuery({
    queryKey: queryKeys.help.articles(),
    queryFn: listArticles,
  });
}

