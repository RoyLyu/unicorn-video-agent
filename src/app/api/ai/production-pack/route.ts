import { ZodError } from "zod";

import type { DbClient } from "@/db";
import { getAgentRunDetail } from "@/db/repositories/agent-run-repository";
import { readAiConfig, type AiEnvironment } from "@/lib/ai/ai-config";
import {
  readAiPolicy,
  shouldAllowMockFallback,
  type GenerationProfile
} from "@/lib/ai/ai-policy";
import { runAiPipeline } from "@/lib/ai-agents/run-ai-pipeline";
import {
  isAiSinglePackFailure,
  runAiSinglePackPipeline,
  type ChatCompletionExecutor
} from "@/lib/ai-agents/run-ai-single-pack-pipeline";
import { ArticleInputSchema } from "@/lib/schemas/production-pack";

import { classifyAiFallbackReason } from "./fallback-summary";

export const runtime = "nodejs";

type HandlerOptions = {
  client?: DbClient;
  env?: AiEnvironment;
  chatCompletionExecutor?: ChatCompletionExecutor;
};

export async function POST(request: Request) {
  return handleAiProductionPackRequest(request);
}

export async function handleAiProductionPackRequest(
  request: Request,
  options: HandlerOptions = {}
) {
  try {
    const body = await request.json();
    const articleInput = ArticleInputSchema.parse(body);
    const generationProfile = parseGenerationProfile(body);
    const config = readAiConfig(options.env);
    const policy = readAiPolicy(options.env);

    if (
      config.agentMode === "sequential" &&
      !shouldAllowMockFallback({ policy, generationProfile })
    ) {
      return Response.json(
        {
          error: "Strict real output does not allow sequential fallback runner.",
          failureReason: "ai_config",
          safeErrorSummary:
            "Strict real output requires single_pack mode. Set AI_AGENT_MODE=single_pack or use fast demo fallback explicitly.",
          fallbackUsed: false,
          generationMode: "ai"
        },
        { status: 422 }
      );
    }

    const result =
      config.agentMode === "sequential"
        ? await runAiPipeline(articleInput, {
            client: options.client,
            env: options.env
          })
        : await runAiSinglePackPipeline(articleInput, {
            client: options.client,
            env: options.env,
            generationProfile,
            chatCompletionExecutor: options.chatCompletionExecutor
          });

    if ("agentMode" in result && isAiSinglePackFailure(result)) {
      return Response.json(
        {
          error: "Strict real output generation failed.",
          agentRunId: result.agentRunId,
          fallbackUsed: result.fallbackUsed,
          generationMode: result.generationMode,
          failureReason: result.failureReason,
          safeErrorSummary: result.safeErrorSummary,
          agentMode: result.agentMode
        },
        { status: 422 }
      );
    }

    const fallbackSummary = result.fallbackUsed
      ? classifyAiFallbackReason(
          getAgentRunErrorMessage(result.agentRunId, options.client)
        )
      : null;

    return Response.json({
      projectId: result.projectId,
      productionPack: result.productionPack,
      agentRunId: result.agentRunId,
      fallbackUsed: result.fallbackUsed,
      generationMode: result.generationMode,
      agentMode: "agentMode" in result ? result.agentMode : "sequential",
      ...(fallbackSummary ?? {})
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid ArticleInput",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "AI pipeline or SQLite persistence failed" },
      { status: 500 }
    );
  }
}

function parseGenerationProfile(body: unknown): GenerationProfile {
  if (
    typeof body === "object" &&
    body !== null &&
    "generationProfile" in body &&
    body.generationProfile === "fast_demo"
  ) {
    return "fast_demo";
  }

  return "real_output";
}

function getAgentRunErrorMessage(agentRunId: string, client?: DbClient) {
  try {
    const detail = getAgentRunDetail(agentRunId, client);

    if (!detail) {
      return null;
    }

    const stepError = detail.steps.find((step) => step.errorMessage)?.errorMessage;

    return detail.run.errorMessage ?? stepError ?? null;
  } catch {
    return null;
  }
}
