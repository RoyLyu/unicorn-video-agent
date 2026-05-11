import { describe, expect, it } from "vitest";

import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import { analyzeShotPromptAlignment } from "./shot-prompt-alignment";

describe("shot prompt alignment", () => {
  it("reports 30/60 shot counts and matching prompt counts for normalized packs", () => {
    const pack = normalizeProductionPack(demoProductionPack);
    const summary = analyzeShotPromptAlignment(pack);

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
});
