import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { frozenProductDemo, productDemoExportLinks } from "./frozen-product-demo";

describe("frozen product demo config", () => {
  it("contains the Batch 13D frozen project anchor", () => {
    expect(frozenProductDemo.projectId).toBe("d0de3657-352b-468b-8304-738229500be1");
    expect(frozenProductDemo.agentRunId).toBe("149300c8-74e0-4ad3-9767-a3f1b3413ddb");
    expect(frozenProductDemo.status.fallbackUsed).toBe(false);
    expect(frozenProductDemo.status.generationMode).toBe("ai");
    expect(frozenProductDemo.status.productionPackMode).toBe("ai");
  });

  it("exposes Product Demo export links", () => {
    expect(frozenProductDemo.paths.productDemo).toBe("/product-demo");
    expect(productDemoExportLinks.map((link) => link.href)).toContain(
      `/api/projects/${frozenProductDemo.projectId}/exports/production-pack.md`
    );
    expect(productDemoExportLinks.map((link) => link.href)).toContain(
      `/api/projects/${frozenProductDemo.projectId}/exports/storyboard.csv`
    );
    expect(productDemoExportLinks.map((link) => link.href)).toContain(
      `/api/projects/${frozenProductDemo.projectId}/exports/prompt-pack.md`
    );
  });

  it("does not read server API key environment variables", () => {
    const source = readFileSync("src/lib/product-demo/frozen-product-demo.ts", "utf8");

    expect(source).not.toContain("MINIMAX_API_KEY");
    expect(source).not.toContain("OPENAI_API_KEY");
    expect(source).not.toContain("process.env");
  });
});
