import { notFound } from "next/navigation";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProductionStudioView } from "@/components/production-studio-view";
import { ProjectNav } from "@/components/project-nav";
import { getProductionStudioPayload } from "@/lib/server/production-studio-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProductionStudioPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const payload = getProductionStudioPayload(projectId);

  if (!payload) {
    notFound();
  }

  return (
    <main className="content-stack">
      {payload.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        eyebrow="Batch 12B / Production Studio"
        title="Production Studio"
        description="检查 90s / 180s micro-shots、Prompt 对齐、版权替代方案和是否需要重跑 / 人工修正。"
      />
      <ProjectNav projectId={projectId} />
      <ProductionStudioView initialPayload={payload} />
    </main>
  );
}
