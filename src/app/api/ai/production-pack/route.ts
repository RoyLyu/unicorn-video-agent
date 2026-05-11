import { ZodError } from "zod";

import type { DbClient } from "@/db";
import { getAgentRunDetail } from "@/db/repositories/agent-run-repository";
import { runAiPipeline } from "@/lib/ai-agents/run-ai-pipeline";
import { ArticleInputSchema } from "@/lib/schemas/production-pack";

import { classifyAiFallbackReason } from "./fallback-summary";

export const runtime = "nodejs";

type HandlerOptions = {
  client?: DbClient;
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
    const result = await runAiPipeline(articleInput, {
      client: options.client
    });
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
