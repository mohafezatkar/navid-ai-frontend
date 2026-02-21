"use client";

import * as React from "react";
import { Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { Attachment } from "@/lib/api/types";
import { AttachmentChip } from "@/app/[locale]/(protected)/(workspace)/chat/components/attachment-chip";
import { Button } from "@/components/ui/button";
import { useUploadAttachmentMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { validateAttachmentFile } from "@/app/[locale]/(protected)/(workspace)/chat/lib/attachment-validation";

type AttachmentPickerProps = {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
};

const ACCEPTED_FILE_TYPES =
  ".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md,image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown";

export function AttachmentPicker({
  attachments,
  onAttachmentsChange,
}: AttachmentPickerProps) {
  const t = useTranslations();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadAttachmentMutation = useUploadAttachmentMutation();

  const removeAttachment = (attachmentId: string) => {
    onAttachmentsChange(
      attachments.filter((attachment) => attachment.id !== attachmentId),
    );
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    let nextAttachments = [...attachments];

    for (const file of Array.from(files)) {
      const validationError = validateAttachmentFile(file, nextAttachments.length, {
        maxPerMessage: (count) => t("errors.attachments.maxPerMessage", { count }),
        maxFileSize: (sizeMb) => t("errors.attachments.maxFileSize", { sizeMb }),
        unsupportedType: t("errors.attachments.unsupportedType"),
      });
      if (validationError) {
        toast.error(validationError);
        continue;
      }

      const optimisticAttachment: Attachment = {
        id: `temp_${crypto.randomUUID()}`,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        status: "uploading",
      };

      nextAttachments = [...nextAttachments, optimisticAttachment];
      onAttachmentsChange(nextAttachments);

      try {
        const uploadedAttachment = await uploadAttachmentMutation.mutateAsync(file);
        nextAttachments = nextAttachments.map((attachment) =>
          attachment.id === optimisticAttachment.id ? uploadedAttachment : attachment,
        );
        onAttachmentsChange(nextAttachments);
      } catch {
        nextAttachments = nextAttachments.map((attachment) =>
          attachment.id === optimisticAttachment.id
            ? { ...attachment, status: "failed" }
            : attachment,
        );
        onAttachmentsChange(nextAttachments);
        toast.error(t("errors.attachments.uploadFailed", { fileName: file.name }));
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="size-4" />
          {t("actions.attachFiles")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={(event) => void uploadFiles(event.target.files)}
        />
      </div>
      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <AttachmentChip
              key={attachment.id}
              attachment={attachment}
              onRemove={removeAttachment}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}


