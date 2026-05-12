import { describe, expect, it } from "vitest";

import type { ProductionPack, ShotFunction } from "@/lib/schemas/production-pack";
import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import { analyzeShotFunctionCoverage } from "./shot-function-coverage";

describe("shot function coverage planner", () => {
  it("marks needsFix when 90s misses required functions", () => {
    const shots = makeShots("90s", 24, ["hook_shot", "context_shot", "evidence_shot", "cta_shot"]);
    const coverage = analyzeShotFunctionCoverage(shots);

    expect(coverage.needsFix).toBe(true);
    expect(coverage.coverageScore).toBeLessThan(4);
    expect(coverage.missingFunctions90s).toEqual([
      "concept_shot",
      "data_shot",
      "risk_shot",
      "summary_shot"
    ]);
    expect(coverage.fixReasons.join("\n")).toContain("镜头功能分工不足");
  });

  it("marks needsFix when 180s misses transition emotional and cta functions", () => {
    const shots = makeShots("180s", 48, [
      "hook_shot",
      "context_shot",
      "evidence_shot",
      "concept_shot",
      "data_shot",
      "risk_shot",
      "summary_shot"
    ]);
    const coverage = analyzeShotFunctionCoverage(shots);

    expect(coverage.needsFix).toBe(true);
    expect(coverage.missingFunctions180s).toEqual([
      "transition_shot",
      "emotional_shot",
      "cta_shot"
    ]);
  });

  it("marks needsFix when one function exceeds 35 percent of a version", () => {
    const shots = [
      ...makeShots("90s", 10, ["hook_shot"]),
      ...makeShots("90s", 14, [
        "context_shot",
        "evidence_shot",
        "concept_shot",
        "data_shot",
        "risk_shot",
        "summary_shot"
      ])
    ];
    const coverage = analyzeShotFunctionCoverage(shots);

    expect(coverage.needsFix).toBe(true);
    expect(coverage.overRepeatedFunctions90s).toEqual(["hook_shot"]);
  });

  it("passes complete standard 24/48 distributions", () => {
    const pack = normalizeProductionPack(demoProductionPack, "standard");
    const coverage = analyzeShotFunctionCoverage(pack.storyboard.shots);

    expect(coverage.needsFix).toBe(false);
    expect(coverage.coverageScore).toBeGreaterThanOrEqual(4);
    expect(coverage.missingFunctions90s).toEqual([]);
    expect(coverage.missingFunctions180s).toEqual([]);
    expect(coverage.overRepeatedFunctions90s).toEqual([]);
    expect(coverage.overRepeatedFunctions180s).toEqual([]);
  });
});

function makeShots(
  versionType: "90s" | "180s",
  count: number,
  pattern: ShotFunction[]
): ProductionPack["storyboard"]["shots"] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${versionType}-${index + 1}`,
    timeRange: "00:00-00:03",
    scene: "测试场景",
    narration: "测试旁白",
    visual: "主体：数据卡；场景：财经空间；镜头：slow push-in；构图：中景；图表：信息卡",
    assetType: "ai-video" as const,
    rightsLevel: "green" as const,
    versionType,
    shotNumber: index + 1,
    shotFunction: pattern[index % pattern.length]
  }));
}
