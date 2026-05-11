import { notFound } from "next/navigation";
import Link from "next/link";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProjectNav } from "@/components/project-nav";
import { ProductionPackExportView } from "@/components/production-pack-export-view";
import { getReviewData } from "@/db/repositories/review-repository";
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
  const reviewData = getReviewData(projectId);

  if (!saved) {
    notFound();
  }

  return (
    <main className="content-stack">
      {saved.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        title="导出清单"
        description="从 SQLite 读取 ProductionPack。Batch 08 即时生成文本生产包导出，不包含真实视频、图片或音频。"
        actions={
          <div className="action-row">
            <Link className="primary-link" href={`/projects/${projectId}/showcase`}>
              进入 Showcase
            </Link>
            <Link className="ghost-button" href={`/projects/${projectId}/production-studio`}>
              Production Studio
            </Link>
            <Link className="ghost-button" href={`/projects/${projectId}/review`}>
              进入 Review
            </Link>
          </div>
        }
      />
      <ProjectNav projectId={projectId} />
      <ProductionPackExportView
        productionPack={saved.productionPack}
        projectId={projectId}
        reviewSummary={reviewData?.reviewSummary}
        publishCopy={reviewData?.publishCopy}
        isFallbackProject={
          saved.productionPack.mode === "mock" ||
          saved.project.status.includes("fallback") ||
          saved.project.status.includes("mock")
        }
      />
    </main>
  );
}
