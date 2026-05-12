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
  const [filters, setFilters] = useState({
    versionType: "all",
    shotFunction: "all",
    productionMethod: "all",
    riskLevel: "all",
    needsFix: "all",
    editedOnly: false
  });
  const [packDraft, setPackDraft] = useState({
    creativeConcept: initialPayload.studio.creativeDirection?.creativeConcept ?? "",
    mainVisualMotif: initialPayload.studio.creativeDirection?.mainVisualMotif ?? "",
    visualImageType: initialPayload.studio.visualStyleBible?.imageType ?? "",
    continuityEnvironment: initialPayload.studio.continuityBible?.environmentBible ?? ""
  });
  const [status, setStatus] = useState("saved");
  const changedEdits = useMemo(
    () => buildEdits(initialPayload.studio.rows, rows, initialPayload.studio, packDraft),
    [initialPayload.studio, rows, packDraft]
  );
  const studio = payload.studio;
  const displayedRows = useMemo(
    () => rows.filter((row, index) => {
      const original = initialPayload.studio.rows[index];
      const edited = original ? JSON.stringify(original) !== JSON.stringify(row) : false;
      const needsFix = row.copyrightRisk === "red" && !row.replacementPlan;

      return (
        (filters.versionType === "all" || row.versionType === filters.versionType) &&
        (filters.shotFunction === "all" || row.shotFunction === filters.shotFunction) &&
        (filters.productionMethod === "all" || row.productionMethod === filters.productionMethod) &&
        (filters.riskLevel === "all" || row.copyrightRisk === filters.riskLevel) &&
        (filters.needsFix === "all" || (filters.needsFix === "yes" ? needsFix : !needsFix)) &&
        (!filters.editedOnly || edited)
      );
    }),
    [filters, initialPayload.studio.rows, rows]
  );

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
    setPackDraft({
      creativeConcept: nextPayload.studio.creativeDirection?.creativeConcept ?? "",
      mainVisualMotif: nextPayload.studio.creativeDirection?.mainVisualMotif ?? "",
      visualImageType: nextPayload.studio.visualStyleBible?.imageType ?? "",
      continuityEnvironment: nextPayload.studio.continuityBible?.environmentBible ?? ""
    });
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
          <span>visual bible: {studio.summary.scores.visualBibleScore}/5</span>
          <span>continuity: {studio.summary.scores.continuityScore}/5</span>
          <span>editing: {studio.summary.scores.editingReadinessScore}/5</span>
          <span>prompt: {studio.summary.scores.promptFieldCompletenessScore}/5</span>
          <span>shot function: {studio.summary.scores.shotFunctionCoverageScore}/5</span>
        </div>
        <div className="metadata-row">
          <span>90s functions: {formatCountMap(studio.summary.distribution90s)}</span>
          <span>180s functions: {formatCountMap(studio.summary.distribution180s)}</span>
          <span>missing 90s: {studio.summary.missingFunctions90s.join(" / ") || "none"}</span>
          <span>missing 180s: {studio.summary.missingFunctions180s.join(" / ") || "none"}</span>
          <span>over repeated: {[...studio.summary.overRepeatedFunctions90s, ...studio.summary.overRepeatedFunctions180s].join(" / ") || "none"}</span>
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
        <div className="section-heading">
          <div>
            <h2>Creative Direction / Visual Bible / Continuity</h2>
            <p>全片 AIGC 视觉总控，保存为 global edits overlay。</p>
          </div>
        </div>
        <div className="form-grid">
          <Editable label="Creative Concept" value={packDraft.creativeConcept} onChange={(value) => setPackDraft((current) => ({ ...current, creativeConcept: value }))} />
          <Editable label="Main Visual Motif" value={packDraft.mainVisualMotif} onChange={(value) => setPackDraft((current) => ({ ...current, mainVisualMotif: value }))} />
          <Editable label="Visual Bible / imageType" value={packDraft.visualImageType} onChange={(value) => setPackDraft((current) => ({ ...current, visualImageType: value }))} />
          <Editable label="Continuity / environmentBible" value={packDraft.continuityEnvironment} onChange={(value) => setPackDraft((current) => ({ ...current, continuityEnvironment: value }))} />
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
        <div className="form-grid">
          <label>
            versionType
            <select value={filters.versionType} onChange={(event) => setFilters((current) => ({ ...current, versionType: event.target.value }))}>
              <option value="all">all</option>
              <option value="90s">90s</option>
              <option value="180s">180s</option>
            </select>
          </label>
          <label>
            shotFunction
            <select value={filters.shotFunction} onChange={(event) => setFilters((current) => ({ ...current, shotFunction: event.target.value }))}>
              <option value="all">all</option>
              {Array.from(new Set(rows.map((row) => row.shotFunction).filter(Boolean))).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            productionMethod
            <select value={filters.productionMethod} onChange={(event) => setFilters((current) => ({ ...current, productionMethod: event.target.value }))}>
              <option value="all">all</option>
              {Array.from(new Set(rows.map((row) => row.productionMethod).filter(Boolean))).map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            riskLevel
            <select value={filters.riskLevel} onChange={(event) => setFilters((current) => ({ ...current, riskLevel: event.target.value }))}>
              <option value="all">all</option>
              <option value="green">green</option>
              <option value="yellow">yellow</option>
              <option value="red">red</option>
              <option value="placeholder">placeholder</option>
            </select>
          </label>
          <label>
            needsFix
            <select value={filters.needsFix} onChange={(event) => setFilters((current) => ({ ...current, needsFix: event.target.value }))}>
              <option value="all">all</option>
              <option value="yes">needs fix</option>
              <option value="no">pass</option>
            </select>
          </label>
          <label>
            editedOnly
            <input type="checkbox" checked={filters.editedOnly} onChange={(event) => setFilters((current) => ({ ...current, editedOnly: event.target.checked }))} />
          </label>
        </div>
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
              {displayedRows.map((row) => {
                const index = rows.findIndex((item) => item.shotId === row.shotId);

                return (
                <tr key={row.shotId}>
                  <td>{row.versionType}</td>
                  <td>{row.shotCode}<br />#{row.shotNumber}</td>
                  <td>
                    <Editable label="duration" value={row.duration} onChange={(value) => updateRow(index, "duration", value, setRows)} />
                    <Editable label="shotFunction" value={row.shotFunction} onChange={(value) => updateRow(index, "shotFunction", value, setRows)} />
                    <Editable label="subject" value={row.subject} onChange={(value) => updateRow(index, "subject", value, setRows)} />
                    <Editable label="environment" value={row.environment} onChange={(value) => updateRow(index, "environment", value, setRows)} />
                    <Editable label="voiceover" value={row.voiceover} onChange={(value) => updateRow(index, "voiceover", value, setRows)} />
                    <Editable label="overlayText" value={row.overlayText} onChange={(value) => updateRow(index, "overlayText", value, setRows)} />
                    <Editable label="visual" value={row.visual} onChange={(value) => updateRow(index, "visual", value, setRows)} />
                    <Editable label="camera" value={row.camera} onChange={(value) => updateRow(index, "camera", value, setRows)} />
                    <Editable label="lighting" value={row.lighting} onChange={(value) => updateRow(index, "lighting", value, setRows)} />
                    <Editable label="style" value={row.style} onChange={(value) => updateRow(index, "style", value, setRows)} />
                    <Editable label="composition" value={row.composition} onChange={(value) => updateRow(index, "composition", value, setRows)} />
                    <Editable label="motion" value={row.motion} onChange={(value) => updateRow(index, "motion", value, setRows)} />
                    <Editable label="productionMethod" value={row.productionMethod} onChange={(value) => updateRow(index, "productionMethod", value, setRows)} />
                    <Editable label="methodReason" value={row.methodReason} onChange={(value) => updateRow(index, "methodReason", value, setRows)} />
                    <Editable label="editing.transitionLogic" value={row.editing.transitionLogic} onChange={(value) => updateNestedRow(index, "editing", "transitionLogic", value, setRows)} />
                    <Editable label="editing.cutType" value={row.editing.cutType} onChange={(value) => updateNestedRow(index, "editing", "cutType", value, setRows)} />
                    <Editable label="editing.pace" value={row.editing.pace} onChange={(value) => updateNestedRow(index, "editing", "pace", value, setRows)} />
                  </td>
                  <td>
                    <Editable label="imagePrompt" value={row.imagePrompt} onChange={(value) => updateRow(index, "imagePrompt", value, setRows)} />
                    <Editable label="videoPrompt" value={row.videoPrompt} onChange={(value) => updateRow(index, "videoPrompt", value, setRows)} />
                    <Editable label="negativePrompt" value={row.negativePrompt} onChange={(value) => updateRow(index, "negativePrompt", value, setRows)} />
                    <Editable label="negativeConstraints" value={row.negativeConstraints} onChange={(value) => updateRow(index, "negativeConstraints", value, setRows)} />
                  </td>
                  <td>
                    <StatusBadge tone={row.copyrightRisk === "red" ? "red" : row.copyrightRisk === "yellow" ? "yellow" : row.copyrightRisk === "placeholder" ? "placeholder" : "green"}>
                      {row.copyrightRisk}
                    </StatusBadge>
                    <Editable label="replacementPlan" value={row.replacementPlan} onChange={(value) => updateRow(index, "replacementPlan", value, setRows)} />
                  </td>
                </tr>
                );
              })}
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

function formatCountMap(values: Record<string, number>) {
  const entries = Object.entries(values).filter(([, value]) => value > 0);

  return entries.length
    ? entries.map(([key, value]) => `${key}:${value}`).join(" / ")
    : "none";
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

function updateNestedRow(
  index: number,
  field: "editing",
  nestedField: keyof ProductionStudioRow["editing"],
  value: string,
  setRows: (updater: (rows: ProductionStudioRow[]) => ProductionStudioRow[]) => void
) {
  setRows((current) =>
    current.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: {
              ...row[field],
              [nestedField]: value
            }
          }
        : row
    )
  );
}

function buildEdits(
  originalRows: ProductionStudioViewModel["rows"],
  rows: ProductionStudioViewModel["rows"],
  originalStudio: ProductionStudioViewModel,
  packDraft: {
    creativeConcept: string;
    mainVisualMotif: string;
    visualImageType: string;
    continuityEnvironment: string;
  }
): ProductionStudioEditInput[] {
  const edits: ProductionStudioEditInput[] = [];

  if (
    packDraft.creativeConcept !== (originalStudio.creativeDirection?.creativeConcept ?? "") ||
    packDraft.mainVisualMotif !== (originalStudio.creativeDirection?.mainVisualMotif ?? "")
  ) {
    edits.push({
      versionType: "global",
      shotNumber: 0,
      editType: "creative_direction",
      patch: {
        creativeDirection: {
          creativeConcept: packDraft.creativeConcept,
          mainVisualMotif: packDraft.mainVisualMotif
        }
      }
    });
  }

  if (packDraft.visualImageType !== (originalStudio.visualStyleBible?.imageType ?? "")) {
    edits.push({
      versionType: "global",
      shotNumber: 0,
      editType: "visual_bible",
      patch: {
        visualStyleBible: {
          imageType: packDraft.visualImageType
        }
      }
    });
  }

  if (packDraft.continuityEnvironment !== (originalStudio.continuityBible?.environmentBible ?? "")) {
    edits.push({
      versionType: "global",
      shotNumber: 0,
      editType: "continuity_bible",
      patch: {
        continuityBible: {
          environmentBible: packDraft.continuityEnvironment
        }
      }
    });
  }

  rows.forEach((row, index) => {
    const original = originalRows[index];

    if (!original) {
      return;
    }

    const shotPatch = changedFields(original, row, [
      "shotCode",
      "duration",
      "shotFunction",
      "subject",
      "environment",
      "lighting",
      "style",
      "visual",
      "voiceover",
      "overlayText",
      "camera",
      "composition",
      "motion"
    ]);
    if (Object.keys(shotPatch).length > 0) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "shot",
        patch: shotPatch
      } as ProductionStudioEditInput);
    }

    const promptPatch = changedFields(original, row, [
      "imagePrompt",
      "videoPrompt",
      "negativePrompt",
      "negativeConstraints"
    ]);
    if (Object.keys(promptPatch).length > 0) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "prompt",
        patch: promptPatch
      } as ProductionStudioEditInput);
    }

    const rightsPatch = changedFields(original, row, ["replacementPlan"]);
    if (Object.keys(rightsPatch).length > 0) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "rights",
        patch: rightsPatch
      } as ProductionStudioEditInput);
    }

    const methodPatch = changedFields(original, row, ["productionMethod", "methodReason"]);
    if (Object.keys(methodPatch).length > 0) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "method",
        patch: methodPatch
      } as ProductionStudioEditInput);
    }

    if (JSON.stringify(original.editing) !== JSON.stringify(row.editing)) {
      edits.push({
        versionType: row.versionType as "90s" | "180s",
        shotNumber: row.shotNumber,
        editType: "editing",
        patch: row.editing
      } as ProductionStudioEditInput);
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
