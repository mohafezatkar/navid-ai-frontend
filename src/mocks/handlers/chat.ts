import { delay, http, HttpResponse } from "msw";

import {
  createConversationInputSchema,
  editUserMessageInputSchema,
  messageFeedbackInputSchema,
  regenerateLastAssistantMessageInputSchema,
  sendMessageInputSchema,
} from "@/lib/contracts";
import { API_PREFIX } from "@/lib/api/config";
import { mockDb } from "@/mocks/data/db";
import { asMockErrorResponse } from "@/mocks/handlers/utils";

const apiPath = (path: string) => `${API_PREFIX}${path}`;

export const chatHandlers = [
  http.get(apiPath("/chat/conversations"), async () => {
    try {
      await delay(180);
      const conversations = mockDb.chat.listConversations();
      return HttpResponse.json({
        count: conversations.length,
        next: null,
        previous: null,
        results: conversations,
      });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/chat/conversations"), async ({ request }) => {
    try {
      await delay(180);
      const body = createConversationInputSchema.parse(await request.json());
      const conversation = mockDb.chat.createConversation(body);
      return HttpResponse.json(conversation, { status: 201 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.get(apiPath("/chat/conversations/:conversationId"), async ({ params }) => {
    try {
      await delay(150);
      const conversationId = String(params.conversationId);
      const payload = mockDb.chat.getConversation(conversationId);
      return HttpResponse.json(payload);
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.get(apiPath("/chat/conversations/:conversationId/messages"), async ({ params }) => {
    try {
      await delay(140);
      const conversationId = String(params.conversationId);
      const payload = mockDb.chat.getConversation(conversationId);
      return HttpResponse.json({
        nextCursor: null,
        previousCursor: null,
        results: payload.messages,
      });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(
    apiPath("/chat/conversations/:conversationId/messages/stream"),
    async ({ params, request }) => {
      try {
        await delay(180);
        const conversationId = String(params.conversationId);
        const body = sendMessageInputSchema
          .omit({ conversationId: true })
          .parse(await request.json());
        const assistantMessage = mockDb.chat.addMessage({
          conversationId,
          ...body,
        });

        const encoder = new TextEncoder();
        const chunks = assistantMessage.content.split(/(\s+)/).filter(Boolean);
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            for (const chunk of chunks) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`),
              );
              await delay(24);
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  status: "done",
                  fullMessageId: assistantMessage.id,
                })}\n\n`,
              ),
            );
            controller.close();
          },
        });

        return new HttpResponse(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      } catch (error) {
        return asMockErrorResponse(error);
      }
    },
  ),

  http.post(apiPath("/chat/conversations/:conversationId/messages"), async ({ params, request }) => {
    try {
      await delay(250);
      const conversationId = String(params.conversationId);
      const body = sendMessageInputSchema
        .omit({ conversationId: true })
        .parse(await request.json());
      const assistantMessage = mockDb.chat.addMessage({
        conversationId,
        ...body,
      });
      return HttpResponse.json(assistantMessage, { status: 200 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.patch(apiPath("/chat/messages/:messageId/feedback"), async ({ params, request }) => {
    try {
      await delay(160);
      const rawBody = await request.json();
      const feedback =
        typeof rawBody === "object" && rawBody !== null
          ? (rawBody as { feedback?: unknown }).feedback
          : undefined;
      const parsed = messageFeedbackInputSchema.parse({
        messageId: String(params.messageId),
        feedback,
      });
      mockDb.chat.setMessageFeedback(parsed);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/chat/conversations/:conversationId/edit-message"), async ({ params, request }) => {
    try {
      await delay(190);
      const conversationId = String(params.conversationId);
      const body = editUserMessageInputSchema
        .omit({ conversationId: true })
        .parse(await request.json());
      mockDb.chat.editUserMessage({
        conversationId,
        ...body,
      });
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/chat/conversations/:conversationId/regenerate"), async ({ params }) => {
    try {
      await delay(220);
      const parsed = regenerateLastAssistantMessageInputSchema.parse({
        conversationId: String(params.conversationId),
      });
      mockDb.chat.regenerateLastAssistantMessage(parsed);
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.delete(apiPath("/chat/conversations/:conversationId"), async ({ params }) => {
    try {
      await delay(180);
      mockDb.chat.deleteConversation(String(params.conversationId));
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.post(apiPath("/chat/attachments"), async ({ request }) => {
    try {
      await delay(220);
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return HttpResponse.json(
          {
            message: "Attachment file is missing.",
            code: "INVALID_ATTACHMENT",
          },
          { status: 400 },
        );
      }
      const attachment = mockDb.chat.uploadAttachment(file);
      return HttpResponse.json(attachment, { status: 201 });
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),
];
