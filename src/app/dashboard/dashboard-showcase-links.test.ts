import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Dashboard showcase links", () => {
  it("adds a Showcase shortcut to project rows", () => {
    const source = readFileSync("src/app/dashboard/page.tsx", "utf8");

    expect(source).toContain("/showcase");
    expect(source).toContain("Showcase");
    expect(source).toContain("/production-studio");
    expect(source).toContain("Production Studio");
  });

  it("adds a Quick Demo shortcut to the dashboard header", () => {
    const source = readFileSync("src/app/dashboard/page.tsx", "utf8");

    expect(source).toContain("/quick-demo");
    expect(source).toContain("Quick Demo");
  });

  it("adds the internal Product Demo entry to the dashboard", () => {
    const source = readFileSync("src/app/dashboard/page.tsx", "utf8");

    expect(source).toContain("/product-demo");
    expect(source).toContain("内部产品入口");
    expect(source).toContain("最近成功真实 audit projectId");
  });

  it("shows the final demo path on the dashboard", () => {
    const source = readFileSync("src/app/dashboard/page.tsx", "utf8");

    expect(source).toContain("FinalDemoPath");
  });
});
