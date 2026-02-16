"use client";

import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ConversationList } from "@/components/shell/conversation-list";
import { SidebarHeader } from "@/components/shell/sidebar-header";
import { UserMenu } from "@/components/shell/user-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useConversationsQuery } from "@/features/chat/hooks/use-conversations-query";
import { useCreateConversationMutation } from "@/features/chat/hooks/use-chat-mutations";
import { useModelsQuery } from "@/features/chat/hooks/use-models-query";

export function MobileNavSheet() {
  const router = useRouter();
  const conversationsQuery = useConversationsQuery();
  const modelsQuery = useModelsQuery();
  const createConversationMutation = useCreateConversationMutation();

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="size-4" />
          <span className="sr-only">Open conversation sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="px-4 py-3">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Conversations and account shortcuts.</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 border-t border-border/70 px-4 py-4">
          <SidebarHeader />
          <nav className="grid gap-1 rounded-lg border border-border/70 bg-card/50 p-2">
            <Button asChild size="sm" variant="ghost" className="justify-start">
              <Link href="/chat">Chat</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="justify-start">
              <Link href="/settings/preferences">Settings</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="justify-start">
              <Link href="/help">Help</Link>
            </Button>
          </nav>
          <Button
            className="w-full justify-start gap-2"
            onClick={() => void createConversation()}
            disabled={createConversationMutation.isPending || modelsQuery.isLoading}
          >
            <Plus className="size-4" />
            New chat
          </Button>
          <ScrollArea className="h-[50vh]">
            <ConversationList
              conversations={conversationsQuery.data ?? []}
              onSelectConversation={(conversationId) => router.push(`/chat/${conversationId}`)}
            />
          </ScrollArea>
          <div className="border-t border-border/70 pt-3">
            <UserMenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
