import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { AgentRunDetail, AgentRunSummary } from "@/db/repositories/agent-run-repository";
import type { ProjectDetail } from "@/db/repositories/project-repository";
import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import { mapShowcaseViewModel } from "./showcase-mapper";

const project: ProjectDetail = {
  id: "project-1",
  articleId: "article-1",
  title: "虚构项目展示",
  sourceName: "独角兽早知道 Demo",
  status: "ai_saved",
  isDemo: false,
  createdAt: "2026-05-09T00:00:00.000Z",
  updatedAt: "2026-05-09T00:00:00.000Z"
};

const completedRun: AgentRunSummary = {
  id: "run-1",
  projectId: "project-1",
  articleTitle: "虚构项目展示",
  status: "completed",
  startedAt: "2026-05-09T00:00:00.000Z",
  completedAt: "2026-05-09T00:00:01.000Z",
  errorMessage: null
};

describe("showcase mapper", () => {
  it("outputs the project title, core viewpoints and AI generation label", () => {
    const pack = { ...demoProductionPack, mode: "ai" as const };
    const viewModel = mapShowcaseViewModel({
      project,
      productionPack: pack,
      reviewData: null,
      latestAgentRun: completedRun,
      latestAgentRunDetail: createRunDetail(completedRun)
    });

    expect(viewModel.projectTitle).toBe(project.title);
    expect(viewModel.generation.generationModeLabel).toBe("AI Agent");
    expect(viewModel.coreViewpoints).toEqual(pack.thesis.coreTheses);
    expect(viewModel.agentSummary.status).toBe("completed");
  });

  it("maps mock generation and fallback state", () => {
    const viewModel = mapShowcaseViewModel({
      project: { ...project, status: "ai_fallback_mock_saved" },
      productionPack: demoProductionPack,
      reviewData: null,
      latestAgentRun: { ...completedRun, status: "completed_with_fallback" },
      latestAgentRunDetail: null
    });

    expect(viewModel.generation.generationModeLabel).toBe("Mock");
    expect(viewModel.generation.fallbackUsed).toBe(true);
    expect(viewModel.fallbackWarning).toContain("当前使用 fallback 结果");
  });

  it("does not show a fallback warning for clean AI output", () => {
    const viewModel = mapShowcaseViewModel({
      project,
      productionPack: { ...demoProductionPack, mode: "ai" },
      reviewData: null,
      latestAgentRun: completedRun,
      latestAgentRunDetail: createRunDetail(completedRun)
    });

    expect(viewModel.generation.fallbackUsed).toBe(false);
    expect(viewModel.fallbackWarning).toBeNull();
  });

  it("falls back to deterministic publish copy and download link", () => {
    const viewModel = mapShowcaseViewModel({
      project,
      productionPack: demoProductionPack,
      reviewData: null,
      latestAgentRun: null,
      latestAgentRunDetail: null
    });

    expect(viewModel.publishCopy.publishText).toContain(
      demoProductionPack.analysis.summary
    );
    expect(viewModel.publishCopy.riskNotice).toContain("不构成投资建议");
    expect(viewModel.links.downloadProductionPack).toBe(
      "/api/projects/project-1/exports/production-pack.md"
    );
  });

  it("shows a title-only fact-check warning for Title-only Demo projects", () => {
    const viewModel = mapShowcaseViewModel({
      project: { ...project, sourceName: "Title-only Demo" },
      productionPack: {
        ...demoProductionPack,
        articleInput: {
          ...demoProductionPack.articleInput,
          sourceName: "Title-only Demo"
        }
      },
      reviewData: null,
      latestAgentRun: null,
      latestAgentRunDetail: null
    });

    expect(viewModel.isTitleOnlyDemo).toBe(true);
    expect(viewModel.titleOnlyWarning).toBe(
      "该项目由标题生成，事实信息需要人工核验。"
    );
  });

  it("does not show a title-only warning for full article projects", () => {
    const viewModel = mapShowcaseViewModel({
      project,
      productionPack: demoProductionPack,
      reviewData: null,
      latestAgentRun: null,
      latestAgentRunDetail: null
    });

    expect(viewModel.isTitleOnlyDemo).toBe(false);
    expect(viewModel.titleOnlyWarning).toBeNull();
  });

  it("does not import AI modules or read server API key names", () => {
    const source = readFileSync(
      "src/lib/showcase/showcase-mapper.ts",
      "utf8"
    );

    expect(source).not.toContain("@/lib/ai");
    expect(source).not.toContain("MINIMAX_API_KEY");
    expect(source).not.toContain("OPENAI_API_KEY");
  });
});

function createRunDetail(run: AgentRunSummary): AgentRunDetail {
  return {
    run,
    steps: [
      {
        id: "step-1",
        runId: run.id,
        agentSlug: "article-analyst",
        stepOrder: 1,
        status: "completed",
        inputJson: {},
        outputJson: {},
        inputSummary: "articleInput",
        outputSummary: "analysis",
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        errorMessage: null
      }
    ],
    contextSnapshots: []
  };
}
