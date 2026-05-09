"use client";

import { useState } from "react";

import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import type { ProductionPack } from "@/lib/schemas/production-pack";
import { DataTable } from "./data-table";
import { ProductionPackStatus } from "./production-pack-status";

export function ProductionPackAnalysisView() {
  const [pack] = useState<ProductionPack>(() => loadProductionPack());

  return (
    <>
      <ProductionPackStatus />
      <section className="card-grid">
        <div className="panel">
          <h2>核心观点</h2>
          <ul className="info-list">
            {pack.thesis.coreTheses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h2>关键事实</h2>
          <ul className="info-list">
            {pack.analysis.keyFacts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <h2>分析摘要</h2>
        <p>{pack.analysis.summary}</p>
        <p>{pack.thesis.videoAngle}</p>
        <p>{pack.thesis.audienceTakeaway}</p>
      </section>

      <section className="panel">
        <h2>行业数据</h2>
        <DataTable
          caption="ProductionPack analysis industry data"
          rows={pack.analysis.industryData}
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
          {pack.analysis.risks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}
