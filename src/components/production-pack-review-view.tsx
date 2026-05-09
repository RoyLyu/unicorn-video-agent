"use client";

import Link from "next/link";
import { useState } from "react";

import { FactCheckTable } from "./fact-check-table";
import { PublishCopyEditor } from "./publish-copy-editor";
import { ReviewChecklist } from "./review-checklist";
import { ReviewStatusCard } from "./review-status-card";
import { RightsRiskTable } from "./rights-risk-table";
import type { ReviewData } from "@/db/repositories/review-repository";

export function ProductionPackReviewView({
  initialReviewData,
  projectId
}: {
  initialReviewData: ReviewData;
  projectId: string;
}) {
  const [reviewData, setReviewData] = useState(initialReviewData);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setSaveStatus(null);

    const response = await fetch(`/api/projects/${projectId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checklist: reviewData.checklist,
        publishCopy: {
          coverTitle: reviewData.publishCopy.coverTitle,
          titleCandidates: reviewData.publishCopy.titleCandidates,
          publishText: reviewData.publishCopy.publishText,
          tags: reviewData.publishCopy.tags,
          riskNotice: reviewData.publishCopy.riskNotice
        },
        factChecks: reviewData.factChecks
      })
    });

    if (!response.ok) {
      setSaveStatus("保存失败，请检查字段。");
      setIsSaving(false);
      return;
    }

    setReviewData((await response.json()) as ReviewData);
    setSaveStatus("已保存审阅记录。");
    setIsSaving(false);
  }

  return (
    <>
      <ReviewStatusCard summary={reviewData.reviewSummary} />
      <ReviewChecklist
        checklist={reviewData.checklist}
        onChange={(checklist) => setReviewData({ ...reviewData, checklist })}
      />
      <FactCheckTable
        factChecks={reviewData.factChecks}
        onChange={(factChecks) => setReviewData({ ...reviewData, factChecks })}
      />
      <section className="panel">
        <h2>版权复核摘要</h2>
        <RightsRiskTable risks={reviewData.productionPack.rightsChecks} />
      </section>
      <PublishCopyEditor
        publishCopy={reviewData.publishCopy}
        onChange={(publishCopy) => setReviewData({ ...reviewData, publishCopy })}
      />
      <section className="panel">
        <div className="review-actions">
          <button className="primary-link" type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存审阅记录"}
          </button>
          <Link className="ghost-button" href={`/projects/${projectId}/export`}>
            跳转 Export
          </Link>
        </div>
        {saveStatus ? <p className="form-error">{saveStatus}</p> : null}
      </section>
    </>
  );
}
