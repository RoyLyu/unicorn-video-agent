import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Product Demo page", () => {
  it("uses the frozen product demo data source", () => {
    const source = readFileSync("src/app/product-demo/page.tsx", "utf8");

    expect(source).toContain("frozenProductDemo");
    expect(source).toContain("getProductionStudioPayload");
    expect(source).toContain("不调用 AI");
  });

  it("contains required internal product links", () => {
    const source = [
      readFileSync("src/app/product-demo/page.tsx", "utf8"),
      readFileSync("src/lib/product-demo/frozen-product-demo.ts", "utf8")
    ].join("\n");

    expect(source).toContain("打开 Showcase");
    expect(source).toContain("打开 Production Studio");
    expect(source).toContain("打开 Export");
    expect(source).toContain("打开 Agent Runs");
    expect(source).toContain("下载 production-pack.md");
    expect(source).toContain("下载 storyboard.csv");
    expect(source).toContain("下载 prompt-pack.md");
  });

  it("states the production boundary", () => {
    const source = readFileSync("src/app/product-demo/page.tsx", "utf8");

    expect(source).toContain("不是最终成片视频");
    expect(source).toContain("需人工完成事实核验和版权复核");
    expect(source).toContain("不构成投资建议");
  });
});
