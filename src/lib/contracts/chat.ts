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

export const messageSchema = z.object({
  id: idSchema,
  role: messageRoleSchema,
  content: z.string(),
  attachments: z.array(attachmentSchema).optional(),
  createdAt: isoDateStringSchema,
  status: messageStatusSchema.optional(),
});

export const conversationSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  modelId: idSchema,
  updatedAt: isoDateStringSchema,
  preview: z.string(),
});

export const sendMessageInputSchema = z.object({
  conversationId: idSchema,
  content: z.string().min(1),
  attachments: z.array(attachmentSchema),
});

export const createConversationInputSchema = z.object({
  modelId: idSchema,
});

export const editUserMessageInputSchema = z.object({
  conversationId: idSchema,
  messageId: idSchema,
  content: z.string().min(1),
});

export const regenerateLastAssistantMessageInputSchema = z.object({
  conversationId: idSchema,
});

export type ModelCapability = z.infer<typeof modelCapabilitySchema>;
export type Model = z.infer<typeof modelSchema>;
export type AttachmentStatus = z.infer<typeof attachmentStatusSchema>;
export type Attachment = z.infer<typeof attachmentSchema>;
export type MessageRole = z.infer<typeof messageRoleSchema>;
export type MessageStatus = z.infer<typeof messageStatusSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>;
export type CreateConversationInput = z.infer<typeof createConversationInputSchema>;
export type EditUserMessageInput = z.infer<typeof editUserMessageInputSchema>;
export type RegenerateLastAssistantMessageInput = z.infer<
  typeof regenerateLastAssistantMessageInputSchema
>;
