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
        eyebrow="Batch 07 / Agent Runs"
        title="Agent Runs"
        description="展示项目的 mock pipeline 运行记录。当前仅记录本地 deterministic agent 执行，不接真实 AI。"
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
                <StatusBadge tone={row.status === "completed" ? "green" : "red"}>
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
