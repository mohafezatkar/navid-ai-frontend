import { delay, http, HttpResponse } from "msw";

import {
  createConversationInputSchema,
  editUserMessageInputSchema,
  regenerateLastAssistantMessageInputSchema,
  sendMessageInputSchema,
} from "@/lib/contracts";
import { API_PREFIX } from "@/lib/api/config";
import { mockDb } from "@/mocks/data/db";
import { asMockErrorResponse } from "@/mocks/handlers/utils";

const apiPath = (path: string) => `${API_PREFIX}${path}`;

export const chatHandlers = [
  http.get(apiPath("/chat/models"), async () => {
    try {
      await delay(150);
      return HttpResponse.json(mockDb.chat.listModels());
    } catch (error) {
      return asMockErrorResponse(error);
    }
  }),

  http.get(apiPath("/chat/conversations"), async () => {
    try {
      await delay(180);
      return HttpResponse.json(mockDb.chat.listConversations());
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
      return HttpResponse.json({ assistantMessage }, { status: 201 });
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
