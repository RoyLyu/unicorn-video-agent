import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProductionPackAnalysisView } from "@/components/production-pack-analysis-view";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AnalysisPage({
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
        title="分析结果"
        description="从 SQLite 读取 ProductionPack，展示 analysis 与 thesis。当前为 Batch 03 / UI Shell + 本地持久化。"
      />
      <ProductionPackAnalysisView productionPack={saved.productionPack} />
    </main>
  );
}
