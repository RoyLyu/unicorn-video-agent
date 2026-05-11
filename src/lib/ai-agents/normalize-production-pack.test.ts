import { describe, expect, it } from "vitest";

import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import {
  normalizeProductionPack,
  requiredNegativePromptTerms,
  visualStyleLock
} from "./normalize-production-pack";

describe("normalizeProductionPack", () => {
  it("expands short storyboards to at least 8 executable shots", () => {
    const normalized = normalizeProductionPack({
      ...demoProductionPack,
      storyboard: {
        shots: demoProductionPack.storyboard.shots.slice(0, 2)
      }
    });

    expect(normalized.storyboard.shots).toHaveLength(8);
    for (const shot of normalized.storyboard.shots) {
      expect(shot.visual).toContain("主体：");
      expect(shot.visual).toContain("场景：");
      expect(shot.visual).toContain("镜头：");
      expect(shot.visual).toContain("构图：");
    }
  });

  it("creates image and video prompt coverage for every shot", () => {
    const normalized = normalizeProductionPack(demoProductionPack);
    const shotIds = normalized.storyboard.shots.map((shot) => shot.id);

    expect(normalized.assetPrompts.imagePrompts.map((prompt) => prompt.sceneRef)).toEqual(shotIds);
    expect(normalized.assetPrompts.videoPrompts.map((prompt) => prompt.sceneRef)).toEqual(shotIds);
    for (const prompt of [
      ...normalized.assetPrompts.imagePrompts,
      ...normalized.assetPrompts.videoPrompts
    ]) {
      expect(prompt.prompt).toContain(visualStyleLock);
      for (const term of requiredNegativePromptTerms) {
        expect(prompt.negativePrompt).toContain(term);
      }
    }
  });

  it("adds replacement alternatives to red rights risks", () => {
    const normalized = normalizeProductionPack(demoProductionPack);
    const redRisks = normalized.rightsChecks.filter((risk) => risk.level === "red");

    expect(redRisks.length).toBeGreaterThan(0);
    for (const risk of redRisks) {
      expect(risk.action).toMatch(/替换|自制图表|抽象 AI 画面|placeholder/);
    }
  });
});
