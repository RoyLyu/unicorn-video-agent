import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("real-run audit script surface", () => {
  it("is wired as a package script", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["audit:real-run"]).toBe(
      "tsx scripts/real-run-audit.ts"
    );
  });

  it("does not read or print API key environment variables directly", () => {
    const source = readFileSync("scripts/real-run-audit.ts", "utf8");

    expect(source).not.toContain("MINIMAX_API_KEY");
    expect(source).not.toContain("OPENAI_API_KEY");
    expect(source).not.toContain("process.env.MINIMAX");
    expect(source).not.toContain("process.env.OPENAI");
  });

  it("keeps real audit artifacts out of git", () => {
    const gitignore = readFileSync(".gitignore", "utf8");

    expect(gitignore).toContain("tmp/");
    expect(gitignore).toContain("tmp/real-run-audit/");
  });
});
