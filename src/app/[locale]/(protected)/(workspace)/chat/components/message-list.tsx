"use client";

import type { Message } from "@/lib/api/types";
import { MessageBubble } from "@/app/[locale]/(protected)/(workspace)/chat/components/message-bubble";
import { PulseLoader } from "@/app/[locale]/(protected)/(workspace)/chat/components/pulse-loader";

type MessageListProps = {
  messages: Message[];
  optimisticUserMessage?: Message | null;
  streamingContent?: string;
  isStreaming?: boolean;
  onEditUserMessage?: (message: Message) => void;
  requiredFeedbackMessageId?: string | null;
  onFeedbackSubmitted?: (messageId: string, feedback: "good" | "bad") => void;
};

export function MessageList({
  messages,
  optimisticUserMessage,
  streamingContent,
  isStreaming,
  requiredFeedbackMessageId,
  onFeedbackSubmitted,
}: MessageListProps) {
  return (
    <div className="space-y-8" dir="ltr">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          highlightFeedback={requiredFeedbackMessageId === message.id}
          onFeedbackSubmitted={onFeedbackSubmitted}
        />
      ))}

      {optimisticUserMessage ? (
        <MessageBubble
          key={optimisticUserMessage.id}
          message={optimisticUserMessage}
        />
      ) : null}

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

      {isStreaming && !streamingContent ? (
        <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
          <PulseLoader size="lg" />
        </div>
      ) : null}
    </div>
  );
}
