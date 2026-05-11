import { eq } from "drizzle-orm";

import {
  getFactChecksByProjectId,
  hasStoredFactChecks,
  saveFactChecks,
  type FactCheckRecord
} from "./fact-check-repository";
import {
  getPublishCopyForProject,
  upsertPublishCopy,
  type PublishCopyRecord
} from "./publish-copy-repository";
import { getProductionPackByProjectId } from "./production-pack-repository";
import type { ProjectDetail } from "./project-repository";
import { getDbClient, type DbClient } from "../index";
import { reviewChecklists, type ReviewChecklistRow } from "../schema";
import {
  ReviewChecklistInputSchema,
  ReviewPayloadSchema,
  type ReviewChecklistInput,
  type ReviewPayload
} from "@/lib/review/review-schemas";
import type { ProductionPack, RightsRiskLevel } from "@/lib/schemas/production-pack";

export const reviewChecklistItems = [
  { key: "core_viewpoint_confirmed", label: "核心观点已确认" },
  { key: "company_event_industry_verified", label: "公司名 / 事件 / 行业已核验" },
  { key: "key_numbers_verified", label: "关键数字已核验" },
  { key: "script_90_reviewed", label: "90s 脚本已审阅" },
  { key: "script_180_reviewed", label: "180s 脚本已审阅" },
  { key: "storyboard_visual_risk_reviewed", label: "分镜画面风险已审阅" },
  { key: "rights_risk_reviewed", label: "版权风险已审阅" },
  { key: "cover_title_confirmed", label: "封面标题已确认" },
  { key: "publish_copy_confirmed", label: "发布文案已确认" },
  { key: "investment_disclaimer_included", label: "已包含“不构成投资建议”" }
] as const;

export type ReviewStatus = "ready" | "in_review" | "blocked" | "not_started";
export type ReviewSubStatus = "verified" | "in_review" | "blocked";

export type ReviewChecklistRecord = ReviewChecklistInput & {
  id?: string;
  projectId?: string;
};

export type ReviewSummary = {
  status: ReviewStatus;
  checklistCompleted: number;
  checklistTotal: number;
  checklistCompletion: number;
  factStatus: ReviewSubStatus;
  rightsStatus: ReviewSubStatus;
  publishCopyEdited: boolean;
};

export type ReviewData = {
  project: ProjectDetail;
  productionPack: ProductionPack;
  publishCopy: PublishCopyRecord;
  factChecks: FactCheckRecord[];
  checklist: ReviewChecklistRecord[];
  reviewSummary: ReviewSummary;
};

export function getReviewData(
  projectId: string,
  client: DbClient = getDbClient()
): ReviewData | null {
  const saved = getProductionPackByProjectId(projectId, client);

  if (!saved) {
    return null;
  }

  const checklist = getReviewChecklist(projectId, client);
  const factChecks = getFactChecksByProjectId(projectId, saved.productionPack, client);
  const publishCopy = getPublishCopyForProject(
    projectId,
    saved.productionPack,
    client
  );
  const hasReviewRows =
    publishCopy.isManual ||
    hasStoredFactChecks(projectId, client) ||
    hasStoredChecklist(projectId, client);

  return {
    project: saved.project,
    productionPack: saved.productionPack,
    publishCopy,
    factChecks,
    checklist,
    reviewSummary: computeReviewSummary({
      checklist,
      factChecks,
      productionPack: saved.productionPack,
      publishCopy,
      hasReviewRows
    })
  };
}

export function saveReviewData(
  projectId: string,
  payload: ReviewPayload,
  client: DbClient = getDbClient()
) {
  const parsed = ReviewPayloadSchema.parse(payload);
  upsertPublishCopy(projectId, parsed.publishCopy, client);
  saveFactChecks(projectId, parsed.factChecks, client);
  saveReviewChecklist(projectId, parsed.checklist, client);

  return getReviewData(projectId, client);
}

export function getReviewChecklist(
  projectId: string,
  client: DbClient = getDbClient()
): ReviewChecklistRecord[] {
  const rows = client.db
    .select()
    .from(reviewChecklists)
    .where(eq(reviewChecklists.projectId, projectId))
    .all();

  return rows.length > 0 ? rows.map(mapChecklistRow) : defaultChecklist();
}

export function saveReviewChecklist(
  projectId: string,
  input: ReviewChecklistInput[],
  client: DbClient = getDbClient()
) {
  const parsed = normalizeChecklist(input);
  const now = new Date().toISOString();

  client.db.transaction(() => {
    client.db
      .delete(reviewChecklists)
      .where(eq(reviewChecklists.projectId, projectId))
      .run();
    client.db
      .insert(reviewChecklists)
      .values(
        parsed.map((item) => ({
          id: crypto.randomUUID(),
          projectId,
          itemKey: item.key,
          label: item.label,
          completed: item.completed,
          createdAt: now,
          updatedAt: now
        }))
      )
      .run();
  });

  return parsed;
}

export function computeReviewSummary({
  checklist,
  factChecks,
  productionPack,
  publishCopy,
  hasReviewRows
}: {
  checklist: ReviewChecklistRecord[];
  factChecks: FactCheckRecord[];
  productionPack: ProductionPack;
  publishCopy: PublishCopyRecord;
  hasReviewRows: boolean;
}): ReviewSummary {
  const checklistTotal = reviewChecklistItems.length;
  const checklistCompleted = checklist.filter((item) => item.completed).length;
  const checklistCompletion = checklistCompleted / checklistTotal;
  const factStatus = computeFactStatus(factChecks);
  const rightsStatus = computeRightsStatus(
    productionPack.rightsChecks.map((risk) => risk.level),
    checklist.some(
      (item) => item.key === "rights_risk_reviewed" && item.completed
    )
  );

  if (!hasReviewRows) {
    return {
      status: "not_started",
      checklistCompleted,
      checklistTotal,
      checklistCompletion,
      factStatus,
      rightsStatus,
      publishCopyEdited: false
    };
  }

  const status =
    factStatus === "blocked" || rightsStatus === "blocked"
      ? "blocked"
      : checklistCompleted === checklistTotal &&
          factStatus === "verified" &&
          rightsStatus === "verified" &&
          publishCopy.isManual
        ? "ready"
        : "in_review";

  return {
    status,
    checklistCompleted,
    checklistTotal,
    checklistCompletion,
    factStatus,
    rightsStatus,
    publishCopyEdited: publishCopy.isManual
  };
}

export function defaultChecklist(): ReviewChecklistRecord[] {
  return reviewChecklistItems.map((item) => ({
    key: item.key,
    label: item.label,
    completed: false
  }));
}

function normalizeChecklist(input: ReviewChecklistInput[]) {
  const byKey = new Map(
    input.map((item) => {
      const parsed = ReviewChecklistInputSchema.parse(item);
      return [parsed.key, parsed.completed] as const;
    })
  );

  return reviewChecklistItems.map((item) => ({
    key: item.key,
    label: item.label,
    completed: byKey.get(item.key) ?? false
  }));
}

function hasStoredChecklist(projectId: string, client: DbClient) {
  return (
    client.db
      .select({ id: reviewChecklists.id })
      .from(reviewChecklists)
      .where(eq(reviewChecklists.projectId, projectId))
      .limit(1)
      .all().length > 0
  );
}

function computeFactStatus(factChecks: FactCheckRecord[]): ReviewSubStatus {
  if (factChecks.some((fact) => fact.status === "rejected")) {
    return "blocked";
  }

  if (factChecks.every((fact) => fact.status === "verified")) {
    return "verified";
  }

  return "in_review";
}

function computeRightsStatus(
  rightsLevels: RightsRiskLevel[],
  rightsChecklistCompleted: boolean
): ReviewSubStatus {
  if (rightsLevels.includes("red")) {
    return "blocked";
  }

  if (
    rightsLevels.includes("yellow") ||
    rightsLevels.includes("placeholder") ||
    !rightsChecklistCompleted
  ) {
    return "in_review";
  }

  return "verified";
}

function mapChecklistRow(row: ReviewChecklistRow): ReviewChecklistRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    key: row.itemKey,
    label: row.label,
    completed: row.completed
  };
}
