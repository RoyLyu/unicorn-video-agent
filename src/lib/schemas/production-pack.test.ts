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

  it("accepts Batch 12B shot and prompt bundle fields without breaking old packs", () => {
    const pack = runMockPipeline(demoArticleInput);
    const parsed = ProductionPackSchema.parse({
      ...pack,
      storyboard: {
        shots: [
          {
            ...pack.storyboard.shots[0],
            versionType: "90s",
            shotNumber: 1,
            beat: "开场判断",
            duration: "3s",
            voiceover: "开场旁白",
            overlayText: "核心判断",
            camera: "slow push-in",
            composition: "center framed data card",
            motion: "subtle chart reveal",
            visualType: "ai-video",
            chartNeed: "自制行业趋势图",
            copyrightRisk: "placeholder",
            replacementPlan: "替换为自制图表或抽象 AI 商业画面。"
          }
        ]
      },
      assetPrompts: {
        ...pack.assetPrompts,
        promptBundles: [
          {
            versionType: "90s",
            shotNumber: 1,
            shotId: pack.storyboard.shots[0].id,
            imagePrompt: "cinematic business documentary style image prompt",
            videoPrompt: "cinematic business documentary style video prompt",
            negativePrompt: "fake logo, unreadable text",
            styleLock: "cinematic business documentary style",
            aspectRatio: "9:16",
            usageWarning: "不得直接生成真实 Logo 或新闻图。"
          }
        ]
      },
      rightsChecks: [
        {
          ...pack.rightsChecks[0],
          replacementPlan: "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项。"
        }
      ]
    });

    expect(parsed.storyboard.shots[0].versionType).toBe("90s");
    expect(parsed.assetPrompts.promptBundles?.[0].shotNumber).toBe(1);
    expect(parsed.rightsChecks[0].replacementPlan).toContain("替换");
    expect(() => ProductionPackSchema.parse(pack)).not.toThrow();
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
