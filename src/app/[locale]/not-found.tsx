import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routes } from "@/lib/routes";

export default async function NotFound() {
  const t = await getTranslations();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-border/70 bg-card/80 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {t("pages.notFound.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("pages.notFound.description")}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href={routes.workspace.chat}>{t("actions.goToChat")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={routes.home}>{t("actions.goHome")}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
