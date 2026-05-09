import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listRecentProjects, type RecentProject } from "@/db/repositories/project-repository";
import { getReviewData, type ReviewSummary } from "@/db/repositories/review-repository";
import { dashboardMetrics, exportFiles } from "@/lib/demo-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const projects = getProjectsSafely();

  return (
    <main className="content-stack">
      <PageHeader
        title="Dashboard"
        description="内部后台总览。当前展示 Batch 03 SQLite 本地持久化项目状态。"
        actions={
          <Link className="primary-link" href="/articles/new">
            新建文章
          </Link>
        }
      />

      <section className="metric-grid" aria-label="后台指标">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="panel">
        <h2>最近项目</h2>
        {projects.length > 0 ? (
          <ul className="info-list">
            {projects.map((project) => (
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
          caption="Batch 01 仅展示导出计划，不生成文件。"
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

function getProjectsSafely(): RecentProject[] {
  try {
    return listRecentProjects();
  } catch {
    return [];
  }
}

function ProjectListItem({ project }: { project: RecentProject }) {
  const reviewSummary = getReviewSummarySafely(project.id);

  return (
    <li>
      <strong>{project.title}</strong>
      <span>{project.sourceName}</span>
      <br />
      <StatusBadge>{project.status}</StatusBadge>{" "}
      <StatusBadge tone={reviewSummary?.status === "ready" ? "green" : "placeholder"}>
        review: {reviewSummary?.status ?? "not_started"}
      </StatusBadge>{" "}
      <Link href={`/projects/${project.id}/analysis`}>查看项目</Link>{" "}
      <Link href={`/projects/${project.id}/review`}>进入 Review</Link>
    </li>
  );
}

function getReviewSummarySafely(projectId: string): ReviewSummary | null {
  try {
    return getReviewData(projectId)?.reviewSummary ?? null;
  } catch {
    return null;
  }
}
