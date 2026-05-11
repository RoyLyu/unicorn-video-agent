import type { DbClient } from "@/db";
import {
  bindAgentRunToProject,
  completeAgentRun,
  createAgentRun,
  failAgentRun,
  recordAgentRunStep,
  saveAgentContextSnapshot
} from "@/db/repositories/agent-run-repository";
import { syncAgentDefinitions } from "@/db/repositories/agent-definition-repository";
import { saveProductionPack } from "@/db/repositories/production-pack-repository";
import { saveQaResult } from "@/db/repositories/qa-result-repository";
import { analyzeArticle } from "@/lib/mock-pipeline/article-analyst";
import { checkRightsRisks } from "@/lib/mock-pipeline/rights-risk-agent";
import { generatePrompts } from "@/lib/mock-pipeline/prompt-generator";
import { createStoryboard } from "@/lib/mock-pipeline/storyboard-agent";
import { writeScripts } from "@/lib/mock-pipeline/script-writer";
import { createThesis } from "@/lib/mock-pipeline/thesis-agent";
import {
  ArticleInputSchema,
  ProductionPackSchema,
  type ArticleInput,
  type ProductionPack
} from "@/lib/schemas/production-pack";

import { createAgentContextSnapshot, summarizeJson } from "./agent-context";
import { createQaSummary } from "./agent-summary";
import type { AgentQaSummary, AgentSlug } from "./agent-run-types";

type SaveOptions = {
  isDemo?: boolean;
  status?: string;
};

type TrackedMockPipelineOptions = {
  client?: DbClient;
  saveOptions?: SaveOptions;
  failAtAgentSlug?: AgentSlug;
};

export type TrackedMockPipelineResult = {
  agentRunId: string;
  productionPack: ProductionPack;
  qaSummary: AgentQaSummary;
  saved: ReturnType<typeof saveProductionPack>;
};

export function runTrackedMockPipeline(
  input: ArticleInput,
  options: TrackedMockPipelineOptions = {}
): TrackedMockPipelineResult {
  const articleInput = ArticleInputSchema.parse(input);
  const client = options.client;

  syncAgentDefinitions(client);
  const run = createAgentRun(articleInput.title, client);

  try {
    const analysis = executeTrackedStep(
      "article-analyst",
      1,
      run.id,
      articleInput,
      { articleInput },
      () => analyzeArticle(articleInput),
      options
    );
    const thesis = executeTrackedStep(
      "thesis-agent",
      2,
      run.id,
      { articleInput, analysis },
      { articleInput, analysis },
      () => createThesis(articleInput, analysis),
      options
    );
    const scripts = executeTrackedStep(
      "script-writer",
      3,
      run.id,
      { articleInput, thesis },
      { articleInput, thesis },
      () => writeScripts(articleInput, thesis),
      options
    );
    const storyboard = executeTrackedStep(
      "storyboard-agent",
      4,
      run.id,
      { articleInput, scripts },
      { articleInput, scripts },
      () => createStoryboard(articleInput, scripts),
      options
    );
    const assetPrompts = executeTrackedStep(
      "prompt-generator",
      5,
      run.id,
      { articleInput, storyboard },
      { articleInput, storyboard },
      () => generatePrompts(articleInput, storyboard),
      options
    );
    executeTrackedStep(
      "asset-finder",
      6,
      run.id,
      { searchLeads: assetPrompts.searchLeads },
      { searchLeads: assetPrompts.searchLeads },
      () => ({
        searchLeads: assetPrompts.searchLeads,
        note: "本地 mock 仅保存素材搜索线索，不下载外部素材。"
      }),
      options
    );

    const qaOutput = executeTrackedStep(
      "qa-agent",
      7,
      run.id,
      { articleInput, analysis, thesis, scripts, storyboard, assetPrompts },
      { articleInput, analysis, thesis, scripts, storyboard, assetPrompts },
      () => {
        const rightsChecks = checkRightsRisks(storyboard, assetPrompts);
        const productionPack = buildProductionPack({
          articleInput,
          analysis,
          thesis,
          scripts,
          storyboard,
          assetPrompts,
          rightsChecks
        });

        return {
          rightsChecks,
          qaSummary: createQaSummary(productionPack),
          productionPack
        };
      },
      options
    );

    const productionPack = qaOutput.productionPack;
    const saved = saveProductionPack(productionPack, client, options.saveOptions);

    bindAgentRunToProject(run.id, saved.project.id, client);
    saveQaResult(
      {
        runId: run.id,
        projectId: saved.project.id,
        summary: qaOutput.qaSummary
      },
      client
    );
    completeAgentRun(run.id, client);

    return {
      agentRunId: run.id,
      productionPack,
      qaSummary: qaOutput.qaSummary,
      saved
    };
  } catch (error) {
    failAgentRun(run.id, error instanceof Error ? error.message : String(error), client);
    throw error;
  }
}

function executeTrackedStep<T>(
  agentSlug: AgentSlug,
  stepOrder: number,
  runId: string,
  inputJson: unknown,
  context: Record<string, unknown>,
  execute: () => T,
  options: TrackedMockPipelineOptions
): T {
  const contextSnapshot = createAgentContextSnapshot(agentSlug, context);

  if (options.failAtAgentSlug === agentSlug) {
    const errorMessage = `Simulated ${agentSlug} failure`;
    const failedStep = recordAgentRunStep(
      {
        runId,
        agentSlug,
        stepOrder,
        status: "failed",
        inputJson,
        outputJson: null,
        inputSummary: summarizeJson(inputJson),
        outputSummary: "failed",
        errorMessage
      },
      options.client
    );
    saveAgentContextSnapshot(
      {
        runId,
        stepId: failedStep.id,
        agentSlug,
        context: contextSnapshot.context,
        summary: contextSnapshot.summary
      },
      options.client
    );
    throw new Error(errorMessage);
  }

  const outputJson = execute();
  const step = recordAgentRunStep(
    {
      runId,
      agentSlug,
      stepOrder,
      status: "completed",
      inputJson,
      outputJson,
      inputSummary: summarizeJson(inputJson),
      outputSummary: summarizeJson(outputJson)
    },
    options.client
  );

  saveAgentContextSnapshot(
    {
      runId,
      stepId: step.id,
      agentSlug,
      context: contextSnapshot.context,
      summary: contextSnapshot.summary
    },
    options.client
  );

  return outputJson;
}

function buildProductionPack(input: Omit<ProductionPack, "id" | "createdAt" | "mode" | "exportManifest">): ProductionPack {
  return ProductionPackSchema.parse({
    id: `mock-${slugify(input.articleInput.title)}`,
    createdAt: "2026-05-09T00:00:00.000Z",
    mode: "mock",
    ...input,
    exportManifest: {
      files: [
        plannedFile("production-pack.md", "Markdown", "完整生产包阅读稿"),
        plannedFile("storyboard.csv", "CSV", "分镜协作表"),
        plannedFile("project.json", "JSON", "完整 ProductionPack JSON"),
        plannedFile("rights-check.csv", "CSV", "版权风险复核表"),
        plannedFile("prompt-pack.md", "Markdown", "AI 图像和视频 Prompt 清单"),
        plannedFile("publish-copy.md", "Markdown", "封面和发布文案")
      ]
    }
  });
}

function plannedFile(filename: string, format: string, purpose: string) {
  return {
    filename,
    format,
    purpose,
    status: "planned" as const,
    generated: false as const
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
