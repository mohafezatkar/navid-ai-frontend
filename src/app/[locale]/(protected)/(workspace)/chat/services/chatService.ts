import type {
  Attachment,
  Conversation,
  Message,
  StreamEvent,
} from "@/lib/api/types";
import { IS_MOCK_MODE, toApiPath } from "@/lib/api/config";
import { fetchJson } from "@/lib/api/fetch-json";
import { http } from "@/lib/http-client";
import {
  attachmentSchema,
  conversationSchema,
  messageSchema,
} from "@/lib/contracts";

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

export async function listConversations(): Promise<Conversation[]> {
  const data = await fetchJson<Conversation[]>("/chat/conversations");
  return data.map((conversation) => conversationSchema.parse(conversation));
}

export async function createConversation(): Promise<Conversation> {
  const data = await fetchJson<Conversation>("/chat/conversations", {
    method: "POST",
  });
  return conversationSchema.parse(data);
}

export async function getConversation(id: string): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  const data = await fetchJson<{ conversation: Conversation; messages: Message[] }>(
    `/chat/conversations/${id}`,
  );
  return {
    conversation: conversationSchema.parse(data.conversation),
    messages: data.messages.map((message) => messageSchema.parse(message)),
  };
}

export async function sendMessage(
  input: { conversationId: string; content: string; attachments: Attachment[] },
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
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

  if (!IS_MOCK_MODE) {
    onEvent({ type: "message_done", message: assistantMessage });
    streamControls.delete(input.conversationId);
    return;
  }

  try {
    await streamAssistantMessage(control, assistantMessage, onEvent);
  } catch (error) {
    onEvent({
      type: "error",
      error: error instanceof Error ? error.message : "",
    });
  } finally {
    streamControls.delete(input.conversationId);
  }
}

export function stopStream(conversationId: string): void {
  const control = streamControls.get(conversationId);
  if (control) {
    control.stopped = true;
  }
}

export async function editUserMessage(input: {
  conversationId: string;
  messageId: string;
  content: string;
}): Promise<void> {
  await fetchJson<void>(`/chat/conversations/${input.conversationId}/edit-message`, {
    method: "POST",
    body: JSON.stringify({
      messageId: input.messageId,
      content: input.content,
    }),
  });
}

export async function regenerateLastAssistantMessage(input: {
  conversationId: string;
}): Promise<void> {
  await fetchJson<void>(`/chat/conversations/${input.conversationId}/regenerate`, {
    method: "POST",
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await fetchJson<void>(`/chat/conversations/${id}`, {
    method: "DELETE",
  });
}

export async function uploadAttachment(file: File): Promise<Attachment> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.request({
    url: toApiPath("/chat/attachments"),
    method: "POST",
    data: formData,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Attachment upload failed with status ${response.status}`);
  }

  return attachmentSchema.parse(response.data);
}
