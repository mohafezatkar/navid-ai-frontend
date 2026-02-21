import type { ReactNode } from "react";
import { CheckCircle2, MessageSquareText, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

type AuthAsidePanelProps = {
  background?: ReactNode;
};

export function AuthAsidePanel({ background }: AuthAsidePanelProps) {
  const t = useTranslations("auth.aside");

  return (
    <aside className="relative hidden overflow-hidden w-full border-r border-border/70 bg-muted/30 lg:flex">
      <div className="absolute inset-0">
        {background}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background/80" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="space-y-6 p-12">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <div className="space-y-3">
            <h2 className="text-4xl font-semibold tracking-tight text-foreground">
              {t("title")}
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-foreground p-12">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-4 text-primary" />
            <span>{t("feature1")}</span>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquareText className="size-4 text-primary" />
            <span>{t("feature2")}</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 text-primary" />
            <span>{t("feature3")}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
