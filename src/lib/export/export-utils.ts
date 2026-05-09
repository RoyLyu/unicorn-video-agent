import type { ProductionPack } from "@/lib/schemas/production-pack";

export const investmentDisclaimer =
  "本内容仅用于财经信息整理和视频号生产包准备，不构成投资建议。";

export function csvRow(values: Array<string | number | boolean | null | undefined>) {
  return values.map(csvCell).join(",");
}

export function csvCell(value: string | number | boolean | null | undefined) {
  const text = value == null ? "" : String(value);
  const escaped = text.replace(/"/g, "\"\"");

  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function markdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function scriptLines(
  script: ProductionPack["scripts"]["video90s"] | ProductionPack["scripts"]["video180s"]
) {
  return script.lines
    .map(
      (line) =>
        `- ${line.timeRange}：${line.narration}\n  - 画面：${line.visual}\n  - 屏幕文字：${line.onScreenText}`
    )
    .join("\n");
}

export function titleCandidates(productionPack: ProductionPack) {
  const title = productionPack.articleInput.title;
  const mainTag = productionPack.articleInput.industryTags[0] ?? "财经";
  const thesis = productionPack.thesis.coreTheses[0] ?? productionPack.thesis.videoAngle;

  return [
    `${title}，释放了什么行业信号？`,
    `一篇文章看懂${mainTag}的新变化`,
    `${mainTag}为什么值得继续观察？`,
    `从融资叙事到视频号脚本：${title}`,
    thesis.length > 28 ? `${thesis.slice(0, 28)}...` : thesis
  ];
}
