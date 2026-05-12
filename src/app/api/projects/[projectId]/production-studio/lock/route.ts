import { ZodError } from "zod";

import { lockProductionStudio } from "@/lib/server/production-studio-service";
import { ProductionStudioLockInputSchema } from "@/lib/production-studio/production-studio-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const parsed = ProductionStudioLockInputSchema.parse(await request.json());
    const result = lockProductionStudio(projectId, parsed.lockNote ?? null);

    if (result.status === "not_found") {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    if (result.status === "gate_failed") {
      return Response.json(
        {
          error: "Production Studio gate must pass before lock.",
          payload: result.payload
        },
        { status: 400 }
      );
    }

    return Response.json(result.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid lock payload" }, { status: 400 });
    }

    return Response.json({ error: "Production Studio lock failed" }, { status: 500 });
  }
}
