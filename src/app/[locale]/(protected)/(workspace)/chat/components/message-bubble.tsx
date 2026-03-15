"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Copy, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import type { Message } from "@/lib/api/types";
import { AttachmentChip } from "@/app/[locale]/(protected)/(workspace)/chat/components/attachment-chip";
import { MarkdownMessage } from "@/app/[locale]/(protected)/(workspace)/chat/components/markdown-message";
import { useMessageFeedbackMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isRtlLanguage } from "@/i18n/routing";
import { parseAssistantContent } from "@/lib/chat-message-content";
import { resolveContentTypography } from "@/lib/content-typography";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: Message;
  highlightFeedback?: boolean;
  onFeedbackSubmitted?: (messageId: string, feedback: "good" | "bad") => void;
};

export function MessageBubble({
  message,
  highlightFeedback = false,
  onFeedbackSubmitted,
}: MessageBubbleProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isUser = message.role === "user";
  const fallbackDir = isRtlLanguage(locale) ? "rtl" : "ltr";
  const [thoughtPanelOpen, setThoughtPanelOpen] = React.useState(false);
  const parsedAssistantContent = React.useMemo(
    () =>
      message.role === "assistant"
        ? parseAssistantContent(message.content)
        : {
            visibleContent: message.content,
            thoughtContent: "",
          },
    [message.content, message.role],
  );
  const renderedContent = parsedAssistantContent.visibleContent;
  const thoughtContent = parsedAssistantContent.thoughtContent;
  const hasThought =
    message.role === "assistant" &&
    message.status !== "streaming" &&
    thoughtContent.trim().length > 0;
  const thoughtPanelSide = fallbackDir === "rtl" ? "left" : "right";
  const ThoughtChevronIcon = fallbackDir === "rtl" ? ChevronLeft : ChevronRight;
  const contentTypography = resolveContentTypography(renderedContent, fallbackDir);
  const thoughtTypography = resolveContentTypography(thoughtContent, fallbackDir);
  const feedbackMutation = useMessageFeedbackMutation();
  const [selectedFeedback, setSelectedFeedback] = React.useState<"good" | "bad" | null>(
    message.feedback ?? null,
  );
  const [pendingFeedback, setPendingFeedback] = React.useState<"good" | "bad" | null>(null);
  const [isMessageCopied, setIsMessageCopied] = React.useState(false);
  const copyResetTimeoutRef = React.useRef<number | null>(null);

  const effectiveFeedback = pendingFeedback ?? selectedFeedback;
  const showAssistantActions =
    message.role === "assistant" &&
    message.status !== "streaming" &&
    renderedContent.trim().length > 0;

  React.useEffect(() => {
    setSelectedFeedback(message.feedback ?? null);
    setPendingFeedback(null);
  }, [message.id, message.feedback]);

  React.useEffect(() => {
    setThoughtPanelOpen(false);
  }, [message.id]);

  React.useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyMessage = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(renderedContent);
      setIsMessageCopied(true);
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
      copyResetTimeoutRef.current = window.setTimeout(() => {
        setIsMessageCopied(false);
        copyResetTimeoutRef.current = null;
      }, 2000);
    } catch {
      toast.error(t("errors.chat.failedCopyMessage"));
    }
  }, [renderedContent, t]);

  const handleFeedback = React.useCallback(
    async (feedback: "good" | "bad") => {
      if (effectiveFeedback || feedbackMutation.isPending) {
        return;
      }

      setPendingFeedback(feedback);
      try {
        await feedbackMutation.mutateAsync({
          messageId: message.id,
          feedback,
        });
        setSelectedFeedback(feedback);
        onFeedbackSubmitted?.(message.id, feedback);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : t("errors.chat.failedSendFeedback"),
        );
      } finally {
        setPendingFeedback(null);
      }
    },
    [effectiveFeedback, feedbackMutation, message.id, onFeedbackSubmitted, t],
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16 }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "min-w-0",
          isUser
            ? "max-w-[min(80%,42rem)] rounded-3xl bg-card px-4 py-2.5 text-md leading-7"
            : "max-w-2xl text-[1.05rem] leading-8 text-foreground",
          contentTypography.fontClassName,
        )}
        dir={contentTypography.dir}
      >
        {hasThought ? (
          <Sheet open={thoughtPanelOpen} onOpenChange={setThoughtPanelOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="mb-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/45 hover:text-foreground"
              >
                {t("pages.chat.thoughtLabel")}
                <ThoughtChevronIcon className="size-3.5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side={thoughtPanelSide}
              showCloseButton={false}
              className="w-[min(94vw,40rem)] sm:max-w-[40rem]"
            >
              <SheetHeader className="pb-1">
                <div className="flex items-center justify-between gap-3">
                  <SheetTitle>
                    {t("pages.chat.thoughtPanelTitle")}
                  </SheetTitle>
                  <SheetClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-md text-muted-foreground hover:text-foreground"
                      aria-label={t("actions.close")}
                    >
                      <X className="size-4" />
                    </Button>
                  </SheetClose>
                </div>
              </SheetHeader>
              <div className="min-h-0 flex-1 px-4 pb-4">
                <ScrollArea className="h-full pe-2">
                  <div className={cn("pt-2", thoughtTypography.fontClassName)} dir={thoughtTypography.dir}>
                    <MarkdownMessage
                      content={thoughtContent}
                      className="min-w-0 text-sm leading-7"
                    />
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}

        {isUser ? (
          <p className="min-w-0 flex-1 whitespace-pre-wrap">{renderedContent}</p>
        ) : (
          <MarkdownMessage content={renderedContent} className="min-w-0 flex-1" />
        )}

        {message.attachments?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <AttachmentChip key={attachment.id} attachment={attachment} />
            ))}
          </div>
        ) : null}

        {showAssistantActions ? (
          <div
            data-feedback-actions-for={message.id}
            dir="ltr"
            className={cn(
              "mt-3 flex w-fit mr-auto items-center gap-1 text-muted-foreground",
              highlightFeedback &&
                !effectiveFeedback &&
                "rounded-md border border-primary/40 bg-primary/10 px-2 py-1",
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="hover:text-foreground"
                  onClick={() => void handleCopyMessage()}
                >
                  {isMessageCopied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span className="sr-only">{t("actions.copy")}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={6}>
                {t("actions.copy")}
              </TooltipContent>
            </Tooltip>

            {effectiveFeedback !== "bad" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={cn(
                      "hover:text-foreground",
                      effectiveFeedback === "good" && "text-primary",
                    )}
                    data-feedback-option="good"
                    onClick={() => void handleFeedback("good")}
                    disabled={feedbackMutation.isPending}
                  >
                    <ThumbsUp
                      className={cn(
                        "size-3.5",
                        effectiveFeedback === "good" && "fill-current",
                      )}
                    />
                    <span className="sr-only">{t("pages.chat.goodResponse")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {t("pages.chat.goodResponse")}
                </TooltipContent>
              </Tooltip>
            ) : null}

            {effectiveFeedback !== "good" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={cn(
                      "hover:text-foreground",
                      effectiveFeedback === "bad" && "text-primary",
                    )}
                    data-feedback-option="bad"
                    onClick={() => void handleFeedback("bad")}
                    disabled={feedbackMutation.isPending}
                  >
                    <ThumbsDown
                      className={cn(
                        "size-3.5",
                        effectiveFeedback === "bad" && "fill-current",
                      )}
                    />
                    <span className="sr-only">{t("pages.chat.badResponse")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6}>
                  {t("pages.chat.badResponse")}
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence>
          {message.status === "streaming" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 h-1.5 w-24 rounded-full bg-primary/40"
            />
          ) : null}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
