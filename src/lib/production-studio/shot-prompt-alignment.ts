import type {
  ProductionPack,
  RightsRiskLevel
} from "@/lib/schemas/production-pack";
import {
  getShotDensitySpec,
  type ShotDensityProfile
} from "./density-profile";

export type ProductionStudioScores = {
  volumeScore: number;
  alignmentScore: number;
  rightsScore: number;
  overallScore: number;
};

export type ProductionStudioSummary = {
  densityProfile: ShotDensityProfile;
  shotCount90s: number;
  shotCount180s: number;
  totalShots: number;
  promptCount90s: number;
  promptCount180s: number;
  totalPrompts: number;
  unmatchedShots: string[];
  unmatchedPrompts: string[];
  redRisksWithoutReplacement: string[];
  riskCounts: Record<RightsRiskLevel, number>;
  scores: ProductionStudioScores;
  needsFix: boolean;
  fixReasons: string[];
};

export function analyzeShotPromptAlignment(
  productionPack: ProductionPack,
  densityProfile: ShotDensityProfile = "standard"
): ProductionStudioSummary {
  const densitySpec = getShotDensitySpec(densityProfile);
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
  const totalShots = shotCount90s + shotCount180s;
  const promptCount90s = promptBundles.filter((prompt) => prompt.versionType === "90s").length;
  const promptCount180s = promptBundles.filter((prompt) => prompt.versionType === "180s").length;
  const totalPrompts = promptCount90s + promptCount180s;
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
    shotCount90s < densitySpec.min90s ? `需要重跑 / 人工修正：90s shots ${shotCount90s} < ${densitySpec.min90s}。` : null,
    shotCount180s < densitySpec.min180s ? `需要重跑 / 人工修正：180s shots ${shotCount180s} < ${densitySpec.min180s}。` : null,
    totalShots < densitySpec.minTotal ? `需要重跑 / 人工修正：total shots ${totalShots} < ${densitySpec.minTotal}。` : null,
    totalPrompts !== totalShots ? `需要重跑 / 人工修正：prompt count ${totalPrompts} != shot count ${totalShots}。` : null,
    unmatchedShots.length > 0 ? `需要重跑 / 人工修正：${unmatchedShots.length} 个 shot 缺少 prompt。` : null,
    unmatchedPrompts.length > 0 ? `需要重跑 / 人工修正：${unmatchedPrompts.length} 个 prompt 无法对应 shot。` : null,
    redRisksWithoutReplacement.length > 0 ? `需要重跑 / 人工修正：${redRisksWithoutReplacement.length} 个 red rights risk 缺少替代方案。` : null
  ].filter(Boolean) as string[];
  const scores = scoreGate({
    shotCount90s,
    shotCount180s,
    promptCount90s,
    promptCount180s,
    totalShots,
    totalPrompts,
    unmatchedShots,
    unmatchedPrompts,
    redRisksWithoutReplacement,
    densitySpec
  });
  const needsFix =
    fixReasons.length > 0 ||
    Object.values(scores).some((score) => score < 4);

  return {
    densityProfile,
    shotCount90s,
    shotCount180s,
    totalShots,
    promptCount90s,
    promptCount180s,
    totalPrompts,
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
  totalShots: number;
  totalPrompts: number;
  unmatchedShots: string[];
  unmatchedPrompts: string[];
  redRisksWithoutReplacement: string[];
  densitySpec: ReturnType<typeof getShotDensitySpec>;
}): ProductionStudioScores {
  const volumeScore = Math.min(
    5,
    Math.floor(
      Math.min(
        input.shotCount90s / input.densitySpec.min90s,
        input.shotCount180s / input.densitySpec.min180s,
        input.totalShots / input.densitySpec.minTotal
      ) * 5
    )
  );
  const alignmentPenalty = input.unmatchedShots.length + input.unmatchedPrompts.length;
  const alignmentScore = alignmentPenalty === 0 ? 5 : alignmentPenalty < 3 ? 3 : 2;
  const rightsScore = input.redRisksWithoutReplacement.length === 0 ? 5 : 2;
  const promptVolumeScore =
    input.promptCount90s === input.shotCount90s &&
      input.promptCount180s === input.shotCount180s &&
      input.totalPrompts === input.totalShots
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
