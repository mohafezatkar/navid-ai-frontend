"use client";

import { RefreshCcw, Square } from "lucide-react";

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
  return (
    <div className="flex items-center gap-2">
      {isStreaming ? (
        <Button variant="outline" size="sm" className="gap-2" onClick={onStop}>
          <Square className="size-3.5" />
          Stop
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
          Regenerate
        </Button>
      )}
    </div>
  );
}
