import { PageHeader } from "@/components/page-header";
import { ProductionPackScriptsView } from "@/components/production-pack-scripts-view";

export default function ScriptsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="视频号脚本"
        description="读取 ProductionPack，展示 90s 与 180s 两套 mock 脚本。"
      />
      <ProductionPackScriptsView />
    </main>
  );
}
