import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "@/lib/attachment-rules";

type AttachmentValidationMessages = {
  maxPerMessage: (count: number) => string;
  maxFileSize: (sizeMb: number) => string;
  unsupportedType: string;
};

function hasAllowedExtension(fileName: string): boolean {
  const extensionIndex = fileName.lastIndexOf(".");
  if (extensionIndex < 0) {
    return false;
  }
  return ALLOWED_ATTACHMENT_EXTENSIONS.has(fileName.slice(extensionIndex).toLowerCase());
}

export function validateAttachmentFile(
  file: File,
  existingCount: number,
  messages: AttachmentValidationMessages,
): string | null {
  if (existingCount >= MAX_ATTACHMENTS_PER_MESSAGE) {
    return messages.maxPerMessage(MAX_ATTACHMENTS_PER_MESSAGE);
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return messages.maxFileSize(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024));
  }

  const mimeAllowed = file.type ? ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type) : false;
  const extensionAllowed = hasAllowedExtension(file.name);

  if (!mimeAllowed && !extensionAllowed) {
    return messages.unsupportedType;
  }

  return null;
}
