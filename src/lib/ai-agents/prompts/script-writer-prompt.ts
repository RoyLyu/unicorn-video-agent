import { commonAiAgentRules } from "./common";

export function scriptWriterPrompt() {
  return `${commonAiAgentRules}
任务：生成 90s 和 180s 两套视频号脚本，语气清晰、克制、适合财经解释。
输出必须匹配 ScriptResult JSON，必须同时包含 video90s 和 video180s。`;
}
