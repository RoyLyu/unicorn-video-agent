import Link from "next/link";

import { StatusBadge } from "./status-badge";
import type { ProductionStudioViewModel } from "@/lib/production-studio/production-studio-mapper";

export function ProductionStudioView({ studio }: { studio: ProductionStudioViewModel }) {
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
          <span>overall score: {studio.summary.scores.overallScore}/5</span>
          <span>alignment score: {studio.summary.scores.alignmentScore}/5</span>
          <span>rights score: {studio.summary.scores.rightsScore}/5</span>
        </div>
        <div className="action-row">
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
        <h2>Shot / Prompt 对应表</h2>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>version</th>
                <th>#</th>
                <th>beat</th>
                <th>visual</th>
                <th>camera / composition / motion</th>
                <th>prompt</th>
                <th>rights</th>
              </tr>
            </thead>
            <tbody>
              {studio.rows.map((row) => (
                <tr key={row.shotId}>
                  <td>{row.versionType}</td>
                  <td>{row.shotNumber}</td>
                  <td>{row.beat}</td>
                  <td>
                    <strong>{row.overlayText}</strong>
                    <p>{row.visual}</p>
                    <small>chart: {row.chartNeed}</small>
                  </td>
                  <td>
                    <p>{row.camera}</p>
                    <p>{row.composition}</p>
                    <p>{row.motion}</p>
                  </td>
                  <td>
                    <details>
                      <summary>Prompts</summary>
                      <p>imagePrompt: {row.imagePrompt}</p>
                      <p>videoPrompt: {row.videoPrompt}</p>
                      <p>negativePrompt: {row.negativePrompt}</p>
                    </details>
                  </td>
                  <td>
                    <StatusBadge tone={row.copyrightRisk === "red" ? "red" : row.copyrightRisk === "yellow" ? "yellow" : row.copyrightRisk === "placeholder" ? "placeholder" : "green"}>
                      {row.copyrightRisk}
                    </StatusBadge>
                    {row.copyrightRisk === "red" ? <p>{row.replacementPlan}</p> : null}
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
