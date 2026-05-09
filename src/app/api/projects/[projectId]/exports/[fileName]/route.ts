import { getProductionPackByProjectId } from "@/db/repositories/production-pack-repository";
import { getPublishCopyByProjectId } from "@/db/repositories/publish-copy-repository";
import { generateExportFile } from "@/lib/export/generate-export-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; fileName: string }> }
) {
  const { projectId, fileName } = await params;

  try {
    const saved = getProductionPackByProjectId(projectId);

    if (!saved) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }

    const generatedFile = generateExportFile(fileName, saved.productionPack, {
      publishCopy: getPublishCopyByProjectId(projectId) ?? undefined
    });

    if (!generatedFile) {
      return Response.json({ error: "Export file not found" }, { status: 404 });
    }

    return new Response(generatedFile.content, {
      headers: {
        "Content-Type": generatedFile.contentType,
        "Content-Disposition": `attachment; filename="${generatedFile.fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return Response.json(
      { error: "SQLite database is not initialized. Run pnpm db:migrate." },
      { status: 500 }
    );
  }
}
