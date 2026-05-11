import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Public Demo quick demo link", () => {
  it("adds a Quick Demo shortcut on the public demo page", () => {
    const source = readFileSync("src/app/demo/page.tsx", "utf8");

    expect(source).toContain("/quick-demo");
    expect(source).toContain("Quick Demo");
  });

  it("shows the final demo path on the public demo page", () => {
    const source = readFileSync("src/app/demo/page.tsx", "utf8");

    expect(source).toContain("FinalDemoPath");
  });
});
