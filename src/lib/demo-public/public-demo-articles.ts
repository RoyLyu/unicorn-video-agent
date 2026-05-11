import type { ArticleInput } from "@/lib/schemas/production-pack";

export const publicDemoForbiddenTerms = [
  "Apple",
  "Tesla",
  "OpenAI",
  "字节跳动",
  "阿里巴巴",
  "腾讯",
  "小米",
  "瑞幸",
  "泡泡玛特",
  "真实 Logo",
  "真实新闻图",
  "招股书截图",
  "真实财务数据"
] as const;

export const publicDemoArticles: ArticleInput[] = [
  {
    title: "公开 Demo：虚构消费品牌禾光小食上市观察",
    rawText:
      "这是一篇公开演示用的模拟文章。禾光小食是一家虚构消费品牌，样例只展示如何把文章输入转成 mock 生产包、审阅记录和文本导出。文中行业指数、渠道表现和用户画像均为虚构演示数据，不对应任何真实公司、真实融资事件、真实新闻素材或真实招股书。",
    sourceUrl: "https://example.com/public-demo/fictional-snack-ipo",
    publishDate: "2026-05-09",
    sourceName: "公开 Demo 模拟稿",
    industryTags: ["消费品牌", "上市观察", "公开 Demo"],
    targetDurations: [90, 180]
  },
  {
    title: "公开 Demo：虚构家庭医疗公司云衡健康上市观察",
    rawText:
      "这是一篇公开演示用的模拟文章。云衡健康是一家虚构家庭医疗服务公司，样例用于展示 mock pipeline、Review 和 Export 的端到端流程。文中家庭健康需求、服务网点和行业热度均为虚构演示数据，不对应任何现实企业、外部图片或外部视频素材。",
    sourceUrl: "https://example.com/public-demo/fictional-home-health-ipo",
    publishDate: "2026-05-09",
    sourceName: "公开 Demo 模拟稿",
    industryTags: ["家庭医疗", "上市观察", "公开 Demo"],
    targetDurations: [90, 180]
  }
];
