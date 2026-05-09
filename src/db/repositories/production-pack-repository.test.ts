import { describe, expect, it } from "vitest";

import { createArticle } from "./article-repository";
import {
  getProductionPackByProjectId,
  saveProductionPack
} from "./production-pack-repository";
import { createTestDbClient } from "../test-utils";
import { demoArticleInput } from "../../lib/mock-pipeline/demo-input";
import { runMockPipeline } from "../../lib/mock-pipeline/run-mock-pipeline";
import { ProductionPackSchema } from "../../lib/schemas/production-pack";

const requiredExportFiles = [
  "production-pack.md",
  "storyboard.csv",
  "project.json",
  "rights-check.csv",
  "prompt-pack.md",
  "publish-copy.md"
];

describe("Batch 03 SQLite repositories", () => {
  it("creates an article record", () => {
    const client = createTestDbClient();

    try {
      const article = createArticle(demoArticleInput, client);

      expect(article.title).toBe(demoArticleInput.title);
      expect(article.sourceName).toBe(demoArticleInput.sourceName);
      expect(article.industryTags).toEqual(demoArticleInput.industryTags);
    } finally {
      client.close();
    }
  });

  it("saves and reads back a complete ProductionPack", () => {
    const client = createTestDbClient();

    try {
      const pack = runMockPipeline(demoArticleInput);
      const saved = saveProductionPack(pack, client);
      const readback = getProductionPackByProjectId(saved.project.id, client);

      expect(readback?.project.id).toBe(saved.project.id);
      expect(readback?.productionPack).toEqual(pack);
      expect(() => ProductionPackSchema.parse(readback?.productionPack)).not.toThrow();
    } finally {
      client.close();
    }
  });

  it("keeps mock pipeline SQLite readback structurally consistent", () => {
    const client = createTestDbClient();

    try {
      const pack = runMockPipeline(demoArticleInput);
      const saved = saveProductionPack(pack, client);
      const readback = getProductionPackByProjectId(saved.project.id, client);
      const filenames = readback?.productionPack.exportManifest.files.map(
        (file) => file.filename
      );
      const rightsLevels = new Set(
        readback?.productionPack.rightsChecks.map((check) => check.level)
      );

      expect(readback?.productionPack.scripts.video90s.lines.length).toBeGreaterThan(0);
      expect(readback?.productionPack.scripts.video180s.lines.length).toBeGreaterThan(0);
      expect(filenames).toEqual(requiredExportFiles);
      expect([...rightsLevels]).toEqual(
        expect.arrayContaining(["green", "yellow", "red", "placeholder"])
      );
      expect(
        [...rightsLevels].every((level) =>
          ["green", "yellow", "red", "placeholder"].includes(level)
        )
      ).toBe(true);
    } finally {
      client.close();
    }
  });
});
