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
        description="从 SQLite 读取 ProductionPack。Batch 04 即时生成文本生产包导出，不包含真实视频、图片或音频。"
      />
      <ProductionPackExportView
        productionPack={saved.productionPack}
        projectId={projectId}
      />
    </main>
  );
}
