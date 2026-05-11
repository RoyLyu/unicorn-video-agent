import { commonAiAgentRules } from "./common";

export function promptGeneratorPrompt() {
  return `${commonAiAgentRules}
任务：为分镜生成 AI 图像 prompt、AI 视频 prompt、negative prompt 和素材搜索线索。
Prompt 必须避免真实公司 Logo、真实新闻图、真实人物肖像和水印。
输出必须匹配 AssetPromptResult JSON。`;
}
