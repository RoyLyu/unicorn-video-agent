import type { ProductionPack } from "@/lib/schemas/production-pack";
import { csvRow } from "./export-utils";

const header = [
  "shotCode",
  "versionType",
  "shotNumber",
  "duration",
  "beat",
  "shotFunction",
  "subject",
  "environment",
  "camera",
  "lighting",
  "style",
  "composition",
  "motion",
  "overlayText",
  "chartNeed",
  "productionMethod",
  "methodReason",
  "continuityAssets",
  "cutType",
  "transitionLogic",
  "screenTextTiming",
  "graphicTiming",
  "musicCue",
  "sfxCue",
  "pace",
  "rollType",
  "copyrightRisk",
  "replacementPlan"
];

export function generateStoryboardCsv(productionPack: ProductionPack) {
  const rows = productionPack.storyboard.shots.map((shot) =>
    csvRow([
      shot.shotCode ?? shot.id,
      shot.versionType ?? "",
      String(shot.shotNumber ?? shot.id),
      shot.duration ?? shot.timeRange,
      shot.beat ?? shot.editing?.beat ?? "",
      shot.shotFunction ?? "",
      shot.subject ?? "",
      shot.environment ?? "",
      shot.camera ?? "",
      shot.lighting ?? "",
      shot.style ?? "",
      shot.composition ?? "",
      shot.motion ?? "",
      shot.overlayText ?? shot.scene,
      shot.chartNeed ?? "",
      shot.productionMethod ?? "",
      shot.methodReason ?? "",
      shot.continuityAssets?.join(" / ") ?? "",
      shot.editing?.cutType ?? "",
      shot.editing?.transitionLogic ?? "",
      shot.editing?.screenTextTiming ?? "",
      shot.editing?.graphicTiming ?? "",
      shot.editing?.musicCue ?? "",
      shot.editing?.sfxCue ?? "",
      shot.editing?.pace ?? "",
      shot.editing?.rollType ?? "",
      shot.copyrightRisk ?? shot.rightsLevel,
      shot.replacementPlan ?? ""
    ])
  );

  return [header.join(","), ...rows].join("\n");
}
