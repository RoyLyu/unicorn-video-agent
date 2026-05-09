import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { analysis } from "@/lib/demo-data";

export default function AnalysisPage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="分析结果"
        description="展示核心观点、关键事实、行业数据和风险点。当前内容均为 Batch 01 假数据。"
      />

      <section className="card-grid">
        <div className="panel">
          <h2>核心观点</h2>
          <ul className="info-list">
            {analysis.viewpoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h2>关键事实</h2>
          <ul className="info-list">
            {analysis.facts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <h2>行业数据</h2>
        <DataTable
          caption="虚构行业数据，用于展示未来分析结果页面。"
          rows={analysis.industryData}
          columns={[
            { key: "metric", header: "指标", render: (row) => row.metric },
            { key: "value", header: "值", render: (row) => row.value },
            { key: "note", header: "说明", render: (row) => row.note }
          ]}
        />
      </section>

      <section className="panel">
        <h2>风险点</h2>
        <ul className="info-list">
          {analysis.risks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
