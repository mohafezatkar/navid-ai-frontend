import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from "@/lib/constants";

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
): string | null {
  if (existingCount >= MAX_ATTACHMENTS_PER_MESSAGE) {
    return `Maximum ${MAX_ATTACHMENTS_PER_MESSAGE} attachments per message.`;
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return `Each file must be less than ${MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)}MB.`;
  }

  const mimeAllowed = file.type ? ALLOWED_ATTACHMENT_MIME_TYPES.has(file.type) : false;
  const extensionAllowed = hasAllowedExtension(file.name);

  if (!mimeAllowed && !extensionAllowed) {
    return "Unsupported file type. Use images, PDF, or text documents.";
  }

  return null;
}
