import { ZodError } from "zod";

import { saveProductionStudioEditPayload } from "@/lib/server/production-studio-service";
import { parseShotDensityProfile } from "@/lib/production-studio/density-profile";
import { ProductionStudioEditBatchSchema } from "@/lib/production-studio/production-studio-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const body = await request.json();
    const parsed = ProductionStudioEditBatchSchema.parse(body);
    const payload = saveProductionStudioEditPayload(
      projectId,
      parsed.edits,
      parseShotDensityProfile(body.densityProfile)
    );

    if (!payload) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid production studio edits",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return Response.json({ error: "Production Studio edit save failed" }, { status: 500 });
  }
}
