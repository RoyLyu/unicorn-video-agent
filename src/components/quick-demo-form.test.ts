import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("QuickDemoForm strict real generation mode", () => {
  const source = readFileSync("src/components/quick-demo-form.tsx", "utf8");

  it("defaults to real generation and can explicitly request fast demo fallback", () => {
    expect(source).toContain("真实生成");
    expect(source).toContain("快速演示");
    expect(source).toContain("generationProfile");
    expect(source).toContain("real_output");
    expect(source).toContain("fast_demo");
    expect(source).toContain("不可投入使用");
  });
});
