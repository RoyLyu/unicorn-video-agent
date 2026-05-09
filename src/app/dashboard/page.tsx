import Link from "next/link";

import { DataTable } from "@/components/data-table";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { dashboardMetrics, demoArticle, exportFiles } from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="Dashboard"
        description="内部后台总览。当前展示均为 Batch 01 静态占位数据，用于确认导航结构和页面信息架构。"
        actions={
          <Link className="primary-link" href="/articles/new">
            新建文章
          </Link>
        }
      />

      <section className="metric-grid" aria-label="后台指标">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="panel">
        <h2>最近 Demo 项目</h2>
        <ul className="info-list">
          <li>
            <strong>{demoArticle.title}</strong>
            <span>{demoArticle.source}</span>
            <br />
            <StatusBadge>{demoArticle.status}</StatusBadge>
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2>未来导出文件</h2>
        <DataTable
          caption="Batch 01 仅展示导出计划，不生成文件。"
          rows={[...exportFiles]}
          columns={[
            { key: "filename", header: "文件名", render: (row) => row.filename },
            { key: "format", header: "格式", render: (row) => row.format },
            { key: "purpose", header: "用途", render: (row) => row.purpose },
            { key: "status", header: "状态", render: (row) => row.status }
          ]}
        />
      </section>
    </main>
  );
}
