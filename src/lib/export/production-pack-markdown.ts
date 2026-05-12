import type { ProductionPack } from "@/lib/schemas/production-pack";
import type { ExportGenerationOptions } from "./export-types";
import {
  analyzeShotPromptAlignment,
  getPromptBundles
} from "@/lib/production-studio/shot-prompt-alignment";
import { formatRightsRiskMarkdownLine } from "@/lib/rights/rights-display";
import {
  investmentDisclaimer,
  markdownList,
  scriptLines,
  titleCandidates
} from "./export-utils";

export function generateProductionPackMarkdown(
  productionPack: ProductionPack,
  options: Pick<ExportGenerationOptions, "fallbackWarning" | "productionStudio"> = {}
) {
  const article = productionPack.articleInput;

  const warning = options.fallbackWarning
    ? "> 当前文件为 fallback/mock 结果，不可投入使用。\n\n"
    : "";
  const gate = options.productionStudio?.summary ?? analyzeShotPromptAlignment(productionPack);
  const needsFixLine = gate.needsFix
    ? "需要重跑 / 人工修正"
    : "pass";

  return `${warning}# ${article.title}

## 文章信息

- 来源：${article.sourceName}
- 链接：${article.sourceUrl}
- 发布日期：${article.publishDate}
- 行业标签：${article.industryTags.join(" / ")}
- 目标时长：${article.targetDurations.join("s / ")}s

## Shot / Prompt Gate Summary

- Shot Density Profile：${options.productionStudio?.densityProfile ?? gate.densityProfile}
- Production Studio Lock Status：${options.productionStudio?.lockStatus ?? "unlocked"}
- Last Gate Run Status：${options.productionStudio?.latestGateStatus ?? "not_run"}
- Edited Fields Count：${options.productionStudio?.editedCount ?? 0}
- 90s shot count：${gate.shotCount90s}
- 180s shot count：${gate.shotCount180s}
- prompt count：${gate.totalPrompts}
- 90s prompt count：${gate.promptCount90s}
- 180s prompt count：${gate.promptCount180s}
- alignment：${gate.unmatchedShots.length === 0 && gate.unmatchedPrompts.length === 0 ? "pass" : "fail"}
- red risk replacement gaps：${gate.redRisksWithoutReplacement.length}
- needsFix：${needsFixLine}
- prompt field completeness：${(gate.scores.promptFieldCompletenessScore ?? gate.scores.overallScore) >= 4 ? "pass" : "fail"}
- report field completeness：${gate.reportFieldCompleteness ?? "pass"}
- report completeness score：${gate.scores.reportCompletenessScore ?? gate.scores.overallScore}/5
${options.productionStudio?.lockStatus === "locked" ? "- lock：已锁定交付版本" : "- lock：未锁版，建议先完成 Production Studio 校验。"}
${gate.fixReasons.length ? gate.fixReasons.map((reason) => `- ${reason}`).join("\n") : "- 无需重跑。"}

## Shot Function Coverage

- shot_function_coverage_score：${gate.scores.shotFunctionCoverageScore}/5
- needsFix：${gate.scores.shotFunctionCoverageScore < 4 ? "需要重跑 / 人工修正：镜头功能分工不足" : "pass"}
- 90s function distribution：${formatCountMap(gate.distribution90s ?? gate.shotFunctionCounts)}
- 180s function distribution：${formatCountMap(gate.distribution180s ?? gate.shotFunctionCounts)}
- missingFunctions90s：${formatList(gate.missingFunctions90s)}
- missingFunctions180s：${formatList(gate.missingFunctions180s)}
- overRepeatedFunctions90s：${formatList(gate.overRepeatedFunctions90s)}
- overRepeatedFunctions180s：${formatList(gate.overRepeatedFunctions180s)}

## AIGC 制作总控

- Creative Concept：${productionPack.creativeDirection?.creativeConcept ?? "未提供"}
- Visual Metaphor：${productionPack.creativeDirection?.visualMetaphor ?? "未提供"}
- Main Visual Motif：${productionPack.creativeDirection?.mainVisualMotif ?? "未提供"}
- Narrative Device：${productionPack.creativeDirection?.narrativeDevice ?? "未提供"}
- Emotional Curve：${productionPack.creativeDirection?.emotionalCurve ?? "未提供"}
- Visual Progression：${productionPack.creativeDirection?.visualProgression ?? "未提供"}
- Audience Takeaway：${productionPack.creativeDirection?.audienceTakeaway ?? "未提供"}
- Production Notes：${productionPack.creativeDirection?.productionNotes ?? "未提供"}

## 视觉风格 Bible

- 画幅：${productionPack.visualStyleBible?.aspectRatio ?? "未提供"}
- 影像类型：${productionPack.visualStyleBible?.imageType ?? "未提供"}
- 色彩系统：
  - primaryColor：${productionPack.visualStyleBible?.colorSystem.primaryColor ?? "未提供"}
  - secondaryColor：${productionPack.visualStyleBible?.colorSystem.secondaryColor ?? "未提供"}
  - accentColor：${productionPack.visualStyleBible?.colorSystem.accentColor ?? "未提供"}
  - forbiddenColors：${formatList(productionPack.visualStyleBible?.colorSystem.forbiddenColors)}
- 光线系统：
  - contrast：${productionPack.visualStyleBible?.lightingSystem.contrast ?? "未提供"}
  - temperature：${productionPack.visualStyleBible?.lightingSystem.temperature ?? "未提供"}
  - keyLightDirection：${productionPack.visualStyleBible?.lightingSystem.keyLightDirection ?? "未提供"}
  - atmosphere：${productionPack.visualStyleBible?.lightingSystem.atmosphere ?? "未提供"}
- 材质系统：
  - metal：${productionPack.visualStyleBible?.materialSystem.metal ?? "未提供"}
  - glass：${productionPack.visualStyleBible?.materialSystem.glass ?? "未提供"}
  - dataParticles：${productionPack.visualStyleBible?.materialSystem.dataParticles ?? "未提供"}
  - paperProspectus：${productionPack.visualStyleBible?.materialSystem.paperProspectus ?? "未提供"}
  - screenUI：${productionPack.visualStyleBible?.materialSystem.screenUI ?? "未提供"}
  - otherMaterials：${formatList(productionPack.visualStyleBible?.materialSystem.otherMaterials)}
- 摄影质感：
  - realistic：${productionPack.visualStyleBible?.cameraTexture.realistic ?? "未提供"}
  - semiRealistic：${productionPack.visualStyleBible?.cameraTexture.semiRealistic ?? "未提供"}
  - motionGraphics：${productionPack.visualStyleBible?.cameraTexture.motionGraphics ?? "未提供"}
  - threeD：${productionPack.visualStyleBible?.cameraTexture.threeD ?? "未提供"}
- 字幕风格：
  - fontMood：${productionPack.visualStyleBible?.typographyStyle.fontMood ?? "未提供"}
  - placement：${productionPack.visualStyleBible?.typographyStyle.placement ?? "未提供"}
  - sizeRule：${productionPack.visualStyleBible?.typographyStyle.sizeRule ?? "未提供"}
  - motionRule：${productionPack.visualStyleBible?.typographyStyle.motionRule ?? "未提供"}
- 图表风格：
  - flat：${productionPack.visualStyleBible?.chartStyle.flat ?? "未提供"}
  - threeD：${productionPack.visualStyleBible?.chartStyle.threeD ?? "未提供"}
  - transparentHUD：${productionPack.visualStyleBible?.chartStyle.transparentHUD ?? "未提供"}
  - infoCard：${productionPack.visualStyleBible?.chartStyle.infoCard ?? "未提供"}
- 禁止项：${formatList(productionPack.visualStyleBible?.forbiddenElements)}

## 连续性 Bible

- Main Character Bible：${productionPack.continuityBible?.mainCharacterBible ?? "未提供"}
- Environment Bible：${productionPack.continuityBible?.environmentBible ?? "未提供"}
- Object Bible：${productionPack.continuityBible?.objectBible ?? "未提供"}
- Color Continuity：${productionPack.continuityBible?.colorContinuity ?? "未提供"}
- Motion Continuity：${productionPack.continuityBible?.motionContinuity ?? "未提供"}
- Graphic Continuity：${productionPack.continuityBible?.graphicContinuity ?? "未提供"}
- Typography Continuity：${productionPack.continuityBible?.typographyContinuity ?? "未提供"}
- Reference Frame Plan：${productionPack.continuityBible?.referenceFramePlan ?? "未提供"}

## Shot Function Summary

${Object.entries(gate.shotFunctionCounts ?? {})
  .map(([key, value]) => `- ${key}：${value}`)
  .join("\n")}

## Production Method Summary

${Object.entries(gate.productionMethodCounts ?? {})
  .map(([key, value]) => `- ${key}：${value}`)
  .join("\n")}

## Editing Structure Summary

- Editing readiness score：${gate.scores.editingReadinessScore ?? gate.scores.overallScore}/5
- 常用剪辑方式：${summarizeEditing(productionPack)}

## Prompt Completeness Summary

- Prompt field completeness score：${gate.scores.promptFieldCompletenessScore ?? gate.scores.overallScore}/5
- Prompt bundles：${gate.totalPrompts}

## 核心摘要

${productionPack.analysis.summary}

## 核心观点

${markdownList(productionPack.thesis.coreTheses)}

## 关键事实

${markdownList(productionPack.analysis.keyFacts)}

## 关键数字

${productionPack.analysis.industryData
  .map((item) => `- ${item.metric}：${item.value}（${item.note}）`)
  .join("\n")}

## 90s 脚本

### ${productionPack.scripts.video90s.title}

钩子：${productionPack.scripts.video90s.hook}

${scriptLines(productionPack.scripts.video90s)}

收束：${productionPack.scripts.video90s.closing}

## 180s 脚本

### ${productionPack.scripts.video180s.title}

钩子：${productionPack.scripts.video180s.hook}

${scriptLines(productionPack.scripts.video180s)}

收束：${productionPack.scripts.video180s.closing}

## 逐镜头 AIGC 制作表

${renderAigcShotBlocks(productionPack)}

## 版权风险与替代方案

${productionPack.rightsChecks
  .map(formatRightsRiskMarkdownLine)
  .join("\n")}

## 发布提示

- 推荐标题：${titleCandidates(productionPack)[0]}
- 发布前必须人工核验事实、素材授权和版权风险。
- ${investmentDisclaimer}
`;
}

function summarizeEditing(productionPack: ProductionPack) {
  const cutTypes = new Set(
    productionPack.storyboard.shots
      .map((shot) => shot.editing?.cutType)
      .filter(Boolean)
  );
  const paces = new Set(
    productionPack.storyboard.shots
      .map((shot) => shot.editing?.pace)
      .filter(Boolean)
  );

  return `cutType=${Array.from(cutTypes).join(" / ") || "未提供"}；pace=${Array.from(paces).join(" / ") || "未提供"}`;
}

function renderAigcShotBlocks(productionPack: ProductionPack) {
  const promptsByShot = new Map(
    getPromptBundles(productionPack).map((prompt) => [
      promptKey(prompt.versionType, prompt.shotNumber, prompt.shotId),
      prompt
    ])
  );

  return [...productionPack.storyboard.shots]
    .sort(compareShots)
    .map((shot) => {
      const versionType = shot.versionType ?? "90s";
      const shotNumber = shot.shotNumber ?? 0;
      const prompt = promptsByShot.get(promptKey(versionType, shotNumber, shot.id));
      const shotCode = shot.shotCode ?? prompt?.shotCode ?? shot.id;
      const editing = shot.editing;

      return `### ${shotCode} / ${shot.id}

- 镜头编号：${shotCode}
- 版本：${versionType}
- 时长：${shot.duration ?? prompt?.duration ?? shot.timeRange}
- Beat：${shot.beat ?? editing?.beat ?? ""}
- Shot Function：${shot.shotFunction ?? ""}
- 画面主体：${shot.subject ?? prompt?.subject ?? ""}
- 场景环境：${shot.environment ?? prompt?.environment ?? ""}
- 摄影机：${shot.camera ?? prompt?.camera ?? ""}
- 灯光：${shot.lighting ?? prompt?.lighting ?? ""}
- 风格：${shot.style ?? prompt?.style ?? ""}
- 构图：${shot.composition ?? ""}
- 运动：${shot.motion ?? ""}
- 画面文字：${shot.overlayText ?? shot.scene}
- 图表需求：${shot.chartNeed ?? ""}
- Production Method：${shot.productionMethod ?? ""}
- Method Reason：${shot.methodReason ?? ""}
- Continuity Assets：${formatList(shot.continuityAssets)}
- Cut Type：${editing?.cutType ?? ""}
- Transition Logic：${editing?.transitionLogic ?? ""}
- Screen Text Timing：${editing?.screenTextTiming ?? ""}
- Graphic Timing：${editing?.graphicTiming ?? ""}
- Music Cue：${editing?.musicCue ?? ""}
- SFX Cue：${editing?.sfxCue ?? ""}
- Pace：${editing?.pace ?? ""}
- Roll Type：${editing?.rollType ?? ""}
- Copyright Risk：${shot.copyrightRisk ?? shot.rightsLevel}
- Replacement Plan：${prompt?.replacementPlan ?? shot.replacementPlan ?? ""}
- Image Prompt：${prompt?.imagePrompt ?? ""}
- Video Prompt：${prompt?.videoPrompt ?? ""}
- Negative Prompt：${prompt?.negativePrompt ?? ""}
- Style Lock：${prompt?.styleLock ?? ""}
- Aspect Ratio：${prompt?.aspectRatio ?? ""}
- Usage Warning：${prompt?.usageWarning ?? ""}
- 禁止项：${formatList(prompt?.forbiddenElements) || prompt?.negativeConstraints || prompt?.negativePrompt || ""}`;
    })
    .join("\n\n");
}

function compareShots(
  a: ProductionPack["storyboard"]["shots"][number],
  b: ProductionPack["storyboard"]["shots"][number]
) {
  const aVersion = a.versionType ?? "90s";
  const bVersion = b.versionType ?? "90s";

  if (aVersion !== bVersion) {
    return aVersion === "90s" ? -1 : 1;
  }

  return (a.shotNumber ?? 0) - (b.shotNumber ?? 0);
}

function promptKey(versionType: string, shotNumber: number, shotId: string) {
  return `${versionType}:${shotNumber}:${shotId}`;
}

function formatList(values?: string[]) {
  return values?.length ? values.join(" / ") : "未提供";
}

function formatCountMap(values?: Record<string, number>) {
  if (!values) {
    return "未提供";
  }

  const entries = Object.entries(values).filter(([, value]) => value > 0);

  return entries.length
    ? entries.map(([key, value]) => `${key}:${value}`).join(" / ")
    : "未提供";
}
