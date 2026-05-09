import { articles } from "../schema";
import { getDbClient, type DbClient } from "../index";
import type { ArticleInput } from "@/lib/schemas/production-pack";

export type ArticleRecord = {
  id: string;
  title: string;
  rawText: string;
  sourceUrl: string;
  publishDate: string;
  sourceName: string;
  industryTags: string[];
  targetDurations: Array<90 | 180>;
  createdAt: string;
};

export function createArticle(
  input: ArticleInput,
  client: DbClient = getDbClient()
): ArticleRecord {
  const now = new Date().toISOString();
  const article: ArticleRecord = {
    id: crypto.randomUUID(),
    title: input.title,
    rawText: input.rawText,
    sourceUrl: input.sourceUrl,
    publishDate: input.publishDate,
    sourceName: input.sourceName,
    industryTags: input.industryTags,
    targetDurations: input.targetDurations,
    createdAt: now
  };

  client.db
    .insert(articles)
    .values({
      id: article.id,
      title: article.title,
      rawText: article.rawText,
      sourceUrl: article.sourceUrl,
      publishDate: article.publishDate,
      sourceName: article.sourceName,
      industryTagsJson: JSON.stringify(article.industryTags),
      targetDurationsJson: JSON.stringify(article.targetDurations),
      createdAt: article.createdAt
    })
    .run();

  return article;
}
