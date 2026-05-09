import { getProductionPackByProjectId } from "@/db/repositories/production-pack-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const saved = getProductionPackByProjectId(projectId);

    if (!saved) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    return Response.json(saved);
  } catch {
    return Response.json(
      { error: "SQLite database is not initialized. Run pnpm db:migrate." },
      { status: 500 }
    );
  }
}
