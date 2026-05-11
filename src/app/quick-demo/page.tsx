import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { QuickDemoForm } from "@/components/quick-demo-form";

export default function QuickDemoPage() {
  return (
    <main className="content-stack">
      <PageHeader
        eyebrow="Batch 10A / Title-only Fast Demo"
        title="Title-only Demo"
        description="只输入标题即可快速生成一套 AI 视频号生产包，并直接进入 Showcase。该入口用于外部展示，不适合正式发布。"
        actions={
          <div className="action-row">
            <Link className="ghost-button" href="/dashboard">
              Dashboard
            </Link>
            <Link className="ghost-button" href="/articles/new">
              完整文章输入
            </Link>
          </div>
        }
      />

      <section className="panel">
        <h2>使用边界</h2>
        <ul className="info-list">
          <li>适合快速展示 AI Agent 从选题到生产包的工作流。</li>
          <li>不代表真实事实，不适合直接进入正式发布。</li>
          <li>正式生产仍应输入完整文章正文，并完成事实核验、版权复核和人工审阅。</li>
          <li>本入口不生成图片、视频、音频，不自动下载素材，不自动发布视频号。</li>
        </ul>
      </section>

      <QuickDemoForm />
    </main>
  );
}
