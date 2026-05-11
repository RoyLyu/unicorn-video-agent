import type { ProductionPack } from "@/lib/schemas/production-pack";

export type ReportFieldCompleteness = "pass" | "fail";

export type ReportCompletenessResult = {
  missingReportFields: string[];
  reportCompletenessScore: number;
  reportFieldCompleteness: ReportFieldCompleteness;
};

export const requiredProductionReportFields = [
  "AIGC 制作总控",
  "视觉风格 Bible",
  "连续性 Bible",
  "逐镜头 AIGC 制作表",
  "镜头编号",
  "画面主体",
  "场景环境",
  "摄影机",
  "灯光",
  "风格",
  "禁止项",
  "Production Method",
  "Method Reason",
  "Cut Type",
  "Transition Logic",
  "Music Cue",
  "SFX Cue",
  "Image Prompt",
  "Video Prompt",
  "Negative Prompt",
  "Replacement Plan"
];

export function analyzeReportCompleteness(markdown: string): ReportCompletenessResult {
  const missingReportFields = requiredProductionReportFields.filter(
    (field) => !markdown.includes(field)
  );

  return buildResult(missingReportFields);
}

export function analyzeProductionPackReportCompleteness(
  productionPack: ProductionPack
): ReportCompletenessResult {
  const missing = new Set<string>();
  const creative = productionPack.creativeDirection;
  const visualBible = productionPack.visualStyleBible;
  const continuity = productionPack.continuityBible;
  const shots = productionPack.storyboard.shots;
  const promptsByShot = new Map(
    getReportPromptBundles(productionPack).map((prompt) => [
      `${prompt.versionType}:${prompt.shotNumber}:${prompt.shotId}`,
      prompt
    ])
  );

  if (!creative || Object.values(creative).some((value) => !hasText(value))) {
    missing.add("AIGC 制作总控");
  }
  if (!visualBible || !hasText(visualBible.aspectRatio) || !visualBible.forbiddenElements.length) {
    missing.add("视觉风格 Bible");
    missing.add("禁止项");
  }
  if (!continuity || Object.values(continuity).some((value) => !hasText(value))) {
    missing.add("连续性 Bible");
  }
  if (!shots.length) {
    missing.add("逐镜头 AIGC 制作表");
  }

  for (const shot of shots) {
    const prompt = promptsByShot.get(`${shot.versionType ?? "90s"}:${shot.shotNumber ?? 0}:${shot.id}`);
    if (!hasText(shot.shotCode ?? shot.id)) missing.add("镜头编号");
    if (!hasText(shot.subject)) missing.add("画面主体");
    if (!hasText(shot.environment)) missing.add("场景环境");
    if (!hasText(shot.camera)) missing.add("摄影机");
    if (!hasText(shot.lighting)) missing.add("灯光");
    if (!hasText(shot.style)) missing.add("风格");
    if (!hasText(shot.productionMethod)) missing.add("Production Method");
    if (!hasText(shot.methodReason)) missing.add("Method Reason");
    if (!hasText(shot.editing?.cutType)) missing.add("Cut Type");
    if (!hasText(shot.editing?.transitionLogic)) missing.add("Transition Logic");
    if (!hasText(shot.editing?.musicCue)) missing.add("Music Cue");
    if (!hasText(shot.editing?.sfxCue)) missing.add("SFX Cue");
    if (!hasText(prompt?.imagePrompt)) missing.add("Image Prompt");
    if (!hasText(prompt?.videoPrompt)) missing.add("Video Prompt");
    if (!hasText(prompt?.negativePrompt)) missing.add("Negative Prompt");
    if (!hasText(prompt?.negativeConstraints) && !hasText(prompt?.negativePrompt)) {
      missing.add("禁止项");
    }
  }

  return buildResult([...missing]);
}

function buildResult(missingReportFields: string[]): ReportCompletenessResult {
  const presentCount = requiredProductionReportFields.length - missingReportFields.length;
  const reportCompletenessScore = missingReportFields.length === 0
    ? 5
    : Math.max(1, Math.floor((presentCount / requiredProductionReportFields.length) * 5));

  return {
    missingReportFields,
    reportCompletenessScore,
    reportFieldCompleteness: missingReportFields.length === 0 ? "pass" : "fail"
  };
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function getReportPromptBundles(productionPack: ProductionPack) {
  if (productionPack.assetPrompts.promptBundles?.length) {
    return productionPack.assetPrompts.promptBundles;
  }

  const videoByShot = new Map(
    productionPack.assetPrompts.videoPrompts.map((prompt) => [prompt.sceneRef, prompt])
  );

  return productionPack.assetPrompts.imagePrompts.map((imagePrompt, index) => {
    const shot = productionPack.storyboard.shots.find((item) => item.id === imagePrompt.sceneRef);
    const videoPrompt = videoByShot.get(imagePrompt.sceneRef);

    return {
      versionType: shot?.versionType ?? "90s" as const,
      shotNumber: shot?.shotNumber ?? index + 1,
      shotId: imagePrompt.sceneRef,
      imagePrompt: imagePrompt.prompt,
      videoPrompt: videoPrompt?.prompt ?? imagePrompt.prompt,
      negativePrompt: imagePrompt.negativePrompt,
      styleLock: "legacy",
      aspectRatio: "9:16",
      usageWarning: imagePrompt.notes,
      negativeConstraints: imagePrompt.negativePrompt
    };
  });
}
