import { ZodError } from "zod";

import { revalidateProductionStudio } from "@/lib/server/production-studio-service";
import { ProductionStudioRevalidateInputSchema } from "@/lib/production-studio/production-studio-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const parsed = ProductionStudioRevalidateInputSchema.parse(await request.json());
    const result = revalidateProductionStudio(projectId, parsed.densityProfile);

    if (!result) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json(result.payload);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid production studio gate payload" }, { status: 400 });
    }

    return Response.json({ error: "Production Studio revalidate failed" }, { status: 500 });
  }
}
