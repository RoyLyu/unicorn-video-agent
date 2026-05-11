# 05 Agent Contracts

## 当前状态

Batch 08 接入真实 AI 文本 Agent pipeline。本文件定义本地 mock Agent、真实 AI Agent、Agent 管理层、ProductionPack、文本导出、审阅记录和公开 demo 数据的输入输出边界。

## Article Input Contract

输入应符合 `ArticleInputSchema`：

- `title`
- `rawText`
- `sourceUrl`
- `publishDate`
- `sourceName`
- `industryTags`
- `targetDurations`

## Production Package Contract

Batch 05 的生成源数据仍应符合 `ProductionPackSchema`，包括：

- `analysis`
- `thesis`
- `scripts`
- `storyboard`
- `assetPrompts`
- `rightsChecks`
- `exportManifest`

## Batch 07 Agent Registry Contract

`src/lib/agents/agent-definitions.ts` 是 Agent 注册表的代码源。每个 Agent 必须包含 slug、name、role、description、requiredContext、输入/输出 schema 摘要、`currentMode: mock`、`futureMode: real_ai_pending` 和 qaChecklist。

## Batch 08 AI Agent Contract

`src/lib/ai-agents/run-ai-pipeline.ts` 是真实 AI pipeline 入口。每个 AI Agent 必须接收明确 JSON input，返回明确 JSON output，并通过对应 Zod schema 校验。OpenAI API key 只允许在 server-side AI 模块和 API route 中读取，不允许客户端组件读取。

AI Agent 执行顺序固定为：

1. Article Analyst
2. Thesis Agent
3. Script Writer
4. Storyboard Agent
5. Prompt Generator
6. Asset Finder
7. QA Agent

单个 AI Agent 失败或 schema 不通过时，该 step 必须记录 `completed_with_fallback`，并使用对应 mock 输出继续。AI 配置缺失时，整条 AI route 仍创建 agent run，并以 mock 输出完成 ProductionPack。

## Mock Pipeline Tracking Contract

`src/lib/mock-pipeline/*` 中的每个 mock agent 继续保持纯函数。Batch 07/08 的 tracked runner 负责调用这些纯函数，并把 agent run、step、input/output JSON、context snapshot 和 QA result 写入 SQLite。素材下载、AI 生图、生视频、TTS 或外部事实核验都不允许进入 Batch 08。

## Export Contract

`src/lib/export/*` 中的导出函数必须是纯函数。它们只接收 `ProductionPack`，返回 Markdown、CSV 或 JSON 字符串，不读写文件、不调用外部 API、不访问数据库。数据库读取只发生在导出 API route 中。

## Review Contract

审阅记录只来自人工编辑和本地表单提交。`fact_checks.status` 只能是 `pending`、`verified`、`needs_review`、`rejected`。发布文案导出优先使用 `publish_copies` 中的人工编辑内容，没有人工内容时回退到确定性派生文案。

## Public Demo Contract

公开 demo 数据必须来自虚构文章输入，项目写入 SQLite 时必须标记 `is_demo = true`。Demo reset 只允许删除并重建 demo 项目，不允许删除普通 mock 项目，不调用外部 API，不生成真实素材。

## QA Result Contract

QA Agent 只做 deterministic summary：事实字段是否存在、90s/180s 脚本是否存在、red 版权风险数量、6 个导出 manifest 是否齐全、发布文案是否包含“不构成投资建议”。QA 结果不代表外部事实核验或法律意见。
