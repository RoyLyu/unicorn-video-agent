import { PageHeader } from "@/components/page-header";
import { ProductionPackAnalysisView } from "@/components/production-pack-analysis-view";

export default function AnalysisPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="分析结果"
        description="读取 ProductionPack，展示 analysis 与 thesis。无本地数据时使用 demo fallback。"
      />
      <ProductionPackAnalysisView />
    </main>
  );
}
