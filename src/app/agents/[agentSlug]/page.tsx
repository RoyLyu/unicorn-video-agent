import { notFound } from "next/navigation";
import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listRecentAgentRunsByAgent } from "@/db/repositories/agent-run-repository";
import { agentDefinitionBySlug } from "@/lib/agents/agent-definitions";
import type { AgentSlug } from "@/lib/agents/agent-run-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params
}: {
  params: Promise<{ agentSlug: string }>;
}) {
  const { agentSlug } = await params;
  const agent = agentDefinitionBySlug.get(agentSlug as AgentSlug);

  if (!agent) {
    notFound();
  }

  const runs = getRecentRunsSafely(agent.slug);

  return (
    <main className="content-stack">
      <PageHeader
        eyebrow="Batch 07 / Agent Management"
        title={agent.name}
        description={agent.description}
        actions={
          <Link className="ghost-button" href="/agents">
            返回 Agents
          </Link>
        }
      />
      <section className="card-grid">
        <div className="panel">
          <h2>Agent 职责</h2>
          <p>{agent.role}</p>
          <p>{agent.description}</p>
          <StatusBadge tone="green">Mock Ready</StatusBadge>{" "}
          <StatusBadge tone="placeholder">Real AI Pending</StatusBadge>
        </div>
        <div className="panel">
          <h2>需要的上下文</h2>
          <ul className="info-list">
            {agent.requiredContext.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
      <section className="card-grid">
        <div className="panel">
          <h2>输入 Schema 摘要</h2>
          <p>{agent.inputSchemaSummary}</p>
        </div>
        <div className="panel">
          <h2>输出 Schema 摘要</h2>
          <p>{agent.outputSchemaSummary}</p>
        </div>
      </section>
      <section className="panel">
        <h2>QA Checklist</h2>
        <ul className="info-list">
          {agent.qaChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="panel">
        <DataTable
          caption="Recent agent runs"
          rows={runs}
          columns={[
            {
              key: "run",
              header: "Run",
              render: (row) =>
                row.projectId ? (
                  <Link href={`/projects/${row.projectId}/agent-runs/${row.id}`}>
                    {row.id}
                  </Link>
                ) : (
                  row.id
                )
            },
            { key: "article", header: "项目", render: (row) => row.articleTitle },
            { key: "status", header: "状态", render: (row) => row.status },
            { key: "started", header: "开始时间", render: (row) => row.startedAt }
          ]}
        />
      </section>
    </main>
  );
}

function getRecentRunsSafely(agentSlug: string) {
  try {
    return listRecentAgentRunsByAgent(agentSlug, 10);
  } catch {
    return [];
  }
}
