import { z, ZodError } from "zod";

import { saveFactChecks } from "@/db/repositories/fact-check-repository";
import { getReviewData } from "@/db/repositories/review-repository";
import { FactCheckInputSchema } from "@/lib/review/review-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FactChecksPayloadSchema = z.object({
  factChecks: z.array(FactCheckInputSchema)
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  if (!getReviewData(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const payload = FactChecksPayloadSchema.parse(await request.json());
    saveFactChecks(projectId, payload.factChecks);
    return Response.json(getReviewData(projectId));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid fact checks" }, { status: 400 });
    }

    return Response.json({ error: "Fact checks save failed" }, { status: 500 });
  }
}
