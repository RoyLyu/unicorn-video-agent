import { notFound } from "next/navigation";
import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProjectNav } from "@/components/project-nav";
import { StatusBadge } from "@/components/status-badge";
import { listAgentRunsByProject } from "@/db/repositories/agent-run-repository";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProjectAgentRunsPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const saved = loadProjectPack(projectId);

  if (!saved) {
    notFound();
  }

  const runs = getRunsSafely(projectId);

  return (
    <main className="content-stack">
      {saved.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        eyebrow="Batch 08 / Agent Runs"
        title="Agent Runs"
        description="展示项目的 Mock / AI pipeline 运行记录、fallback 状态和错误信息。"
        actions={
          <div className="action-row">
            <Link className="primary-link" href={`/projects/${projectId}/production-studio`}>
              Production Studio
            </Link>
            <Link className="ghost-button" href={`/projects/${projectId}/showcase`}>
              Showcase
            </Link>
          </div>
        }
      />
      <ProjectNav projectId={projectId} />
      <section className="panel">
        <DataTable
          caption="Project agent runs"
          rows={runs}
          columns={[
            {
              key: "run",
              header: "Run",
              render: (row) => (
                <Link href={`/projects/${projectId}/agent-runs/${row.id}`}>
                  {row.id}
                </Link>
              )
            },
            {
              key: "status",
              header: "状态",
              render: (row) => (
                <StatusBadge tone={statusTone(row.status)}>
                  {row.status}
                </StatusBadge>
              )
            },
            { key: "started", header: "开始时间", render: (row) => row.startedAt },
            { key: "completed", header: "完成时间", render: (row) => row.completedAt ?? "-" },
            { key: "error", header: "错误", render: (row) => row.errorMessage ?? "-" }
          ]}
        />
      </section>
    </main>
  );
}

function getRunsSafely(projectId: string) {
  try {
    return listAgentRunsByProject(projectId);
  } catch {
    return [];
  }
}

function statusTone(status: string) {
  if (status === "completed") {
    return "green" as const;
  }

  if (status === "completed_with_fallback") {
    return "yellow" as const;
  }

  return "red" as const;
}
