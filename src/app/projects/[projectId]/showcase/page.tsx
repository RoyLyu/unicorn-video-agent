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
import { readAiPolicy } from "@/lib/ai/ai-policy";
import { loadProjectPack } from "@/lib/server/project-pack";
import { getProductionStudioPayload } from "@/lib/server/production-studio-service";
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
  const productionStudioPayload = getProductionStudioPayload(projectId);
  const showcase = mapShowcaseViewModel({
    project: saved.project,
    productionPack: productionStudioPayload?.effectiveProductionPack ?? saved.productionPack,
    reviewData,
    latestAgentRun,
    latestAgentRunDetail,
    productionStudioState: productionStudioPayload
      ? {
          densityProfile: productionStudioPayload.densityProfile,
          edits: productionStudioPayload.edits,
          latestGateRun: productionStudioPayload.latestGateRun,
          lock: productionStudioPayload.lock
        }
      : undefined
  });
  const policy = readAiPolicy();

  if (policy.requireRealOutput && showcase.generation.fallbackUsed) {
    return (
      <main className="content-stack">
        {saved.project.isDemo ? <DemoModeBanner /> : null}
        <PageHeader
          eyebrow="Batch 12A / Strict Real Output"
          title="真实输出失败诊断"
          description="当前项目是 fallback/mock 结果，不能作为正式成品 Showcase。请重新生成真实 AI 版本或检查 AI 配置。"
        />
        <ProjectNav projectId={projectId} />
        <section className="panel">
          <h2>当前为 fallback/mock 结果，不可作为正式成品。</h2>
          <p>generationMode: {showcase.generation.generationModeLabel}</p>
          <p>projectStatus: {showcase.generation.projectStatus}</p>
          <p>Agent Run: {showcase.agentSummary.status}</p>
          <div className="action-row">
            <a className="primary-link" href="/articles/new">
              重新生成真实 AI 版本
            </a>
          </div>
        </section>
      </main>
    );
  }

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
