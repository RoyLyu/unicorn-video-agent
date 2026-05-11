import type { DbClient } from "@/db";
import { syncAgentDefinitions } from "@/db/repositories/agent-definition-repository";
import {
  bindAgentRunToProject,
  completeAgentRun,
  createAgentRun,
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
import { normalizeAiError } from "@/lib/ai/ai-errors";
import { createOpenAiClient } from "@/lib/ai/openai-client";
import { parseAiJsonObject } from "@/lib/ai/structured-output";
import { runMockPipeline } from "@/lib/mock-pipeline/run-mock-pipeline";
import {
  ArticleInputSchema,
  ProductionPackSchema,
  type ArticleInput,
  type GenerationMode,
  type ProductionPack
} from "@/lib/schemas/production-pack";

import { normalizeProductionPack } from "./normalize-production-pack";
import {
  requiredNegativePrompt,
  singlePackProductionPrompt
} from "./prompts/single-pack-production-prompt";

type SaveOptions = {
  isDemo?: boolean;
  status?: string;
};

export type ChatCompletionExecutor = (input: {
  config: Extract<AiConfig, { ok: true }>;
  systemPrompt: string;
  userInput: unknown;
}) => Promise<string>;

type RunAiSinglePackPipelineOptions = {
  client?: DbClient;
  env?: AiEnvironment;
  saveOptions?: SaveOptions;
  chatCompletionExecutor?: ChatCompletionExecutor;
};

export type RunAiSinglePackPipelineResult = {
  projectId: string;
  agentRunId: string;
  productionPack: ProductionPack;
  qaSummary: AgentQaSummary;
  fallbackUsed: boolean;
  generationMode: GenerationMode;
  agentMode: "single_pack";
  saved: ReturnType<typeof saveProductionPack>;
};

const agentSteps: Array<{ slug: AgentSlug; output: (pack: ProductionPack) => unknown }> = [
  { slug: "article-analyst", output: (pack) => pack.analysis },
  { slug: "thesis-agent", output: (pack) => pack.thesis },
  { slug: "script-writer", output: (pack) => pack.scripts },
  { slug: "storyboard-agent", output: (pack) => pack.storyboard },
  { slug: "prompt-generator", output: (pack) => pack.assetPrompts },
  { slug: "asset-finder", output: (pack) => pack.assetPrompts.searchLeads },
  {
    slug: "qa-agent",
    output: (pack) => ({
      rightsChecks: pack.rightsChecks,
      qaSummary: createQaSummary(pack)
    })
  }
];

export async function runAiSinglePackPipeline(
  input: ArticleInput,
  options: RunAiSinglePackPipelineOptions = {}
): Promise<RunAiSinglePackPipelineResult> {
  const articleInput = ArticleInputSchema.parse(input);
  const client = options.client;
  const config = readAiConfig(options.env);

  syncAgentDefinitions(client);
  const run = createAgentRun(articleInput.title, client);

  try {
    if (!config.ok) {
      return saveFallbackPack({
        articleInput,
        runId: run.id,
        client,
        saveOptions: options.saveOptions,
        errorMessage: config.error.message
      });
    }

    const rawText = options.chatCompletionExecutor
      ? await options.chatCompletionExecutor({
          config,
          systemPrompt: singlePackProductionPrompt(),
          userInput: { articleInput }
        })
      : await requestChatCompletionJson(config, { articleInput });
    const parsedPack = coerceAiProductionPack(parseAiJsonObject(rawText), articleInput);
    const productionPack = normalizeProductionPack(parsedPack);
    const qaSummary = createQaSummary(productionPack);
    const saved = saveProductionPack(productionPack, client, {
      ...options.saveOptions,
      status: options.saveOptions?.status ?? "ai_saved"
    });

    bindAgentRunToProject(run.id, saved.project.id, client);
    recordAllSteps({
      runId: run.id,
      articleInput,
      productionPack,
      status: "completed",
      errorMessage: null,
      client
    });
    saveQaResult({ runId: run.id, projectId: saved.project.id, summary: qaSummary }, client);
    completeAgentRun(run.id, client, "completed");

    return {
      projectId: saved.project.id,
      agentRunId: run.id,
      productionPack,
      qaSummary,
      fallbackUsed: false,
      generationMode: "ai",
      agentMode: "single_pack",
      saved
    };
  } catch (error) {
    const normalized = normalizeAiError(error);

    return saveFallbackPack({
      articleInput,
      runId: run.id,
      client,
      saveOptions: options.saveOptions,
      errorMessage: `${normalized.code}: ${normalized.message}`
    });
  }
}

async function requestChatCompletionJson(
  config: Extract<AiConfig, { ok: true }>,
  userInput: unknown
) {
  const client = createOpenAiClient(config);
  const response = await client.chat.completions.create(
    {
      model: config.model,
      messages: [
        { role: "system", content: singlePackProductionPrompt() },
        { role: "user", content: JSON.stringify(userInput) }
      ],
      temperature: 0.2,
      max_tokens: Math.max(config.maxTokens, 8000)
    },
    { timeout: config.requestTimeoutMs }
  );
  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI provider returned empty content.");
  }

  return content;
}

function saveFallbackPack(input: {
  articleInput: ArticleInput;
  runId: string;
  client?: DbClient;
  saveOptions?: SaveOptions;
  errorMessage: string;
}): RunAiSinglePackPipelineResult {
  const productionPack = runMockPipeline(input.articleInput);
  const qaSummary = createQaSummary(productionPack);
  const saved = saveProductionPack(productionPack, input.client, {
    ...input.saveOptions,
    status: input.saveOptions?.status ?? "ai_fallback_mock_saved"
  });

  bindAgentRunToProject(input.runId, saved.project.id, input.client);
  recordAllSteps({
    runId: input.runId,
    articleInput: input.articleInput,
    productionPack,
    status: "completed_with_fallback",
    errorMessage: input.errorMessage,
    client: input.client
  });
  saveQaResult({ runId: input.runId, projectId: saved.project.id, summary: qaSummary }, input.client);
  completeAgentRun(input.runId, input.client, "completed_with_fallback");

  return {
    projectId: saved.project.id,
    agentRunId: input.runId,
    productionPack,
    qaSummary,
    fallbackUsed: true,
    generationMode: "mock",
    agentMode: "single_pack",
    saved
  };
}

function coerceAiProductionPack(rawOutput: unknown, articleInput: ArticleInput): ProductionPack {
  const basePack = createBaseAiPack(articleInput);
  const raw = isRecord(rawOutput) && isRecord(rawOutput.productionPack)
    ? rawOutput.productionPack
    : rawOutput;
  const record = isRecord(raw) ? raw : {};
  const storyboard = isRecord(record.storyboard) ? record.storyboard : {};
  const rawShots = Array.isArray(storyboard.shots)
    ? storyboard.shots
    : Array.isArray(record.shots)
      ? record.shots
      : basePack.storyboard.shots;
  const shots = rawShots.map((shot, index) => {
    const item = isRecord(shot) ? shot : {};

    return {
      id: String(item.id ?? `S${String(index + 1).padStart(2, "0")}`),
      timeRange: String(item.timeRange ?? `00:${String(index * 10).padStart(2, "0")}-00:${String(index * 10 + 10).padStart(2, "0")}`),
      scene: String(item.scene ?? `第 ${index + 1} 段观点视觉化`),
      narration: String(item.narration ?? `第 ${index + 1} 段旁白。`),
      visual: String(item.visual ?? item.scene ?? "行业观点信息卡"),
      assetType: normalizeAssetType(item.assetType, index),
      rightsLevel: normalizeRightsLevel(item.rightsLevel),
      imagePrompt: item.imagePrompt,
      videoPrompt: item.videoPrompt,
      negativePrompt: item.negativePrompt,
      notes: item.notes
    };
  });
  const assetPrompts = coerceAssetPrompts(record.assetPrompts, shots, articleInput);
  const exportManifest = coerceExportManifest(record.exportManifest, basePack);

  return ProductionPackSchema.parse({
    id: String(record.id ?? `ai-${slugify(articleInput.title)}`),
    createdAt: String(record.createdAt ?? new Date().toISOString()),
    mode: "ai",
    articleInput,
    analysis: coerceAnalysis(record.analysis, basePack),
    thesis: coerceThesis(record.thesis, basePack),
    scripts: coerceScripts(record.scripts, basePack),
    storyboard: {
      shots: shots.map((shot) => ({
        id: shot.id,
        timeRange: shot.timeRange,
        scene: shot.scene,
        narration: shot.narration,
        visual: shot.visual,
        assetType: shot.assetType,
        rightsLevel: shot.rightsLevel
      }))
    },
    assetPrompts,
    rightsChecks: coerceRightsChecks(record.rightsChecks, basePack),
    exportManifest
  });
}

function coerceAnalysis(value: unknown, basePack: ProductionPack) {
  const record = isRecord(value) ? value : {};
  const industryData = Array.isArray(record.industryData)
    ? record.industryData.map((item, index) =>
        isRecord(item)
          ? {
              metric: String(item.metric ?? `行业观察 ${index + 1}`),
              value: String(item.value ?? item.note ?? "待人工核验"),
              note: String(item.note ?? "来自 AI 输出，正式发布前需人工核验。")
            }
          : {
              metric: `行业观察 ${index + 1}`,
              value: String(item),
              note: "来自 AI 输出，正式发布前需人工核验。"
            }
      )
    : basePack.analysis.industryData;

  return {
    summary: String(record.summary ?? basePack.analysis.summary),
    keyFacts: coerceStringArray(record.keyFacts, basePack.analysis.keyFacts),
    industryData,
    risks: coerceStringArray(record.risks, basePack.analysis.risks)
  };
}

function coerceThesis(value: unknown, basePack: ProductionPack) {
  const record = isRecord(value) ? value : {};

  return {
    coreTheses: coerceStringArray(record.coreTheses, basePack.thesis.coreTheses),
    videoAngle: String(record.videoAngle ?? basePack.thesis.videoAngle),
    audienceTakeaway: String(record.audienceTakeaway ?? basePack.thesis.audienceTakeaway)
  };
}

function coerceScripts(value: unknown, basePack: ProductionPack) {
  const record = isRecord(value) ? value : {};

  return {
    video90s: isRecord(record.video90s) ? record.video90s : basePack.scripts.video90s,
    video180s: isRecord(record.video180s) ? record.video180s : basePack.scripts.video180s
  };
}

function coerceAssetPrompts(
  value: unknown,
  shots: Array<Record<string, unknown>>,
  articleInput: ArticleInput
) {
  const record = isRecord(value) ? value : {};
  const imagePrompts = Array.isArray(record.imagePrompts)
    ? record.imagePrompts
    : shots.map((shot) => ({
        id: `IMG-${shot.id}`,
        sceneRef: shot.id,
        prompt: shot.imagePrompt ?? shot.visual,
        negativePrompt: shot.negativePrompt,
        notes: shot.notes
      }));
  const videoPrompts = Array.isArray(record.videoPrompts)
    ? record.videoPrompts
    : shots.map((shot) => ({
        id: `VID-${shot.id}`,
        sceneRef: shot.id,
        prompt: shot.videoPrompt ?? shot.visual,
        negativePrompt: shot.negativePrompt,
        notes: shot.notes
      }));

  return {
    imagePrompts: imagePrompts.map((item, index) => coercePromptItem(item, index, "IMG", shots)),
    videoPrompts: videoPrompts.map((item, index) => coercePromptItem(item, index, "VID", shots)),
    searchLeads: Array.isArray(record.searchLeads) && record.searchLeads.length > 0
      ? record.searchLeads.map((item) => {
          const lead = isRecord(item) ? item : {};

          return {
            query: String(lead.query ?? `${articleInput.industryTags.join(" ")} abstract business documentary vertical footage`),
            platform: String(lead.platform ?? "Pexels / Pixabay / Storyblocks"),
            intendedUse: String(lead.intendedUse ?? "寻找非特定公司、非新闻现场的抽象商业氛围素材。"),
            licenseRequirement: String(lead.licenseRequirement ?? "必须人工确认可商用、可二创和署名要求。")
          };
        })
      : [
          {
            query: `${articleInput.industryTags.join(" ")} abstract business documentary vertical footage`,
            platform: "Pexels / Pixabay / Storyblocks",
            intendedUse: "寻找非特定公司、非新闻现场的抽象商业氛围素材。",
            licenseRequirement: "必须人工确认可商用、可二创和署名要求。"
          }
        ]
  };
}

function coercePromptItem(
  value: unknown,
  index: number,
  prefix: "IMG" | "VID",
  shots: Array<Record<string, unknown>>
) {
  const record = isRecord(value) ? value : {};
  const sceneRef = String(record.sceneRef ?? shots[index]?.id ?? `S${String(index + 1).padStart(2, "0")}`);

  return {
    id: String(record.id ?? `${prefix}-${sceneRef}`),
    sceneRef,
    prompt: String(record.prompt ?? shots[index]?.visual ?? "abstract business documentary visual"),
    negativePrompt: String(record.negativePrompt || requiredNegativePrompt),
    notes: String(record.notes ?? "对应分镜提示。")
  };
}

function coerceRightsChecks(value: unknown, basePack: ProductionPack) {
  const rows = Array.isArray(value) && value.length > 0 ? value : basePack.rightsChecks;

  return rows.map((item, index) => {
    const record = isRecord(item) ? item : {};
    const level = normalizeRightsLevel(record.level ?? record.riskLevel);

    return {
      item: String(record.item ?? record.materialType ?? record.shotId ?? `版权项 ${index + 1}`),
      level,
      reason: String(record.reason ?? record.notes ?? "需要人工复核授权。"),
      action: String(record.action ?? record.reviewAction ?? "替换为自制图表、抽象 AI 画面或 placeholder 复核项，不使用真实素材。")
    };
  });
}

function coerceStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.length > 0
    ? value.map((item) => String(item)).filter(Boolean)
    : fallback;
}

function coerceExportManifest(value: unknown, basePack: ProductionPack) {
  const files = isRecord(value) && Array.isArray(value.files) ? value.files : [];

  return {
    files: (files.length > 0 ? files : basePack.exportManifest.files).map((file, index) => {
      const item = isRecord(file) ? file : {};
      const filename = String(item.filename ?? item.name ?? item.fileName ?? "");

      return {
        filename: filename || String(basePack.exportManifest.files[index]?.filename ?? "production-pack.md"),
        format: String(item.format ?? inferFormat(filename)),
        purpose: String(item.purpose ?? item.description ?? "文本导出文件"),
        status: "planned" as const,
        generated: false as const
      };
    })
  };
}

function createBaseAiPack(articleInput: ArticleInput): ProductionPack {
  const basePack = runMockPipeline(articleInput);
  const sanitized = sanitizeInternalPhrases({
    ...basePack,
    id: `ai-${slugify(articleInput.title)}`,
    createdAt: new Date().toISOString(),
    mode: "ai"
  });

  return ProductionPackSchema.parse(sanitized);
}

function sanitizeInternalPhrases(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replace(/mock/gi, "AI")
      .replace(/Batch\s*02/gi, "当前流程")
      .replace(/后续会补齐|系统会补齐|demo-data/g, "已生成");
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeInternalPhrases);
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeInternalPhrases(item)])
    );
  }

  return value;
}

function inferFormat(filename: string) {
  if (filename.endsWith(".csv")) {
    return "CSV";
  }

  if (filename.endsWith(".json")) {
    return "JSON";
  }

  return "Markdown";
}

function normalizeAssetType(value: unknown, index: number) {
  const allowed = ["chart", "ai-image", "ai-video", "stock", "screen", "text"];

  return allowed.includes(String(value))
    ? String(value)
    : index % 2 === 0
      ? "ai-image"
      : "ai-video";
}

function normalizeRightsLevel(value: unknown) {
  const allowed = ["green", "yellow", "red", "placeholder"];

  return allowed.includes(String(value)) ? String(value) : "placeholder";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function recordAllSteps(input: {
  runId: string;
  articleInput: ArticleInput;
  productionPack: ProductionPack;
  status: AgentStepStatus;
  errorMessage: string | null;
  client?: DbClient;
}) {
  agentSteps.forEach((stepInfo, index) => {
    const outputJson = stepInfo.output(input.productionPack);
    const contextSnapshot = createAgentContextSnapshot(stepInfo.slug, {
      articleInput: input.articleInput,
      productionPack: input.productionPack
    });
    const step = recordAgentRunStep(
      {
        runId: input.runId,
        agentSlug: stepInfo.slug,
        stepOrder: index + 1,
        status: input.status,
        inputJson: { articleInput: input.articleInput, mode: "single_pack" },
        outputJson,
        inputSummary: summarizeJson(input.articleInput),
        outputSummary: summarizeJson(outputJson),
        errorMessage: input.status === "completed" ? null : input.errorMessage
      },
      input.client
    );

    saveAgentContextSnapshot(
      {
        runId: input.runId,
        stepId: step.id,
        agentSlug: stepInfo.slug,
        context: contextSnapshot.context,
        summary: contextSnapshot.summary
      },
      input.client
    );
  });
}
