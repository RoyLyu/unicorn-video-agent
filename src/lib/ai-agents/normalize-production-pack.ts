import {
  ProductionPackSchema,
  type AssetPromptResult,
  type ProductionPack,
  type RightsCheckResult,
  type RightsRiskLevel,
  type StoryboardResult,
  type StoryboardVersionType
} from "@/lib/schemas/production-pack";

import {
  requiredNegativePrompt,
  visualStyleLock
} from "./prompts/single-pack-production-prompt";

export { visualStyleLock };

export const requiredNegativePromptTerms = requiredNegativePrompt
  .split(",")
  .map((term) => term.trim());

const assetTypes = ["chart", "ai-image", "ai-video", "stock", "screen", "text"] as const;
const rightsLevels = ["green", "yellow", "red", "placeholder"] as const;
const cameraMotions = [
  "slow push-in",
  "tracking shot",
  "pan left",
  "tilt down",
  "dolly forward",
  "slow zoom",
  "俯拍",
  "跟拍"
];
const minimumShotsByVersion: Record<StoryboardVersionType, number> = {
  "90s": 30,
  "180s": 60
};
const defaultReplacementPlan =
  "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项，不使用真实素材。";
const usageWarning =
  "仅作为后续素材生成提示，不代表已生成素材；不得生成真实 Logo、新闻图、创始人肖像、招股书截图或可读品牌文字。";

export function normalizeProductionPack(pack: ProductionPack): ProductionPack {
  const storyboard = ensureStoryboardMinimumShots(pack.storyboard, pack);
  const assetPrompts = ensurePromptCoverage(pack.assetPrompts, storyboard);
  const rightsChecks = ensureRightsAlternatives(pack.rightsChecks);

  return ProductionPackSchema.parse({
    ...pack,
    storyboard,
    assetPrompts,
    rightsChecks
  });
}

export function ensureStoryboardMinimumShots(
  storyboard: StoryboardResult,
  pack: ProductionPack
): StoryboardResult {
  return {
    shots: [
      ...normalizeVersionShots(storyboard, pack, "90s"),
      ...normalizeVersionShots(storyboard, pack, "180s")
    ]
  };
}

export function ensurePromptCoverage(
  prompts: AssetPromptResult,
  storyboard: StoryboardResult
): AssetPromptResult {
  const imageByShot = new Map(prompts.imagePrompts.map((prompt) => [prompt.sceneRef, prompt]));
  const videoByShot = new Map(prompts.videoPrompts.map((prompt) => [prompt.sceneRef, prompt]));
  const bundleByShot = new Map(
    (prompts.promptBundles ?? []).map((prompt) => [prompt.shotId, prompt])
  );
  const promptBundles = storyboard.shots.map((shot, index) => {
    const existing = bundleByShot.get(shot.id);
    const imagePrompt = ensureStyleLock(
      existing?.imagePrompt ||
        imageByShot.get(shot.id)?.prompt ||
        `vertical image frame for ${shot.visual}, unbranded abstract business documentary visuals`
    );
    const videoPrompt = ensureStyleLock(
      existing?.videoPrompt ||
        videoByShot.get(shot.id)?.prompt ||
        `vertical video movement for ${shot.visual}, ${shot.motion ?? cameraMotions[index % cameraMotions.length]}, unbranded abstract business documentary footage`
    );

    return {
      versionType: shot.versionType ?? "90s",
      shotNumber: shot.shotNumber ?? index + 1,
      shotId: shot.id,
      imagePrompt,
      videoPrompt,
      negativePrompt: ensureNegativePrompt(existing?.negativePrompt ?? imageByShot.get(shot.id)?.negativePrompt ?? videoByShot.get(shot.id)?.negativePrompt),
      styleLock: existing?.styleLock || visualStyleLock,
      aspectRatio: existing?.aspectRatio || "9:16",
      usageWarning: existing?.usageWarning || usageWarning
    };
  });

  return {
    imagePrompts: promptBundles.map((bundle) => ({
      id: `IMG-${bundle.shotId}`,
      sceneRef: bundle.shotId,
      prompt: bundle.imagePrompt,
      negativePrompt: bundle.negativePrompt,
      notes: `对应 ${bundle.versionType} #${bundle.shotNumber}，${usageWarning}`
    })),
    videoPrompts: promptBundles.map((bundle) => ({
      id: `VID-${bundle.shotId}`,
      sceneRef: bundle.shotId,
      prompt: bundle.videoPrompt,
      negativePrompt: bundle.negativePrompt,
      notes: `对应 ${bundle.versionType} #${bundle.shotNumber}，${usageWarning}`
    })),
    searchLeads:
      prompts.searchLeads.length > 0
        ? prompts.searchLeads
        : [
            {
              query: "abstract business documentary vertical footage royalty free",
              platform: "Pexels / Pixabay / Storyblocks",
              intendedUse: "寻找非特定公司、非新闻现场的抽象商业氛围素材。",
              licenseRequirement: "必须人工确认可商用、可二创和署名要求。"
            }
          ],
    promptBundles
  };
}

export function ensureRightsAlternatives(
  rightsChecks: RightsCheckResult[]
): RightsCheckResult[] {
  return rightsChecks.map((risk) => {
    if (risk.level !== "red") {
      return risk;
    }

    if (risk.replacementPlan?.trim() && hasReplacementAlternative(`${risk.action} ${risk.replacementPlan}`)) {
      return risk;
    }

    return {
      ...risk,
      action: hasReplacementAlternative(risk.action)
        ? risk.action
        : `${risk.action} ${defaultReplacementPlan}`,
      replacementPlan: defaultReplacementPlan
    };
  });
}

function normalizeVersionShots(
  storyboard: StoryboardResult,
  pack: ProductionPack,
  versionType: StoryboardVersionType
) {
  const targetCount = minimumShotsByVersion[versionType];
  const sourceLines = versionType === "90s"
    ? pack.scripts.video90s.lines
    : pack.scripts.video180s.lines;
  const explicitlyVersioned = storyboard.shots.filter(
    (shot) => shot.versionType === versionType
  );
  const sourceShots = explicitlyVersioned.length > 0 ? explicitlyVersioned : storyboard.shots;

  return Array.from({ length: targetCount }, (_, index) => {
    const shotNumber = index + 1;
    const sourceShot = sourceShots[index % Math.max(1, sourceShots.length)];
    const line = sourceLines[index % Math.max(1, sourceLines.length)] ?? sourceLines[0];
    const id = `${versionType === "90s" ? "S90" : "S180"}-${String(shotNumber).padStart(2, "0")}`;
    const scene = sourceShot?.scene || line?.visual || `${versionType} 第 ${shotNumber} 个节拍`;
    const narration = sourceShot?.voiceover || sourceShot?.narration || line?.narration || `${versionType} 第 ${shotNumber} 段旁白，承接核心观点。`;
    const motion = sourceShot?.motion || sourceShot?.camera || cameraMotions[index % cameraMotions.length];
    const composition = sourceShot?.composition || "竖屏中近景，信息卡与商业场景分层";
    const chartNeed = sourceShot?.chartNeed || line?.onScreenText || "自制信息图承载事实";
    const rightsLevel = normalizeRightsLevel(sourceShot?.rightsLevel ?? sourceShot?.copyrightRisk ?? (index % 11 === 0 ? "placeholder" : "green"));
    const replacementPlan = rightsLevel === "red"
      ? sourceShot?.replacementPlan || defaultReplacementPlan
      : sourceShot?.replacementPlan;

    return {
      id,
      timeRange: buildTimeRange(versionType, index),
      scene,
      narration,
      visual: ensureExecutableVisual(sourceShot?.visual || line?.visual || scene, scene, index),
      assetType: sourceShot && assetTypes.includes(sourceShot.assetType) ? sourceShot.assetType : index % 3 === 0 ? "chart" as const : index % 2 === 0 ? "ai-image" as const : "ai-video" as const,
      rightsLevel,
      versionType,
      shotNumber,
      beat: sourceShot?.beat || line?.onScreenText || `Beat ${shotNumber}`,
      duration: sourceShot?.duration || "3s",
      voiceover: narration,
      overlayText: sourceShot?.overlayText || line?.onScreenText || narration.slice(0, 18),
      camera: sourceShot?.camera || motion,
      composition,
      motion,
      visualType: sourceShot?.visualType || sourceShot?.assetType || "business-documentary",
      chartNeed,
      copyrightRisk: rightsLevel,
      replacementPlan
    };
  });
}

function buildTimeRange(versionType: StoryboardVersionType, index: number) {
  const seconds = index * 3;
  const end = Math.min(seconds + 3, versionType === "90s" ? 90 : 180);

  return `${formatSeconds(seconds)}-${formatSeconds(end)}`;
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ensureExecutableVisual(visual: string, scene: string, index: number) {
  const hasStructuredFields =
    visual.includes("主体：") &&
    visual.includes("场景：") &&
    visual.includes("镜头：") &&
    visual.includes("构图：");

  if (hasStructuredFields) {
    return visual;
  }

  const motion = cameraMotions[index % cameraMotions.length];
  const subject = extractSubject(visual, scene);

  return `主体：${subject}；场景：深色财经演播空间与抽象数据屏幕；镜头：${motion}；构图：竖屏中近景，人物剪影与信息图分层；图表：用字幕和自制信息卡承载事实，不出现可读品牌文字。`;
}

function ensureStyleLock(prompt: string) {
  return prompt.includes(visualStyleLock)
    ? prompt
    : `${visualStyleLock}, ${prompt}`;
}

function ensureNegativePrompt(value: string | undefined) {
  const existing = value?.trim();
  const terms = existing ? [existing] : [];

  for (const term of requiredNegativePromptTerms) {
    if (!terms.join(", ").toLowerCase().includes(term.toLowerCase())) {
      terms.push(term);
    }
  }

  return terms.join(", ");
}

function extractSubject(visual: string, scene: string) {
  const source = `${visual || scene}`.trim();

  return source ? source.slice(0, 42) : "抽象商业团队、数据屏幕和行业信息卡";
}

function normalizeRightsLevel(level: RightsRiskLevel): RightsRiskLevel {
  return rightsLevels.includes(level) ? level : "placeholder";
}

function hasReplacementAlternative(action: string) {
  return /替换|自制图表|抽象 AI 画面|placeholder/.test(action);
}
