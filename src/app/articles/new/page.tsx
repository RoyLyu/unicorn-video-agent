import { ArticleInputForm } from "@/components/article-input-form";
import { PageHeader } from "@/components/page-header";

export default function NewArticlePage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="新建文章"
        description="输入文章信息并调用本地 mock pipeline 生成 ProductionPack。当前不接真实 AI，不抓取公众号全文。"
      />
      <ArticleInputForm />
    </main>
  );
}
