import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { storyboardShots } from "@/lib/demo-data";

export default function ShotsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="分镜表"
        description="静态分镜表用于确认剪辑协作页面结构，不包含真实视频素材或自动成片能力。"
      />

      <section className="panel">
        <DataTable
          caption="Batch 01 假分镜表"
          rows={storyboardShots}
          columns={[
            { key: "id", header: "镜号", render: (row) => row.id },
            { key: "timeRange", header: "时间", render: (row) => row.timeRange },
            { key: "scene", header: "场景", render: (row) => row.scene },
            { key: "visual", header: "画面", render: (row) => row.visual },
            { key: "asset", header: "素材", render: (row) => row.asset },
            {
              key: "rights",
              header: "版权状态",
              render: (row) => <StatusBadge tone="placeholder">{row.rights}</StatusBadge>
            }
          ]}
        />
      </section>
    </main>
  );
}
