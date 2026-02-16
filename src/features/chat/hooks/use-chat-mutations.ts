"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import type { Attachment, StreamEvent } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.chat.createConversation,
    onSuccess: async (conversation) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(),
      });
      queryClient.setQueryData(queryKeys.chat.conversation(conversation.id), {
        conversation,
        messages: [],
      });
    },
  });
}

type SendMessageMutationInput = {
  conversationId: string;
  content: string;
  attachments: Attachment[];
  onEvent: (event: StreamEvent) => void;
};

export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      attachments,
      onEvent,
    }: SendMessageMutationInput) => {
      await apiClient.chat.sendMessage(
        {
          conversationId,
          content,
          attachments,
        },
        onEvent,
      );
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversations(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversation(variables.conversationId),
        }),
      ]);
    },
  });
}

export function useEditUserMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.chat.editUserMessage,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversations(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversation(variables.conversationId),
        }),
      ]);
    },
  });
}

export function useRegenerateLastAssistantMessageMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.chat.regenerateLastAssistantMessage,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversations(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversation(variables.conversationId),
        }),
      ]);
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.chat.deleteConversation,
    onSuccess: async (_, conversationId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.chat.conversation(conversationId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.chat.conversations(),
      });
    },
  });
}

export function useUploadAttachmentMutation() {
  return useMutation({
    mutationFn: apiClient.chat.uploadAttachment,
  });
}
