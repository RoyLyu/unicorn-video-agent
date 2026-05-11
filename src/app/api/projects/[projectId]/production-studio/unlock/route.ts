import { unlockProductionStudio } from "@/lib/server/production-studio-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const payload = unlockProductionStudio(projectId);

  if (!payload) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(payload);
}
