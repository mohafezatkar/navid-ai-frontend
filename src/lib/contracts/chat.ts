import { z } from "zod";

import { idSchema, isoDateStringSchema } from "@/lib/contracts/common";

export const modelCapabilitySchema = z.enum(["text", "image", "file"]);

export const modelSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  capabilities: z.array(modelCapabilitySchema),
});

export const attachmentStatusSchema = z.enum([
  "queued",
  "uploading",
  "uploaded",
  "failed",
]);

export const attachmentSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().nonnegative(),
  url: z.url().optional(),
  status: attachmentStatusSchema,
});

export const messageRoleSchema = z.enum(["user", "assistant", "system"]);
export const messageStatusSchema = z.enum(["streaming", "done", "error"]);
export const messageFeedbackSchema = z.enum(["good", "bad"]);

export const messageSchema = z.object({
  id: idSchema,
  role: messageRoleSchema,
  content: z.string(),
  attachments: z.array(attachmentSchema).optional(),
  createdAt: isoDateStringSchema,
  status: messageStatusSchema.optional(),
  feedback: messageFeedbackSchema.nullable().optional(),
});

export const conversationSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  createdAt: isoDateStringSchema.optional(),
  updatedAt: isoDateStringSchema,
  modelId: idSchema.optional(),
  preview: z.string().optional(),
});

export const conversationListSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(conversationSchema),
});

export const messageListSchema = z.object({
  nextCursor: z.string().nullable(),
  previousCursor: z.string().nullable(),
  results: z.array(messageSchema),
});

export const sendMessageInputSchema = z.object({
  conversationId: idSchema,
  content: z.string().min(1),
  attachments: z.array(attachmentSchema).default([]),
});

export const createConversationInputSchema = z.object({
  modelId: idSchema.optional(),
});

export const editUserMessageInputSchema = z.object({
  conversationId: idSchema,
  messageId: idSchema,
  content: z.string().min(1),
});

export const regenerateLastAssistantMessageInputSchema = z.object({
  conversationId: idSchema,
});

export const messageFeedbackInputSchema = z.object({
  messageId: idSchema,
  feedback: messageFeedbackSchema,
});

export type Model = z.infer<typeof modelSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type Message = z.infer<typeof messageSchema>;
export type MessageFeedback = z.infer<typeof messageFeedbackSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type ConversationList = z.infer<typeof conversationListSchema>;
export type MessageList = z.infer<typeof messageListSchema>;
