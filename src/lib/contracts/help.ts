import { z } from "zod";

import { idSchema } from "@/lib/contracts/common";

export const helpArticleSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  body: z.string().min(1),
});

export const helpArticlesSchema = z.array(helpArticleSchema);

export type HelpArticle = z.infer<typeof helpArticleSchema>;
