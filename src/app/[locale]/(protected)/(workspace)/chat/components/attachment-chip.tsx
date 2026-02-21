"use client";

import { FileText, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Attachment } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AttachmentChipProps = {
  attachment: Attachment;
  onRemove?: (attachmentId: string) => void;
};

function statusLabel(
  status: Attachment["status"],
  t: (key: string) => string,
): string {
  switch (status) {
    case "uploading":
      return t("status.uploading");
    case "failed":
      return t("status.failed");
    case "uploaded":
      return t("status.ready");
    default:
      return t("status.queued");
  }
}

export function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/80 px-2 py-1.5 text-xs">
      {attachment.status === "uploading" ? (
        <Loader2 className="size-3 animate-spin text-muted-foreground" />
      ) : (
        <FileText className="size-3 text-muted-foreground" />
      )}
      <span className="max-w-[140px] truncate font-medium">{attachment.name}</span>
      <Badge variant="outline" className="text-[10px]">
        {statusLabel(attachment.status, t)}
      </Badge>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-5"
          onClick={() => onRemove(attachment.id)}
        >
          <X className="size-3" />
          <span className="sr-only">{t("actions.delete")}</span>
        </Button>
      ) : null}
    </div>
  );
}
