"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { ConversationList } from "@/app/[locale]/(protected)/(workspace)/components/conversation-list";
import { SidebarHeader } from "@/app/[locale]/(protected)/(workspace)/components/sidebar-header";
import { UserMenu } from "@/app/[locale]/(protected)/(workspace)/components/user-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-conversations-query";
import { useCreateConversationMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { useModelsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-models-query";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

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
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const conversationsQuery = useConversationsQuery();
  const modelsQuery = useModelsQuery();
  const createConversationMutation = useCreateConversationMutation();

  const activeConversationId = getActiveConversationId(pathname);

  const createConversation = async () => {
    const fallbackModelId = modelsQuery.data?.[0]?.id;
    if (!fallbackModelId) {
      return;
    }
    const conversation = await createConversationMutation.mutateAsync({
      modelId: fallbackModelId,
    });
    router.push(routes.workspace.conversation(conversation.id));
  };

  return (
    <aside
      className={cn(
        "hidden h-screen border-r border-border/70 bg-sidebar/70 p-3 backdrop-blur md:flex md:flex-col",
        isSidebarCollapsed ? "w-20" : "w-80",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <SidebarHeader collapsed={isSidebarCollapsed} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
          <span className="sr-only">{t("actions.toggleSidebar")}</span>
        </Button>
      </div>

      <Button
        className="mb-3 gap-2"
        variant={isSidebarCollapsed ? "outline" : "default"}
        onClick={() => void createConversation()}
        disabled={createConversationMutation.isPending || modelsQuery.isLoading}
      >
        <Plus className="size-4" />
        {!isSidebarCollapsed ? t("actions.newChat") : null}
      </Button>

      <AnimatePresence mode="wait">
        {!isSidebarCollapsed ? (
          <motion.div
            key="expanded-sidebar-content"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <nav className="mb-3 grid gap-1 rounded-lg border border-border/60 bg-card/50 p-2">
              <Button
                asChild
                size="sm"
                variant={pathname.startsWith(routes.workspace.chat) ? "secondary" : "ghost"}
                className="justify-start"
              >
                <Link href={routes.workspace.chat}>{t("navigation.chat")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant={pathname.startsWith(routes.workspace.settings.root) ? "secondary" : "ghost"}
                className="justify-start"
              >
                <Link href={routes.workspace.settings.preferences}>{t("navigation.settings")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant={pathname.startsWith(routes.workspace.help) ? "secondary" : "ghost"}
                className="justify-start"
              >
                <Link href={routes.workspace.help}>{t("navigation.help")}</Link>
              </Button>
            </nav>
            <ScrollArea className="min-h-0 flex-1 pr-2">
              <ConversationList
                conversations={conversationsQuery.data ?? []}
                activeConversationId={activeConversationId}
                onSelectConversation={(conversationId) =>
                  router.push(routes.workspace.conversation(conversationId))
                }
              />
            </ScrollArea>
            <div className="mt-3 border-t border-border/70 pt-3">
              <UserMenu />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed-sidebar-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-auto flex justify-center"
          >
            <UserMenu />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}


