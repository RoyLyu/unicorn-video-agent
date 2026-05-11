import { describe, expect, it } from "vitest";

import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import { scanOutputContamination } from "./output-contamination";

describe("output contamination scanner", () => {
  it("recursively finds banned terms in nested ProductionPack text fields", () => {
    const result = scanOutputContamination(
      {
        ...demoProductionPack,
        mode: "ai",
        analysis: {
          ...demoProductionPack.analysis,
          summary: "这是一段 Batch 02 占位内容"
        },
        scripts: {
          ...demoProductionPack.scripts,
          video90s: {
            ...demoProductionPack.scripts.video90s,
            lines: [
              {
                ...demoProductionPack.scripts.video90s.lines[0],
                narration: "这不是可用内容，只生成 JSON 生产包"
              }
            ]
          }
        }
      },
      ["mock", "Batch 02", "只生成 JSON 生产包"]
    );

    expect(result.contaminated).toBe(true);
    expect(result.matches.map((match) => match.term)).toEqual(
      expect.arrayContaining(["Batch 02", "只生成 JSON 生产包"])
    );
    expect(result.matches.some((match) => match.path === "analysis.summary")).toBe(true);
    expect(result.safeErrorSummary).toContain("contaminated_output");
  });

  it("reports clean AI output when no banned terms are present", () => {
    const result = scanOutputContamination(
      {
        title: "真实 AI 输出",
        nested: ["没有禁用词"]
      },
      ["mock", "Batch 02"]
    );

    expect(result.contaminated).toBe(false);
    expect(result.matches).toHaveLength(0);
  });
});
