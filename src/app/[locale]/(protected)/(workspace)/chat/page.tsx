"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useSessionQuery } from "@/app/[locale]/(auth)/hooks/use-session-query";
import { ChatInput } from "@/app/[locale]/(protected)/(workspace)/chat/components/chat-input";
import { useCreateConversationMutation } from "@/app/[locale]/(protected)/(workspace)/chat/hooks/use-chat-mutations";
import { useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import { useDraftStore } from "@/stores/draft-store";

function resolveShortName(name: string | null | undefined, email: string | undefined): string {
  if (name && name.trim().length > 0) {
    return name.trim().split(/\s+/)[0] ?? "there";
  }

  if (email && email.trim().length > 0) {
    return email.trim().split("@")[0] ?? "there";
  }

  return "there";
}

function resolveHeading(template: string, shortName: string): string {
  return template
    .replaceAll("[User Shortname]", shortName)
    .replaceAll("{shortName}", shortName);
}

export default function ChatHomePage() {
  const t = useTranslations();
  const router = useRouter();
  const sessionQuery = useSessionQuery();
  const createConversationMutation = useCreateConversationMutation();
  const setDraft = useDraftStore((state) => state.setDraft);

  const shortName = useMemo(
    () => resolveShortName(sessionQuery.data?.name, sessionQuery.data?.email),
    [sessionQuery.data?.email, sessionQuery.data?.name],
  );

  const headingTemplates = useMemo(() => {
    const rawHeadingValue = t.raw("pages.chat.homeHeading");

    if (Array.isArray(rawHeadingValue)) {
      return rawHeadingValue.filter((item): item is string => typeof item === "string");
    }

    if (typeof rawHeadingValue === "string") {
      return [rawHeadingValue];
    }

    return [];
  }, [t]);

  const pickRandomHeading = useCallback(() => {
    const fallbackHeading = t("pages.chat.title");

    if (headingTemplates.length === 0) {
      return fallbackHeading;
    }

    const randomIndex = Math.floor(Math.random() * headingTemplates.length);
    const randomTemplate = headingTemplates[randomIndex] ?? fallbackHeading;
    return resolveHeading(randomTemplate, shortName);
  }, [headingTemplates, shortName, t]);

  const [homeHeading, setHomeHeading] = useState(() => t("pages.chat.title"));

  useEffect(() => {
    setHomeHeading(pickRandomHeading());
  }, [pickRandomHeading]);

  useEffect(() => {
    const handleNewChatClicked = () => {
      setHomeHeading(pickRandomHeading());
    };

    window.addEventListener("chat:new-chat-clicked", handleNewChatClicked);
    return () => {
      window.removeEventListener("chat:new-chat-clicked", handleNewChatClicked);
    };
  }, [pickRandomHeading]);

  const handleSubmit = async (message: string) => {
    const conversation = await createConversationMutation.mutateAsync();
    setDraft(conversation.id, message);
    router.push(routes.workspace.conversation(conversation.id));
  };

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-16">
        <h1 className="mb-8 text-center text-3xl font-normal tracking-tight text-foreground">
          {homeHeading}
        </h1>
        <ChatInput
          className="w-full p-2"
          placeholder={t("pages.chat.homeInputPlaceholder")}
          onSubmit={handleSubmit}
          disabled={createConversationMutation.isPending}
          showAttach={false}
          showTools={false}
          showVoice={false}
        />
      </div>
    </div>
  );
}
