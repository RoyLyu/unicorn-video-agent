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
    expect(source).toContain("不可承诺事项");
  });
});
