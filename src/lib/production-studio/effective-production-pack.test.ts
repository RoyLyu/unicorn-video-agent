import { describe, expect, it } from "vitest";

import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import { resolveEffectiveProductionPack } from "./effective-production-pack";

describe("resolveEffectiveProductionPack", () => {
  it("applies shot edits without mutating original ProductionPack", () => {
    const original = normalizeProductionPack(demoProductionPack, "standard");
    const result = resolveEffectiveProductionPack({
      productionPack: original,
      densityProfile: "standard",
      edits: [
        {
          id: "edit-1",
          projectId: "project-1",
          versionType: "90s",
          shotNumber: 1,
          editType: "shot",
          patch: { visual: "主体：人工修改；场景：编辑台；镜头：slow push-in；构图：中景；图表：人工信息卡" },
          createdAt: "now",
          updatedAt: "now"
        }
      ]
    });

    expect(result.effective.storyboard.shots[0].visual).toContain("人工修改");
    expect(original.storyboard.shots[0].visual).not.toContain("人工修改");
    expect(result.editedCount).toBe(1);
  });

  it("applies prompt edits and keeps shot prompt alignment", () => {
    const original = normalizeProductionPack(demoProductionPack, "standard");
    const result = resolveEffectiveProductionPack({
      productionPack: original,
      densityProfile: "standard",
      edits: [
        {
          id: "edit-1",
          projectId: "project-1",
          versionType: "90s",
          shotNumber: 1,
          editType: "prompt",
          patch: { imagePrompt: "edited image prompt cinematic business documentary style" },
          createdAt: "now",
          updatedAt: "now"
        }
      ]
    });

    expect(result.effective.assetPrompts.promptBundles?.[0].imagePrompt).toContain("edited image prompt");
    expect(result.summary.unmatchedShots).toEqual([]);
    expect(result.summary.unmatchedPrompts).toEqual([]);
  });
});
