import { PageHeader } from "@/components/page-header";
import { ProductionPackExportView } from "@/components/production-pack-export-view";

export default function ExportPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="导出清单"
        description="读取 ProductionPack exportManifest。Batch 02 只展示计划，不生成 Markdown、CSV 或 JSON 文件。"
      />
      <ProductionPackExportView />
    </main>
  );
}
