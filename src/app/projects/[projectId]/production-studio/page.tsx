import { notFound } from "next/navigation";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProductionStudioView } from "@/components/production-studio-view";
import { ProjectNav } from "@/components/project-nav";
import { mapProductionStudioViewModel } from "@/lib/production-studio/production-studio-mapper";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProductionStudioPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const saved = loadProjectPack(projectId);

  if (!saved) {
    notFound();
  }

  const studio = mapProductionStudioViewModel({
    projectId,
    projectTitle: saved.project.title,
    productionPack: saved.productionPack
  });

  return (
    <main className="content-stack">
      {saved.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        eyebrow="Batch 12B / Production Studio"
        title="Production Studio"
        description="检查 90s / 180s micro-shots、Prompt 对齐、版权替代方案和是否需要重跑 / 人工修正。"
      />
      <ProjectNav projectId={projectId} />
      <ProductionStudioView studio={studio} />
    </main>
  );
}
