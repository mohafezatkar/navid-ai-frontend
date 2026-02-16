import type {
  ApiClient,
  Conversation,
  Message,
  Model,
  Session,
  StreamEvent,
} from "@/lib/api/types";
import { toApiPath } from "@/lib/api/constants";
import { fetchJson } from "@/lib/api/http";
import {
  attachmentSchema,
  conversationSchema,
  helpArticlesSchema,
  messageSchema,
  modelSchema,
  preferencesSchema,
  profileSchema,
  sessionSchema,
} from "@/lib/contracts";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE === "live" ? "live" : "mock";
const STREAM_DELAY_MS = 28;

type StreamControl = {
  stopped: boolean;
};

const streamControls = new Map<string, StreamControl>();

function tokenizeForStreaming(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function streamAssistantMessage(
  control: StreamControl,
  assistantMessage: Message,
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const chunks = tokenizeForStreaming(assistantMessage.content);
  for (const chunk of chunks) {
    if (control.stopped) {
      return;
    }

    onEvent({ type: "token", value: chunk });
    await sleep(STREAM_DELAY_MS);
  }

  if (!control.stopped) {
    onEvent({ type: "message_done", message: assistantMessage });
  }
}

export const apiClient: ApiClient = {
  auth: {
    async me() {
      const data = await fetchJson<Session | null>("/auth/me");
      if (!data) {
        return null;
      }
      return sessionSchema.parse(data);
    },
    async login(input) {
      const data = await fetchJson<Session>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return sessionSchema.parse(data);
    },
    async signup(input) {
      const data = await fetchJson<Session>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return sessionSchema.parse(data);
    },
    async logout() {
      await fetchJson<void>("/auth/logout", {
        method: "POST",
      });
    },
    async forgotPassword(input) {
      await fetchJson<void>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    async resetPassword(input) {
      await fetchJson<void>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    startGoogleOAuth() {
      void fetchJson<Session>("/auth/google/start", {
        method: "POST",
      }).then(() => {
        if (typeof window !== "undefined") {
          window.location.assign("/chat");
        }
      }).catch(() => {
        if (typeof window !== "undefined") {
          window.location.assign("/login");
        }
      });
    },
  },
  chat: {
    async listConversations() {
      const data = await fetchJson<Conversation[]>("/chat/conversations");
      return data.map((conversation) => conversationSchema.parse(conversation));
    },
    async createConversation(input) {
      const data = await fetchJson<Conversation>("/chat/conversations", {
        method: "POST",
        body: JSON.stringify(input),
      });
      return conversationSchema.parse(data);
    },
    async getConversation(id) {
      const data = await fetchJson<{ conversation: Conversation; messages: Message[] }>(
        `/chat/conversations/${id}`,
      );
      return {
        conversation: conversationSchema.parse(data.conversation),
        messages: data.messages.map((message) => messageSchema.parse(message)),
      };
    },
    async sendMessage(input, onEvent) {
      const control: StreamControl = { stopped: false };
      streamControls.set(input.conversationId, control);

      const data = await fetchJson<{ assistantMessage: Message }>(
        `/chat/conversations/${input.conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: input.content,
            attachments: input.attachments,
          }),
        },
      );

      const assistantMessage = messageSchema.parse(data.assistantMessage);

      if (API_MODE === "live") {
        onEvent({ type: "message_done", message: assistantMessage });
        streamControls.delete(input.conversationId);
        return;
      }

      try {
        await streamAssistantMessage(control, assistantMessage, onEvent);
      } catch (error) {
        onEvent({
          type: "error",
          error: error instanceof Error ? error.message : "Failed to stream response.",
        });
      } finally {
        streamControls.delete(input.conversationId);
      }
    },
    stopStream(conversationId) {
      const control = streamControls.get(conversationId);
      if (control) {
        control.stopped = true;
      }
    },
    async editUserMessage(input) {
      await fetchJson<void>(`/chat/conversations/${input.conversationId}/edit-message`, {
        method: "POST",
        body: JSON.stringify({
          messageId: input.messageId,
          content: input.content,
        }),
      });
    },
    async regenerateLastAssistantMessage(input) {
      await fetchJson<void>(`/chat/conversations/${input.conversationId}/regenerate`, {
        method: "POST",
      });
    },
    async deleteConversation(id) {
      await fetchJson<void>(`/chat/conversations/${id}`, {
        method: "DELETE",
      });
    },
    async uploadAttachment(file) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(toApiPath("/chat/attachments"), {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Attachment upload failed with status ${response.status}`);
      }

      const json = await response.json();
      return attachmentSchema.parse(json);
    },
    async listModels() {
      const data = await fetchJson<Model[]>("/chat/models");
      return data.map((model) => modelSchema.parse(model));
    },
  },
  settings: {
    async getProfile() {
      const data = await fetchJson<{ name: string; email: string }>("/settings/profile");
      return profileSchema.parse(data);
    },
    async updateProfile(input) {
      await fetchJson<void>("/settings/profile", {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },
    async getPreferences() {
      const data = await fetchJson<{ theme: "light" | "dark" | "system"; defaultModelId: string }>(
        "/settings/preferences",
      );
      return preferencesSchema.parse(data);
    },
    async updatePreferences(input) {
      await fetchJson<void>("/settings/preferences", {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },
  },
  help: {
    async listArticles() {
      const data = await fetchJson<Array<{ id: string; title: string; body: string }>>(
        "/help/articles",
      );
      return helpArticlesSchema.parse(data);
    },
  },
};
