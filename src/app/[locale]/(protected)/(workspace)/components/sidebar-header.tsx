import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type SidebarHeaderProps = {
  collapsed?: boolean;
};

export function SidebarHeader({ collapsed = false }: SidebarHeaderProps) {
  const t = useTranslations();

  return (
    <Link
      href={routes.workspace.chat}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/35",
        collapsed && "w-full",
      )}
    >
      <div className="rounded-md bg-foreground/10 p-1.5 text-foreground">
        <Sparkles className="size-4" />
      </div>
    </Link>
  );
}
