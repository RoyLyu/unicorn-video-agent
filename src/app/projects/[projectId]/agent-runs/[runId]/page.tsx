import { notFound } from "next/navigation";
import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProjectNav } from "@/components/project-nav";
import { StatusBadge } from "@/components/status-badge";
import { getAgentRunDetail } from "@/db/repositories/agent-run-repository";
import { getQaResultByRunId } from "@/db/repositories/qa-result-repository";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AgentRunDetailPage({
  params
}: {
  params: Promise<{ projectId: string; runId: string }>;
}) {
  const { projectId, runId } = await params;
  const saved = loadProjectPack(projectId);
  const detail = getRunDetailSafely(runId);

  if (!saved || !detail || detail.run.projectId !== projectId) {
    notFound();
  }

  const qaResult = getQaResultSafely(runId);

  return (
    <main className="content-stack">
      {saved.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        eyebrow="Batch 08 / Agent Run Detail"
        title="Agent Run Detail"
        description="逐步展示 pipeline step、input/output 摘要、context snapshot 和错误信息。"
        actions={
          <Link className="ghost-button" href={`/projects/${projectId}/agent-runs`}>
            返回 Agent Runs
          </Link>
        }
      />
      <ProjectNav projectId={projectId} />
      <section className="panel">
        <h2>Run Summary</h2>
        <p>{detail.run.id}</p>
        <StatusBadge tone={statusTone(detail.run.status)}>
          {detail.run.status}
        </StatusBadge>
        {detail.run.errorMessage ? <p>{detail.run.errorMessage}</p> : null}
      </section>
      <section className="panel">
        <DataTable
          caption="Agent run steps"
          rows={detail.steps}
          columns={[
            { key: "order", header: "#", render: (row) => row.stepOrder },
            {
              key: "agent",
              header: "Agent",
              render: (row) => <Link href={`/agents/${row.agentSlug}`}>{row.agentSlug}</Link>
            },
            {
              key: "status",
              header: "状态",
              render: (row) => (
                <StatusBadge tone={statusTone(row.status)}>{row.status}</StatusBadge>
              )
            },
            { key: "input", header: "Input 摘要", render: (row) => row.inputSummary },
            { key: "output", header: "Output 摘要", render: (row) => row.outputSummary },
            {
              key: "context",
              header: "Context Snapshot",
              render: (row) =>
                detail.contextSnapshots.find((snapshot) => snapshot.stepId === row.id)
                  ?.summary ?? "-"
            },
            { key: "error", header: "Error", render: (row) => row.errorMessage ?? "-" }
          ]}
        />
      </section>
      {qaResult ? (
        <section className="panel">
          <h2>QA Result</h2>
          <pre className="json-preview">{JSON.stringify(qaResult.summary, null, 2)}</pre>
        </section>
      ) : null}
    </main>
  );
}

function getRunDetailSafely(runId: string) {
  try {
    return getAgentRunDetail(runId);
  } catch {
    return null;
  }
}

function getQaResultSafely(runId: string) {
  try {
    return getQaResultByRunId(runId);
  } catch {
    return null;
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
