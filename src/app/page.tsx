import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { dashboardMetrics, navigationItems } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="content-stack">
      <PageHeader
        title="Batch 05 审阅工作流"
        description="本批在本地 SQLite 与文本导出基础上增加导出前 checklist、事实核验、版权复核和发布文案编辑；不接 AI、云数据库、真实素材或自动发布。"
        actions={
          <Link className="primary-link" href="/dashboard">
            进入 Dashboard
          </Link>
        }
      />

      <section className="metric-grid" aria-label="Batch 05 概览指标">
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
