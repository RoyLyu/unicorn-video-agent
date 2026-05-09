import { describe, expect, it } from "vitest";

import {
  ArticleInputSchema,
  ProductionPackSchema,
  RightsRiskLevelSchema
} from "./production-pack";
import { demoArticleInput } from "../mock-pipeline/demo-input";
import { runMockPipeline } from "../mock-pipeline/run-mock-pipeline";

const requiredExportFiles = [
  "production-pack.md",
  "storyboard.csv",
  "project.json",
  "rights-check.csv",
  "prompt-pack.md",
  "publish-copy.md"
];

describe("Batch 02 ProductionPack schemas", () => {
  it("validates the demo article input", () => {
    expect(() => ArticleInputSchema.parse(demoArticleInput)).not.toThrow();
  });

  it("rejects invalid article input", () => {
    expect(
      ArticleInputSchema.safeParse({
        ...demoArticleInput,
        rawText: ""
      }).success
    ).toBe(false);

    expect(
      ArticleInputSchema.safeParse({
        ...demoArticleInput,
        sourceUrl: "not-a-url"
      }).success
    ).toBe(false);

    expect(
      ArticleInputSchema.safeParse({
        ...demoArticleInput,
        targetDurations: [120]
      }).success
    ).toBe(false);
  });

  it("only allows the four Batch 02 rights risk levels", () => {
    expect(RightsRiskLevelSchema.options).toEqual([
      "green",
      "yellow",
      "red",
      "placeholder"
    ]);
  });
});

describe("Batch 02 mock pipeline", () => {
  it("returns a complete ProductionPack", () => {
    const pack = runMockPipeline(demoArticleInput);

    expect(() => ProductionPackSchema.parse(pack)).not.toThrow();
    expect(pack.mode).toBe("mock");
    expect(pack.analysis.keyFacts.length).toBeGreaterThan(0);
    expect(pack.thesis.coreTheses.length).toBeGreaterThan(0);
    expect(pack.storyboard.shots.length).toBeGreaterThan(0);
    expect(pack.assetPrompts.imagePrompts.length).toBeGreaterThan(0);
    expect(pack.rightsChecks.length).toBeGreaterThan(0);
  });

  it("always includes 90s and 180s scripts for display", () => {
    const pack = runMockPipeline({
      ...demoArticleInput,
      targetDurations: [90]
    });

    expect(pack.scripts.video90s.lines.length).toBeGreaterThan(0);
    expect(pack.scripts.video180s.lines.length).toBeGreaterThan(0);
  });

  it("includes the required planned export files and does not generate files", () => {
    const pack = runMockPipeline(demoArticleInput);
    const filenames = pack.exportManifest.files.map((file) => file.filename);

    expect(filenames).toEqual(requiredExportFiles);
    expect(pack.exportManifest.files.every((file) => file.status === "planned")).toBe(
      true
    );
    expect(pack.exportManifest.files.every((file) => file.generated === false)).toBe(
      true
    );
  });
});
