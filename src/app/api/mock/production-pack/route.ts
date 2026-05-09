import { ZodError } from "zod";

import { saveProductionPack } from "@/db/repositories/production-pack-repository";
import { runMockPipeline } from "@/lib/mock-pipeline/run-mock-pipeline";
import { ArticleInputSchema } from "@/lib/schemas/production-pack";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const articleInput = ArticleInputSchema.parse(body);
    const productionPack = runMockPipeline(articleInput);
    const saved = saveProductionPack(productionPack);

    return Response.json({
      projectId: saved.project.id,
      productionPack: saved.productionPack
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
