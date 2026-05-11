import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

import { describe, expect, it } from "vitest";

describe("ArticleInputForm Batch 08 generation modes", () => {
  const source = readFileSync("src/components/article-input-form.tsx", "utf8");

  it("can submit to mock and AI production pack endpoints", () => {
    expect(source).toContain("/api/mock/production-pack");
    expect(source).toContain("/api/ai/production-pack");
    expect(source).toContain("AI Agent");
    expect(source).toContain("generationProfile");
    expect(source).toContain("real_output");
    expect(source).toContain("完整文章正文或事实材料");
  });

  it("does not read server-side OpenAI credentials in the client component", () => {
    expect(source).not.toContain("OPENAI_API_KEY");
    expect(source).not.toContain("process.env");
  });

  it("does not expose OpenAI credentials in client-facing components or pages", () => {
    const files = execFileSync(
      "rg",
      [
        "--files",
        "src/components",
        "src/app",
        "-g",
        "*.tsx",
        "-g",
        "!src/app/api/**"
      ],
      { encoding: "utf8" }
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    const combinedSource = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(combinedSource).not.toContain("OPENAI_API_KEY");
    expect(combinedSource).not.toContain("process.env.OPENAI_API_KEY");
  });
});
