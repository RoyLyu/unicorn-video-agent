import type { ProductionPack } from "@/lib/schemas/production-pack";
import type { ExportGenerationOptions } from "./export-types";
import { analyzeShotPromptAlignment } from "@/lib/production-studio/shot-prompt-alignment";
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
${options.productionStudio?.lockStatus === "locked" ? "- lock：已锁定交付版本" : "- lock：未锁版，建议先完成 Production Studio 校验。"}
${gate.fixReasons.length ? gate.fixReasons.map((reason) => `- ${reason}`).join("\n") : "- 无需重跑。"}

## Creative Direction

- Creative Concept：${productionPack.creativeDirection?.creativeConcept ?? "未提供"}
- Visual Metaphor：${productionPack.creativeDirection?.visualMetaphor ?? "未提供"}
- Main Visual Motif：${productionPack.creativeDirection?.mainVisualMotif ?? "未提供"}
- Narrative Device：${productionPack.creativeDirection?.narrativeDevice ?? "未提供"}
- Emotional Curve：${productionPack.creativeDirection?.emotionalCurve ?? "未提供"}
- Visual Progression：${productionPack.creativeDirection?.visualProgression ?? "未提供"}
- Audience Takeaway：${productionPack.creativeDirection?.audienceTakeaway ?? "未提供"}
- Production Notes：${productionPack.creativeDirection?.productionNotes ?? "未提供"}

## Visual Style Bible

- Aspect Ratio：${productionPack.visualStyleBible?.aspectRatio ?? "未提供"}
- Image Type：${productionPack.visualStyleBible?.imageType ?? "未提供"}
- Color System：${productionPack.visualStyleBible ? `${productionPack.visualStyleBible.colorSystem.primaryColor} / ${productionPack.visualStyleBible.colorSystem.secondaryColor} / ${productionPack.visualStyleBible.colorSystem.accentColor}` : "未提供"}
- Lighting：${productionPack.visualStyleBible ? `${productionPack.visualStyleBible.lightingSystem.contrast} / ${productionPack.visualStyleBible.lightingSystem.temperature} / ${productionPack.visualStyleBible.lightingSystem.atmosphere}` : "未提供"}
- Forbidden Elements：${productionPack.visualStyleBible?.forbiddenElements.join(" / ") ?? "未提供"}

## Continuity Bible

- Character：${productionPack.continuityBible?.mainCharacterBible ?? "未提供"}
- Environment：${productionPack.continuityBible?.environmentBible ?? "未提供"}
- Objects：${productionPack.continuityBible?.objectBible ?? "未提供"}
- Color：${productionPack.continuityBible?.colorContinuity ?? "未提供"}
- Motion：${productionPack.continuityBible?.motionContinuity ?? "未提供"}
- Graphics：${productionPack.continuityBible?.graphicContinuity ?? "未提供"}
- Typography：${productionPack.continuityBible?.typographyContinuity ?? "未提供"}
- Reference Frames：${productionPack.continuityBible?.referenceFramePlan ?? "未提供"}

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

## 分镜概览

${productionPack.storyboard.shots
  .map(
    (shot) =>
      `- ${shot.id} ${shot.timeRange}：${shot.scene} / ${shot.visual} / ${shot.rightsLevel}`
  )
  .join("\n")}

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
