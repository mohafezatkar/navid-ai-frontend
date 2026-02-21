"use client";

import { RefreshCcw, Square } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type StreamControlsProps = {
  isStreaming: boolean;
  isRegenerating?: boolean;
  onStop: () => void;
  onRegenerate: () => void;
};

export function StreamControls({
  isStreaming,
  isRegenerating,
  onStop,
  onRegenerate,
}: StreamControlsProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center gap-2">
      {isStreaming ? (
        <Button variant="outline" size="sm" className="gap-2" onClick={onStop}>
          <Square className="size-3.5" />
          {t("actions.stop")}
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onRegenerate}
          disabled={isRegenerating}
        >
          <RefreshCcw className="size-3.5" />
          {t("actions.regenerate")}
        </Button>
      )}
    </div>
  );
}
