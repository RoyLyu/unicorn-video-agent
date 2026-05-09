import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { rightsRisks, type RightsRiskLevel } from "@/lib/demo-data";

const toneByLevel: Record<
  RightsRiskLevel,
  "green" | "yellow" | "red" | "placeholder"
> = {
  Green: "green",
  Yellow: "yellow",
  Red: "red",
  Placeholder: "placeholder"
};

export default function RightsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="版权风险"
        description="展示 Green / Yellow / Red / Placeholder 四级版权风险假数据。Batch 01 不下载或嵌入任何网络素材。"
      />

      <section className="panel">
        <DataTable
          caption="版权风险表"
          rows={rightsRisks}
          columns={[
            { key: "item", header: "项目", render: (row) => row.item },
            {
              key: "level",
              header: "等级",
              render: (row) => (
                <StatusBadge tone={toneByLevel[row.level]}>{row.level}</StatusBadge>
              )
            },
            { key: "reason", header: "原因", render: (row) => row.reason },
            { key: "action", header: "处理方式", render: (row) => row.action }
          ]}
        />
      </section>
    </main>
  );
}
