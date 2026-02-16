import { MessageCircleMore } from "lucide-react";

import { Button } from "@/components/ui/button";

type ChatEmptyStateProps = {
  onStart: () => void;
  disabled?: boolean;
};

export function ChatEmptyState({ onStart, disabled }: ChatEmptyStateProps) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/40 p-8 text-center">
      <div className="mb-3 rounded-full bg-primary/15 p-3 text-primary">
        <MessageCircleMore className="size-6" />
      </div>
      <h2 className="text-xl font-semibold">Start your first conversation</h2>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Choose a model and send a message. You can upload images or documents to provide
        context.
      </p>
      <Button className="mt-5" onClick={onStart} disabled={disabled}>
        Start chatting
      </Button>
    </div>
  );
}
