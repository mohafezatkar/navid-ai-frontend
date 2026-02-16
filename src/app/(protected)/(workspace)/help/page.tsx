"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Input } from "@/components/ui/input";
import { useHelpArticlesQuery } from "@/features/help/hooks/use-help-query";

export default function HelpCenterPage() {
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
        title="Help center"
        description="Browse onboarding guidance, prompt patterns, and troubleshooting notes."
      />

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search help articles..."
        className="max-w-md"
      />

      {helpArticlesQuery.isLoading ? <LoadingState label="Loading help articles..." /> : null}
      {helpArticlesQuery.isError ? (
        <ErrorState
          title="Could not load help content"
          description="Try refreshing this page."
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
        <p className="text-sm text-muted-foreground">No matching help articles found.</p>
      ) : null}
    </div>
  );
}
