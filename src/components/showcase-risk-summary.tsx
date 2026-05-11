import { StatusBadge } from "./status-badge";
import type { ShowcaseRiskSummary } from "@/lib/showcase/showcase-types";

export function ShowcaseRiskSummary({
  riskSummary
}: {
  riskSummary: ShowcaseRiskSummary;
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <h2>版权风险摘要</h2>
        <div className="metadata-row">
          <StatusBadge tone="green">green {riskSummary.counts.green}</StatusBadge>
          <StatusBadge tone="yellow">yellow {riskSummary.counts.yellow}</StatusBadge>
          <StatusBadge tone="red">red {riskSummary.counts.red}</StatusBadge>
          <StatusBadge tone="placeholder">
            placeholder {riskSummary.counts.placeholder}
          </StatusBadge>
        </div>
      </div>
      <details className="showcase-details" open>
        <summary>查看复核项</summary>
        <ul className="info-list">
          {riskSummary.items.map((risk) => (
            <li key={`${risk.item}-${risk.level}`}>
              <strong>
                {risk.item} <StatusBadge tone={risk.level}>{risk.level}</StatusBadge>{" "}
                <span>{risk.displayLabel}</span>
              </strong>
              <span>{risk.displayText}</span>
              <br />
              <small>
                {risk.level === "red" ? risk.alternativeText : risk.action}
              </small>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
