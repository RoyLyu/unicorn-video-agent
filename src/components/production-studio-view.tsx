"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusBadge } from "./status-badge";
import type { getProductionStudioPayload } from "@/lib/server/production-studio-service";
import type { ProductionStudioViewModel, ProductionStudioRow } from "@/lib/production-studio/production-studio-mapper";
import type { ShotDensityProfile } from "@/lib/production-studio/density-profile";
import type { ProductionStudioEditInput } from "@/lib/production-studio/production-studio-schemas";

type ProductionStudioPayload = NonNullable<ReturnType<typeof getProductionStudioPayload>>;

export function ProductionStudioView({
  initialPayload
}: {
  initialPayload: ProductionStudioPayload;
}) {
  const [payload, setPayload] = useState(initialPayload);
  const [profile, setProfile] = useState<ShotDensityProfile>(initialPayload.densityProfile);
  const [rows, setRows] = useState(initialPayload.studio.rows);
  const [status, setStatus] = useState("saved");
  const changedEdits = useMemo(
    () => buildEdits(initialPayload.studio.rows, rows),
    [initialPayload.studio.rows, rows]
  );
  const studio = payload.studio;

  async function saveEdits() {
    if (changedEdits.length === 0) {
      setStatus("saved");
      return;
    }

    setStatus("saving");
    const response = await fetch(`/api/projects/${studio.projectId}/production-studio/edits`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edits: changedEdits, densityProfile: profile })
    });

    if (!response.ok) {
      setStatus("save_failed");
      return;
    }

    const nextPayload = await response.json() as ProductionStudioPayload;
    setPayload(nextPayload);
    setRows(nextPayload.studio.rows);
    setStatus("saved");
  }

  async function revalidateGate() {
    setStatus("revalidating");
    const response = await fetch(`/api/projects/${studio.projectId}/production-studio/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ densityProfile: profile })
    });

    if (!response.ok) {
      setStatus("revalidate_failed");
      return;
    }

    const nextPayload = await response.json() as ProductionStudioPayload;
    setPayload(nextPayload);
    setRows(nextPayload.studio.rows);
    setStatus("saved");
  }

  async function setLock(locked: boolean) {
    setStatus(locked ? "locking" : "unlocking");
    const response = await fetch(
      `/api/projects/${studio.projectId}/production-studio/${locked ? "lock" : "unlock"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lockNote: "Production Studio gate pass 后锁定。" })
      }
    );

    if (!response.ok) {
      setStatus(locked ? "lock_failed" : "unlock_failed");
      return;
    }

    const nextPayload = await response.json() as ProductionStudioPayload;
    setPayload(nextPayload);
    setRows(nextPayload.studio.rows);
    setStatus("saved");
  }

  return (
    <div className="content-stack">
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Shot / Prompt Gate</h2>
            <p>{studio.gateLabel}</p>
          </div>
          <StatusBadge tone={studio.summary.needsFix ? "red" : "green"}>
            {studio.summary.needsFix ? "需要修正" : "pass"}
          </StatusBadge>
        </div>
        <div className="form-grid">
          <label>
            Density Profile
            <select value={profile} onChange={(event) => setProfile(event.target.value as ShotDensityProfile)}>
              {payload.profileOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <p>
            当前状态：{status} / edited fields: {payload.editedCount + changedEdits.length} / lock:{" "}
            {payload.lock?.locked ? "已锁定交付版本" : "未锁版，建议先完成 Production Studio 校验"}
          </p>
        </div>
        <div className="metric-grid">
          <Metric label="90s shots" value={studio.summary.shotCount90s} />
          <Metric label="180s shots" value={studio.summary.shotCount180s} />
          <Metric label="90s prompts" value={studio.summary.promptCount90s} />
          <Metric label="180s prompts" value={studio.summary.promptCount180s} />
        </div>
        {studio.summary.fixReasons.length ? (
          <div className="showcase-warning showcase-warning--blocked">
            {studio.summary.fixReasons.join("；")}
          </div>
        ) : null}
        <div className="metadata-row">
          <span>profile: {profile}</span>
          <span>latest gate: {payload.latestGateRun?.status ?? "not_run"}</span>
          <span>overall score: {studio.summary.scores.overallScore}/5</span>
        </div>
        <div className="action-row">
          <button className="ghost-button" type="button" onClick={saveEdits}>批量保存当前页修改</button>
          <button className="ghost-button" type="button" onClick={revalidateGate}>重新校验 Gate</button>
          <button className="ghost-button" type="button" onClick={() => setLock(true)}>锁定当前生产包</button>
          <button className="ghost-button" type="button" onClick={() => setLock(false)}>解除锁定</button>
          <Link className="primary-link" href={studio.links.showcase}>Showcase</Link>
          <Link className="ghost-button" href={studio.links.review}>Review</Link>
          <Link className="ghost-button" href={studio.links.export}>Export</Link>
          <Link className="ghost-button" href={studio.links.agentRuns}>Agent Runs</Link>
        </div>
      </section>

      <section className="panel">
        <h2>Rights Summary</h2>
        <div className="metadata-row">
          <span>green: {studio.summary.riskCounts.green}</span>
          <span>yellow: {studio.summary.riskCounts.yellow}</span>
          <span>red: {studio.summary.riskCounts.red}</span>
          <span>placeholder: {studio.summary.riskCounts.placeholder}</span>
        </div>
        {studio.summary.redRisksWithoutReplacement.length ? (
          <p>red 缺替代方案：{studio.summary.redRisksWithoutReplacement.join(" / ")}</p>
        ) : (
          <p>所有 red risk 都有 replacementPlan。</p>
        )}
      </section>

      <section className="panel table-panel">
        <h2>Shot / Prompt 编辑台</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>version</th>
                <th>#</th>
                <th>shot fields</th>
                <th>prompt bundle</th>
                <th>rights</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.shotId}>
                  <td>{row.versionType}</td>
                  <td>{row.shotNumber}</td>
                  <td>
                    <Editable label="voiceover" value={row.voiceover} onChange={(value) => updateRow(index, "voiceover", value, setRows)} />
                    <Editable label="overlayText" value={row.overlayText} onChange={(value) => updateRow(index, "overlayText", value, setRows)} />
                    <Editable label="visual" value={row.visual} onChange={(value) => updateRow(index, "visual", value, setRows)} />
                    <Editable label="camera" value={row.camera} onChange={(value) => updateRow(index, "camera", value, setRows)} />
                    <Editable label="composition" value={row.composition} onChange={(value) => updateRow(index, "composition", value, setRows)} />
                    <Editable label="motion" value={row.motion} onChange={(value) => updateRow(index, "motion", value, setRows)} />
                  </td>
                  <td>
                    <Editable label="imagePrompt" value={row.imagePrompt} onChange={(value) => updateRow(index, "imagePrompt", value, setRows)} />
                    <Editable label="videoPrompt" value={row.videoPrompt} onChange={(value) => updateRow(index, "videoPrompt", value, setRows)} />
                    <Editable label="negativePrompt" value={row.negativePrompt} onChange={(value) => updateRow(index, "negativePrompt", value, setRows)} />
                  </td>
                  <td>
                    <StatusBadge tone={row.copyrightRisk === "red" ? "red" : row.copyrightRisk === "yellow" ? "yellow" : row.copyrightRisk === "placeholder" ? "placeholder" : "green"}>
                      {row.copyrightRisk}
                    </StatusBadge>
                    <Editable label="replacementPlan" value={row.replacementPlan} onChange={(value) => updateRow(index, "replacementPlan", value, setRows)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Editable({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <small>{label}</small>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={2} />
    </label>
  );
}

function updateRow(
  index: number,
  field: keyof ProductionStudioRow,
  value: string,
  setRows: (updater: (rows: ProductionStudioRow[]) => ProductionStudioRow[]) => void
) {
  setRows((current) =>
    current.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: value
          }
        : row
    )
  );
}

function buildEdits(
  originalRows: ProductionStudioViewModel["rows"],
  rows: ProductionStudioViewModel["rows"]
): ProductionStudioEditInput[] {
  const edits: ProductionStudioEditInput[] = [];

  rows.forEach((row, index) => {
    const original = originalRows[index];

    if (!original) {
      return;
    }

    const shotPatch = changedFields(original, row, ["visual", "voiceover", "overlayText", "camera", "composition", "motion"]);
    if (Object.keys(shotPatch).length > 0) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "shot",
        patch: shotPatch
      });
    }

    const promptPatch = changedFields(original, row, ["imagePrompt", "videoPrompt", "negativePrompt"]);
    if (Object.keys(promptPatch).length > 0) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "prompt",
        patch: promptPatch
      });
    }

    const rightsPatch = changedFields(original, row, ["replacementPlan"]);
    if (Object.keys(rightsPatch).length > 0) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "rights",
        patch: rightsPatch
      });
    }
  });

  return edits;
}

function changedFields<TField extends keyof ProductionStudioRow>(
  original: ProductionStudioRow,
  row: ProductionStudioRow,
  fields: TField[]
) {
  return Object.fromEntries(
    fields
      .filter((field) => original[field] !== row[field])
      .map((field) => [field, row[field]])
  ) as unknown as Record<TField, string>;
}
