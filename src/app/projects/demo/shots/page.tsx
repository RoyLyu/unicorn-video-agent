import { PageHeader } from "@/components/page-header";
import { ProductionPackStoryboardView } from "@/components/production-pack-storyboard-view";

export default function ShotsPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="分镜表"
        description="读取 ProductionPack storyboard，不包含真实视频素材或自动成片能力。"
      />
      <ProductionPackStoryboardView />
    </main>
  );
}
