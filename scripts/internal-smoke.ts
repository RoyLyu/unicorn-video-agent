import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getProductionPackByProjectId } from "@/db/repositories/production-pack-repository";
import { frozenProductDemo } from "@/lib/product-demo/frozen-product-demo";

type SmokeCheck = {
  label: string;
  ok: boolean;
  detail: string;
};

export async function runInternalSmoke(cwd = process.cwd()) {
  const checks: SmokeCheck[] = [];

  checks.push(await checkExists(".env.local", path.join(cwd, ".env.local")));
  checks.push(await checkExists("SQLite database", path.join(cwd, "data", "unicorn-video-agent.sqlite")));
  checks.push(await checkExists("Internal SOP", path.join(cwd, "docs", "14_INTERNAL_USE_SOP.md")));
  checks.push(await checkProductDemoConfig());
  checks.push(await checkFrozenProject());

  return {
    ok: checks.every((check) => check.ok),
    checks
  };
}

async function checkExists(label: string, filePath: string): Promise<SmokeCheck> {
  try {
    await access(filePath);
    return { label, ok: true, detail: filePath };
  } catch {
    return { label, ok: false, detail: `${filePath} not found` };
  }
}

async function checkProductDemoConfig(): Promise<SmokeCheck> {
  const requiredPaths = [
    frozenProductDemo.paths.showcase,
    frozenProductDemo.paths.productionStudio,
    frozenProductDemo.paths.export,
    frozenProductDemo.paths.agentRuns,
    frozenProductDemo.paths.productionPack,
    frozenProductDemo.paths.storyboard,
    frozenProductDemo.paths.promptPack
  ];
  const missing = requiredPaths.filter((value) => !value.includes(frozenProductDemo.projectId));

  return {
    label: "Product Demo frozen paths",
    ok: missing.length === 0,
    detail: missing.length === 0 ? frozenProductDemo.projectId : `missing projectId in ${missing.join(", ")}`
  };
}

async function checkFrozenProject(): Promise<SmokeCheck> {
  try {
    const saved = getProductionPackByProjectId(frozenProductDemo.projectId);

    return {
      label: "Frozen project",
      ok: Boolean(saved),
      detail: saved
        ? `${saved.project.title} (${saved.productionPack.mode})`
        : `${frozenProductDemo.projectId} not found in SQLite`
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      label: "Frozen project",
      ok: false,
      detail: message
    };
  }
}

async function main() {
  const result = await runInternalSmoke();

  console.log("Internal smoke checks");
  for (const check of result.checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
  }

  if (!result.ok) {
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  void main();
}

export async function readSmokeScriptSource(cwd = process.cwd()) {
  return readFile(path.join(cwd, "scripts", "internal-smoke.ts"), "utf8");
}
