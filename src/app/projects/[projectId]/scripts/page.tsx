import { notFound } from "next/navigation";
import Link from "next/link";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProjectNav } from "@/components/project-nav";
import { ProductionPackScriptsView } from "@/components/production-pack-scripts-view";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ScriptsPage({
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
      {saved.project.isDemo ? <DemoModeBanner /> : null}
      <PageHeader
        title="视频号脚本"
        description="从 SQLite 读取 ProductionPack，展示 90s 与 180s 两套 mock 脚本。"
        actions={
          <Link className="primary-link" href={`/projects/${projectId}/review`}>
            进入 Review
          </Link>
        }
      />
      <ProjectNav projectId={projectId} />
      <ProductionPackScriptsView productionPack={saved.productionPack} />
    </main>
  );
}
