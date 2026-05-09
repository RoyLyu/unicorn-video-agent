import { PageHeader } from "@/components/page-header";
import { ProductionPackRightsView } from "@/components/production-pack-rights-view";

export default function RightsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="版权风险"
        description="读取 ProductionPack rightsChecks，展示 green / yellow / red / placeholder 四级版权风险。"
      />
      <ProductionPackRightsView />
    </main>
  );
}
