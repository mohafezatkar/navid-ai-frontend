"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useConversationQuery(conversationId?: string) {
  return useQuery({
    queryKey: conversationId
      ? queryKeys.chat.conversation(conversationId)
      : ["chat", "conversations", "missing-id"],
    queryFn: () => apiClient.chat.getConversation(conversationId ?? ""),
    enabled: Boolean(conversationId),
  });
}
