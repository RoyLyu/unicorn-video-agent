import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { backupDatabase, getBackupDbPaths } from "./backup-db";
import { getProductDemoLines } from "./product-demo-check";

describe("internal release scripts", () => {
  it("backup:db reports a clear error when the database is missing", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "uva-backup-missing-"));

    await expect(backupDatabase({ cwd: tempDir })).rejects.toThrow(
      "SQLite database not found"
    );
    await rm(tempDir, { recursive: true, force: true });
  });

  it("backup:db creates a timestamped SQLite backup when the database exists", async () => {
    const tempDir = await mkdtemp(path.join(os.tmpdir(), "uva-backup-"));
    const dbPath = path.join(tempDir, "data", "unicorn-video-agent.sqlite");
    await mkdir(path.dirname(dbPath), { recursive: true });
    await writeFile(dbPath, "sqlite-content", "utf8");

    const result = await backupDatabase({
      cwd: tempDir,
      now: new Date(2026, 4, 12, 1, 2, 3)
    });

    expect(result.backupPath).toContain(path.join("backups", "unicorn-video-agent-20260512-010203.sqlite"));
    await expect(readFile(result.backupPath, "utf8")).resolves.toBe("sqlite-content");
    await rm(tempDir, { recursive: true, force: true });
  });

  it("internal:smoke does not call AI or external APIs", async () => {
    const source = await readFile("scripts/internal-smoke.ts", "utf8");

    expect(source).not.toContain("@/lib/ai/");
    expect(source).not.toContain("MINIMAX_API_KEY");
    expect(source).not.toContain("OPENAI_API_KEY");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("OpenAI");
  });

  it("demo:product prints the fixed Product Demo paths", () => {
    const output = getProductDemoLines().join("\n");

    expect(output).toContain("/product-demo");
    expect(output).toContain("/projects/d0de3657-352b-468b-8304-738229500be1/showcase");
    expect(output).toContain("/exports/production-pack.md");
  });

  it("keeps local backups and material candidates out of git", async () => {
    const gitignore = await readFile(".gitignore", "utf8");

    expect(gitignore).toContain("backups/");
    expect(gitignore).toContain("data/material-candidates/");
  });

  it("builds deterministic backup paths", () => {
    const paths = getBackupDbPaths({
      cwd: "/repo",
      now: new Date(2026, 4, 12, 9, 8, 7)
    });

    expect(paths.dbPath).toBe("/repo/data/unicorn-video-agent.sqlite");
    expect(paths.backupPath).toBe("/repo/backups/unicorn-video-agent-20260512-090807.sqlite");
  });
});
