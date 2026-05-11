import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Dashboard showcase links", () => {
  it("adds a Showcase shortcut to project rows", () => {
    const source = readFileSync("src/app/dashboard/page.tsx", "utf8");

    expect(source).toContain("/showcase");
    expect(source).toContain("Showcase");
  });

  it("adds a Quick Demo shortcut to the dashboard header", () => {
    const source = readFileSync("src/app/dashboard/page.tsx", "utf8");

    expect(source).toContain("/quick-demo");
    expect(source).toContain("Quick Demo");
  });
});
