import { getProductionStudioPayload } from "@/lib/server/production-studio-service";
import { parseShotDensityProfile } from "@/lib/production-studio/density-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const url = new URL(request.url);
  const payload = getProductionStudioPayload(
    projectId,
    parseShotDensityProfile(url.searchParams.get("densityProfile"))
  );

  if (!payload) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(payload);
}
