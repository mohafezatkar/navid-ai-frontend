"use client";

import * as React from "react";
import { SendHorizontal } from "lucide-react";

import type { Attachment } from "@/lib/api/types";
import { AttachmentPicker } from "@/features/chat/components/attachment-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ComposerProps = {
  draft: string;
  attachments: Attachment[];
  isSending?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onDraftChange: (value: string) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onSubmit: () => void;
};

export function Composer({
  draft,
  attachments,
  isSending,
  disabled,
  placeholder = "Type your message...",
  onDraftChange,
  onAttachmentsChange,
  onSubmit,
}: ComposerProps) {
  const canSubmit = (draft.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur">
      <AttachmentPicker attachments={attachments} onAttachmentsChange={onAttachmentsChange} />
      <div className="mt-2 flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[96px] resize-none border-border/70 bg-background/70",
            disabled && "opacity-80",
          )}
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSubmit) {
                onSubmit();
              }
            }
          }}
        />
        <Button
          className="gap-2"
          disabled={!canSubmit || isSending}
          onClick={onSubmit}
          type="button"
        >
          <SendHorizontal className="size-4" />
          Send
        </Button>
      </div>
    </div>
  );
}

