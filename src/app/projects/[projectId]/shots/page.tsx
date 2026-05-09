import { notFound } from "next/navigation";
import Link from "next/link";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { PageHeader } from "@/components/page-header";
import { ProductionPackStoryboardView } from "@/components/production-pack-storyboard-view";
import { loadProjectPack } from "@/lib/server/project-pack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ShotsPage({
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
        title="分镜表"
        description="从 SQLite 读取 ProductionPack storyboard；不包含真实视频素材或自动成片能力。"
        actions={
          <Link className="primary-link" href={`/projects/${projectId}/review`}>
            进入 Review
          </Link>
        }
      />
      <ProductionPackStoryboardView productionPack={saved.productionPack} />
    </main>
  );
}
