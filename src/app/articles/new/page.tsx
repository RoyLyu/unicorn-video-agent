import { ArticleInputForm } from "@/components/article-input-form";
import { PageHeader } from "@/components/page-header";
import { readDefaultGenerationMode } from "@/lib/ai/ai-config";

export default function NewArticlePage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="新建文章"
        description="输入文章信息，可选择 Mock 或 AI Agent 生成 ProductionPack。当前不抓取公众号全文。"
      />
      <ArticleInputForm defaultGenerationMode={readDefaultGenerationMode()} />
    </main>
  );
}
