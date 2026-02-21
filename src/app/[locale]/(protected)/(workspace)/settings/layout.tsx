import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={routes.workspace.settings.profile}>{t("navigation.profile")}</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={routes.workspace.settings.preferences}>{t("navigation.preferences")}</Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
