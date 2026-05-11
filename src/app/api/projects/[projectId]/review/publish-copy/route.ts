import { ZodError } from "zod";

import { upsertPublishCopy } from "@/db/repositories/publish-copy-repository";
import { getReviewData } from "@/db/repositories/review-repository";
import { PublishCopyInputSchema } from "@/lib/review/review-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  if (!getReviewData(projectId)) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    upsertPublishCopy(projectId, PublishCopyInputSchema.parse(await request.json()));
    return Response.json(getReviewData(projectId));
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: "Invalid publish copy" }, { status: 400 });
    }

    return Response.json({ error: "Publish copy save failed" }, { status: 500 });
  }
}
