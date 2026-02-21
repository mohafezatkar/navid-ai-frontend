"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, Pencil, User } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Message } from "@/lib/api/types";
import { AttachmentChip } from "@/app/[locale]/(protected)/(workspace)/chat/components/attachment-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: Message;
  onEditUserMessage?: (message: Message) => void;
};

export function MessageBubble({ message, onEditUserMessage }: MessageBubbleProps) {
  const t = useTranslations();
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-3 rounded-xl border px-3 py-3",
        isAssistant
          ? "border-border/70 bg-card/80"
          : "border-primary/20 bg-primary/10 dark:bg-primary/15",
      )}
    >
      <div className="mt-0.5">
        {isAssistant ? (
          <Bot className="size-4 text-primary" />
        ) : (
          <User className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isAssistant ? t("pages.chat.assistantRole") : t("pages.chat.userRole")}
          </p>
          {isUser && onEditUserMessage ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => onEditUserMessage(message)}
            >
              <Pencil className="size-3" />
              {t("actions.edit")}
            </Button>
          ) : null}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>

        {message.attachments?.length ? (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <AttachmentChip key={attachment.id} attachment={attachment} />
            ))}
          </div>
        ) : null}

        <AnimatePresence>
          {message.status === "streaming" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-1.5 w-24 rounded-full bg-primary/40"
            />
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}


