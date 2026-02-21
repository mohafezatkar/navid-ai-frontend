"use client";

import { Menu, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ConversationList } from "@/app/[locale]/(protected)/(workspace)/components/conversation-list";
import { SidebarHeader } from "@/app/[locale]/(protected)/(workspace)/components/sidebar-header";
import { UserMenu } from "@/app/[locale]/(protected)/(workspace)/components/user-menu";
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
import { useConversationsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-conversations-query";
import { useCreateConversationMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { useModelsQuery } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-models-query";
import { isRtlLanguage } from "@/i18n/routing";
import { Link, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

export function MobileNavSheet() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = isRtlLanguage(locale);
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
      <SheetContent side={isRtl ? "right" : "left"} className="w-80 p-0">
        <SheetHeader className="px-4 py-3">
          <SheetTitle>{t("navigation.navigation")}</SheetTitle>
          <SheetDescription>{t("navigation.conversationsAndShortcuts")}</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 border-t border-border/70 px-4 py-4">
          <SidebarHeader />
          <nav className="grid gap-1 rounded-lg border border-border/70 bg-card/50 p-2">
            <Button asChild size="sm" variant="ghost" className="justify-start">
              <Link href={routes.workspace.chat}>{t("navigation.chat")}</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="justify-start">
              <Link href={routes.workspace.settings.preferences}>{t("navigation.settings")}</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="justify-start">
              <Link href={routes.workspace.help}>{t("navigation.help")}</Link>
            </Button>
          </nav>
          <Button
            className="w-full justify-start gap-2"
            onClick={() => void createConversation()}
            disabled={createConversationMutation.isPending || modelsQuery.isLoading}
          >
            <Plus className="size-4" />
            {t("actions.newChat")}
          </Button>
          <ScrollArea className="h-[50vh]">
            <ConversationList
              conversations={conversationsQuery.data ?? []}
              onSelectConversation={(conversationId) =>
                router.push(routes.workspace.conversation(conversationId))
              }
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


