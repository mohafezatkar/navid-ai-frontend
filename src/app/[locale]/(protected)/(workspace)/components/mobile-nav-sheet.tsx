"use client";

import { Menu, SquarePen } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ConversationList } from "@/app/[locale]/(protected)/(workspace)/components/conversation-list";
import { SidebarHeader } from "@/app/[locale]/(protected)/(workspace)/components/sidebar-header";
import { UserMenu } from "@/app/[locale]/(protected)/(workspace)/components/user-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useConversationsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-conversations-query";
import { useCreateConversationMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { isRtlLanguage } from "@/i18n/routing";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function MobileNavSheet() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = isRtlLanguage(locale);
  const pathname = usePathname();
  const router = useRouter();
  const conversationsQuery = useConversationsQuery();
  const createConversationMutation = useCreateConversationMutation();

  const createConversation = async () => {
    window.dispatchEvent(new CustomEvent("chat:new-chat-clicked"));
    const conversation = await createConversationMutation.mutateAsync();
    router.push(routes.workspace.conversation(conversation.id));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="size-4" />
          <span className="sr-only">{t("actions.openConversationSidebar")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={isRtl ? "right" : "left"} className="w-80 bg-sidebar p-0">
        <div className="space-y-2 px-3 py-3">
          <SidebarHeader />
          <nav className="grid gap-0.5 px-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 justify-start rounded-md px-2.5 font-normal"
              onClick={() => void createConversation()}
            >
              <SquarePen className="size-4" />
              {t("actions.newChat")}
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn(
                "h-9 justify-start rounded-md px-2.5 font-normal",
                pathname.startsWith(routes.workspace.settings.root) &&
                  "bg-accent/40 text-foreground",
              )}
            >
              <Link href={routes.workspace.settings.preferences}>{t("navigation.settings")}</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn(
                "h-9 justify-start rounded-md px-2.5 font-normal",
                pathname.startsWith(routes.workspace.help) && "bg-accent/40 text-foreground",
              )}
            >
              <Link href={routes.workspace.help}>{t("navigation.help")}</Link>
            </Button>
          </nav>
          <p className="px-3 pt-1 text-xs font-medium text-muted-foreground">
            {t("pages.chat.recentChats")}
          </p>
          <ScrollArea className="h-[50vh]">
            <ConversationList
              conversations={conversationsQuery.data ?? []}
              onSelectConversation={(conversationId) =>
                router.push(routes.workspace.conversation(conversationId))
              }
            />
          </ScrollArea>
          <div className="border-t border-border/50 px-1 pt-2">
            <UserMenu />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


