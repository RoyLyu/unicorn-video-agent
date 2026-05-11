import type {
  ProductionPack,
  RightsRiskLevel,
  StoryboardVersionType
} from "@/lib/schemas/production-pack";

export type ProductionStudioScores = {
  volumeScore: number;
  alignmentScore: number;
  rightsScore: number;
  overallScore: number;
};

export type ProductionStudioSummary = {
  shotCount90s: number;
  shotCount180s: number;
  promptCount90s: number;
  promptCount180s: number;
  unmatchedShots: string[];
  unmatchedPrompts: string[];
  redRisksWithoutReplacement: string[];
  riskCounts: Record<RightsRiskLevel, number>;
  scores: ProductionStudioScores;
  needsFix: boolean;
  fixReasons: string[];
};

const minimumShots: Record<StoryboardVersionType, number> = {
  "90s": 30,
  "180s": 60
};

export function analyzeShotPromptAlignment(
  productionPack: ProductionPack
): ProductionStudioSummary {
  const shots = productionPack.storyboard.shots;
  const promptBundles = getPromptBundles(productionPack);
  const shotKeys = new Set(shots.map(shotKey));
  const promptKeys = new Set(promptBundles.map(promptKey));
  const unmatchedShots = shots
    .filter((shot) => !promptKeys.has(shotKey(shot)))
    .map((shot) => shot.id);
  const unmatchedPrompts = promptBundles
    .filter((prompt) => !shotKeys.has(promptKey(prompt)))
    .map((prompt) => prompt.shotId);
  const shotCount90s = shots.filter((shot) => shot.versionType === "90s").length;
  const shotCount180s = shots.filter((shot) => shot.versionType === "180s").length;
  const promptCount90s = promptBundles.filter((prompt) => prompt.versionType === "90s").length;
  const promptCount180s = promptBundles.filter((prompt) => prompt.versionType === "180s").length;
  const redRisksWithoutReplacement = productionPack.rightsChecks
    .filter((risk) => risk.level === "red" && !hasReplacement(`${risk.action} ${risk.replacementPlan ?? ""}`))
    .map((risk) => risk.item);
  const riskCounts: Record<RightsRiskLevel, number> = {
    green: 0,
    yellow: 0,
    red: 0,
    placeholder: 0
  };

  for (const shot of shots) {
    riskCounts[shot.rightsLevel] += 1;
  }
  for (const risk of productionPack.rightsChecks) {
    riskCounts[risk.level] += 1;
  }

  const fixReasons = [
    shotCount90s < minimumShots["90s"] ? `需要重跑 / 人工修正：90s shots ${shotCount90s} < 30。` : null,
    shotCount180s < minimumShots["180s"] ? `需要重跑 / 人工修正：180s shots ${shotCount180s} < 60。` : null,
    unmatchedShots.length > 0 ? `需要重跑 / 人工修正：${unmatchedShots.length} 个 shot 缺少 prompt。` : null,
    unmatchedPrompts.length > 0 ? `需要重跑 / 人工修正：${unmatchedPrompts.length} 个 prompt 无法对应 shot。` : null,
    redRisksWithoutReplacement.length > 0 ? `需要重跑 / 人工修正：${redRisksWithoutReplacement.length} 个 red rights risk 缺少替代方案。` : null
  ].filter(Boolean) as string[];
  const scores = scoreGate({
    shotCount90s,
    shotCount180s,
    promptCount90s,
    promptCount180s,
    unmatchedShots,
    unmatchedPrompts,
    redRisksWithoutReplacement
  });
  const needsFix =
    fixReasons.length > 0 ||
    Object.values(scores).some((score) => score < 4);

  return {
    shotCount90s,
    shotCount180s,
    promptCount90s,
    promptCount180s,
    unmatchedShots,
    unmatchedPrompts,
    redRisksWithoutReplacement,
    riskCounts,
    scores,
    needsFix,
    fixReasons: needsFix && fixReasons.length === 0
      ? ["需要重跑 / 人工修正：Production Studio gate score 低于 4。"]
      : fixReasons
  };
}

export function getPromptBundles(productionPack: ProductionPack) {
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
      usageWarning: imagePrompt.notes
    };
  });
}

function scoreGate(input: {
  shotCount90s: number;
  shotCount180s: number;
  promptCount90s: number;
  promptCount180s: number;
  unmatchedShots: string[];
  unmatchedPrompts: string[];
  redRisksWithoutReplacement: string[];
}): ProductionStudioScores {
  const volumeScore = Math.min(
    5,
    Math.floor(
      Math.min(input.shotCount90s / minimumShots["90s"], input.shotCount180s / minimumShots["180s"]) * 5
    )
  );
  const alignmentPenalty = input.unmatchedShots.length + input.unmatchedPrompts.length;
  const alignmentScore = alignmentPenalty === 0 ? 5 : alignmentPenalty < 3 ? 3 : 2;
  const rightsScore = input.redRisksWithoutReplacement.length === 0 ? 5 : 2;
  const promptVolumeScore =
    input.promptCount90s >= input.shotCount90s && input.promptCount180s >= input.shotCount180s
      ? 5
      : 3;
  const overallScore = Math.min(volumeScore, alignmentScore, rightsScore, promptVolumeScore);

  return {
    volumeScore,
    alignmentScore,
    rightsScore,
    overallScore
  };
}

function shotKey(shot: ProductionPack["storyboard"]["shots"][number]) {
  return `${shot.versionType ?? "90s"}:${shot.shotNumber ?? 0}:${shot.id}`;
}

function promptKey(prompt: ReturnType<typeof getPromptBundles>[number]) {
  return `${prompt.versionType}:${prompt.shotNumber}:${prompt.shotId}`;
}

function hasReplacement(value: string) {
  return /替换|自制图表|抽象 AI 画面|placeholder/.test(value);
}
