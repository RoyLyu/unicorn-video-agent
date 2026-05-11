import type { ProductionStudioSummary } from "./shot-prompt-alignment";

export function productionStudioNeedsFix(summary: ProductionStudioSummary) {
  return summary.needsFix || summary.scores.overallScore < 4;
}

export function productionStudioGateLabel(summary: ProductionStudioSummary) {
  return productionStudioNeedsFix(summary) ? "需要重跑 / 人工修正" : "pass";
}
