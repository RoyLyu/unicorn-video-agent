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

  it("prints a safe env summary without reading API key values directly", () => {
    const source = readFileSync("scripts/real-run-audit.ts", "utf8");

    expect(source).toContain("safe env summary");
    expect(source).toContain("MINIMAX_API_KEY exists");
    expect(source).toContain("AI_REQUIRE_REAL_OUTPUT");
    expect(source).toContain("--allowFallback");
    expect(source).not.toContain("process.env.MINIMAX");
    expect(source).not.toContain("process.env.OPENAI");
  });

  it("uses failed artifacts for fallback audits without overwriting latest success", () => {
    const source = readFileSync("scripts/real-run-audit.ts", "utf8");

    expect(source).toContain("failed-production-pack.json");
    expect(source).toContain("failed-qa-report.md");
    expect(source).toContain("latest-production-pack.json");
    expect(source).toContain("latest-qa-report.md");
    expect(source).toContain("process.exitCode = 1");
  });

  it("renders canonicalization diagnostics in failed audit reports", () => {
    const source = readFileSync("scripts/real-run-audit.ts", "utf8");

    expect(source).toContain("schemaFailurePaths");
    expect(source).toContain("invalidEnumValues");
    expect(source).toContain("canonicalizationChangedFields");
    expect(source).toContain("unknownEnumFields");
    expect(source).toContain("canonicalizationChangedCount");
  });

  it("keeps real audit artifacts out of git", () => {
    const gitignore = readFileSync(".gitignore", "utf8");

    expect(gitignore).toContain("tmp/");
    expect(gitignore).toContain("tmp/real-run-audit/");
  });
});
