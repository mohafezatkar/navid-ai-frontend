"use client";

import { motion } from "framer-motion";
import { CircleHelp, PanelLeftClose, PanelLeftOpen, Settings, SquarePen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { ConversationList } from "@/app/[locale]/(protected)/(workspace)/components/conversation-list";
import { SidebarHeader } from "@/app/[locale]/(protected)/(workspace)/components/sidebar-header";
import { UserMenu } from "@/app/[locale]/(protected)/(workspace)/components/user-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-conversations-query";
import { useCreateConversationMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSED_WIDTH = 80;
const SIDEBAR_EXPANDED_WIDTH = 320;

const SIDEBAR_WIDTH_TRANSITION = {
  duration: 0.28,
  ease: "easeIn" as const,
};

const SIDEBAR_TEXT_FADE_DURATION_MS = 160;
const SIDEBAR_TEXT_FADE_TRANSITION = {
  duration: SIDEBAR_TEXT_FADE_DURATION_MS / 1000,
  ease: "easeOut" as const,
};

const NAV_ICON_SLOT_CLASS = "flex size-7 shrink-0 items-center justify-center";

function getActiveConversationId(pathname: string): string | undefined {
  if (!pathname.startsWith(`${routes.workspace.chat}/`)) {
    return undefined;
  }

  const segments = pathname.split("/");
  return segments[2] || undefined;
}

export function AppSidebar() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsing, setIsCollapsing] = useState(false);
  const collapseTimeoutRef = useRef<number | null>(null);
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const conversationsQuery = useConversationsQuery();
  const createConversationMutation = useCreateConversationMutation();
  const isTextVisible = !isSidebarCollapsed && !isCollapsing;

  const activeConversationId = getActiveConversationId(pathname);

  const createConversation = async () => {
    window.dispatchEvent(new CustomEvent("chat:new-chat-clicked"));
    const conversation = await createConversationMutation.mutateAsync();
    router.push(routes.workspace.conversation(conversation.id));
  };

  const collapseSidebar = () => {
    if (isSidebarCollapsed || isCollapsing) {
      return;
    }

    setIsCollapsing(true);
    collapseTimeoutRef.current = window.setTimeout(() => {
      setSidebarCollapsed(true);
      setIsCollapsing(false);
      collapseTimeoutRef.current = null;
    }, SIDEBAR_TEXT_FADE_DURATION_MS);
  };

  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current !== null) {
        window.clearTimeout(collapseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
      }}
      transition={SIDEBAR_WIDTH_TRANSITION}
      onClick={() => {
        if (isSidebarCollapsed) {
          setSidebarCollapsed(false);
        }
      }}
      className={cn(
        "group/sidebar hidden h-screen shrink-0 overflow-hidden bg-sidebar px-2 py-3 md:flex md:flex-col",
        isSidebarCollapsed && "cursor-pointer",
      )}
    >
      {isSidebarCollapsed ? (
        <div className="mb-2 px-1">
          <div className="relative h-9 w-full">
            <div className="pointer-events-none absolute inset-0 transition-opacity duration-150 group-hover/sidebar:opacity-0">
              <SidebarHeader collapsed />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-start opacity-0 transition-opacity duration-150 group-hover/sidebar:opacity-100">
              <span className="ms-2 p-1.5">
                <PanelLeftOpen className="size-4 text-muted-foreground" />
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex items-center px-1">
          <SidebarHeader />
          <Button
            variant="ghost"
            size="icon"
            className="ms-auto shrink-0 text-muted-foreground hover:text-foreground"
            onClick={collapseSidebar}
            disabled={isCollapsing}
          >
            <PanelLeftClose className="size-4" />
            <span className="sr-only">{t("actions.toggleSidebar")}</span>
          </Button>
        </div>
      )}

      {!isSidebarCollapsed ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <nav className="mb-2 grid gap-0.5 px-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 justify-start gap-2 rounded-md px-2 font-normal"
              onClick={() => void createConversation()}
            >
              <span className={NAV_ICON_SLOT_CLASS}>
                <SquarePen className="size-4" />
              </span>
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: isTextVisible ? 1 : 0, x: isTextVisible ? 0 : -4 }}
                transition={SIDEBAR_TEXT_FADE_TRANSITION}
              >
                {t("actions.newChat")}
              </motion.span>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn(
                "h-9 justify-start gap-2 rounded-md px-2 font-normal",
                pathname.startsWith(routes.workspace.settings.root) &&
                  "bg-accent/40 text-foreground",
              )}
            >
              <Link href={routes.workspace.settings.preferences}>
                <span className={NAV_ICON_SLOT_CLASS}>
                  <Settings className="size-4" />
                </span>
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: isTextVisible ? 1 : 0, x: isTextVisible ? 0 : -4 }}
                  transition={SIDEBAR_TEXT_FADE_TRANSITION}
                >
                  {t("navigation.settings")}
                </motion.span>
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn(
                "h-9 justify-start gap-2 rounded-md px-2 font-normal",
                pathname.startsWith(routes.workspace.help) && "bg-accent/40 text-foreground",
              )}
            >
              <Link href={routes.workspace.help}>
                <span className={NAV_ICON_SLOT_CLASS}>
                  <CircleHelp className="size-4" />
                </span>
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: isTextVisible ? 1 : 0, x: isTextVisible ? 0 : -4 }}
                  transition={SIDEBAR_TEXT_FADE_TRANSITION}
                >
                  {t("navigation.help")}
                </motion.span>
              </Link>
            </Button>
          </nav>
          <motion.p
            className="mb-2 px-3 text-xs font-medium text-muted-foreground"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: isTextVisible ? 1 : 0, x: isTextVisible ? 0 : -4 }}
            transition={SIDEBAR_TEXT_FADE_TRANSITION}
          >
            {t("pages.chat.recentChats")}
          </motion.p>
          <div className="min-h-0 flex-1">
            <ScrollArea className="h-full px-1">
              <ConversationList
                conversations={conversationsQuery.data ?? []}
                activeConversationId={activeConversationId}
                onSelectConversation={(conversationId) =>
                  router.push(routes.workspace.conversation(conversationId))
                }
              />
            </ScrollArea>
          </div>
          <div className="mt-2 border-t border-border/50 px-1 pt-2">
            <UserMenu />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col px-1">
          <div className="mb-2 flex ps-1">
            <Button
              size="icon"
              className="rounded-md"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                void createConversation();
              }}
              aria-label={t("actions.newChat")}
            >
              <SquarePen className="size-4" />
            </Button>
          </div>
          <div className="mt-auto flex ps-1">
            <UserMenu compact />
          </div>
        </div>
      )}
    </motion.aside>
  );
}


