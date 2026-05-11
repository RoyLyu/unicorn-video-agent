import { describe, expect, it } from "vitest";

import { createQaSummary } from "./agent-summary";
import { demoArticleInput } from "@/lib/mock-pipeline/demo-input";
import { runMockPipeline } from "@/lib/mock-pipeline/run-mock-pipeline";

describe("Batch 07 QA summary", () => {
  it("counts red rights risks and confirms scripts, exports and publish disclaimer", () => {
    const pack = runMockPipeline(demoArticleInput);
    const summary = createQaSummary(pack);

    expect(summary.copyright.redRightsRiskCount).toBe(1);
    expect(summary.script.has90sScript).toBe(true);
    expect(summary.script.has180sScript).toBe(true);
    expect(summary.export.hasRequiredManifestFiles).toBe(true);
    expect(summary.publish.includesInvestmentDisclaimer).toBe(true);
  });
});
