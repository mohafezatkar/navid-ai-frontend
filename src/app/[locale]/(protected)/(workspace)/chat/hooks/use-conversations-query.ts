"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { listConversations } from "@/app/[locale]/(protected)/(workspace)/chat/services/chatService";

export function useConversationsQuery() {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: listConversations,
  });
}

