import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type LoadingStateProps = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export function LoadingState({
  label = "Loading...",
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-6 text-sm text-muted-foreground",
        fullScreen && "min-h-screen rounded-none border-none bg-background",
        className,
      )}
    >
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
