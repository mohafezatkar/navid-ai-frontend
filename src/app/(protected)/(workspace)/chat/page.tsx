"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ChatEmptyState } from "@/features/chat/components/chat-empty-state";
import { ModelSelector } from "@/features/chat/components/model-selector";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { useConversationsQuery } from "@/features/chat/hooks/use-conversations-query";
import { useCreateConversationMutation } from "@/features/chat/hooks/use-chat-mutations";
import { useModelsQuery } from "@/features/chat/hooks/use-models-query";
import { usePreferencesQuery } from "@/features/settings/hooks/use-preferences-query";

export default function ChatHomePage() {
  const router = useRouter();
  const modelsQuery = useModelsQuery();
  const conversationsQuery = useConversationsQuery();
  const preferencesQuery = usePreferencesQuery();
  const createConversationMutation = useCreateConversationMutation();

  const [selectedModelOverride, setSelectedModelOverride] = useState<string | null>(null);
  const selectedModelId =
    selectedModelOverride ??
    preferencesQuery.data?.defaultModelId ??
    modelsQuery.data?.[0]?.id ??
    "";

  const startConversation = async () => {
    if (!selectedModelId) {
      return;
    }
    const conversation = await createConversationMutation.mutateAsync({
      modelId: selectedModelId,
    });
    router.push(`/chat/${conversation.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat workspace"
        description="Create a new conversation or continue from recent history."
        actions={
          <ModelSelector
            models={modelsQuery.data ?? []}
            value={selectedModelId}
            onChange={setSelectedModelOverride}
            disabled={modelsQuery.isLoading}
          />
        }
      />

      {modelsQuery.isLoading ? <LoadingState label="Loading models..." /> : null}
      {modelsQuery.isError ? (
        <ErrorState
          title="Could not load models"
          description="Refresh and try again."
          onRetry={() => void modelsQuery.refetch()}
        />
      ) : null}

      {!modelsQuery.isLoading && !modelsQuery.isError ? (
        <ChatEmptyState
          onStart={() => void startConversation()}
          disabled={createConversationMutation.isPending || !selectedModelId}
        />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Recent chats
        </h2>
        {conversationsQuery.isLoading ? (
          <LoadingState label="Loading conversations..." />
        ) : conversationsQuery.data?.length ? (
          <div className="grid gap-2 md:grid-cols-2">
            {conversationsQuery.data.slice(0, 6).map((conversation) => (
              <Button
                key={conversation.id}
                asChild
                variant="outline"
                className="h-auto justify-start p-3 text-left"
              >
                <Link href={`/chat/${conversation.id}`}>
                  <div>
                    <p className="font-medium">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">{conversation.preview}</p>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        )}
      </section>
    </div>
  );
}

