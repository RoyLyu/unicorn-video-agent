import { ZodError } from "zod";

import type { DbClient } from "@/db";
import { runAiPipeline } from "@/lib/ai-agents/run-ai-pipeline";
import { ArticleInputSchema } from "@/lib/schemas/production-pack";

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

    return Response.json({
      projectId: result.projectId,
      productionPack: result.productionPack,
      agentRunId: result.agentRunId,
      fallbackUsed: result.fallbackUsed,
      generationMode: result.generationMode
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
