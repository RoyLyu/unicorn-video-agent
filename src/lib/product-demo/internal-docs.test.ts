import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("internal release docs", () => {
  it("includes the internal use SOP with fixed Mac operations", () => {
    expect(existsSync("docs/14_INTERNAL_USE_SOP.md")).toBe(true);
    const source = readFileSync("docs/14_INTERNAL_USE_SOP.md", "utf8");

    expect(source).toContain("backup");
    expect(source).toContain("pm2");
    expect(source).toContain("gate fail");
    expect(source).toContain("SQLite 备份");
    expect(source).toContain("SQLite 恢复");
    expect(source).toContain("不可承诺事项");
  });

  it("includes the frozen Product Demo document", () => {
    expect(existsSync("docs/15_PRODUCT_DEMO_FREEZE.md")).toBe(true);
    const source = readFileSync("docs/15_PRODUCT_DEMO_FREEZE.md", "utf8");

    expect(source).toContain("d0de3657-352b-468b-8304-738229500be1");
    expect(source).toContain("149300c8-74e0-4ad3-9767-a3f1b3413ddb");
    expect(source).toContain("/product-demo");
    expect(source).toContain("fallbackUsed=false");
  });

  it("adds Product Demo to the final runbook without AI calls", () => {
    const source = readFileSync("docs/12_FINAL_DEMO_RUNBOOK.md", "utf8");

    expect(source).toContain("/product-demo");
    expect(source).toContain("Product Demo 不调用 AI");
  });
});
