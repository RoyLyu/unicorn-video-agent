import { describe, expect, it } from "vitest";

import { saveProductionPack } from "./production-pack-repository";
import {
  getReviewData,
  reviewChecklistItems,
  saveReviewChecklist
} from "./review-repository";
import {
  getPublishCopyByProjectId,
  upsertPublishCopy
} from "./publish-copy-repository";
import { saveFactChecks } from "./fact-check-repository";
import { createTestDbClient } from "../test-utils";
import { demoArticleInput } from "../../lib/mock-pipeline/demo-input";
import { runMockPipeline } from "../../lib/mock-pipeline/run-mock-pipeline";

const editedPublishCopy = {
  coverTitle: "人工封面标题",
  titleCandidates: [
    "人工标题 A",
    "人工标题 B",
    "人工标题 C",
    "人工标题 D",
    "人工标题 E"
  ],
  publishText: "这是一段人工编辑后的发布文案。",
  tags: ["AI", "审阅"],
  riskNotice: "不构成投资建议"
};

describe("Batch 05 review repositories", () => {
  it("returns fallback review state for old projects without review rows", () => {
    const client = createTestDbClient();

    try {
      const saved = saveProductionPack(runMockPipeline(demoArticleInput), client);
      const review = getReviewData(saved.project.id, client);

      expect(review).not.toBeNull();
      expect(review!.reviewSummary.status).toBe("not_started");
      expect(review!.checklist).toHaveLength(reviewChecklistItems.length);
      expect(review!.checklist.every((item) => item.completed === false)).toBe(true);
      expect(review!.factChecks.length).toBeGreaterThan(0);
      expect(review!.factChecks.every((item) => item.status === "pending")).toBe(true);
      expect(review!.publishCopy.isManual).toBe(false);
    } finally {
      client.close();
    }
  });

  it("creates, updates and reads a manual publish copy", () => {
    const client = createTestDbClient();

    try {
      const saved = saveProductionPack(runMockPipeline(demoArticleInput), client);

      upsertPublishCopy(saved.project.id, editedPublishCopy, client);
      expect(getPublishCopyByProjectId(saved.project.id, client)).toMatchObject({
        ...editedPublishCopy,
        isManual: true
      });

      upsertPublishCopy(
        saved.project.id,
        { ...editedPublishCopy, coverTitle: "更新后的封面标题" },
        client
      );

      expect(getPublishCopyByProjectId(saved.project.id, client)?.coverTitle).toBe(
        "更新后的封面标题"
      );
    } finally {
      client.close();
    }
  });

  it("rejects invalid fact check statuses", () => {
    const client = createTestDbClient();

    try {
      const saved = saveProductionPack(runMockPipeline(demoArticleInput), client);

      expect(() =>
        saveFactChecks(
          saved.project.id,
          [
            {
              itemType: "fact",
              label: "公司名",
              value: "虚构公司",
              sourceUrl: "",
              status: "done" as never,
              notes: ""
            }
          ],
          client
        )
      ).toThrow();
    } finally {
      client.close();
    }
  });

  it("computes checklist completion in review summary", () => {
    const client = createTestDbClient();

    try {
      const saved = saveProductionPack(runMockPipeline(demoArticleInput), client);
      saveReviewChecklist(
        saved.project.id,
        reviewChecklistItems.map((item, index) => ({
          key: item.key,
          label: item.label,
          completed: index < 5
        })),
        client
      );

      const review = getReviewData(saved.project.id, client);

      expect(review).not.toBeNull();
      expect(review!.reviewSummary.checklistCompleted).toBe(5);
      expect(review!.reviewSummary.checklistTotal).toBe(reviewChecklistItems.length);
      expect(review!.reviewSummary.checklistCompletion).toBe(0.5);
    } finally {
      client.close();
    }
  });
});
