import type { AnalysisResult, ArticleInput } from "../schemas/production-pack";

export function analyzeArticle(input: ArticleInput): AnalysisResult {
  const tags = input.industryTags.join(" / ");

  return {
    summary: `这篇 mock 文章围绕「${input.title}」展开，适合拆成一个关于 ${tags} 的视频号生产包。`,
    keyFacts: [
      `文章来源：${input.sourceName}`,
      `发布日期：${input.publishDate}`,
      `行业标签：${tags}`,
      "正文由用户手动输入，系统不抓取公众号全文。"
    ],
    industryData: [
      { metric: "内容类型", value: "财经解释型短视频", note: "面向微信视频号" },
      {
        metric: "目标时长",
        value: input.targetDurations.map((duration) => `${duration}s`).join(" / "),
        note: "Batch 02 会补齐 90s 和 180s 两套脚本用于页面展示。"
      },
      {
        metric: "素材策略",
        value: "自制图表 + 授权素材",
        note: "不使用未确认版权的新闻图或视频片段。"
      }
    ],
    risks: [
      "mock 输出不能当作真实 AI 结论发布。",
      "融资金额、投资方和客户名称必须在真实流程中人工核验。",
      "素材搜索线索不等同于已授权素材。"
    ]
  };
}
