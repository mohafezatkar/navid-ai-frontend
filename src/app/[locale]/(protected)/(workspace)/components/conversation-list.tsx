"use client";

import { useTranslations } from "next-intl";

import type { Conversation } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
};

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const t = useTranslations();

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        {t("pages.chat.noConversationsPanel")}
      </div>
    );
  }

  return (
    <ul className="space-y-0.5">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent/35",
              conversation.id === activeConversationId
                ? "bg-accent/45 text-foreground"
                : "text-foreground/90",
            )}
          >
            <p className="truncate">{conversation.title}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
