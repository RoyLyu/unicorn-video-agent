import type { ProductionPack } from "@/lib/schemas/production-pack";
import type { PublishCopyExportData } from "./export-types";
import {
  investmentDisclaimer,
  markdownList,
  titleCandidates
} from "./export-utils";

export function generatePublishCopyMarkdown(
  productionPack: ProductionPack,
  publishCopy?: PublishCopyExportData
) {
  const titles = publishCopy?.titleCandidates ?? titleCandidates(productionPack);
  const tags = publishCopy
    ? publishCopy.tags.map((tag) => `#${tag.replace(/^#/, "")}`)
    : productionPack.articleInput.industryTags.map((tag) => `#${tag}`);
  const coverTitle =
    publishCopy?.coverTitle ??
    `${productionPack.articleInput.industryTags[0] ?? "财经"}新信号`;
  const publishText =
    publishCopy?.publishText ??
    `${productionPack.analysis.summary}\n\n${productionPack.thesis.audienceTakeaway}`;
  const riskNotice = publishCopy?.riskNotice ?? investmentDisclaimer;

  return `# Publish Copy

## 视频号标题候选

${markdownList(titles)}

## 封面标题

${coverTitle}

## 发布文案

${publishText}

## 标签建议

${tags.join(" ")} #独角兽早知道 #财经短视频

## 风险提示

- 发布前必须人工核验文章事实、素材授权和版权风险。
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体。
- ${riskNotice}
`;
}
