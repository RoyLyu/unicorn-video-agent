import { eq } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import { publishCopies, type PublishCopyRow } from "../schema";
import {
  PublishCopyInputSchema,
  type PublishCopyInput
} from "@/lib/review/review-schemas";
import type { ProductionPack } from "@/lib/schemas/production-pack";
import { investmentDisclaimer, titleCandidates } from "@/lib/export/export-utils";

export type PublishCopyRecord = PublishCopyInput & {
  id?: string;
  projectId?: string;
  isManual: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export function derivePublishCopy(productionPack: ProductionPack): PublishCopyRecord {
  return {
    coverTitle: `${productionPack.articleInput.industryTags[0] ?? "财经"}新信号`,
    titleCandidates: titleCandidates(productionPack),
    publishText: `${productionPack.analysis.summary}\n\n${productionPack.thesis.audienceTakeaway}`,
    tags: [...productionPack.articleInput.industryTags, "独角兽早知道", "财经短视频"],
    riskNotice: investmentDisclaimer,
    isManual: false
  };
}

export function getPublishCopyByProjectId(
  projectId: string,
  client: DbClient = getDbClient()
): PublishCopyRecord | null {
  const row = client.db
    .select()
    .from(publishCopies)
    .where(eq(publishCopies.projectId, projectId))
    .get();

  return row ? mapPublishCopyRow(row) : null;
}

export function getPublishCopyForProject(
  projectId: string,
  productionPack: ProductionPack,
  client: DbClient = getDbClient()
): PublishCopyRecord {
  return getPublishCopyByProjectId(projectId, client) ?? derivePublishCopy(productionPack);
}

export function upsertPublishCopy(
  projectId: string,
  input: PublishCopyInput,
  client: DbClient = getDbClient()
): PublishCopyRecord {
  const parsed = PublishCopyInputSchema.parse(input);
  const now = new Date().toISOString();
  const existing = getPublishCopyByProjectId(projectId, client);

  if (existing?.id) {
    client.db
      .update(publishCopies)
      .set({
        coverTitle: parsed.coverTitle,
        titleCandidatesJson: JSON.stringify(parsed.titleCandidates),
        publishText: parsed.publishText,
        tagsJson: JSON.stringify(parsed.tags),
        riskNotice: parsed.riskNotice,
        updatedAt: now
      })
      .where(eq(publishCopies.id, existing.id))
      .run();

    return {
      ...parsed,
      id: existing.id,
      projectId,
      isManual: true,
      createdAt: existing.createdAt,
      updatedAt: now
    };
  }

  const id = crypto.randomUUID();
  client.db
    .insert(publishCopies)
    .values({
      id,
      projectId,
      coverTitle: parsed.coverTitle,
      titleCandidatesJson: JSON.stringify(parsed.titleCandidates),
      publishText: parsed.publishText,
      tagsJson: JSON.stringify(parsed.tags),
      riskNotice: parsed.riskNotice,
      createdAt: now,
      updatedAt: now
    })
    .run();

  return {
    ...parsed,
    id,
    projectId,
    isManual: true,
    createdAt: now,
    updatedAt: now
  };
}

function mapPublishCopyRow(row: PublishCopyRow): PublishCopyRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    coverTitle: row.coverTitle,
    titleCandidates: JSON.parse(row.titleCandidatesJson) as string[],
    publishText: row.publishText,
    tags: JSON.parse(row.tagsJson) as string[],
    riskNotice: row.riskNotice,
    isManual: true,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
