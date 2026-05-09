import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { dashboardMetrics, navigationItems } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="content-stack">
      <PageHeader
        title="Batch 01 后台 UI Shell"
        description="本批只建立内部后台的静态导航和页面骨架，不接 AI、数据库、真实素材、导出生成或自动发布。"
        actions={
          <Link className="primary-link" href="/dashboard">
            进入 Dashboard
          </Link>
        }
      />

      <section className="metric-grid" aria-label="Batch 01 概览指标">
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
