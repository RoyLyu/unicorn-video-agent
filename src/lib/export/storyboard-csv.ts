import type { ProductionPack } from "@/lib/schemas/production-pack";
import { csvRow } from "./export-utils";

const header = [
  "versionType",
  "shotNumber",
  "duration",
  "voiceover",
  "visualDescription",
  "overlayText",
  "camera",
  "composition",
  "motion",
  "visualType",
  "chartNeed",
  "copyrightRisk",
  "replacementPlan"
];

export function generateStoryboardCsv(productionPack: ProductionPack) {
  const rows = productionPack.storyboard.shots.map((shot) =>
    csvRow([
      shot.versionType ?? "",
      String(shot.shotNumber ?? shot.id),
      shot.duration ?? shot.timeRange,
      shot.voiceover ?? shot.narration,
      shot.visual,
      shot.overlayText ?? shot.scene,
      shot.camera ?? "",
      shot.composition ?? "",
      shot.motion ?? "",
      shot.visualType ?? shot.assetType,
      shot.chartNeed ?? "",
      shot.copyrightRisk ?? shot.rightsLevel,
      shot.replacementPlan ?? ""
    ])
  );

  return [header.join(","), ...rows].join("\n");
}
