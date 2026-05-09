import { commonAiAgentRules } from "./common";

export function articleAnalystPrompt() {
  return `${commonAiAgentRules}
任务：分析公众号财经文章，输出摘要、关键事实、行业数据和风险点。
输出必须匹配 AnalysisResult JSON。`;
}
