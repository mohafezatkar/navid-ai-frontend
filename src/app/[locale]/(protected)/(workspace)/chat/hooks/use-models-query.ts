"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { listModels } from "@/app/[locale]/(protected)/(workspace)/chat/services/chatService";

export function useModelsQuery() {
  return useQuery({
    queryKey: queryKeys.chat.models(),
    queryFn: listModels,
  });
}

