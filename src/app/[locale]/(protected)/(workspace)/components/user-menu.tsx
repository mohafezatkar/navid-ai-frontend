"use client";

import { LogOut, Moon, Settings, Sun, SunMoon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { useSessionQuery } from "@/app/[locale]/(auth)/hooks/use-session-query";
import { useLogoutMutation } from "@/app/[locale]/(auth)/hooks/use-auth-mutations";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

function initialsFromName(name: string | null | undefined): string {
  if (!name) {
    return "U";
  }
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserMenu() {
  const t = useTranslations();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { data: session } = useSessionQuery();
  const logoutMutation = useLogoutMutation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 px-2">
          <Avatar className="size-7">
            <AvatarFallback>{initialsFromName(session?.name)}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm">{session?.name ?? t("common.account")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{session?.email ?? t("common.noEmail")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {t("navigation.language")}
        </DropdownMenuLabel>
        <div className="px-2 pb-2">
          <LanguageSwitcher className="w-full justify-between" />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.workspace.settings.profile}>
            <Settings className="mr-2 size-4" />
            {t("navigation.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 size-4" />
          {t("pages.settings.themeLight")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 size-4" />
          {t("pages.settings.themeDark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <SunMoon className="mr-2 size-4" />
          {t("pages.settings.themeSystem")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          disabled={logoutMutation.isPending}
          onClick={async () => {
            await logoutMutation.mutateAsync();
            router.replace(routes.auth.login);
          }}
        >
          <LogOut className="mr-2 size-4" />
          {t("actions.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

