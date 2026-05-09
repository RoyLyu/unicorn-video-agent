import Link from "next/link";

import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { dashboardMetrics, navigationItems } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="content-stack">
      <PageHeader
        eyebrow="Batch 06 / Public Demo"
        title="Public Demo Hardening"
        description="本批把内部 MVP 打磨成可外部受控展示的本地 Demo：公开安全样例、Demo Mode、重置入口、审阅状态和文本导出。"
        actions={
          <div className="action-row">
            <Link className="primary-link" href="/demo">
              打开 Public Demo
            </Link>
            <Link className="ghost-button" href="/dashboard">
              进入 Dashboard
            </Link>
          </div>
        }
      />

      <section className="metric-grid" aria-label="Batch 06 概览指标">
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
