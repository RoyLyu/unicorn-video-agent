import type {
  ProductionMethod,
  ProductionPack,
  RightsRiskLevel,
  ShotFunction
} from "@/lib/schemas/production-pack";
import {
  getShotDensitySpec,
  type ShotDensityProfile
} from "./density-profile";
import { analyzeProductionPackReportCompleteness } from "./report-completeness";

export type ProductionStudioScores = {
  volumeScore: number;
  alignmentScore: number;
  rightsScore: number;
  creativeDirectionScore: number;
  visualBibleScore: number;
  continuityScore: number;
  shotFunctionCoverageScore: number;
  productionMethodScore: number;
  editingReadinessScore: number;
  promptFieldCompletenessScore: number;
  reportCompletenessScore: number;
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
  shotFunctionCounts: Record<ShotFunction, number>;
  productionMethodCounts: Record<ProductionMethod, number>;
  missingReportFields: string[];
  reportFieldCompleteness: "pass" | "fail";
  scores: ProductionStudioScores;
  needsFix: boolean;
  fixReasons: string[];
};

export type ProductionPromptBundle = NonNullable<
  ProductionPack["assetPrompts"]["promptBundles"]
>[number];

const required90Functions: ShotFunction[] = [
  "hook_shot",
  "context_shot",
  "evidence_shot",
  "concept_shot",
  "data_shot",
  "risk_shot",
  "summary_shot"
];
const required180Functions: ShotFunction[] = [
  "hook_shot",
  "context_shot",
  "evidence_shot",
  "concept_shot",
  "transition_shot",
  "emotional_shot",
  "data_shot",
  "risk_shot",
  "summary_shot",
  "cta_shot"
];

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
  const shotFunctionCounts = countShotFunctions(shots);
  const productionMethodCounts = countProductionMethods(shots);
  const contractScores = scoreAigcContract(productionPack, promptBundles);
  const reportCompleteness = analyzeProductionPackReportCompleteness(productionPack);

  const fixReasons = [
    shotCount90s < densitySpec.min90s ? `需要重跑 / 人工修正：90s shots ${shotCount90s} < ${densitySpec.min90s}。` : null,
    shotCount180s < densitySpec.min180s ? `需要重跑 / 人工修正：180s shots ${shotCount180s} < ${densitySpec.min180s}。` : null,
    totalShots < densitySpec.minTotal ? `需要重跑 / 人工修正：total shots ${totalShots} < ${densitySpec.minTotal}。` : null,
    totalPrompts !== totalShots ? `需要重跑 / 人工修正：prompt count ${totalPrompts} != shot count ${totalShots}。` : null,
    unmatchedShots.length > 0 ? `需要重跑 / 人工修正：${unmatchedShots.length} 个 shot 缺少 prompt。` : null,
    unmatchedPrompts.length > 0 ? `需要重跑 / 人工修正：${unmatchedPrompts.length} 个 prompt 无法对应 shot。` : null,
    redRisksWithoutReplacement.length > 0 ? `需要重跑 / 人工修正：${redRisksWithoutReplacement.length} 个 red rights risk 缺少替代方案。` : null,
    contractScores.creativeDirectionScore < 4 ? "需要重跑 / 人工修正：Creative Direction 不完整。" : null,
    contractScores.visualBibleScore < 4 ? "需要重跑 / 人工修正：Visual Bible 不完整。" : null,
    contractScores.continuityScore < 4 ? "需要重跑 / 人工修正：连续性控制系统不完整。" : null,
    contractScores.shotFunctionCoverageScore < 4 ? "需要重跑 / 人工修正：镜头功能覆盖不足或重复过多。" : null,
    contractScores.productionMethodScore < 4 ? "需要重跑 / 人工修正：Production Method 覆盖不足。" : null,
    contractScores.editingReadinessScore < 4 ? "需要重跑 / 人工修正：剪辑结构字段不完整。" : null,
    contractScores.promptFieldCompletenessScore < 4 ? "需要重跑 / 人工修正：Prompt production contract 字段不完整。" : null,
    reportCompleteness.reportFieldCompleteness === "fail" ? `需要重跑 / 人工修正：报告字段缺失（${reportCompleteness.missingReportFields.join(" / ")}）。` : null
  ].filter(Boolean) as string[];
  const baseScores = scoreGate({
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
  const scores = {
    ...baseScores,
    ...contractScores,
    reportCompletenessScore: reportCompleteness.reportCompletenessScore,
    overallScore: Math.min(
      baseScores.overallScore,
      ...Object.values(contractScores),
      reportCompleteness.reportCompletenessScore
    )
  };
  const needsFix =
    fixReasons.length > 0 ||
    reportCompleteness.reportFieldCompleteness === "fail" ||
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
    shotFunctionCounts,
    productionMethodCounts,
    missingReportFields: reportCompleteness.missingReportFields,
    reportFieldCompleteness: reportCompleteness.reportFieldCompleteness,
    scores,
    needsFix,
    fixReasons: needsFix && fixReasons.length === 0
      ? ["需要重跑 / 人工修正：Production Studio gate score 低于 4。"]
      : fixReasons
  };
}

function countShotFunctions(shots: ProductionPack["storyboard"]["shots"]) {
  const counts = emptyShotFunctionCounts();
  for (const shot of shots) {
    if (shot.shotFunction) {
      counts[shot.shotFunction] += 1;
    }
  }
  return counts;
}

function emptyShotFunctionCounts(): Record<ShotFunction, number> {
  return {
    hook_shot: 0,
    context_shot: 0,
    evidence_shot: 0,
    concept_shot: 0,
    transition_shot: 0,
    emotional_shot: 0,
    data_shot: 0,
    risk_shot: 0,
    summary_shot: 0,
    cta_shot: 0
  };
}

function countProductionMethods(shots: ProductionPack["storyboard"]["shots"]) {
  const counts: Record<ProductionMethod, number> = {
    text_to_video: 0,
    image_to_video: 0,
    text_to_image_edit: 0,
    motion_graphics: 0,
    stock_footage: 0,
    manual_design: 0,
    compositing: 0
  };
  for (const shot of shots) {
    if (shot.productionMethod) {
      counts[shot.productionMethod] += 1;
    }
  }
  return counts;
}

function scoreAigcContract(
  productionPack: ProductionPack,
  promptBundles: ReturnType<typeof getPromptBundles>
) {
  const shots = productionPack.storyboard.shots;
  const creativeDirectionScore = scoreFilled([
    productionPack.creativeDirection?.creativeConcept,
    productionPack.creativeDirection?.visualMetaphor,
    productionPack.creativeDirection?.mainVisualMotif,
    productionPack.creativeDirection?.narrativeDevice,
    productionPack.creativeDirection?.emotionalCurve,
    productionPack.creativeDirection?.visualProgression,
    productionPack.creativeDirection?.audienceTakeaway,
    productionPack.creativeDirection?.productionNotes
  ]);
  const visualBibleScore = scoreFilled([
    productionPack.visualStyleBible?.aspectRatio,
    productionPack.visualStyleBible?.imageType,
    productionPack.visualStyleBible?.colorSystem?.primaryColor,
    productionPack.visualStyleBible?.lightingSystem?.contrast,
    productionPack.visualStyleBible?.materialSystem?.screenUI,
    productionPack.visualStyleBible?.typographyStyle?.fontMood,
    productionPack.visualStyleBible?.chartStyle?.infoCard,
    ...(productionPack.visualStyleBible?.forbiddenElements ?? [])
  ]);
  const continuityScore = scoreFilled([
    productionPack.continuityBible?.mainCharacterBible,
    productionPack.continuityBible?.environmentBible,
    productionPack.continuityBible?.objectBible,
    productionPack.continuityBible?.colorContinuity,
    productionPack.continuityBible?.motionContinuity,
    productionPack.continuityBible?.graphicContinuity,
    productionPack.continuityBible?.typographyContinuity,
    productionPack.continuityBible?.referenceFramePlan,
    ...shots.map((shot) => (shot.continuityAssets?.length ? shot.continuityAssets.join(" / ") : ""))
  ]);
  const shotFunctionCoverageScore = scoreShotFunctionCoverage(shots);
  const productionMethodScore = scoreRatio(
    shots.filter((shot) => shot.productionMethod && shot.methodReason).length,
    shots.length
  );
  const editingReadinessScore = scoreRatio(
    shots.filter((shot) =>
      Boolean(
        shot.editing?.cutType &&
          shot.editing.transitionLogic &&
          shot.editing.screenTextTiming &&
          shot.editing.graphicTiming &&
          shot.editing.musicCue &&
          shot.editing.sfxCue &&
          shot.editing.pace &&
          shot.editing.rollType
      )
    ).length,
    shots.length
  );
  const promptFieldCompletenessScore = scoreRatio(
    promptBundles.filter((prompt) =>
      Boolean(
        prompt.shotCode &&
          prompt.duration &&
          prompt.subject &&
          prompt.environment &&
          prompt.camera &&
          prompt.lighting &&
          prompt.style &&
          prompt.negativeConstraints &&
          prompt.forbiddenElements?.length
      )
    ).length,
    promptBundles.length
  );

  return {
    creativeDirectionScore,
    visualBibleScore,
    continuityScore,
    shotFunctionCoverageScore,
    productionMethodScore,
    editingReadinessScore,
    promptFieldCompletenessScore
  };
}

function scoreShotFunctionCoverage(shots: ProductionPack["storyboard"]["shots"]) {
  const score90 = requiredCoverageScore(shots, "90s", required90Functions);
  const score180 = requiredCoverageScore(shots, "180s", required180Functions);

  return Math.min(score90, score180);
}

function requiredCoverageScore(
  shots: ProductionPack["storyboard"]["shots"],
  versionType: "90s" | "180s",
  required: ShotFunction[]
) {
  const versionShots = shots.filter((shot) => shot.versionType === versionType);
  const available = new Set(versionShots.map((shot) => shot.shotFunction).filter(Boolean));
  const covered = required.filter((item) => available.has(item)).length;
  const dominantCount = Math.max(0, ...Object.values(countShotFunctions(versionShots)));
  const repetitionPenalty = dominantCount > versionShots.length * 0.45 ? 1 : 0;

  return Math.max(1, Math.min(5, Math.floor((covered / required.length) * 5) - repetitionPenalty));
}

function scoreFilled(values: Array<string | undefined>) {
  return scoreRatio(values.filter((value) => value?.trim()).length, values.length);
}

function scoreRatio(count: number, total: number) {
  if (total === 0) {
    return 1;
  }
  return Math.max(1, Math.min(5, Math.floor((count / total) * 5)));
}

export function getPromptBundles(productionPack: ProductionPack): ProductionPromptBundle[] {
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
}): Pick<ProductionStudioScores, "volumeScore" | "alignmentScore" | "rightsScore" | "overallScore"> {
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
