import { commonAiAgentRules } from "./common";

export function assetFinderPrompt() {
  return `${commonAiAgentRules}
任务：整理素材搜索线索和版权复核要求，不访问素材网站，不下载素材。
输出必须匹配 AssetFinderResult JSON。`;
}
