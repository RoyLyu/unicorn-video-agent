import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { FinalDemoPath } from "@/components/final-demo-path";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  getLatestAgentRunForProject,
  type AgentRunSummary
} from "@/db/repositories/agent-run-repository";
import {
  listDemoProjects,
  listRecentProjects
} from "@/db/repositories/project-repository";
import { getReviewData, type ReviewSummary } from "@/db/repositories/review-repository";
import { attachLatestAgentRunStatus, type ProjectWithAgentRun } from "@/lib/agents/dashboard-agent-runs";
import { splitDashboardProjects } from "@/lib/demo-public/dashboard-projects";
import { dashboardMetrics, exportFiles } from "@/lib/demo-data";
import { getProductionStudioPayload } from "@/lib/server/production-studio-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { demoProjects, recentProjects } = getDashboardProjectsSafely();

  return (
    <main className="content-stack">
      <PageHeader
        title="Dashboard"
        description="内部后台总览。当前展示 Batch 06 Demo 项目、普通项目、审阅完成度和导出状态。"
        actions={
          <div className="action-row">
            <Link className="primary-link" href="/articles/new">
              新建文章
            </Link>
            <Link className="ghost-button" href="/quick-demo">
              Quick Demo
            </Link>
            <Link className="ghost-button" href="/demo">
              Public Demo
            </Link>
            <Link className="ghost-button" href="/agents">
              Agents
            </Link>
          </div>
        }
      />

      <section className="metric-grid" aria-label="后台指标">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <FinalDemoPath />

      <section className="panel">
        <h2>公开 Demo 项目</h2>
        <DemoModeBanner />
        {demoProjects.length > 0 ? (
          <ul className="info-list">
            {demoProjects.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>当前没有公开 demo 项目。请从 `/demo` 重置公开演示数据。</p>
            <Link className="primary-link" href="/demo">
              打开 Public Demo
            </Link>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>最近项目</h2>
        {recentProjects.length > 0 ? (
          <ul className="info-list">
            {recentProjects.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>SQLite 当前没有项目。请先运行迁移，然后创建第一篇文章。</p>
            <Link className="primary-link" href="/articles/new">
              创建第一篇文章
            </Link>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>未来导出文件</h2>
        <DataTable
          caption="Batch 06 展示文本导出清单，不生成真实媒体文件。"
          rows={[...exportFiles]}
          columns={[
            { key: "filename", header: "文件名", render: (row) => row.filename },
            { key: "format", header: "格式", render: (row) => row.format },
            { key: "purpose", header: "用途", render: (row) => row.purpose },
            { key: "status", header: "状态", render: (row) => row.status }
          ]}
        />
      </section>
    </main>
  );
}

function getDashboardProjectsSafely(): {
  demoProjects: ProjectWithAgentRun[];
  recentProjects: ProjectWithAgentRun[];
} {
  try {
    const split = splitDashboardProjects(
      listDemoProjects(10),
      listRecentProjects(10, { includeDemo: false })
    );

    return {
      demoProjects: attachLatestAgentRunStatus(
        split.demoProjects,
        getLatestAgentRunSafely
      ),
      recentProjects: attachLatestAgentRunStatus(
        split.recentProjects,
        getLatestAgentRunSafely
      )
    };
  } catch {
    return { demoProjects: [], recentProjects: [] };
  }
}

function ProjectListItem({ project }: { project: ProjectWithAgentRun }) {
  const reviewSummary = getReviewSummarySafely(project.id);
  const studio = getProductionStudioSafely(project.id);

  return (
    <li>
      <strong>{project.title}</strong>
      <span>{project.sourceName}</span>
      <br />
      <StatusBadge>{project.status}</StatusBadge>{" "}
      {project.isDemo ? <StatusBadge tone="placeholder">Demo Mode</StatusBadge> : null}{" "}
      <StatusBadge tone={reviewSummary?.status === "ready" ? "green" : "placeholder"}>
        review: {reviewSummary?.status ?? "not_started"}
      </StatusBadge>{" "}
      <StatusBadge tone="green">
        checklist: {Math.round((reviewSummary?.checklistCompletion ?? 0) * 100)}%
      </StatusBadge>{" "}
      <StatusBadge tone="green">export: ready</StatusBadge>{" "}
      <StatusBadge tone={agentRunTone(project.latestAgentRun?.status)}>
        agent: {project.latestAgentRun?.status ?? "not_started"}
      </StatusBadge>{" "}
      <StatusBadge tone={studio?.summary.needsFix ? "red" : "green"}>
        studio: {studio?.latestGateRun?.status ?? "not_run"}
      </StatusBadge>{" "}
      <StatusBadge tone={studio?.lock?.locked ? "green" : "placeholder"}>
        lock: {studio?.lock?.locked ? "locked" : "unlocked"}
      </StatusBadge>{" "}
      <StatusBadge tone="placeholder">
        density: {studio?.densityProfile ?? "standard"}
      </StatusBadge>{" "}
      <div className="action-row">
        <Link href={`/projects/${project.id}/showcase`}>Showcase</Link>
        <Link href={`/projects/${project.id}/production-studio`}>Production Studio</Link>
        <Link href={`/projects/${project.id}/analysis`}>Analysis</Link>
        <Link href={`/projects/${project.id}/agent-runs`}>Agent Runs</Link>
        <Link href={`/projects/${project.id}/review`}>Review</Link>
        <Link href={`/projects/${project.id}/export`}>Export</Link>
      </div>
    </li>
  );
}

function getProductionStudioSafely(projectId: string) {
  try {
    return getProductionStudioPayload(projectId);
  } catch {
    return null;
  }
}

function getLatestAgentRunSafely(projectId: string): AgentRunSummary | null {
  try {
    return getLatestAgentRunForProject(projectId);
  } catch {
    return null;
  }
}

function agentRunTone(status: AgentRunSummary["status"] | undefined) {
  if (status === "completed") {
    return "green" as const;
  }

  if (status === "completed_with_fallback") {
    return "yellow" as const;
  }

  if (status === "failed") {
    return "red" as const;
  }

  return "placeholder" as const;
}

function getReviewSummarySafely(projectId: string): ReviewSummary | null {
  try {
    return getReviewData(projectId)?.reviewSummary ?? null;
  } catch {
    return null;
  }
}
