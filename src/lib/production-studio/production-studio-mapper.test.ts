import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import { mapProductionStudioViewModel } from "./production-studio-mapper";

describe("production studio mapper", () => {
  it("maps shot prompt rows and gate summary without external AI dependencies", () => {
    const pack = normalizeProductionPack(demoProductionPack);
    const viewModel = mapProductionStudioViewModel({
      projectId: "project-1",
      projectTitle: "测试项目",
      productionPack: pack
    });

    expect(viewModel.projectTitle).toBe("测试项目");
    expect(viewModel.summary.shotCount90s).toBeGreaterThanOrEqual(24);
    expect(viewModel.summary.shotCount180s).toBeGreaterThanOrEqual(48);
    expect(viewModel.rows).toHaveLength(pack.storyboard.shots.length);
    expect(viewModel.rows[0].imagePrompt).toContain("cinematic business documentary style");
  });

  it("does not import AI client modules or server API keys", () => {
    const source = readFileSync("src/lib/production-studio/production-studio-mapper.ts", "utf8");

    expect(source).not.toContain("@/lib/ai/");
    expect(source).not.toContain("MINIMAX_API_KEY");
    expect(source).not.toContain("OPENAI_API_KEY");
  });

  it("keeps production studio API routes deterministic without AI imports", () => {
    const routeFiles = [
      "src/app/api/projects/[projectId]/production-studio/route.ts",
      "src/app/api/projects/[projectId]/production-studio/edits/route.ts",
      "src/app/api/projects/[projectId]/production-studio/revalidate/route.ts",
      "src/app/api/projects/[projectId]/production-studio/lock/route.ts",
      "src/app/api/projects/[projectId]/production-studio/unlock/route.ts"
    ];

    for (const routeFile of routeFiles) {
      const source = readFileSync(join(process.cwd(), routeFile), "utf8");

      expect(source).not.toContain("@/lib/ai/");
      expect(source).not.toContain("MINIMAX_API_KEY");
      expect(source).not.toContain("OPENAI_API_KEY");
    }
  });
});
