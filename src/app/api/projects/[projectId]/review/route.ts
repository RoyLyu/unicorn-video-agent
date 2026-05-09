import { ZodError } from "zod";

import { getReviewApiPayload, saveReviewApiPayload } from "./review-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const payload = getReviewApiPayload(projectId);

  if (!payload) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(payload);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const current = getReviewApiPayload(projectId);

  if (!current) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const payload = await request.json();
    const saved = saveReviewApiPayload(projectId, payload);

    return Response.json(saved);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Invalid review payload",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return Response.json({ error: "Review save failed" }, { status: 500 });
  }
}
