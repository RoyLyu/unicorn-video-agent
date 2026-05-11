import { notFound } from "next/navigation";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProjectNav } from "@/components/project-nav";
import { ProjectShowcaseView } from "@/components/project-showcase-view";
import {
  getAgentRunDetail,
  getLatestAgentRunForProject
} from "@/db/repositories/agent-run-repository";
import { getReviewData } from "@/db/repositories/review-repository";
import { loadProjectPack } from "@/lib/server/project-pack";
import { mapShowcaseViewModel } from "@/lib/showcase/showcase-mapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShowcasePage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const saved = loadProjectPack(projectId);

  if (!saved) {
    notFound();
  }

  const latestAgentRun = getLatestAgentRunSafely(projectId);
  const latestAgentRunDetail = latestAgentRun
    ? getAgentRunDetailSafely(latestAgentRun.id)
    : null;
  const reviewData = getReviewDataSafely(projectId);
  const showcase = mapShowcaseViewModel({
    project: saved.project,
    productionPack: saved.productionPack,
    reviewData,
    latestAgentRun,
    latestAgentRunDetail
  });

  return (
    <main className="content-stack">
      {saved.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        eyebrow="Batch 09 / Showcase"
        title="视频号生产包成品展示"
        description="面向外部演示、录屏和讲解的成品展示页。当前展示 ProductionPack 文本生产包，不是最终成片视频。"
      />
      <ProjectNav projectId={projectId} />
      <ProjectShowcaseView showcase={showcase} />
    </main>
  );
}

function getLatestAgentRunSafely(projectId: string) {
  try {
    return getLatestAgentRunForProject(projectId);
  } catch {
    return null;
  }
}

function getAgentRunDetailSafely(runId: string) {
  try {
    return getAgentRunDetail(runId);
  } catch {
    return null;
  }
}

function getReviewDataSafely(projectId: string) {
  try {
    return getReviewData(projectId);
  } catch {
    return null;
  }
}
