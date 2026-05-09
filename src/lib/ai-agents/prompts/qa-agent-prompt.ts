import { commonAiAgentRules } from "./common";

export function qaAgentPrompt() {
  return `${commonAiAgentRules}
任务：基于全部中间输出生成版权风险检查和 QA summary。
QA 只能是结构检查和风险统计，不代表外部事实核验或法律意见。
输出必须匹配 QaAgentResult JSON。`;
}
