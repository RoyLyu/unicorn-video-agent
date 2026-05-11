import { getProductionPackByProjectId } from "@/db/repositories/production-pack-repository";
import { getPublishCopyByProjectId } from "@/db/repositories/publish-copy-repository";
import { readAiPolicy } from "@/lib/ai/ai-policy";
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

    const isFallback = isFallbackProject(saved);
    const policy = readAiPolicy();

    if (
      fileName === "production-pack.md" &&
      isFallback &&
      policy.requireRealOutput
    ) {
      return Response.json(
        {
          error: "Fallback production-pack.md is blocked in strict real output mode."
        },
        { status: 422 }
      );
    }

    const generatedFile = generateExportFile(fileName, saved.productionPack, {
      publishCopy: getPublishCopyByProjectId(projectId) ?? undefined,
      fallbackWarning: fileName === "production-pack.md" && isFallback
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

function isFallbackProject(saved: NonNullable<ReturnType<typeof getProductionPackByProjectId>>) {
  return (
    saved.productionPack.mode === "mock" ||
    saved.project.status.includes("fallback") ||
    saved.project.status.includes("mock")
  );
}
