import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { demoArticle } from "@/lib/demo-data";

export default function DemoArticlePage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="Demo 文章"
        description="示例文章用于 Batch 02 mock pipeline fallback，不代表真实新闻、真实公司或真实融资事件。"
        actions={
          <Link className="primary-link" href="/projects/demo/analysis">
            查看分析结果
          </Link>
        }
      />

      <section className="panel">
        <h2>{demoArticle.title}</h2>
        <ul className="info-list">
          <li>
            <strong>来源</strong>
            {demoArticle.source}
          </li>
          <li>
            <strong>发布日期</strong>
            {demoArticle.publishedAt}
          </li>
          <li>
            <strong>行业标签</strong>
            {demoArticle.tags.join(" / ")}
          </li>
          <li>
            <strong>目标时长</strong>
            {demoArticle.targetDuration}
          </li>
          <li>
            <strong>状态</strong>
            <StatusBadge>{demoArticle.status}</StatusBadge>
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>正文占位</h2>
        <p>{demoArticle.body}</p>
      </section>
    </main>
  );
}
