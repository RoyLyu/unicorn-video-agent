import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProductionPackExportView } from "@/components/production-pack-export-view";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ExportPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const saved = loadProjectPack(projectId);

  if (!saved) {
    notFound();
  }

  return (
    <main className="content-stack">
      <PageHeader
        title="导出清单"
        description="从 SQLite 读取 exportManifest。Batch 03 仍只展示计划，不生成 Markdown、CSV 或 JSON 文件。"
      />
      <ProductionPackExportView productionPack={saved.productionPack} />
    </main>
  );
}
