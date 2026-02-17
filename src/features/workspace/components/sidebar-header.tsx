import { Sparkles } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type SidebarHeaderProps = {
  collapsed?: boolean;
};

export function SidebarHeader({ collapsed = false }: SidebarHeaderProps) {
  return (
    <Link
      href="/chat"
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border/70 bg-card/80 px-3 py-2",
        collapsed && "justify-center px-2",
      )}
    >
      <div className="rounded-lg bg-primary/15 p-1.5 text-primary">
        <Sparkles className="size-4" />
      </div>
      {!collapsed ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">Navid AI</p>
          <p className="truncate text-[11px] text-muted-foreground">Conversational workspace</p>
        </div>
      ) : null}
    </Link>
  );
}
