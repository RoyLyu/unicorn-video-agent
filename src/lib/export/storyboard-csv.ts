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
  "replacementPlan",
  "shotCode",
  "shotFunction",
  "productionMethod",
  "methodReason",
  "subject",
  "environment",
  "lighting",
  "style",
  "cutType",
  "transitionLogic",
  "screenTextTiming",
  "graphicTiming",
  "musicCue",
  "sfxCue",
  "pace",
  "rollType"
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
      shot.replacementPlan ?? "",
      shot.shotCode ?? shot.id,
      shot.shotFunction ?? "",
      shot.productionMethod ?? "",
      shot.methodReason ?? "",
      shot.subject ?? "",
      shot.environment ?? "",
      shot.lighting ?? "",
      shot.style ?? "",
      shot.editing?.cutType ?? "",
      shot.editing?.transitionLogic ?? "",
      shot.editing?.screenTextTiming ?? "",
      shot.editing?.graphicTiming ?? "",
      shot.editing?.musicCue ?? "",
      shot.editing?.sfxCue ?? "",
      shot.editing?.pace ?? "",
      shot.editing?.rollType ?? ""
    ])
  );

  return [header.join(","), ...rows].join("\n");
}
