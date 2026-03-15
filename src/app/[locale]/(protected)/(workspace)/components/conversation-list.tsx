"use client";

import * as React from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { useDeleteConversationMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingButton } from "@/components/ui/loading-button";
import type { Conversation } from "@/lib/api/types";
import { usePathname, useRouter } from "@/i18n/navigation";
import { isRtlLanguage } from "@/i18n/routing";
import { routes } from "@/lib/routes";
import { resolveContentTypography } from "@/lib/content-typography";
import { cn } from "@/lib/utils";

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
};

const THINK_TAG_REGEX = /<\/?think>/gi;

function getRouteConversationId(pathname: string): string | undefined {
  if (!pathname.startsWith(`${routes.workspace.chat}/`)) {
    return undefined;
  }

  const segments = pathname.split("/");
  return segments[2] || undefined;
}

function normalizeConversationTitle(rawTitle: string): string {
  return rawTitle.replace(THINK_TAG_REGEX, "").replace(/\s+/g, " ").trim();
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const deleteConversationMutation = useDeleteConversationMutation();
  const [conversationPendingDelete, setConversationPendingDelete] = React.useState<Conversation | null>(
    null,
  );
  const locale = useLocale();
  const fallbackDir = isRtlLanguage(locale) ? "rtl" : "ltr";
  const currentConversationId =
    activeConversationId ?? getRouteConversationId(pathname);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!conversationPendingDelete || deleteConversationMutation.isPending) {
      return;
    }

    const deletingConversationId = conversationPendingDelete.id;

    try {
      await deleteConversationMutation.mutateAsync(deletingConversationId);
      setConversationPendingDelete(null);

      if (currentConversationId === deletingConversationId) {
        router.replace(routes.workspace.chat);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("errors.chat.failedDeleteConversation"),
      );
    }
  }, [
    conversationPendingDelete,
    currentConversationId,
    deleteConversationMutation,
    router,
    t,
  ]);

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-2 text-sm text-muted-foreground">
        {t("pages.chat.noConversationsPanel")}
      </div>
    );
  }

  return (
    <>
      <ul className="w-full max-w-full space-y-0.5 overflow-x-hidden">
        {conversations.map((conversation) => {
          const normalizedTitle = normalizeConversationTitle(conversation.title);
          const displayTitle =
            normalizedTitle.length > 0 ? normalizedTitle : t("actions.newChat");
          const titleTypography = resolveContentTypography(
            displayTitle,
            fallbackDir,
          );
          const isActive = conversation.id === currentConversationId;

          return (
            <li key={conversation.id} className="w-full max-w-full overflow-hidden">
              <div
                className={cn(
                  "group/item grid w-full max-w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center overflow-hidden rounded-md pe-1 transition-colors hover:bg-accent/35",
                  isActive
                    ? "bg-accent/45 text-foreground"
                    : "text-foreground/90",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectConversation(conversation.id)}
                  className="min-w-0 w-full cursor-pointer overflow-hidden px-2.5 py-2 text-left text-sm"
                >
                  <p
                    className={cn(
                      "block w-full max-w-full truncate font-semibold",
                      titleTypography.fontClassName,
                    )}
                    dir={titleTypography.dir}
                  >
                    {displayTitle}
                  </p>
                </button>

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className={cn(
                        "size-7 shrink-0 text-muted-foreground opacity-70 transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:opacity-100 data-[state=open]:opacity-100",
                        isActive && "opacity-100",
                      )}
                      aria-label="Conversation actions"
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Conversation actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={deleteConversationMutation.isPending}
                      onSelect={() => setConversationPendingDelete(conversation)}
                    >
                      <Trash2 className="size-4" />
                      {t("actions.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={Boolean(conversationPendingDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteConversationMutation.isPending) {
            setConversationPendingDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <DialogDescription className="my-4 text-base font-semibold">
              This will delete{" "}
              <span className="wrap-break-word font-bold text-foreground">
                {conversationPendingDelete
                  ? normalizeConversationTitle(conversationPendingDelete.title)
                  : "this chat"}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={deleteConversationMutation.isPending}
              >
                {t("actions.cancel")}
              </Button>
            </DialogClose>
            <LoadingButton
              variant="destructive"
              loading={deleteConversationMutation.isPending}
              loadingText="Deleting..."
              onClick={() => {
                void handleConfirmDelete();
              }}
            >
              {t("actions.delete")}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
