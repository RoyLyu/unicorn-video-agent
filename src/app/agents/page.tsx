import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listRecentAgentRunsByAgent } from "@/db/repositories/agent-run-repository";
import { agentDefinitions } from "@/lib/agents/agent-definitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AgentsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        eyebrow="Batch 07 / Agent Management"
        title="Agent 管理"
        description="展示 mock Agent 注册表、职责、模式和最近运行状态。当前不接真实 AI API。"
      />
      <section className="panel">
        <DataTable
          caption="Agent registry"
          rows={agentDefinitions.map((agent) => ({
            ...agent,
            latestRun: getLatestRunStatusSafely(agent.slug)
          }))}
          columns={[
            {
              key: "name",
              header: "Agent",
              render: (row) => <Link href={`/agents/${row.slug}`}>{row.name}</Link>
            },
            { key: "role", header: "职责", render: (row) => row.role },
            {
              key: "mode",
              header: "状态",
              render: () => (
                <>
                  <StatusBadge tone="green">Mock Ready</StatusBadge>{" "}
                  <StatusBadge tone="placeholder">Real AI Pending</StatusBadge>
                </>
              )
            },
            {
              key: "latest",
              header: "最近运行",
              render: (row) => row.latestRun ?? "no runs"
            }
          ]}
        />
      </section>
    </main>
  );
}

function getLatestRunStatusSafely(agentSlug: string) {
  try {
    return listRecentAgentRunsByAgent(agentSlug, 1)[0]?.status ?? null;
  } catch {
    return null;
  }
}
