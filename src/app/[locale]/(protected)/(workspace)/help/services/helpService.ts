import { fetchJson } from "@/lib/api/fetch-json";
import { helpArticlesSchema } from "@/lib/contracts";

export async function listArticles(): Promise<Array<{ id: string; title: string; body: string }>> {
  const data = await fetchJson<Array<{ id: string; title: string; body: string }>>(
    "/help/articles",
  );
  return helpArticlesSchema.parse(data);
}
