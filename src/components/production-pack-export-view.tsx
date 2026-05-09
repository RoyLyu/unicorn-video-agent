"use client";

import { useState } from "react";

import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import type { ProductionPack } from "@/lib/schemas/production-pack";
import { DataTable } from "./data-table";
import { ProductionPackStatus } from "./production-pack-status";
import { StatusBadge } from "./status-badge";

export function ProductionPackExportView() {
  const [pack] = useState<ProductionPack>(() => loadProductionPack());

  return (
    <>
      <ProductionPackStatus />
      <section className="panel">
        <DataTable
          caption="ProductionPack export manifest - planned only"
          rows={pack.exportManifest.files}
          columns={[
            { key: "filename", header: "文件名", render: (row) => row.filename },
            { key: "format", header: "格式", render: (row) => row.format },
            { key: "purpose", header: "用途", render: (row) => row.purpose },
            {
              key: "status",
              header: "状态",
              render: (row) => (
                <StatusBadge tone="placeholder">{row.status}</StatusBadge>
              )
            },
            {
              key: "generated",
              header: "已生成",
              render: (row) => (row.generated ? "是" : "否")
            }
          ]}
        />
      </section>
      <section className="panel">
        <h2>导出边界</h2>
        <p>Batch 02 只返回 JSON manifest，不创建、不下载、不写入真实文件。</p>
      </section>
    </>
  );
}
