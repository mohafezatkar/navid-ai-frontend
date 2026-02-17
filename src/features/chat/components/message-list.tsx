"use client";

import type { Message } from "@/lib/api/types";
import { AssistantTypingRow } from "@/features/chat/components/assistant-typing-row";
import { MessageBubble } from "@/features/chat/components/message-bubble";

type MessageListProps = {
  messages: Message[];
  streamingContent?: string;
  isStreaming?: boolean;
  onEditUserMessage?: (message: Message) => void;
};

export function MessageList({
  messages,
  streamingContent,
  isStreaming,
  onEditUserMessage,
}: MessageListProps) {
  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onEditUserMessage={onEditUserMessage}
        />
      ))}

      {streamingContent ? (
        <MessageBubble
          message={{
            id: "streaming_message",
            role: "assistant",
            content: streamingContent,
            createdAt: new Date().toISOString(),
            status: "streaming",
          }}
        />
      ) : null}

      {isStreaming && !streamingContent ? <AssistantTypingRow /> : null}
    </div>
  );
}

