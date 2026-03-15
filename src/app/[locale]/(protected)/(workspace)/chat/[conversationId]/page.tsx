"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { ChatInput } from "@/app/[locale]/(protected)/(workspace)/chat/components/chat-input";
import { MessageList } from "@/app/[locale]/(protected)/(workspace)/chat/components/message-list";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Attachment, Message } from "@/lib/api/types";
import { useConversationQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-conversation-query";
import {
  useEditUserMessageMutation,
  useSendMessageMutation,
} from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { useDraftStore } from "@/stores/draft-store";

const EMPTY_ATTACHMENTS: Attachment[] = [];
const EMPTY_MESSAGES: Message[] = [];
type MessageFeedbackValue = "good" | "bad";

function resolveLatestAssistantAwaitingFeedbackId(
  messages: Message[],
  pendingFeedbackByMessageId: Record<string, MessageFeedbackValue>,
): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message.role !== "assistant") {
      continue;
    }

    if (message.status === "streaming" || message.content.trim().length === 0) {
      continue;
    }

    const resolvedFeedback = pendingFeedbackByMessageId[message.id] ?? message.feedback ?? null;
    return resolvedFeedback ? null : message.id;
  }

  return null;
}

function focusFeedbackActions(messageId: string): void {
  const selector = `[data-feedback-actions-for="${messageId}"]`;
  const actionsContainer = document.querySelector(selector);
  if (!(actionsContainer instanceof HTMLElement)) {
    return;
  }

  actionsContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  const firstFeedbackButton = actionsContainer.querySelector(
    "button[data-feedback-option]:not(:disabled)",
  );
  if (firstFeedbackButton instanceof HTMLButtonElement) {
    firstFeedbackButton.focus();
  }
}

export default function ConversationPage() {
  const t = useTranslations();
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const conversationQuery = useConversationQuery(conversationId);
  const sendMessageMutation = useSendMessageMutation();
  const editMessageMutation = useEditUserMessageMutation();

  const [streamingContent, setStreamingContent] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [editingMessage, setEditingMessage] = React.useState<Message | null>(null);
  const [editingContent, setEditingContent] = React.useState("");
  const [optimisticUserMessage, setOptimisticUserMessage] = React.useState<Message | null>(null);
  const [requiredFeedbackMessageId, setRequiredFeedbackMessageId] = React.useState<string | null>(null);
  const [pendingFeedbackByMessageId, setPendingFeedbackByMessageId] = React.useState<
    Record<string, MessageFeedbackValue>
  >({});
  const autoSubmittedConversationIdsRef = React.useRef(new Set<string>());

  const messagesViewportRef = React.useRef<HTMLDivElement | null>(null);

  const draft = useDraftStore(
    React.useCallback(
      (state) => state.draftsByConversationId[conversationId] ?? "",
      [conversationId],
    ),
  );
  const attachments = useDraftStore(
    React.useCallback(
      (state) => state.attachmentsByConversationId[conversationId] ?? EMPTY_ATTACHMENTS,
      [conversationId],
    ),
  );
  const setDraft = useDraftStore((state) => state.setDraft);
  const clearDraft = useDraftStore((state) => state.clearConversationDraft);
  const messages = conversationQuery.data?.messages ?? EMPTY_MESSAGES;
  const latestAssistantAwaitingFeedbackId = React.useMemo(
    () => resolveLatestAssistantAwaitingFeedbackId(messages, pendingFeedbackByMessageId),
    [messages, pendingFeedbackByMessageId],
  );

  const onSend = React.useCallback(
    async (content: string) => {
      const normalizedContent = content.trim();
      if (!normalizedContent && attachments.length === 0) {
        return false;
      }

      const sendableAttachments: Attachment[] = attachments.filter(
        (attachment) => attachment.status === "uploaded",
      );

      if (attachments.some((attachment) => attachment.status === "uploading")) {
        toast.error(t("errors.chat.waitForUploads"));
        return false;
      }

      if (latestAssistantAwaitingFeedbackId) {
        setRequiredFeedbackMessageId(latestAssistantAwaitingFeedbackId);
        requestAnimationFrame(() => {
          focusFeedbackActions(latestAssistantAwaitingFeedbackId);
        });
        return false;
      }

      setDraft(conversationId, "");
      setRequiredFeedbackMessageId(null);
      setOptimisticUserMessage({
        id: `optimistic_user_${Date.now()}`,
        role: "user",
        content: normalizedContent,
        attachments: sendableAttachments.length > 0 ? sendableAttachments : undefined,
        createdAt: new Date().toISOString(),
        status: "done",
      });
      setIsStreaming(true);
      setStreamingContent("");

      try {
        await sendMessageMutation.mutateAsync({
          conversationId,
          content: normalizedContent,
          attachments: sendableAttachments,
          onEvent: (event) => {
            if (event.type === "token") {
              setStreamingContent((current) => current + event.value);
              return;
            }

            if (event.type === "message_done") {
              setStreamingContent("");
              setIsStreaming(false);
              return;
            }

            toast.error(event.error || t("errors.chat.failedSendMessage"));
            setIsStreaming(false);
          },
        });

        setOptimisticUserMessage(null);
        clearDraft(conversationId);
        return true;
      } catch (error) {
        setOptimisticUserMessage(null);
        setDraft(conversationId, normalizedContent);
        toast.error(error instanceof Error ? error.message : t("errors.chat.failedSendMessage"));
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [
      attachments,
      clearDraft,
      conversationId,
      latestAssistantAwaitingFeedbackId,
      sendMessageMutation,
      setDraft,
      t,
    ],
  );

  const onEditMessage = async () => {
    if (!editingMessage || !editingContent.trim()) {
      return;
    }

    try {
      await editMessageMutation.mutateAsync({
        conversationId,
        messageId: editingMessage.id,
        content: editingContent.trim(),
      });
      setEditingMessage(null);
      setEditingContent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.chat.failedEditMessage"));
    }
  };

  React.useEffect(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) {
      return;
    }

    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [isStreaming, messages.length, optimisticUserMessage?.id, streamingContent]);

  React.useEffect(() => {
    setRequiredFeedbackMessageId(null);
    setPendingFeedbackByMessageId({});
  }, [conversationId]);

  React.useEffect(() => {
    if (!requiredFeedbackMessageId) {
      return;
    }

    if (requiredFeedbackMessageId !== latestAssistantAwaitingFeedbackId) {
      setRequiredFeedbackMessageId(null);
    }
  }, [latestAssistantAwaitingFeedbackId, requiredFeedbackMessageId]);

  React.useEffect(() => {
    if (!conversationQuery.data) {
      return;
    }

    if (messages.length > 0) {
      return;
    }

    const initialPrompt = draft.trim();
    if (!initialPrompt) {
      return;
    }

    if (isStreaming) {
      return;
    }

    if (attachments.some((attachment) => attachment.status === "uploading")) {
      return;
    }

    if (autoSubmittedConversationIdsRef.current.has(conversationId)) {
      return;
    }

    autoSubmittedConversationIdsRef.current.add(conversationId);
    void onSend(initialPrompt).catch(() => {
      autoSubmittedConversationIdsRef.current.delete(conversationId);
    });
  }, [
    attachments,
    conversationId,
    conversationQuery.data,
    draft,
    isStreaming,
    messages.length,
    onSend,
  ]);

  if (conversationQuery.isLoading) {
    return;
  }

  if (conversationQuery.isError || !conversationQuery.data) {
    return (
      <ErrorState
        title={t("errors.chat.unavailableTitle")}
        description={t("errors.chat.unavailableDescription")}
        onRetry={() => void conversationQuery.refetch()}
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <section ref={messagesViewportRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-44 pt-7">
          <MessageList
            messages={messages}
            optimisticUserMessage={optimisticUserMessage}
            streamingContent={streamingContent}
            isStreaming={isStreaming}
            requiredFeedbackMessageId={requiredFeedbackMessageId}
            onFeedbackSubmitted={(messageId, feedback) => {
              setPendingFeedbackByMessageId((current) => ({
                ...current,
                [messageId]: feedback,
              }));
              setRequiredFeedbackMessageId((current) =>
                current === messageId ? null : current,
              );
            }}
            onEditUserMessage={(message) => {
              setEditingMessage(message);
              setEditingContent(message.content);
            }}
          />
        </div>
      </section>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="pointer-events-auto mx-auto w-full max-w-3xl pb-6  bg-background">
          {requiredFeedbackMessageId ? (
            <p
              role="status"
              aria-live="polite"
              className="px-3 pb-2 text-sm text-destructive"
            >
              {t("errors.chat.feedbackRequiredBeforeSend")}
            </p>
          ) : null}
          <ChatInput
            value={draft}
            onValueChange={(value) => setDraft(conversationId, value)}
            onSubmit={onSend}
            placeholder={t("pages.chat.composerPlaceholder")}
            disabled={isStreaming}
            showAttach={false}
            showTools={false}
            showVoice={false}
            className="p-2"
            showDisclaimer
            footerClassName="bg-background py-1"
          />
        </div>
      </div>

      <Dialog
        open={Boolean(editingMessage)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMessage(null);
            setEditingContent("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("pages.chat.editMessage")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editingContent}
            onChange={(event) => setEditingContent(event.target.value)}
            className="min-h-[180px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingMessage(null);
                setEditingContent("");
              }}
            >
              {t("actions.cancel")}
            </Button>
            <Button onClick={() => void onEditMessage()} disabled={editMessageMutation.isPending}>
              {editMessageMutation.isPending ? t("status.saving") : t("actions.saveAndRegenerate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
