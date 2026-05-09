import type {
  AssetPromptResult,
  RightsCheckResult,
  StoryboardResult
} from "../schemas/production-pack";

export function checkRightsRisks(
  storyboard: StoryboardResult,
  prompts: AssetPromptResult
): RightsCheckResult[] {
  return [
    {
      item: storyboard.shots[0]?.visual ?? "自制标题卡",
      level: "green",
      reason: "自制 UI 和文本画面，不含第三方素材。",
      action: "可用于 mock 展示，进入真实剪辑前保留源文件。"
    },
    {
      item: prompts.searchLeads[0]?.query ?? "开放素材搜索线索",
      level: "yellow",
      reason: "搜索线索可能指向有署名、商用或二创限制的素材。",
      action: "下载或剪辑前必须人工确认平台授权。"
    },
    {
      item: "真实新闻配图或融资现场照片",
      level: "red",
      reason: "版权归属不明，不能默认用于视频号。",
      action: "替换为自制图表或取得明确授权。"
    },
    {
      item: prompts.imagePrompts[0]?.id ?? "AI 图像 Prompt",
      level: "placeholder",
      reason: "Batch 02 不生成真实图片，Prompt 只是占位。",
      action: "后续生成后再做相似性和版权复核。"
    }
  ];
}
