"use client";

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
  if (conversations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/80 p-3 text-sm text-muted-foreground">
        No conversations yet. Start one to begin chatting.
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {conversations.map((conversation) => (
        <li key={conversation.id}>
          <button
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent/60",
              conversation.id === activeConversationId
                ? "border-primary/70 bg-primary/10"
                : "border-transparent",
            )}
          >
            <p className="truncate text-sm font-medium">{conversation.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {conversation.preview || "No messages yet"}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
