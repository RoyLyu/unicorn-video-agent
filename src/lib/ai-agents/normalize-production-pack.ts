import {
  ProductionPackSchema,
  type AssetPromptResult,
  type ProductionPack,
  type RightsCheckResult,
  type RightsRiskLevel,
  type StoryboardResult
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
  const sourceLines = pack.scripts.video90s.lines;
  const shots = [...storyboard.shots];

  while (shots.length < 8) {
    const index = shots.length;
    const line = sourceLines[index % sourceLines.length] ?? sourceLines[0];
    const id = `S${String(index + 1).padStart(2, "0")}`;

    shots.push({
      id,
      timeRange: line?.timeRange ?? `00:${String(index * 10).padStart(2, "0")}-00:${String(index * 10 + 10).padStart(2, "0")}`,
      scene: line?.visual || `第 ${index + 1} 段观点视觉化`,
      narration: line?.narration || `第 ${index + 1} 段旁白，承接核心观点。`,
      visual: line?.visual || "行业数据与观点摘要",
      assetType: index % 2 === 0 ? "ai-image" : "ai-video",
      rightsLevel: index % 3 === 0 ? "placeholder" : "green"
    });
  }

  return {
    shots: shots.slice(0, Math.max(shots.length, 8)).map((shot, index) => ({
      ...shot,
      id: shot.id || `S${String(index + 1).padStart(2, "0")}`,
      scene: shot.scene || `第 ${index + 1} 段观点视觉化`,
      visual: ensureExecutableVisual(shot.visual, shot.scene, index),
      assetType: assetTypes.includes(shot.assetType) ? shot.assetType : "ai-image",
      rightsLevel: normalizeRightsLevel(shot.rightsLevel)
    }))
  };
}

export function ensurePromptCoverage(
  prompts: AssetPromptResult,
  storyboard: StoryboardResult
): AssetPromptResult {
  const imageByShot = new Map(prompts.imagePrompts.map((prompt) => [prompt.sceneRef, prompt]));
  const videoByShot = new Map(prompts.videoPrompts.map((prompt) => [prompt.sceneRef, prompt]));

  return {
    imagePrompts: storyboard.shots.map((shot) => {
      const existing = imageByShot.get(shot.id);

      return {
        id: existing?.id || `IMG-${shot.id}`,
        sceneRef: shot.id,
        prompt: ensureStyleLock(
          existing?.prompt ||
            `vertical image frame for ${shot.visual}, unbranded abstract business documentary visuals`
        ),
        negativePrompt: ensureNegativePrompt(existing?.negativePrompt),
        notes: existing?.notes || `对应 ${shot.id}，只作为后续图像生成提示，不代表已生成素材。`
      };
    }),
    videoPrompts: storyboard.shots.map((shot) => {
      const existing = videoByShot.get(shot.id);

      return {
        id: existing?.id || `VID-${shot.id}`,
        sceneRef: shot.id,
        prompt: ensureStyleLock(
          existing?.prompt ||
            `vertical video movement for ${shot.visual}, ${cameraMotions[Number(shot.id.slice(1)) % cameraMotions.length]}, unbranded abstract business documentary footage`
        ),
        negativePrompt: ensureNegativePrompt(existing?.negativePrompt),
        notes: existing?.notes || `对应 ${shot.id}，只作为后续视频生成提示，不代表已生成素材。`
      };
    }),
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
          ]
  };
}

export function ensureRightsAlternatives(
  rightsChecks: RightsCheckResult[]
): RightsCheckResult[] {
  return rightsChecks.map((risk) => {
    if (risk.level !== "red" || hasReplacementAlternative(risk.action)) {
      return risk;
    }

    return {
      ...risk,
      action: `${risk.action} 替换为自制图表、抽象 AI 画面或 placeholder 复核项，不使用真实素材。`
    };
  });
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
