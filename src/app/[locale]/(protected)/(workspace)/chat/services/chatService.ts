import type {
  Attachment,
  Conversation,
  Message,
  StreamEvent,
} from "@/lib/api/types";
import { toApiPath } from "@/lib/api/config";
import { ApiError, fetchJson } from "@/lib/api/fetch-json";
import { http } from "@/lib/http-client";
import {
  attachmentSchema,
  conversationListSchema,
  conversationSchema,
  messageListSchema,
  messageSchema,
} from "@/lib/contracts";

const CONVERSATIONS_PAGE_SIZE = 50;
const MAX_CONVERSATION_SCAN_PAGES = 20;
const FALLBACK_CONVERSATION_TITLE = "New chat";
const STREAM_ENDPOINT_FALLBACK_STATUSES = new Set([404, 405, 406, 415, 501]);

type StreamControl = {
  stopped: boolean;
  abortController: AbortController;
};

const streamControls = new Map<string, StreamControl>();

class StreamRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "StreamRequestError";
    this.status = status;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.split("=")[1] ?? "";
  return decodeURIComponent(value);
}

function buildChatRequestBody(input: {
  content: string;
  attachments: Attachment[];
}): {
  content: string;
  attachments?: Attachment[];
} {
  if (input.attachments.length === 0) {
    return { content: input.content };
  }

  return {
    content: input.content,
    attachments: input.attachments,
  };
}

function normalizeConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    createdAt: conversation.createdAt ?? conversation.updatedAt,
    preview: conversation.preview ?? "",
  };
}

function parseConversationsPayload(data: unknown): Conversation[] {
  if (Array.isArray(data)) {
    return data.map((conversation) =>
      normalizeConversation(conversationSchema.parse(conversation)),
    );
  }

  const parsed = conversationListSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data.results.map(normalizeConversation);
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as { results: unknown[] }).results)
  ) {
    return (data as { results: unknown[] }).results.map((conversation) =>
      normalizeConversation(conversationSchema.parse(conversation)),
    );
  }

  throw new Error("Invalid conversations payload.");
}

function parseMessagesPayload(data: unknown): Message[] {
  if (Array.isArray(data)) {
    return data.map((message) => messageSchema.parse(message));
  }

  const paginated = messageListSchema.safeParse(data);
  if (paginated.success) {
    return paginated.data.results.map((message) => messageSchema.parse(message));
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as { results: unknown[] }).results)
  ) {
    return (data as { results: unknown[] }).results.map((message) =>
      messageSchema.parse(message),
    );
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "messages" in data &&
    Array.isArray((data as { messages: unknown[] }).messages)
  ) {
    return (data as { messages: unknown[] }).messages.map((message) =>
      messageSchema.parse(message),
    );
  }

  throw new Error("Invalid messages payload.");
}

function parseConversationAndMessagesPayload(data: unknown): {
  conversation: Conversation;
  messages: Message[];
} | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  if (!("conversation" in data) || !("messages" in data)) {
    return null;
  }

  const payload = data as {
    conversation: unknown;
    messages: unknown[];
  };

  if (!Array.isArray(payload.messages)) {
    return null;
  }

  return {
    conversation: normalizeConversation(conversationSchema.parse(payload.conversation)),
    messages: payload.messages.map((message) => messageSchema.parse(message)),
  };
}

function parseAssistantMessagePayload(data: unknown): Message {
  if (
    typeof data === "object" &&
    data !== null &&
    "assistantMessage" in data
  ) {
    return messageSchema.parse((data as { assistantMessage: unknown }).assistantMessage);
  }

  return messageSchema.parse(data);
}

function getStreamErrorMessage(errorPayload: unknown, status: number): string {
  if (
    typeof errorPayload === "object" &&
    errorPayload !== null &&
    "message" in errorPayload &&
    typeof (errorPayload as { message: unknown }).message === "string"
  ) {
    return (errorPayload as { message: string }).message;
  }

  if (typeof errorPayload === "string" && errorPayload.trim().length > 0) {
    return errorPayload;
  }

  return `Streaming request failed with status ${status}.`;
}

function shouldFallbackToNonStreaming(error: unknown): boolean {
  if (error instanceof StreamRequestError) {
    return STREAM_ENDPOINT_FALLBACK_STATUSES.has(error.status);
  }

  if (error instanceof ApiError) {
    return STREAM_ENDPOINT_FALLBACK_STATUSES.has(error.status);
  }

  return false;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function buildFallbackConversation(
  conversationId: string,
  messages: Message[],
): Conversation {
  const lastMessageCreatedAt = messages[messages.length - 1]?.createdAt;
  const timestamp = lastMessageCreatedAt ?? new Date().toISOString();
  return normalizeConversation(
    conversationSchema.parse({
      id: conversationId,
      title: FALLBACK_CONVERSATION_TITLE,
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
  );
}

async function listConversationMessages(conversationId: string): Promise<Message[]> {
  const data = await fetchJson<unknown>(
    `/chat/conversations/${conversationId}/messages`,
  );
  return parseMessagesPayload(data);
}

async function findConversationById(conversationId: string): Promise<Conversation | null> {
  for (let page = 1; page <= MAX_CONVERSATION_SCAN_PAGES; page += 1) {
    const data = await fetchJson<unknown>(
      `/chat/conversations?page=${page}&size=${CONVERSATIONS_PAGE_SIZE}`,
    );

    if (Array.isArray(data)) {
      const found = data
        .map((conversation) =>
          normalizeConversation(conversationSchema.parse(conversation)),
        )
        .find((conversation) => conversation.id === conversationId);
      return found ?? null;
    }

    const parsed = conversationListSchema.safeParse(data);
    if (!parsed.success) {
      return null;
    }

    const found = parsed.data.results
      .map(normalizeConversation)
      .find((conversation) => conversation.id === conversationId);
    if (found) {
      return found;
    }

    if (!parsed.data.next) {
      return null;
    }
  }

  return null;
}

async function sendMessageNonStreaming(input: {
  conversationId: string;
  content: string;
  attachments: Attachment[];
}): Promise<Message> {
  const data = await fetchJson<unknown>(
    `/chat/conversations/${input.conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(buildChatRequestBody(input)),
    },
  );

  return parseAssistantMessagePayload(data);
}

function buildSseMessage(messageId: string | undefined, content: string): Message {
  return messageSchema.parse({
    id: messageId ?? `msg_stream_${Math.random().toString(36).slice(2, 10)}`,
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
    status: "done",
  });
}

async function sendMessageStreaming(
  input: { conversationId: string; content: string; attachments: Attachment[] },
  control: StreamControl,
  onEvent: (event: StreamEvent) => void,
): Promise<Message | null> {
  const csrfToken = getCookie("csrftoken");
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  const response = await fetch(
    toApiPath(`/chat/conversations/${input.conversationId}/messages/stream`),
    {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(buildChatRequestBody(input)),
      signal: control.abortController.signal,
    },
  );

  if (!response.ok) {
    let errorPayload: unknown = null;
    try {
      errorPayload = await response.json();
    } catch {
      try {
        errorPayload = await response.text();
      } catch {
        errorPayload = null;
      }
    }

    throw new StreamRequestError(
      response.status,
      getStreamErrorMessage(errorPayload, response.status),
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/event-stream")) {
    let jsonPayload: unknown = null;
    try {
      jsonPayload = await response.json();
    } catch {
      throw new StreamRequestError(
        response.status,
        "Unexpected non-stream response from streaming endpoint.",
      );
    }

    return parseAssistantMessagePayload(jsonPayload);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new StreamRequestError(
      response.status,
      "Streaming response body is unavailable.",
    );
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let fullMessageId: string | undefined;
  let doneMessage: Message | null = null;
  let receivedDoneEvent = false;

  const hasDoneSignal = (payload: Record<string, unknown>): boolean =>
    payload.status === "done" ||
    payload.type === "done" ||
    payload.event === "done" ||
    payload.done === true ||
    payload.isFinal === true;

  const processBlock = (block: string) => {
    const lines = block.split(/\r?\n/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine.startsWith("data:")) {
        continue;
      }

      const payloadText = trimmedLine.slice(5).trim();
      if (!payloadText) {
        continue;
      }

      if (payloadText === "[DONE]") {
        receivedDoneEvent = true;
        continue;
      }

      let payload: unknown = null;
      try {
        payload = JSON.parse(payloadText);
      } catch {
        continue;
      }

      if (typeof payload !== "object" || payload === null) {
        continue;
      }

      const streamPayload = payload as Record<string, unknown>;

      if (typeof streamPayload.error === "string" && streamPayload.error) {
        throw new Error(streamPayload.error);
      }

      if (typeof streamPayload.chunk === "string") {
        content += streamPayload.chunk;
        onEvent({ type: "token", value: streamPayload.chunk });
      }

      if (typeof streamPayload.fullMessageId === "string") {
        fullMessageId = streamPayload.fullMessageId;
      }

      if (hasDoneSignal(streamPayload)) {
        receivedDoneEvent = true;
      }

      if ("message" in streamPayload) {
        const parsedMessage = messageSchema.safeParse(streamPayload.message);
        if (parsedMessage.success) {
          doneMessage = parsedMessage.data;
          receivedDoneEvent = true;
        }
      }

      if ("assistantMessage" in streamPayload) {
        const parsedAssistantMessage = messageSchema.safeParse(streamPayload.assistantMessage);
        if (parsedAssistantMessage.success) {
          doneMessage = parsedAssistantMessage.data;
          receivedDoneEvent = true;
        }
      }
    }
  };

  while (!control.stopped && !receivedDoneEvent) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const eventBlocks = buffer.split(/\r?\n\r?\n/);
    buffer = eventBlocks.pop() ?? "";

    for (const block of eventBlocks) {
      processBlock(block);
      if (receivedDoneEvent || control.stopped) {
        break;
      }
    }

    if (receivedDoneEvent) {
      try {
        await reader.cancel();
      } catch {
        // no-op: closing an already-closed stream can throw in some browsers
      }
      break;
    }
  }

  if (control.stopped) {
    return null;
  }

  if (buffer.trim().length > 0) {
    processBlock(buffer);
  }

  if (doneMessage) {
    return doneMessage;
  }

  if (content.length > 0 || fullMessageId || receivedDoneEvent) {
    return buildSseMessage(fullMessageId, content);
  }

  throw new StreamRequestError(response.status, "Empty streaming response.");
}

async function tryGetLegacyConversation(id: string): Promise<{
  conversation: Conversation;
  messages: Message[];
} | null> {
  try {
    const data = await fetchJson<unknown>(`/chat/conversations/${id}`);
    return parseConversationAndMessagesPayload(data);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      return null;
    }

    throw error;
  }
}

export async function listConversations(): Promise<Conversation[]> {
  const data = await fetchJson<unknown>(
    `/chat/conversations?page=1&size=${CONVERSATIONS_PAGE_SIZE}`,
  );
  return parseConversationsPayload(data);
}

export async function createConversation(): Promise<Conversation> {
  const data = await fetchJson<unknown>("/chat/conversations", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return normalizeConversation(conversationSchema.parse(data));
}

export async function getConversation(id: string): Promise<{
  conversation: Conversation;
  messages: Message[];
}> {
  try {
    const messages = await listConversationMessages(id);
    const conversation = await findConversationById(id);
    return {
      conversation: conversation ?? buildFallbackConversation(id, messages),
      messages,
    };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      const legacyPayload = await tryGetLegacyConversation(id);
      if (legacyPayload) {
        return legacyPayload;
      }
    }

    throw error;
  }
}

export async function sendMessage(
  input: { conversationId: string; content: string; attachments: Attachment[] },
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const control: StreamControl = {
    stopped: false,
    abortController: new AbortController(),
  };
  streamControls.set(input.conversationId, control);

  try {
    const streamedMessage = await sendMessageStreaming(input, control, onEvent);
    if (streamedMessage && !control.stopped) {
      onEvent({ type: "message_done", message: streamedMessage });
    }
  } catch (error) {
    if (control.stopped || isAbortError(error)) {
      return;
    }

    if (shouldFallbackToNonStreaming(error)) {
      const assistantMessage = await sendMessageNonStreaming(input);
      if (!control.stopped) {
        onEvent({ type: "message_done", message: assistantMessage });
      }
      return;
    }

    onEvent({
      type: "error",
      error: error instanceof Error ? error.message : "",
    });

    throw error;
  } finally {
    streamControls.delete(input.conversationId);
  }
}

export function stopStream(conversationId: string): void {
  const control = streamControls.get(conversationId);
  if (control) {
    control.stopped = true;
    control.abortController.abort();
  }
}

export async function deleteConversation(id: string): Promise<void> {
  await fetchJson<void>(`/chat/conversations/${id}`, {
    method: "DELETE",
  });
}

export async function setMessageFeedback(input: {
  messageId: string;
  feedback: "good" | "bad";
}): Promise<void> {
  await fetchJson<void>(`/chat/messages/${input.messageId}/feedback`, {
    method: "PATCH",
    body: JSON.stringify({
      feedback: input.feedback,
    }),
  });
}

// TODO(api-v2): These endpoints are legacy and are not part of the current
// `/api/v1/chat` contract. Keep them until backend replacements are introduced.
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
