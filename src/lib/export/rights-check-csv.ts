import type { ProductionPack } from "@/lib/schemas/production-pack";
import { csvRow } from "./export-utils";

const header = [
  "shotCode",
  "versionType",
  "materialType",
  "riskLevel",
  "reason",
  "replacementPlan",
  "productionMethod",
  "usageStatus",
  "reviewStatus",
  "sourceUrl",
  "notes"
];

export function generateRightsCheckCsv(productionPack: ProductionPack) {
  const rows = productionPack.rightsChecks.map((risk, index) => {
    const shot = productionPack.storyboard.shots[index];
    const replacementPlan =
      risk.replacementPlan ??
      shot?.replacementPlan ??
      (risk.level === "red" || risk.level === "placeholder"
        ? "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项，不使用真实素材。"
        : "");

    return csvRow([
      shot?.shotCode ?? shot?.id ?? `R${String(index + 1).padStart(2, "0")}`,
      shot?.versionType ?? "",
      shot?.assetType ?? "material",
      risk.level,
      risk.reason,
      replacementPlan,
      shot?.productionMethod ?? "",
      usageStatusForRisk(risk.level),
      risk.level === "green" ? "ready" : "needs_review",
      "",
      `${risk.item} ${risk.action}`
    ]);
  });

  return [header.join(","), ...rows].join("\n");
}

function usageStatusForRisk(level: ProductionPack["rightsChecks"][number]["level"]) {
  if (level === "green") {
    return "ready";
  }

  if (level === "yellow") {
    return "manual_review";
  }

  if (level === "red") {
    return "do-not-use";
  }

  return "placeholder_review";
}
