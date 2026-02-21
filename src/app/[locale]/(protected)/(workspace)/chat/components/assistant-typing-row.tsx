import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function AssistantTypingRow() {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {t("status.assistantTyping")}
    </div>
  );
}
