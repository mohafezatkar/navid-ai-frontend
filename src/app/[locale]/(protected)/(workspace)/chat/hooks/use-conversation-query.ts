"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getConversation } from "@/app/[locale]/(protected)/(workspace)/chat/services/chatService";

export function useConversationQuery(conversationId?: string) {
  return useQuery({
    queryKey: conversationId
      ? queryKeys.chat.conversation(conversationId)
      : ["chat", "conversations", "missing-id"],
    queryFn: () => getConversation(conversationId ?? ""),
    enabled: Boolean(conversationId),
  });
}

