import { StatusBadge } from "./status-badge";
import type { ShowcaseAgentSummary, ShowcaseGenerationSummary } from "@/lib/showcase/showcase-types";

export function ShowcaseAgentSummary({
  generation,
  agentSummary
}: {
  generation: ShowcaseGenerationSummary;
  agentSummary: ShowcaseAgentSummary;
}) {
  return (
    <section className="showcase-summary-grid" aria-label="生成状态摘要">
      <div className="showcase-summary-item">
        <span>Generation</span>
        <strong>{generation.generationModeLabel}</strong>
        <StatusBadge tone={generation.productionPackMode === "ai" ? "green" : "neutral"}>
          mode: {generation.productionPackMode}
        </StatusBadge>
      </div>
      <div className="showcase-summary-item">
        <span>Fallback</span>
        <strong>{generation.fallbackUsed ? "Used" : "Not used"}</strong>
        <StatusBadge tone={generation.fallbackUsed ? "yellow" : "green"}>
          {generation.fallbackUsed ? "completed_with_fallback" : "clean output"}
        </StatusBadge>
      </div>
      <div className="showcase-summary-item">
        <span>Agent Run</span>
        <strong>{agentSummary.status}</strong>
        <small>
          {agentSummary.stepCount} steps · {agentSummary.fallbackStepCount} fallback ·{" "}
          {agentSummary.failedStepCount} failed
        </small>
      </div>
    </section>
  );
}
