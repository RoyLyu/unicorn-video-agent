import { ZodError } from "zod";

import { runTrackedMockPipeline } from "@/lib/agents/tracked-mock-pipeline";
import { ArticleInputSchema } from "@/lib/schemas/production-pack";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const articleInput = ArticleInputSchema.parse(body);
    const result = runTrackedMockPipeline(articleInput);

    return Response.json({
      projectId: result.saved.project.id,
      productionPack: result.saved.productionPack,
      agentRunId: result.agentRunId,
      fallbackUsed: false,
      generationMode: "mock"
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
      { error: "Mock pipeline or SQLite persistence failed" },
      { status: 500 }
    );
  }
}
