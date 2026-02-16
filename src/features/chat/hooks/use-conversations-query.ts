"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useConversationsQuery() {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: apiClient.chat.listConversations,
  });
}
