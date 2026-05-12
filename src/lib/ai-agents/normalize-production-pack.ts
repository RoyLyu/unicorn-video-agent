import {
  ProductionPackSchema,
  type AssetPromptResult,
  type ProductionPack,
  type ProductionMethod,
  type RightsCheckResult,
  type RightsRiskLevel,
  type ShotFunction,
  type StoryboardResult,
  type StoryboardVersionType
} from "@/lib/schemas/production-pack";

import {
  requiredNegativePrompt,
  visualStyleLock
} from "./prompts/single-pack-production-prompt";
import {
  getShotDensitySpec,
  type ShotDensityProfile
} from "@/lib/production-studio/density-profile";

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
const defaultReplacementPlan =
  "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项，不使用真实素材。";
const usageWarning =
  "仅作为后续素材生成提示，不代表已生成素材；不得生成真实 Logo、新闻图、创始人肖像、招股书截图或可读品牌文字。";
const forbiddenElements = [
  "no real logo",
  "no readable brand name",
  "no news screenshot",
  "no fake signage",
  "no garbled text",
  "no real founder portrait unless licensed"
];
const shotFunctionPattern90: ShotFunction[] = [
  "hook_shot",
  "context_shot",
  "evidence_shot",
  "concept_shot",
  "data_shot",
  "risk_shot",
  "summary_shot"
];
const shotFunctionPattern180: ShotFunction[] = [
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
const productionMethodPattern: ProductionMethod[] = [
  "text_to_video",
  "image_to_video",
  "text_to_image_edit",
  "motion_graphics",
  "manual_design",
  "compositing",
  "stock_footage"
];

export function normalizeProductionPack(
  pack: ProductionPack,
  densityProfile: ShotDensityProfile = "standard"
): ProductionPack {
  const storyboard = ensureStoryboardMinimumShots(pack.storyboard, pack, densityProfile);
  const assetPrompts = ensurePromptCoverage(pack.assetPrompts, storyboard);
  const rightsChecks = ensureRightsAlternatives(pack.rightsChecks);

  return ProductionPackSchema.parse({
    ...pack,
    creativeDirection: pack.creativeDirection ?? buildCreativeDirection(pack),
    visualStyleBible: pack.visualStyleBible ?? buildVisualStyleBible(),
    continuityBible: pack.continuityBible ?? buildContinuityBible(),
    storyboard,
    assetPrompts,
    rightsChecks
  });
}

export function ensureStoryboardMinimumShots(
  storyboard: StoryboardResult,
  pack: ProductionPack,
  densityProfile: ShotDensityProfile = "standard"
): StoryboardResult {
  return {
    shots: [
      ...normalizeVersionShots(storyboard, pack, "90s", densityProfile),
      ...normalizeVersionShots(storyboard, pack, "180s", densityProfile)
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
      shotCode: shot.shotCode ?? shot.id,
      duration: shot.duration ?? shot.timeRange,
      subject: shot.subject ?? extractSubject(shot.visual, shot.scene),
      environment: shot.environment ?? "vertical premium finance documentary space",
      camera: shot.camera ?? shot.motion ?? "slow push-in",
      lighting: shot.lighting ?? "low saturation, soft contrast, natural lighting",
      style: shot.style ?? "cinematic business documentary style",
      imagePrompt,
      videoPrompt,
      negativePrompt: ensureNegativePrompt(existing?.negativePrompt ?? imageByShot.get(shot.id)?.negativePrompt ?? videoByShot.get(shot.id)?.negativePrompt),
      styleLock: existing?.styleLock || visualStyleLock,
      aspectRatio: existing?.aspectRatio || "9:16",
      usageWarning: existing?.usageWarning || usageWarning,
      negativeConstraints: existing?.negativeConstraints || requiredNegativePrompt,
      forbiddenElements: existing?.forbiddenElements?.length ? existing.forbiddenElements : forbiddenElements,
      replacementPlan: existing?.replacementPlan || shot.replacementPlan || (shot.rightsLevel === "red" ? defaultReplacementPlan : "使用自制图表、抽象 AI 商业画面或已授权素材。")
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
  versionType: StoryboardVersionType,
  densityProfile: ShotDensityProfile
) {
  const densitySpec = getShotDensitySpec(densityProfile);
  const targetCount = versionType === "90s" ? densitySpec.min90s : densitySpec.min180s;
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
    const shotFunction = sourceShot?.shotFunction || shotFunctionFor(versionType, index);
    const productionMethod = sourceShot?.productionMethod || productionMethodFor(index, sourceShot?.assetType);
    const subject = sourceShot?.subject || extractSubject(sourceShot?.visual || line?.visual || scene, scene);
    const environment = sourceShot?.environment || "深色财经演播空间、抽象城市与数据屏幕的竖屏场景";
    const lighting = sourceShot?.lighting || "低饱和冷色主光，银色数据高光，柔和对比";
    const style = sourceShot?.style || "商业纪录片、科技财经、写实动效混合";

    return {
      id,
      shotCode: id,
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
      replacementPlan,
      shotFunction,
      productionMethod,
      methodReason: sourceShot?.methodReason || methodReasonFor(productionMethod),
      subject,
      environment,
      lighting,
      style,
      continuityAssets: sourceShot?.continuityAssets?.length
        ? sourceShot.continuityAssets
        : ["dark finance studio", "silver data particles", "transparent HUD card"],
      editing: sourceShot?.editing ?? {
        beat: sourceShot?.beat || line?.onScreenText || `Beat ${shotNumber}`,
        cutType: index % 5 === 0 ? "graphic_match" as const : index % 3 === 0 ? "match_cut" as const : "hard_cut" as const,
        transitionLogic: "以前一镜头的信息卡或数据运动方向衔接下一镜头。",
        screenTextTiming: "旁白关键词出现后 0.3 秒弹出，停留 1.5 秒。",
        graphicTiming: "镜头中段进入图表卡片，结尾淡出。",
        musicCue: index % 8 === 0 ? "节拍抬升，进入新段落。" : "保持低频脉冲与轻微推进。",
        sfxCue: "信息卡出现时使用轻微 whoosh 与 data tick。",
        pace: versionType === "90s" ? "fast" as const : index % 4 === 0 ? "slow" as const : "medium" as const,
        rollType: sourceShot?.assetType === "chart" ? "graphic_roll" as const : index % 6 === 0 ? "transition_roll" as const : "b_roll" as const
      }
    };
  });
}

function buildCreativeDirection(pack: ProductionPack) {
  const title = pack.articleInput.title;
  const tags = pack.articleInput.industryTags.join(" / ");

  return {
    creativeConcept: `用竖屏商业纪录片语言解释「${title}」的核心机会与风险。`,
    visualMetaphor: "用银色数据流穿过城市、货架和信息卡，隐喻资本、产业和品牌能力的流动。",
    mainVisualMotif: "深色空间中的透明 HUD 信息卡、银色数据粒子和抽象商业场景。",
    narrativeDevice: "从问题钩子进入行业背景，再用证据、概念图、风险提示和结论推进。",
    emotionalCurve: "开头制造问题感，中段建立判断和证据，结尾收束到审慎机会。",
    visualProgression: "画面从抽象标题卡发展到行业数据空间，再进入风险复核和结论卡。",
    audienceTakeaway: `观众应记住 ${tags} 相关机会需要事实核验、版权复核和投资风险意识。`,
    productionNotes: "事实信息由字幕和自制图表承载，AI 画面只负责无品牌商业纪录片氛围。"
  };
}

function buildVisualStyleBible() {
  return {
    aspectRatio: "9:16 vertical",
    imageType: "商业纪录片 / 科技财经 / 超现实信息图",
    colorSystem: {
      primaryColor: "dark navy",
      secondaryColor: "silver",
      accentColor: "cold cyan",
      forbiddenColors: ["neon rainbow", "high saturation purple", "brand-specific colors"]
    },
    lightingSystem: {
      contrast: "soft contrast",
      temperature: "cool neutral",
      keyLightDirection: "45-degree top side light",
      atmosphere: "premium consulting video atmosphere"
    },
    materialSystem: {
      metal: "brushed silver edges",
      glass: "transparent HUD glass cards",
      dataParticles: "subtle silver data particles",
      paperProspectus: "abstract unbranded paper stack",
      screenUI: "non-readable finance dashboard UI",
      otherMaterials: ["matte black desk", "soft haze", "abstract product silhouettes"]
    },
    cameraTexture: {
      realistic: "realistic business documentary footage",
      semiRealistic: "semi-realistic AI b-roll",
      motionGraphics: "clean financial motion graphics",
      threeD: "minimal 3D data objects"
    },
    typographyStyle: {
      fontMood: "clean financial sans-serif",
      placement: "upper third and center-safe vertical composition",
      sizeRule: "large keywords, small explanatory captions",
      motionRule: "short slide-in, fade-out, no jitter"
    },
    chartStyle: {
      flat: "flat information cards",
      threeD: "subtle 3D bars only when needed",
      transparentHUD: "transparent HUD overlays",
      infoCard: "dark card with silver border"
    },
    forbiddenElements
  };
}

function buildContinuityBible() {
  return {
    mainCharacterBible: "no recurring human presenter; only anonymous silhouettes when needed",
    environmentBible: "dark finance studio, abstract city, port, shelf and data space share the same navy/silver lighting",
    objectBible: "transparent HUD card, abstract prospectus paper, data sphere and chart card recur across sections",
    colorContinuity: "navy background with silver data highlights throughout, cyan only for emphasis",
    motionContinuity: "slow push-in, data stream direction and graphic match transitions repeat between beats",
    graphicContinuity: "all charts use transparent HUD cards and silver grid lines",
    typographyContinuity: "keywords use the same financial sans-serif, large top-safe placement",
    referenceFramePlan: "generate or select one key reference frame per segment: title, context, evidence, risk and summary"
  };
}

function shotFunctionFor(versionType: StoryboardVersionType, index: number): ShotFunction {
  const pattern = versionType === "90s" ? shotFunctionPattern90 : shotFunctionPattern180;

  return pattern[index % pattern.length];
}

function productionMethodFor(index: number, assetType: StoryboardResult["shots"][number]["assetType"] | undefined): ProductionMethod {
  if (assetType === "chart" || assetType === "screen") {
    return "motion_graphics";
  }
  if (assetType === "stock") {
    return "stock_footage";
  }

  return productionMethodPattern[index % productionMethodPattern.length];
}

function methodReasonFor(method: ProductionMethod) {
  const reasons: Record<ProductionMethod, string> = {
    text_to_video: "适合抽象商业氛围、城市空间和运动镜头。",
    image_to_video: "适合保持主体和风格稳定后做轻微运动。",
    text_to_image_edit: "适合信息图、海报、图表卡片和局部编辑。",
    motion_graphics: "适合数据图、路径图、结构图和 HUD 信息卡。",
    stock_footage: "适合真实港口、城市或消费场景，但必须进入版权候选池。",
    manual_design: "适合字幕、图表、Logo 替代和风险提示。",
    compositing: "适合 AI 背景、人工 UI 和字幕叠加合成。"
  };

  return reasons[method];
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
