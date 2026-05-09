import Link from "next/link";
import { notFound } from "next/navigation";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProductionPackReviewView } from "@/components/production-pack-review-view";
import { getReviewData } from "@/db/repositories/review-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const reviewData = getReviewData(projectId);

  if (!reviewData) {
    notFound();
  }

  return (
    <main className="content-stack">
      {reviewData.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        eyebrow="Batch 06 / Review Workflow"
        title="项目审阅"
        description="导出前 checklist、事实核验、版权复核和发布文案编辑。当前不接真实 AI、不自动发布。"
        actions={
          <Link className="primary-link" href={`/projects/${projectId}/export`}>
            进入 Export
          </Link>
        }
      />
      <ProductionPackReviewView
        initialReviewData={reviewData}
        projectId={projectId}
      />
    </main>
  );
}
