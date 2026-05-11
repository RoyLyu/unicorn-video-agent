import { describe, expect, it } from "vitest";

import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import {
  normalizeProductionPack,
  requiredNegativePromptTerms,
  visualStyleLock
} from "./normalize-production-pack";

describe("normalizeProductionPack", () => {
  it("expands short storyboards into production-studio micro-shots", () => {
    const normalized = normalizeProductionPack({
      ...demoProductionPack,
      storyboard: {
        shots: demoProductionPack.storyboard.shots.slice(0, 2)
      }
    });

    expect(normalized.storyboard.shots.length).toBeGreaterThanOrEqual(72);
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

  it("expands production studio micro-shots to standard 24 for 90s and 48 for 180s by default", () => {
    const normalized = normalizeProductionPack(demoProductionPack);
    const shots90 = normalized.storyboard.shots.filter((shot) => shot.versionType === "90s");
    const shots180 = normalized.storyboard.shots.filter((shot) => shot.versionType === "180s");

    expect(shots90.length).toBeGreaterThanOrEqual(24);
    expect(shots180.length).toBeGreaterThanOrEqual(48);
    expect(shots90[0]).toMatchObject({
      versionType: "90s",
      shotNumber: 1
    });
    expect(shots180[0]).toMatchObject({
      versionType: "180s",
      shotNumber: 1
    });
  });

  it("keeps dense 30/60 profile available for high-density editing", () => {
    const normalized = normalizeProductionPack(demoProductionPack, "dense");

    expect(normalized.storyboard.shots.filter((shot) => shot.versionType === "90s")).toHaveLength(30);
    expect(normalized.storyboard.shots.filter((shot) => shot.versionType === "180s")).toHaveLength(60);
  });

  it("creates one prompt bundle per shot and keeps legacy prompt arrays aligned", () => {
    const normalized = normalizeProductionPack(demoProductionPack);
    const shotKeys = normalized.storyboard.shots.map(
      (shot) => `${shot.versionType}:${shot.shotNumber}:${shot.id}`
    );
    const bundleKeys = normalized.assetPrompts.promptBundles?.map(
      (prompt) => `${prompt.versionType}:${prompt.shotNumber}:${prompt.shotId}`
    );

    expect(bundleKeys).toEqual(shotKeys);
    expect(normalized.assetPrompts.imagePrompts).toHaveLength(normalized.storyboard.shots.length);
    expect(normalized.assetPrompts.videoPrompts).toHaveLength(normalized.storyboard.shots.length);
    for (const bundle of normalized.assetPrompts.promptBundles ?? []) {
      expect(bundle.imagePrompt).toContain(visualStyleLock);
      expect(bundle.videoPrompt).toContain(visualStyleLock);
      for (const term of requiredNegativePromptTerms) {
        expect(bundle.negativePrompt).toContain(term);
      }
    }
  });

  it("adds replacementPlan to red rights checks and red shots", () => {
    const normalized = normalizeProductionPack({
      ...demoProductionPack,
      storyboard: {
        shots: [
          {
            ...demoProductionPack.storyboard.shots[0],
            rightsLevel: "red"
          }
        ]
      },
      rightsChecks: [
        {
          item: "真实新闻配图",
          level: "red",
          reason: "未确认授权",
          action: "不能直接使用"
        }
      ]
    });
    const redShots = normalized.storyboard.shots.filter((shot) => shot.rightsLevel === "red");

    expect(normalized.rightsChecks[0].replacementPlan).toMatch(/替换|自制图表|抽象 AI 画面|placeholder/);
    expect(redShots[0]?.replacementPlan).toMatch(/替换|自制图表|抽象 AI 画面|placeholder/);
  });
});
