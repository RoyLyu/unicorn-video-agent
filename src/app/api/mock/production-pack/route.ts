import { ZodError } from "zod";

import { runMockPipeline } from "@/lib/mock-pipeline/run-mock-pipeline";
import { ArticleInputSchema } from "@/lib/schemas/production-pack";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const articleInput = ArticleInputSchema.parse(body);
    const productionPack = runMockPipeline(articleInput);

    return Response.json(productionPack);
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
      { error: "Mock pipeline failed" },
      { status: 500 }
    );
  }
}
