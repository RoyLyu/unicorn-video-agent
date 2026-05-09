import { eq } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import { factChecks, type FactCheckRow } from "../schema";
import {
  FactCheckInputSchema,
  type FactCheckInput,
  type FactCheckStatus
} from "@/lib/review/review-schemas";
import type { ProductionPack } from "@/lib/schemas/production-pack";

export type FactCheckRecord = FactCheckInput & {
  id: string;
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function deriveFactChecks(productionPack: ProductionPack): FactCheckRecord[] {
  const article = productionPack.articleInput;
  const baseItems: FactCheckInput[] = [
    {
      itemType: "article",
      label: "文章标题",
      value: article.title,
      sourceUrl: article.sourceUrl,
      status: "pending",
      notes: ""
    },
    {
      itemType: "article",
      label: "文章来源",
      value: article.sourceName,
      sourceUrl: article.sourceUrl,
      status: "pending",
      notes: ""
    },
    {
      itemType: "article",
      label: "发布日期",
      value: article.publishDate,
      sourceUrl: article.sourceUrl,
      status: "pending",
      notes: ""
    }
  ];
  const factItems = productionPack.analysis.keyFacts.map((fact) => ({
    itemType: "key_fact",
    label: "关键事实",
    value: fact,
    sourceUrl: article.sourceUrl,
    status: "pending" as FactCheckStatus,
    notes: ""
  }));
  const metricItems = productionPack.analysis.industryData.map((metric) => ({
    itemType: "metric",
    label: metric.metric,
    value: metric.value,
    sourceUrl: article.sourceUrl,
    status: "pending" as FactCheckStatus,
    notes: metric.note
  }));

  return [...baseItems, ...factItems, ...metricItems].map((item, index) => ({
    ...item,
    id: `default-fact-${index + 1}`
  }));
}

export function getFactChecksByProjectId(
  projectId: string,
  productionPack: ProductionPack,
  client: DbClient = getDbClient()
): FactCheckRecord[] {
  const rows = client.db
    .select()
    .from(factChecks)
    .where(eq(factChecks.projectId, projectId))
    .all();

  return rows.length > 0 ? rows.map(mapFactCheckRow) : deriveFactChecks(productionPack);
}

export function hasStoredFactChecks(
  projectId: string,
  client: DbClient = getDbClient()
) {
  return (
    client.db
      .select({ id: factChecks.id })
      .from(factChecks)
      .where(eq(factChecks.projectId, projectId))
      .limit(1)
      .all().length > 0
  );
}

export function saveFactChecks(
  projectId: string,
  input: FactCheckInput[],
  client: DbClient = getDbClient()
): FactCheckRecord[] {
  const parsed = input.map((item) => FactCheckInputSchema.parse(item));
  const now = new Date().toISOString();
  const records = parsed.map((item) => ({
    ...item,
    id: item.id && !item.id.startsWith("default-") ? item.id : crypto.randomUUID(),
    projectId,
    createdAt: now,
    updatedAt: now
  }));

  client.db.transaction(() => {
    client.db.delete(factChecks).where(eq(factChecks.projectId, projectId)).run();
    if (records.length > 0) {
      client.db
        .insert(factChecks)
        .values(
          records.map((item) => ({
            id: item.id,
            projectId,
            itemType: item.itemType,
            label: item.label,
            value: item.value,
            sourceUrl: item.sourceUrl,
            status: item.status,
            notes: item.notes,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
          }))
        )
        .run();
    }
  });

  return records;
}

function mapFactCheckRow(row: FactCheckRow): FactCheckRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    itemType: row.itemType,
    label: row.label,
    value: row.value,
    sourceUrl: row.sourceUrl,
    status: FactCheckInputSchema.shape.status.parse(row.status),
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
