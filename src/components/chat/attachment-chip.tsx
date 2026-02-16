"use client";

import { FileText, Loader2, X } from "lucide-react";

import type { Attachment } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AttachmentChipProps = {
  attachment: Attachment;
  onRemove?: (attachmentId: string) => void;
};

function statusLabel(status: Attachment["status"]): string {
  switch (status) {
    case "uploading":
      return "Uploading";
    case "failed":
      return "Failed";
    case "uploaded":
      return "Ready";
    default:
      return "Queued";
  }
}

export function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/80 px-2 py-1.5 text-xs">
      {attachment.status === "uploading" ? (
        <Loader2 className="size-3 animate-spin text-muted-foreground" />
      ) : (
        <FileText className="size-3 text-muted-foreground" />
      )}
      <span className="max-w-[140px] truncate font-medium">{attachment.name}</span>
      <Badge variant="outline" className="text-[10px]">
        {statusLabel(attachment.status)}
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
          <span className="sr-only">Remove attachment</span>
        </Button>
      ) : null}
    </div>
  );
}
