"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Input } from "@/components/ui/input";
import { useHelpArticlesQuery } from "@/app/[locale]/(protected)/(workspace)/help/hooks/use-help-query";

export default function HelpCenterPage() {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const helpArticlesQuery = useHelpArticlesQuery();

  const filteredArticles = useMemo(() => {
    const articles = helpArticlesQuery.data ?? [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return articles;
    }

    return articles.filter((article) => {
      const haystack = `${article.title} ${article.body}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [helpArticlesQuery.data, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pages.help.title")}
        description={t("pages.help.description")}
      />

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("pages.help.searchPlaceholder")}
        className="max-w-md"
      />

      {helpArticlesQuery.isLoading ? <LoadingState label={t("status.loadingHelpArticles")} /> : null}
      {helpArticlesQuery.isError ? (
        <ErrorState
          title={t("errors.chat.failedLoadHelpTitle")}
          description={t("errors.chat.failedLoadHelpDescription")}
          onRetry={() => void helpArticlesQuery.refetch()}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <SectionCard key={article.id} title={article.title}>
            <p className="text-sm leading-6 text-muted-foreground">{article.body}</p>
          </SectionCard>
        ))}
      </div>

      {!helpArticlesQuery.isLoading && !helpArticlesQuery.isError && filteredArticles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("pages.help.empty")}</p>
      ) : null}
    </div>
  );
}

