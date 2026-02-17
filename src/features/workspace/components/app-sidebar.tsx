"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { ConversationList } from "@/features/workspace/components/conversation-list";
import { SidebarHeader } from "@/features/workspace/components/sidebar-header";
import { UserMenu } from "@/features/workspace/components/user-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationsQuery } from "@/features/chat/hooks/use-conversations-query";
import { useCreateConversationMutation } from "@/features/chat/hooks/use-chat-mutations";
import { useModelsQuery } from "@/features/chat/hooks/use-models-query";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

function getActiveConversationId(pathname: string): string | undefined {
  if (!pathname.startsWith("/chat/")) {
    return undefined;
  }

  const segments = pathname.split("/");
  return segments[2] || undefined;
}

export function AppSidebar() {
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
    router.push(`/chat/${conversation.id}`);
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
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <Button
        className="mb-3 gap-2"
        variant={isSidebarCollapsed ? "outline" : "default"}
        onClick={() => void createConversation()}
        disabled={createConversationMutation.isPending || modelsQuery.isLoading}
      >
        <Plus className="size-4" />
        {!isSidebarCollapsed ? "New chat" : null}
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
                variant={pathname.startsWith("/chat") ? "secondary" : "ghost"}
                className="justify-start"
              >
                <Link href="/chat">Chat</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant={pathname.startsWith("/settings") ? "secondary" : "ghost"}
                className="justify-start"
              >
                <Link href="/settings/preferences">Settings</Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant={pathname.startsWith("/help") ? "secondary" : "ghost"}
                className="justify-start"
              >
                <Link href="/help">Help</Link>
              </Button>
            </nav>
            <ScrollArea className="min-h-0 flex-1 pr-2">
              <ConversationList
                conversations={conversationsQuery.data ?? []}
                activeConversationId={activeConversationId}
                onSelectConversation={(conversationId) => router.push(`/chat/${conversationId}`)}
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

