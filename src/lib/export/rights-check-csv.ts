import type { ProductionPack } from "@/lib/schemas/production-pack";
import { csvRow } from "./export-utils";

const header = [
  "shotId",
  "materialType",
  "sourceName",
  "sourceUrl",
  "licenseType",
  "riskLevel",
  "commercialAllowed",
  "wechatVideoAllowed",
  "needsAttribution",
  "reviewStatus",
  "notes",
  "replacementPlan"
];

export function generateRightsCheckCsv(productionPack: ProductionPack) {
  const rows = productionPack.rightsChecks.map((risk, index) => {
    const shot = productionPack.storyboard.shots[index];

    return csvRow([
      shot?.id ?? `R${String(index + 1).padStart(2, "0")}`,
      shot?.assetType ?? "material",
      risk.item,
      "",
      licenseTypeForRisk(risk.level),
      risk.level,
      risk.level === "green",
      risk.level === "green",
      risk.level === "yellow",
      risk.level === "green" ? "ready" : "needs_review",
      `${risk.reason} ${risk.action}`,
      risk.replacementPlan ?? ""
    ]);
  });

  return [header.join(","), ...rows].join("\n");
}

function licenseTypeForRisk(level: ProductionPack["rightsChecks"][number]["level"]) {
  if (level === "green") {
    return "self-made-or-cleared";
  }

  if (level === "yellow") {
    return "manual-review-required";
  }

  if (level === "red") {
    return "do-not-use";
  }

  return "placeholder";
}
