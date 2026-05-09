import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ProductionPackRightsView } from "@/components/production-pack-rights-view";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function RightsPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const saved = loadProjectPack(projectId);

  if (!saved) {
    notFound();
  }

  return (
    <main className="content-stack">
      <PageHeader
        title="版权风险"
        description="从 SQLite 读取 rightsChecks，展示 green / yellow / red / placeholder 四级版权风险。"
      />
      <ProductionPackRightsView productionPack={saved.productionPack} />
    </main>
  );
}
