import { create } from "zustand";

import type { Attachment } from "@/lib/api/types";

type DraftStore = {
  draftsByConversationId: Record<string, string>;
  attachmentsByConversationId: Record<string, Attachment[]>;
  setDraft: (conversationId: string, draft: string) => void;
  setAttachments: (conversationId: string, attachments: Attachment[]) => void;
  clearDraft: (conversationId: string) => void;
  addAttachment: (conversationId: string, attachment: Attachment) => void;
  removeAttachment: (conversationId: string, attachmentId: string) => void;
  clearConversationDraft: (conversationId: string) => void;
};

export const useDraftStore = create<DraftStore>((set) => ({
  draftsByConversationId: {},
  attachmentsByConversationId: {},
  setDraft: (conversationId, draft) => {
    set((state) => ({
      draftsByConversationId: {
        ...state.draftsByConversationId,
        [conversationId]: draft,
      },
    }));
  },
  setAttachments: (conversationId, attachments) => {
    set((state) => ({
      attachmentsByConversationId: {
        ...state.attachmentsByConversationId,
        [conversationId]: attachments,
      },
    }));
  },
  clearDraft: (conversationId) => {
    set((state) => {
      const next = { ...state.draftsByConversationId };
      delete next[conversationId];
      return { draftsByConversationId: next };
    });
  },
  addAttachment: (conversationId, attachment) => {
    set((state) => ({
      attachmentsByConversationId: {
        ...state.attachmentsByConversationId,
        [conversationId]: [
          ...(state.attachmentsByConversationId[conversationId] ?? []),
          attachment,
        ],
      },
    }));
  },
  removeAttachment: (conversationId, attachmentId) => {
    set((state) => ({
      attachmentsByConversationId: {
        ...state.attachmentsByConversationId,
        [conversationId]: (state.attachmentsByConversationId[conversationId] ?? []).filter(
          (attachment) => attachment.id !== attachmentId,
        ),
      },
    }));
  },
  clearConversationDraft: (conversationId) => {
    set((state) => {
      const nextDrafts = { ...state.draftsByConversationId };
      const nextAttachments = { ...state.attachmentsByConversationId };
      delete nextDrafts[conversationId];
      delete nextAttachments[conversationId];
      return {
        draftsByConversationId: nextDrafts,
        attachmentsByConversationId: nextAttachments,
      };
    });
  },
}));
