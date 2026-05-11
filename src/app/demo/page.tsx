import Link from "next/link";

import { DemoModeBanner } from "@/components/demo-mode-banner";
import { DemoResetButton } from "@/components/demo-reset-button";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { listDemoProjects } from "@/db/repositories/project-repository";
import { publicDemoProjectCards } from "@/lib/demo-public/public-demo-projects";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PublicDemoPage() {
  const demoProjects = getDemoProjectsSafely();

  return (
    <main className="content-stack">
      <DemoModeBanner />
      <PageHeader
        eyebrow="Batch 06 / Public Demo"
        title="独角兽早知道 Video Agent Demo"
        description="将公众号财经文章转化为视频号生产包：文章输入、mock pipeline、人工审阅和文本导出。公开 demo 仅展示本地模拟数据。"
        actions={
          <div className="action-row">
            <Link className="primary-link" href="/dashboard">
              进入后台 Dashboard
            </Link>
            <Link className="ghost-button" href="/articles/new">
              创建新 Mock 项目
            </Link>
            <Link className="ghost-button" href="/quick-demo">
              Quick Demo
            </Link>
          </div>
        }
      />

      <section className="panel">
        <h2>产品流程</h2>
        <div className="flow-grid">
          {["文章输入", "mock pipeline", "review", "export"].map((step) => (
            <div className="flow-step" key={step}>
              {step}
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>公开安全样例</h2>
          <DemoResetButton />
        </div>
        <div className="card-grid">
          {publicDemoProjectCards.map((card, index) => {
            const project = demoProjects[index];

            return (
              <article className="route-card" key={card.title}>
                <StatusBadge tone="placeholder">Demo Data</StatusBadge>
                <strong>{card.title}</strong>
                <p>{card.description}</p>
                <p>{card.tags.join(" / ")}</p>
                {project ? (
                  <div className="action-row">
                    <Link href={`/projects/${project.id}/analysis`}>Analysis</Link>
                    <Link href={`/projects/${project.id}/review`}>Review</Link>
                    <Link href={`/projects/${project.id}/export`}>Export</Link>
                  </div>
                ) : (
                  <p>尚未 seed，请先重置 Demo 数据。</p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>当前能力</h2>
        <ul className="info-list">
          <li>本地 mock pipeline 生成 ProductionPack，并写入 SQLite。</li>
          <li>Title-only Demo 可从一个标题快速进入 AI Agent 生产包 Showcase。</li>
          <li>支持 Review checklist、事实核验、版权复核摘要和发布文案编辑。</li>
          <li>支持 Markdown / CSV / JSON 文本预览、复制和下载。</li>
        </ul>
      </section>

      <section className="panel">
        <h2>当前限制</h2>
        <ul className="info-list">
          <li>公开 demo 不调用真实 AI，不代表真实投研或公司分析。</li>
          <li>不抓取文章、不下载素材、不生成图片、视频或音频。</li>
          <li>不自动发布视频号，不做云部署、登录或权限。</li>
        </ul>
      </section>
    </main>
  );
}

function getDemoProjectsSafely() {
  try {
    return listDemoProjects(2);
  } catch {
    return [];
  }
}
