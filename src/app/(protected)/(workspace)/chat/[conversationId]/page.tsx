"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Composer } from "@/features/chat/components/composer";
import { MessageList } from "@/features/chat/components/message-list";
import { StreamControls } from "@/features/chat/components/stream-controls";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
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
import { apiClient } from "@/lib/api";
import { useConversationQuery } from "@/features/chat/hooks/use-conversation-query";
import {
  useDeleteConversationMutation,
  useEditUserMessageMutation,
  useRegenerateLastAssistantMessageMutation,
  useSendMessageMutation,
} from "@/features/chat/hooks/use-chat-mutations";
import { useDraftStore } from "@/stores/draft-store";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId;
  const router = useRouter();
  const conversationQuery = useConversationQuery(conversationId);
  const sendMessageMutation = useSendMessageMutation();
  const editMessageMutation = useEditUserMessageMutation();
  const regenerateMutation = useRegenerateLastAssistantMessageMutation();
  const deleteConversationMutation = useDeleteConversationMutation();

  const [streamingContent, setStreamingContent] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [editingMessage, setEditingMessage] = React.useState<Message | null>(null);
  const [editingContent, setEditingContent] = React.useState("");

  const draft = useDraftStore(
    React.useCallback(
      (state) => state.draftsByConversationId[conversationId] ?? "",
      [conversationId],
    ),
  );
  const attachments = useDraftStore(
    React.useCallback(
      (state) => state.attachmentsByConversationId[conversationId] ?? [],
      [conversationId],
    ),
  );
  const setDraft = useDraftStore((state) => state.setDraft);
  const setAttachments = useDraftStore((state) => state.setAttachments);
  const clearDraft = useDraftStore((state) => state.clearConversationDraft);

  const onSend = async () => {
    if (!draft.trim() && attachments.length === 0) {
      return;
    }

    const sendableAttachments: Attachment[] = attachments.filter(
      (attachment) => attachment.status === "uploaded",
    );
    if (attachments.some((attachment) => attachment.status === "uploading")) {
      toast.error("Please wait until uploads finish.");
      return;
    }

    setIsStreaming(true);
    setStreamingContent("");

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: draft.trim(),
        attachments: sendableAttachments,
        onEvent: (event) => {
          if (event.type === "token") {
            setStreamingContent((current) => current + event.value);
          } else if (event.type === "message_done") {
            setStreamingContent("");
            setIsStreaming(false);
          } else if (event.type === "error") {
            toast.error(event.error);
            setIsStreaming(false);
          }
        },
      });
      clearDraft(conversationId);
    } catch (error) {
      setIsStreaming(false);
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    }
  };

  const onStopStreaming = () => {
    apiClient.chat.stopStream(conversationId);
    setIsStreaming(false);
    setStreamingContent("");
  };

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
      toast.error(error instanceof Error ? error.message : "Failed to edit message.");
    }
  };

  const onRegenerate = async () => {
    try {
      await regenerateMutation.mutateAsync({ conversationId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not regenerate response.");
    }
  };

  const onDeleteConversation = async () => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
      clearDraft(conversationId);
      router.replace("/chat");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete conversation.");
    }
  };

  if (conversationQuery.isLoading) {
    return <LoadingState label="Loading conversation..." />;
  }

  if (conversationQuery.isError || !conversationQuery.data) {
    return (
      <ErrorState
        title="Conversation unavailable"
        description="Try refreshing this page or return to chat home."
        onRetry={() => void conversationQuery.refetch()}
      />
    );
  }

  const { conversation, messages } = conversationQuery.data;

  return (
    <div className="flex h-full min-h-[calc(100vh-120px)] flex-col gap-5">
      <PageHeader
        title={conversation.title}
        description={`Model: ${conversation.modelId}`}
        actions={
          <>
            <StreamControls
              isStreaming={isStreaming}
              isRegenerating={regenerateMutation.isPending}
              onStop={onStopStreaming}
              onRegenerate={() => void onRegenerate()}
            />
            <ConfirmDialog
              title="Delete conversation?"
              description="This action cannot be undone."
              confirmLabel="Delete"
              onConfirm={() => void onDeleteConversation()}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              }
            />
          </>
        }
      />

      <section className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border/70 bg-card/50 p-4">
        <MessageList
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          onEditUserMessage={(message) => {
            setEditingMessage(message);
            setEditingContent(message.content);
          }}
        />
      </section>

      <Composer
        draft={draft}
        attachments={attachments}
        onDraftChange={(value) => setDraft(conversationId, value)}
        onAttachmentsChange={(nextAttachments) => setAttachments(conversationId, nextAttachments)}
        onSubmit={() => void onSend()}
        isSending={sendMessageMutation.isPending}
        disabled={isStreaming}
      />

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
            <DialogTitle>Edit message</DialogTitle>
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
              Cancel
            </Button>
            <Button onClick={() => void onEditMessage()} disabled={editMessageMutation.isPending}>
              {editMessageMutation.isPending ? "Saving..." : "Save and regenerate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

