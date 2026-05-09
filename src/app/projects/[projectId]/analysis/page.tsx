import { notFound } from "next/navigation";
import Link from "next/link";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProjectNav } from "@/components/project-nav";
import { ProductionPackAnalysisView } from "@/components/production-pack-analysis-view";
import { StatusBadge } from "@/components/status-badge";
import { getLatestAgentRunForProject } from "@/db/repositories/agent-run-repository";
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
  const latestRun = getLatestRunSafely(projectId);
  const generationLabel = getGenerationLabel(
    saved.productionPack.mode,
    latestRun?.status
  );

  return (
    <main className="content-stack">
      {saved.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        title="分析结果"
        description="从 SQLite 读取 ProductionPack，展示 analysis 与 thesis，并标记 AI / Mock / fallback 生成状态。"
        actions={
          <Link className="primary-link" href={`/projects/${projectId}/review`}>
            进入 Review
          </Link>
        }
      />
      <ProjectNav projectId={projectId} />
      <section className="panel">
        <h2>Generation Mode</h2>
        <div className="metadata-row">
          <StatusBadge tone={generationLabel.tone}>{generationLabel.label}</StatusBadge>
          <span>ProductionPack mode: {saved.productionPack.mode}</span>
          <span>Agent run: {latestRun?.status ?? "not_started"}</span>
        </div>
      </section>
      <ProductionPackAnalysisView productionPack={saved.productionPack} />
    </main>
  );
}

function getLatestRunSafely(projectId: string) {
  try {
    return getLatestAgentRunForProject(projectId);
  } catch {
    return null;
  }
}

function getGenerationLabel(
  mode: "mock" | "ai",
  status: "running" | "completed" | "completed_with_fallback" | "failed" | undefined
) {
  if (status === "completed_with_fallback") {
    return { label: "AI fallback to Mock", tone: "yellow" as const };
  }

  if (mode === "ai") {
    return { label: "AI Agent", tone: "green" as const };
  }

  return { label: "Mock", tone: "neutral" as const };
}
