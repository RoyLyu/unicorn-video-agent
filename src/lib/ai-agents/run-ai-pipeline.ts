import type { z } from "zod";

import type { DbClient } from "@/db";
import { syncAgentDefinitions } from "@/db/repositories/agent-definition-repository";
import {
  bindAgentRunToProject,
  completeAgentRun,
  createAgentRun,
  failAgentRun,
  recordAgentRunStep,
  saveAgentContextSnapshot
} from "@/db/repositories/agent-run-repository";
import { saveProductionPack } from "@/db/repositories/production-pack-repository";
import { saveQaResult } from "@/db/repositories/qa-result-repository";
import { createAgentContextSnapshot, summarizeJson } from "@/lib/agents/agent-context";
import { createQaSummary } from "@/lib/agents/agent-summary";
import type {
  AgentQaSummary,
  AgentSlug,
  AgentStepStatus
} from "@/lib/agents/agent-run-types";
import {
  readAiConfig,
  type AiConfig,
  type AiEnvironment
} from "@/lib/ai/ai-config";
import { AiSchemaError, normalizeAiError } from "@/lib/ai/ai-errors";
import { requestStructuredOutput } from "@/lib/ai/structured-output";
import { analyzeArticle } from "@/lib/mock-pipeline/article-analyst";
import { generatePrompts } from "@/lib/mock-pipeline/prompt-generator";
import { checkRightsRisks } from "@/lib/mock-pipeline/rights-risk-agent";
import { writeScripts } from "@/lib/mock-pipeline/script-writer";
import { createStoryboard } from "@/lib/mock-pipeline/storyboard-agent";
import { createThesis } from "@/lib/mock-pipeline/thesis-agent";
import {
  ArticleInputSchema,
  ProductionPackSchema,
  type ArticleInput,
  type AssetPromptResult,
  type GenerationMode,
  type ProductionPack
} from "@/lib/schemas/production-pack";

import { articleAnalystPrompt } from "./prompts/article-analyst-prompt";
import { assetFinderPrompt } from "./prompts/asset-finder-prompt";
import { promptGeneratorPrompt } from "./prompts/prompt-generator-prompt";
import { qaAgentPrompt } from "./prompts/qa-agent-prompt";
import { scriptWriterPrompt } from "./prompts/script-writer-prompt";
import { storyboardAgentPrompt } from "./prompts/storyboard-agent-prompt";
import { thesisAgentPrompt } from "./prompts/thesis-agent-prompt";
import {
  AiAgentOutputSchemas,
  QaAgentResultSchema
} from "./schemas";

type SaveOptions = {
  isDemo?: boolean;
  status?: string;
};

type AiStepExecutorInput<TSchema extends z.ZodType> = {
  agentSlug: AgentSlug;
  schema: TSchema;
  schemaName: string;
  systemPrompt: string;
  userInput: unknown;
  fallbackOutput: z.infer<TSchema>;
  config: Extract<AiConfig, { ok: true }>;
};

export type AiStepExecutor = <TSchema extends z.ZodType>(
  input: AiStepExecutorInput<TSchema>
) => Promise<unknown>;

type RunAiPipelineOptions = {
  client?: DbClient;
  env?: AiEnvironment;
  saveOptions?: SaveOptions;
  aiExecutor?: AiStepExecutor;
};

export type RunAiPipelineResult = {
  projectId: string;
  agentRunId: string;
  productionPack: ProductionPack;
  qaSummary: AgentQaSummary;
  fallbackUsed: boolean;
  generationMode: GenerationMode;
  saved: ReturnType<typeof saveProductionPack>;
};

export async function runAiPipeline(
  input: ArticleInput,
  options: RunAiPipelineOptions = {}
): Promise<RunAiPipelineResult> {
  const articleInput = ArticleInputSchema.parse(input);
  const client = options.client;
  const config = readAiConfig(options.env);

  syncAgentDefinitions(client);
  const run = createAgentRun(articleInput.title, client);
  let fallbackUsed = false;

  try {
    const analysisFallback = analyzeArticle(articleInput);
    const analysis = await executeAiStep({
      agentSlug: "article-analyst",
      stepOrder: 1,
      runId: run.id,
      schemaName: "analysis_result",
      schema: AiAgentOutputSchemas["article-analyst"],
      systemPrompt: articleAnalystPrompt(),
      userInput: { articleInput },
      context: { articleInput },
      fallbackOutput: analysisFallback,
      config,
      aiExecutor: options.aiExecutor,
      client
    });
    fallbackUsed = fallbackUsed || analysis.fallbackUsed;

    const thesisFallback = createThesis(articleInput, analysis.output);
    const thesis = await executeAiStep({
      agentSlug: "thesis-agent",
      stepOrder: 2,
      runId: run.id,
      schemaName: "thesis_result",
      schema: AiAgentOutputSchemas["thesis-agent"],
      systemPrompt: thesisAgentPrompt(),
      userInput: { articleInput, analysis: analysis.output },
      context: { articleInput, analysis: analysis.output },
      fallbackOutput: thesisFallback,
      config,
      aiExecutor: options.aiExecutor,
      client
    });
    fallbackUsed = fallbackUsed || thesis.fallbackUsed;

    const scriptsFallback = writeScripts(articleInput, thesis.output);
    const scripts = await executeAiStep({
      agentSlug: "script-writer",
      stepOrder: 3,
      runId: run.id,
      schemaName: "script_result",
      schema: AiAgentOutputSchemas["script-writer"],
      systemPrompt: scriptWriterPrompt(),
      userInput: { articleInput, thesis: thesis.output },
      context: { articleInput, thesis: thesis.output },
      fallbackOutput: scriptsFallback,
      config,
      aiExecutor: options.aiExecutor,
      client
    });
    fallbackUsed = fallbackUsed || scripts.fallbackUsed;

    const storyboardFallback = createStoryboard(articleInput, scripts.output);
    const storyboard = await executeAiStep({
      agentSlug: "storyboard-agent",
      stepOrder: 4,
      runId: run.id,
      schemaName: "storyboard_result",
      schema: AiAgentOutputSchemas["storyboard-agent"],
      systemPrompt: storyboardAgentPrompt(),
      userInput: { articleInput, scripts: scripts.output },
      context: { articleInput, scripts: scripts.output },
      fallbackOutput: storyboardFallback,
      config,
      aiExecutor: options.aiExecutor,
      client
    });
    fallbackUsed = fallbackUsed || storyboard.fallbackUsed;

    const assetPromptsFallback = generatePrompts(articleInput, storyboard.output);
    const assetPrompts = await executeAiStep({
      agentSlug: "prompt-generator",
      stepOrder: 5,
      runId: run.id,
      schemaName: "asset_prompt_result",
      schema: AiAgentOutputSchemas["prompt-generator"],
      systemPrompt: promptGeneratorPrompt(),
      userInput: { articleInput, storyboard: storyboard.output },
      context: { articleInput, storyboard: storyboard.output },
      fallbackOutput: assetPromptsFallback,
      config,
      aiExecutor: options.aiExecutor,
      client
    });
    fallbackUsed = fallbackUsed || assetPrompts.fallbackUsed;

    const assetFinderFallback = {
      searchLeads: assetPrompts.output.searchLeads,
      note: "只保存素材搜索线索，不下载外部素材。"
    };
    const assetFinder = await executeAiStep({
      agentSlug: "asset-finder",
      stepOrder: 6,
      runId: run.id,
      schemaName: "asset_finder_result",
      schema: AiAgentOutputSchemas["asset-finder"],
      systemPrompt: assetFinderPrompt(),
      userInput: {
        searchLeads: assetPrompts.output.searchLeads,
        copyrightPolicy: "不下载素材；所有外部素材必须人工确认授权。"
      },
      context: { searchLeads: assetPrompts.output.searchLeads },
      fallbackOutput: assetFinderFallback,
      config,
      aiExecutor: options.aiExecutor,
      client
    });
    fallbackUsed = fallbackUsed || assetFinder.fallbackUsed;

    const assetPromptsForPack: AssetPromptResult = {
      ...assetPrompts.output,
      searchLeads: assetFinder.output.searchLeads
    };
    const draftRightsChecks = checkRightsRisks(storyboard.output, assetPromptsForPack);
    const draftMode = config.ok ? "ai" : "mock";
    const draftPack = buildProductionPack({
      mode: draftMode,
      articleInput,
      analysis: analysis.output,
      thesis: thesis.output,
      scripts: scripts.output,
      storyboard: storyboard.output,
      assetPrompts: assetPromptsForPack,
      rightsChecks: draftRightsChecks
    });
    const qaFallback = {
      rightsChecks: draftRightsChecks,
      qaSummary: createQaSummary(draftPack)
    };
    const qa = await executeAiStep({
      agentSlug: "qa-agent",
      stepOrder: 7,
      runId: run.id,
      schemaName: "qa_agent_result",
      schema: QaAgentResultSchema,
      systemPrompt: qaAgentPrompt(),
      userInput: {
        articleInput,
        analysis: analysis.output,
        thesis: thesis.output,
        scripts: scripts.output,
        storyboard: storyboard.output,
        assetPrompts: assetPromptsForPack,
        draftRightsChecks
      },
      context: {
        articleInput,
        analysis: analysis.output,
        thesis: thesis.output,
        scripts: scripts.output,
        storyboard: storyboard.output,
        assetPrompts: assetPromptsForPack
      },
      fallbackOutput: qaFallback,
      config,
      aiExecutor: options.aiExecutor,
      client
    });
    fallbackUsed = fallbackUsed || qa.fallbackUsed;

    const generationMode: GenerationMode = config.ok ? "ai" : "mock";
    const productionPack = buildProductionPack({
      mode: generationMode,
      articleInput,
      analysis: analysis.output,
      thesis: thesis.output,
      scripts: scripts.output,
      storyboard: storyboard.output,
      assetPrompts: assetPromptsForPack,
      rightsChecks: qa.output.rightsChecks
    });
    const qaSummary = createQaSummary(productionPack);
    const status = getProjectStatus(generationMode, fallbackUsed);
    const saved = saveProductionPack(productionPack, client, {
      ...options.saveOptions,
      status: options.saveOptions?.status ?? status
    });

    bindAgentRunToProject(run.id, saved.project.id, client);
    saveQaResult(
      {
        runId: run.id,
        projectId: saved.project.id,
        summary: qaSummary
      },
      client
    );
    completeAgentRun(
      run.id,
      client,
      fallbackUsed ? "completed_with_fallback" : "completed"
    );

    return {
      projectId: saved.project.id,
      agentRunId: run.id,
      productionPack,
      qaSummary,
      fallbackUsed,
      generationMode,
      saved
    };
  } catch (error) {
    failAgentRun(run.id, error instanceof Error ? error.message : String(error), client);
    throw error;
  }
}

type ExecuteAiStepInput<TSchema extends z.ZodType> = {
  agentSlug: AgentSlug;
  stepOrder: number;
  runId: string;
  schemaName: string;
  schema: TSchema;
  systemPrompt: string;
  userInput: unknown;
  context: Record<string, unknown>;
  fallbackOutput: z.infer<TSchema>;
  config: AiConfig;
  aiExecutor?: AiStepExecutor;
  client?: DbClient;
};

async function executeAiStep<TSchema extends z.ZodType>(
  input: ExecuteAiStepInput<TSchema>
): Promise<{ output: z.infer<TSchema>; fallbackUsed: boolean }> {
  const contextSnapshot = createAgentContextSnapshot(input.agentSlug, input.context);

  if (!input.config.ok) {
    recordStepWithSnapshot({
      ...input,
      status: "completed_with_fallback",
      outputJson: input.fallbackOutput,
      errorMessage: input.config.error.message,
      contextSnapshot
    });
    return { output: input.fallbackOutput, fallbackUsed: true };
  }

  try {
    const rawOutput = input.aiExecutor
      ? await input.aiExecutor({
          agentSlug: input.agentSlug,
          schema: input.schema,
          schemaName: input.schemaName,
          systemPrompt: input.systemPrompt,
          userInput: input.userInput,
          fallbackOutput: input.fallbackOutput,
          config: input.config
        })
      : await requestStructuredOutput({
          config: input.config,
          agentSlug: input.agentSlug,
          schema: input.schema,
          schemaName: input.schemaName,
          systemPrompt: input.systemPrompt,
          userInput: input.userInput
        });
    const output = parseAiOutput(input.schema, input.agentSlug, rawOutput);

    recordStepWithSnapshot({
      ...input,
      status: "completed",
      outputJson: output,
      errorMessage: null,
      contextSnapshot
    });
    return { output, fallbackUsed: false };
  } catch (error) {
    const normalized = normalizeAiError(error);
    recordStepWithSnapshot({
      ...input,
      status: "completed_with_fallback",
      outputJson: input.fallbackOutput,
      errorMessage: `${normalized.code}: ${normalized.message}`,
      contextSnapshot
    });
    return { output: input.fallbackOutput, fallbackUsed: true };
  }
}

function parseAiOutput<TSchema extends z.ZodType>(
  schema: TSchema,
  agentSlug: AgentSlug,
  rawOutput: unknown
): z.infer<TSchema> {
  const parsed = schema.safeParse(rawOutput);

  if (!parsed.success) {
    throw new AiSchemaError(
      `${agentSlug} schema validation failed: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`
    );
  }

  return parsed.data;
}

function recordStepWithSnapshot<TSchema extends z.ZodType>(
  input: ExecuteAiStepInput<TSchema> & {
    status: AgentStepStatus;
    outputJson: unknown;
    errorMessage: string | null;
    contextSnapshot: ReturnType<typeof createAgentContextSnapshot>;
  }
) {
  const step = recordAgentRunStep(
    {
      runId: input.runId,
      agentSlug: input.agentSlug,
      stepOrder: input.stepOrder,
      status: input.status,
      inputJson: input.userInput,
      outputJson: input.outputJson,
      inputSummary: summarizeJson(input.userInput),
      outputSummary: summarizeJson(input.outputJson),
      errorMessage: input.errorMessage
    },
    input.client
  );

  saveAgentContextSnapshot(
    {
      runId: input.runId,
      stepId: step.id,
      agentSlug: input.agentSlug,
      context: input.contextSnapshot.context,
      summary: input.contextSnapshot.summary
    },
    input.client
  );
}

function buildProductionPack(input: Omit<ProductionPack, "id" | "createdAt" | "exportManifest">): ProductionPack {
  return ProductionPackSchema.parse({
    id: `${input.mode}-${slugify(input.articleInput.title)}`,
    createdAt: new Date().toISOString(),
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

function getProjectStatus(mode: GenerationMode, fallbackUsed: boolean) {
  if (mode === "mock") {
    return "ai_fallback_mock_saved";
  }

  return fallbackUsed ? "ai_saved_with_fallback" : "ai_saved";
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
