import type { AgentDefinition } from "./agent-run-types";

export const agentDefinitions: AgentDefinition[] = [
  {
    slug: "article-analyst",
    name: "Article Analyst",
    role: "文章分析",
    description: "解析文章输入，生成摘要、关键事实、行业数据和风险点。",
    requiredContext: ["ArticleInput"],
    inputSchemaSummary: "ArticleInput: title, rawText, sourceUrl, publishDate, sourceName, industryTags, targetDurations",
    outputSchemaSummary: "AnalysisResult: summary, keyFacts, industryData, risks",
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: ["正文非空", "行业标签存在", "关键事实可被人工复核"]
  },
  {
    slug: "thesis-agent",
    name: "Thesis Agent",
    role: "观点提炼",
    description: "基于分析结果提炼核心观点、视频角度和观众收获。",
    requiredContext: ["ArticleInput", "AnalysisResult"],
    inputSchemaSummary: "ArticleInput + AnalysisResult",
    outputSchemaSummary: "ThesisResult: coreTheses, videoAngle, audienceTakeaway",
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: ["核心观点存在", "观点不编造真实融资金额", "结论保留风险边界"]
  },
  {
    slug: "script-writer",
    name: "Script Writer",
    role: "脚本写作",
    description: "生成 90s 和 180s 两套视频号脚本。",
    requiredContext: ["ArticleInput", "ThesisResult"],
    inputSchemaSummary: "ArticleInput + ThesisResult",
    outputSchemaSummary: "ScriptResult: video90s, video180s",
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: ["90s 脚本存在", "180s 脚本存在", "脚本包含不接真实 AI 的边界提示"]
  },
  {
    slug: "storyboard-agent",
    name: "Storyboard Agent",
    role: "分镜设计",
    description: "把脚本拆成分镜镜号、旁白、画面和素材类型。",
    requiredContext: ["ArticleInput", "ScriptResult"],
    inputSchemaSummary: "ArticleInput + ScriptResult",
    outputSchemaSummary: "StoryboardResult: shots[]",
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: ["分镜数量大于 0", "每个分镜有素材类型", "版权风险等级可显示"]
  },
  {
    slug: "prompt-generator",
    name: "Prompt Generator",
    role: "素材 Prompt",
    description: "生成 AI 图像 Prompt、AI 视频 Prompt 和负向提示词。",
    requiredContext: ["ArticleInput", "StoryboardResult"],
    inputSchemaSummary: "ArticleInput + StoryboardResult",
    outputSchemaSummary: "AssetPromptResult: imagePrompts, videoPrompts, searchLeads",
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: ["Prompt 不包含真实品牌指令", "negativePrompt 排除新闻图和水印", "9:16 竖屏语境清晰"]
  },
  {
    slug: "asset-finder",
    name: "Asset Finder",
    role: "素材线索",
    description: "整理素材搜索线索和授权复核要求，不下载任何外部素材。",
    requiredContext: ["AssetPromptResult.searchLeads"],
    inputSchemaSummary: "SearchLead[]: query, platform, intendedUse, licenseRequirement",
    outputSchemaSummary: "SearchLead[] review summary",
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: ["只保存搜索线索", "不下载素材", "授权要求必须人工确认"]
  },
  {
    slug: "qa-agent",
    name: "QA Agent",
    role: "确定性 QA",
    description: "对事实、脚本、版权、导出和发布提示做本地 deterministic QA。",
    requiredContext: ["ProductionPack draft", "RightsCheckResult[]"],
    inputSchemaSummary: "ProductionPack draft + rights checks",
    outputSchemaSummary: "AgentQaSummary + final rightsChecks",
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: ["统计 red rights risk", "确认 90s/180s 脚本", "确认 6 个导出文件", "确认不构成投资建议"]
  }
];

export const agentDefinitionBySlug = new Map(
  agentDefinitions.map((agent) => [agent.slug, agent])
);
