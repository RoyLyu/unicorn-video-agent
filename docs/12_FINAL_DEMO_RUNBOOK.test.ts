import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("Final demo runbook", () => {
  it("documents final demo readiness and recovery steps", () => {
    const source = readFileSync("docs/12_FINAL_DEMO_RUNBOOK.md", "utf8");

    expect(source).toContain("演示前检查");
    expect(source).toContain(".env.local");
    expect(source).toContain("pnpm db:migrate");
    expect(source).toContain("/quick-demo");
    expect(source).toContain("推荐 5 个标题");
    expect(source).toContain("出错时如何处理");
    expect(source).toContain("Production Studio");
    expect(source).toContain("90s shots 必须 >= 30");
    expect(source).toContain("需要重跑 / 人工修正");
    expect(source).toContain("不可承诺事项");
  });

  it("documents Batch 11C frozen demo rights handling", () => {
    const source = readFileSync("docs/13_REAL_RUN_AUDIT_SUMMARY.md", "utf8");

    expect(source).toContain("f966086f-1599-4b30-be3d-231b04d02d45");
    expect(source).toContain(
      "/projects/f966086f-1599-4b30-be3d-231b04d02d45/showcase"
    );
    expect(source).toContain("Demo-ready: yes");
    expect(source).toContain("Storyboard 5/5");
    expect(source).toContain("Prompt 5/5");
    expect(source).toContain("Rights 4/5");
    expect(source).toContain("不可直接使用素材");
    expect(source).toContain("新消费品牌上市背后：中国品牌全球化的第二轮机会来了");
  });
});
