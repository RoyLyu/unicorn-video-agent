import type { ProductionPack } from "@/lib/schemas/production-pack";
import {
  investmentDisclaimer,
  markdownList,
  scriptLines,
  titleCandidates
} from "./export-utils";

export function generateProductionPackMarkdown(productionPack: ProductionPack) {
  const article = productionPack.articleInput;

  return `# ${article.title}

## 文章信息

- 来源：${article.sourceName}
- 链接：${article.sourceUrl}
- 发布日期：${article.publishDate}
- 行业标签：${article.industryTags.join(" / ")}
- 目标时长：${article.targetDurations.join("s / ")}s

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

## 版权风险摘要

${productionPack.rightsChecks
  .map((risk) => `- ${risk.level}：${risk.item}。${risk.action}`)
  .join("\n")}

## 发布提示

- 推荐标题：${titleCandidates(productionPack)[0]}
- 发布前必须人工核验事实、素材授权和版权风险。
- ${investmentDisclaimer}
`;
}
