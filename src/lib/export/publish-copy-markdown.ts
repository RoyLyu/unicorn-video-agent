import type { ProductionPack } from "@/lib/schemas/production-pack";
import {
  investmentDisclaimer,
  markdownList,
  titleCandidates
} from "./export-utils";

export function generatePublishCopyMarkdown(productionPack: ProductionPack) {
  const titles = titleCandidates(productionPack);
  const tags = productionPack.articleInput.industryTags.map((tag) => `#${tag}`);

  return `# Publish Copy

## 视频号标题候选

${markdownList(titles)}

## 封面标题

${productionPack.articleInput.industryTags[0] ?? "财经"}新信号

## 发布文案

${productionPack.analysis.summary}

${productionPack.thesis.audienceTakeaway}

## 标签建议

${tags.join(" ")} #独角兽早知道 #财经短视频

## 风险提示

- 发布前必须人工核验文章事实、素材授权和版权风险。
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体。
- ${investmentDisclaimer}
`;
}
