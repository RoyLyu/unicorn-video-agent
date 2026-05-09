import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { dashboardMetrics, navigationItems } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="content-stack">
      <PageHeader
        title="Batch 02 本地 Mock 生产包流程"
        description="本批实现文章输入到本地 mock ProductionPack 的闭环，不接 AI、数据库、真实素材、真实导出或自动发布。"
        actions={
          <Link className="primary-link" href="/dashboard">
            进入 Dashboard
          </Link>
        }
      />

      <section className="metric-grid" aria-label="Batch 02 概览指标">
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
