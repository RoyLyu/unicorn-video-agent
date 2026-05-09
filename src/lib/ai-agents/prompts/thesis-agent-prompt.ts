import { commonAiAgentRules } from "./common";

export function thesisAgentPrompt() {
  return `${commonAiAgentRules}
任务：基于文章分析提炼核心观点、视频角度和观众收获。
输出必须匹配 ThesisResult JSON。`;
}
