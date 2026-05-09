"use client";

import { useState } from "react";

import {
  allowedExportFileNames,
  type ExportFileName
} from "@/lib/export/export-types";
import { generateExportFile } from "@/lib/export/generate-export-file";
import { loadProductionPack } from "@/lib/storage/production-pack-storage";
import type { ProductionPack } from "@/lib/schemas/production-pack";
import { DataTable } from "./data-table";
import { ProductionPackStatus } from "./production-pack-status";
import { ReviewStatusCard } from "./review-status-card";
import { StatusBadge } from "./status-badge";
import type { PublishCopyRecord } from "@/db/repositories/publish-copy-repository";
import type { ReviewSummary } from "@/db/repositories/review-repository";

export function ProductionPackExportView({
  productionPack,
  projectId,
  reviewSummary,
  publishCopy
}: {
  productionPack?: ProductionPack;
  projectId?: string;
  reviewSummary?: ReviewSummary;
  publishCopy?: PublishCopyRecord;
}) {
  const [pack] = useState<ProductionPack>(() => productionPack ?? loadProductionPack());
  const [selectedFileName, setSelectedFileName] =
    useState<ExportFileName>("production-pack.md");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const selectedFile = generateExportFile(selectedFileName, pack, {
    publishCopy: publishCopy?.isManual ? publishCopy : undefined
  });

  async function handleCopy() {
    if (!selectedFile) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopyStatus("已复制当前预览内容。");
    } catch {
      setCopyStatus("复制失败，请手动选择预览内容。");
    }
  }

  return (
    <>
      <ProductionPackStatus productionPack={pack} />
      {reviewSummary ? <ReviewStatusCard summary={reviewSummary} /> : null}
      <div className="notice">
        Batch 05 显示审阅状态但不强制禁止下载。若事实、版权或 checklist 未完成，发布前仍需人工复核。
      </div>
      <section className="panel">
        <DataTable
          caption="Batch 04 export files"
          rows={allowedExportFileNames.map((fileName) => {
            const manifest = pack.exportManifest.files.find(
              (file) => file.filename === fileName
            );

            return {
              filename: fileName,
              format: manifest?.format ?? formatForFile(fileName),
              purpose: manifest?.purpose ?? "Batch 04 文本导出",
              status: fileName === selectedFileName ? "selected" : "ready"
            };
          })}
          columns={[
            { key: "filename", header: "文件名", render: (row) => row.filename },
            { key: "format", header: "格式", render: (row) => row.format },
            { key: "purpose", header: "用途", render: (row) => row.purpose },
            {
              key: "status",
              header: "状态",
              render: (row) => (
                <StatusBadge tone={row.status === "selected" ? "green" : "placeholder"}>
                  {row.status}
                </StatusBadge>
              )
            },
            {
              key: "action",
              header: "操作",
              render: (row) => (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setSelectedFileName(row.filename)}
                >
                  预览
                </button>
              )
            }
          ]}
        />
      </section>

      <section className="panel">
        <div className="export-preview-header">
          <div>
            <h2>{selectedFileName}</h2>
            <p>{selectedFile?.contentType}</p>
          </div>
          <div className="export-actions">
            <button className="ghost-button" type="button" onClick={handleCopy}>
              复制预览
            </button>
            {projectId ? (
              <a
                className="primary-link"
                href={`/api/projects/${projectId}/exports/${selectedFileName}`}
              >
                下载当前文件
              </a>
            ) : (
              <button className="primary-link" type="button" disabled>
                Demo 不下载
              </button>
            )}
          </div>
        </div>
        {copyStatus ? <p className="form-error">{copyStatus}</p> : null}
        <pre className="export-preview">{selectedFile?.content}</pre>
      </section>
    </>
  );
}

function formatForFile(fileName: ExportFileName) {
  if (fileName.endsWith(".md")) {
    return "Markdown";
  }

  if (fileName.endsWith(".csv")) {
    return "CSV";
  }

  return "JSON";
}
