import type { ProductionPack } from "@/lib/schemas/production-pack";
import { csvRow } from "./export-utils";

const header = [
  "shotNumber",
  "duration",
  "voiceover",
  "visualDescription",
  "overlayText",
  "visualType",
  "copyrightRisk"
];

export function generateStoryboardCsv(productionPack: ProductionPack) {
  const rows = productionPack.storyboard.shots.map((shot) =>
    csvRow([
      shot.id,
      shot.timeRange,
      shot.narration,
      shot.visual,
      shot.scene,
      shot.assetType,
      shot.rightsLevel
    ])
  );

  return [header.join(","), ...rows].join("\n");
}
