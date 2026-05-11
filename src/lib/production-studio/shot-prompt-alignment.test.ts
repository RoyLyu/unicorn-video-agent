import { describe, expect, it } from "vitest";

import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";
import { generateProductionPackMarkdown } from "@/lib/export/production-pack-markdown";

import { analyzeShotPromptAlignment } from "./shot-prompt-alignment";
import { readShotDensityProfile } from "./density-profile";
import { analyzeReportCompleteness } from "./report-completeness";

describe("shot prompt alignment", () => {
  it("defaults shot density profile to standard", () => {
    expect(readShotDensityProfile({})).toBe("standard");
  });

  it("passes lite, standard and dense profile thresholds", () => {
    const densePack = normalizeProductionPack(demoProductionPack, "dense");
    const standardPack = normalizeProductionPack(demoProductionPack, "standard");
    const litePack = normalizeProductionPack(demoProductionPack, "lite");

    expect(analyzeShotPromptAlignment(litePack, "lite").needsFix).toBe(false);
    expect(analyzeShotPromptAlignment(standardPack, "standard").needsFix).toBe(false);
    expect(analyzeShotPromptAlignment(densePack, "dense").needsFix).toBe(false);
    expect(analyzeShotPromptAlignment(densePack, "standard").needsFix).toBe(false);
    expect(analyzeShotPromptAlignment(litePack, "lite").shotCount90s).toBe(20);
    expect(analyzeShotPromptAlignment(standardPack, "standard").shotCount90s).toBe(24);
    expect(analyzeShotPromptAlignment(densePack, "dense").shotCount90s).toBe(30);
  });

  it("reports 30/60 shot counts and matching prompt counts for normalized packs", () => {
    const pack = normalizeProductionPack(demoProductionPack, "dense");
    const summary = analyzeShotPromptAlignment(pack, "dense");

    expect(summary.shotCount90s).toBeGreaterThanOrEqual(30);
    expect(summary.shotCount180s).toBeGreaterThanOrEqual(60);
    expect(summary.promptCount90s).toBe(summary.shotCount90s);
    expect(summary.promptCount180s).toBe(summary.shotCount180s);
    expect(summary.unmatchedShots).toEqual([]);
    expect(summary.unmatchedPrompts).toEqual([]);
    expect(summary.needsFix).toBe(false);
  });

  it("marks needsFix when prompts are missing and red risks lack replacement", () => {
    const pack = normalizeProductionPack(demoProductionPack);
    const broken = {
      ...pack,
      assetPrompts: {
        ...pack.assetPrompts,
        promptBundles: pack.assetPrompts.promptBundles?.slice(1)
      },
      rightsChecks: [
        {
          item: "真实新闻图",
          level: "red" as const,
          reason: "未确认授权",
          action: "不能直接使用",
          replacementPlan: ""
        }
      ]
    };
    const summary = analyzeShotPromptAlignment(broken);

    expect(summary.needsFix).toBe(true);
    expect(summary.fixReasons.join("\n")).toContain("需要重跑 / 人工修正");
    expect(summary.unmatchedShots.length).toBeGreaterThan(0);
    expect(summary.redRisksWithoutReplacement).toEqual(["真实新闻图"]);
  });

  it("marks needsFix when shot function coverage is incomplete", () => {
    const pack = normalizeProductionPack(demoProductionPack);
    const broken = {
      ...pack,
      storyboard: {
        shots: pack.storyboard.shots.map((shot) => ({
          ...shot,
          shotFunction: "context_shot" as const
        }))
      }
    };
    const summary = analyzeShotPromptAlignment(broken);

    expect(summary.scores.shotFunctionCoverageScore).toBeLessThan(4);
    expect(summary.needsFix).toBe(true);
    expect(summary.fixReasons.join("\n")).toContain("镜头功能");
  });

  it("marks needsFix when continuity and prompt contract fields are missing", () => {
    const pack = normalizeProductionPack(demoProductionPack);
    const broken = {
      ...pack,
      continuityBible: undefined,
      storyboard: {
        shots: pack.storyboard.shots.map((shot) => ({
          ...shot,
          continuityAssets: []
        }))
      },
      assetPrompts: {
        ...pack.assetPrompts,
        promptBundles: pack.assetPrompts.promptBundles?.map((bundle) => ({
          ...bundle,
          subject: "",
          forbiddenElements: []
        }))
      }
    };
    const summary = analyzeShotPromptAlignment(broken);

    expect(summary.scores.continuityScore).toBeLessThan(4);
    expect(summary.scores.promptFieldCompletenessScore).toBeLessThan(4);
    expect(summary.needsFix).toBe(true);
    expect(summary.fixReasons.join("\n")).toContain("连续性");
    expect(summary.fixReasons.join("\n")).toContain("Prompt");
  });

  it("includes report completeness in the Production Studio gate", () => {
    const pack = normalizeProductionPack(demoProductionPack);
    const summary = analyzeShotPromptAlignment(pack);
    const report = analyzeReportCompleteness(generateProductionPackMarkdown(pack));

    expect(summary.reportFieldCompleteness).toBe("pass");
    expect(summary.missingReportFields).toEqual([]);
    expect(summary.scores.reportCompletenessScore).toBeGreaterThanOrEqual(4);
    expect(summary.scores.reportCompletenessScore).toBe(report.reportCompletenessScore);
  });
});
