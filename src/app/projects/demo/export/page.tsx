import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { exportFiles } from "@/lib/demo-data";

export default function ExportPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="导出清单"
        description="展示未来会导出的文件类型。Batch 01 只展示计划，不生成 Markdown、CSV 或 JSON 文件。"
      />

      <section className="panel">
        <DataTable
          caption="未来导出文件清单"
          rows={[...exportFiles]}
          columns={[
            { key: "filename", header: "文件名", render: (row) => row.filename },
            { key: "format", header: "格式", render: (row) => row.format },
            { key: "purpose", header: "用途", render: (row) => row.purpose },
            {
              key: "status",
              header: "状态",
              render: (row) => <StatusBadge tone="placeholder">{row.status}</StatusBadge>
            },
            {
              key: "generated",
              header: "已生成",
              render: (row) => (row.generated ? "是" : "否")
            }
          ]}
        />
      </section>
    </main>
  );
}
