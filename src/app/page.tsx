import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { dashboardMetrics, navigationItems } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="content-stack">
      <PageHeader
        eyebrow="Batch 08 / Real AI Pipeline"
        title="Real AI Production Pack Pipeline"
        description="本批新增真实 AI 文本生产包生成路径，保留 mock fallback，并继续记录 Agent Run、上下文快照和 QA summary。"
        actions={
          <div className="action-row">
            <Link className="primary-link" href="/agents">
              打开 Agents
            </Link>
            <Link className="ghost-button" href="/dashboard">
              进入 Dashboard
            </Link>
          </div>
        }
      />

      <section className="metric-grid" aria-label="Batch 08 概览指标">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="panel">
        <h2>页面导航</h2>
        <div className="route-grid">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href} className="route-card">
              <strong>{item.label}</strong>
              <span>{item.href}</span>
              <p>{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
