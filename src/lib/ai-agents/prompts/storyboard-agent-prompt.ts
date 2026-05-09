import { commonAiAgentRules } from "./common";

export function storyboardAgentPrompt() {
  return `${commonAiAgentRules}
任务：把脚本拆成竖屏视频号分镜，描述画面、旁白、素材类型和初始版权风险。
输出必须匹配 StoryboardResult JSON。`;
}
