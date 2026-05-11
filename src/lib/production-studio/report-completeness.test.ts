import { describe, expect, it } from "vitest";

import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";
import { generateProductionPackMarkdown } from "@/lib/export/production-pack-markdown";

import { analyzeReportCompleteness } from "./report-completeness";

describe("production report completeness gate", () => {
  it("passes when production-pack.md contains the full AIGC report contract", () => {
    const pack = normalizeProductionPack(demoProductionPack, "standard");
    const markdown = generateProductionPackMarkdown(pack);
    const result = analyzeReportCompleteness(markdown);

    expect(result.reportFieldCompleteness).toBe("pass");
    expect(result.reportCompletenessScore).toBeGreaterThanOrEqual(4);
    expect(result.missingReportFields).toEqual([]);
  });

  it("fails with missing fields when the report only has a compressed storyboard", () => {
    const compressedReport = `# Report

## 分镜概览

- S90-01 0-3s：主体 / 场景 / 镜头 / 构图 / 图表 / green
`;
    const result = analyzeReportCompleteness(compressedReport);

    expect(result.reportFieldCompleteness).toBe("fail");
    expect(result.reportCompletenessScore).toBeLessThan(4);
    expect(result.missingReportFields).toContain("AIGC 制作总控");
    expect(result.missingReportFields).toContain("逐镜头 AIGC 制作表");
    expect(result.missingReportFields).toContain("Image Prompt");
  });
});
