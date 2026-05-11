# Changelog

## Batch 13A - Production Studio Edit / Density Profile / Revalidate / Lock

- 新增 Shot Density Profile：`lite`、`standard`、`dense`，默认 `standard`，并让 prompt、normalization、Production Studio gate 和 audit 接收 profile。
- 新增 `production_studio_edits`、`production_studio_gate_runs`、`production_studio_locks` 三张表和 migration，人工编辑不覆盖原始 AI ProductionPack。
- 新增 effective ProductionPack resolver，Showcase、Export、Production Studio 和 project JSON 使用 edits overlay 后的 effective 版本。
- Production Studio 从只读检查页升级为编辑台：支持编辑 shot、prompt、replacementPlan，批量保存、重新校验 Gate、锁定和解除锁定。
- 新增 Production Studio API：GET state、PATCH edits、POST revalidate、POST lock、POST unlock。
- Showcase、Export 和 Dashboard 展示 density profile、gate status、lock status、edited count 和 needsFix 状态。
- Export 增加 Production Studio summary，`storyboard.csv`、`prompt-pack.md`、`rights-check.csv` 使用 effective ProductionPack。

## Batch 12B - Shot / Prompt Volume Gate and Production Studio Core

- 扩展 ProductionPack schema，支持 90s / 180s micro-shots、shotNumber、camera、composition、motion、copyrightRisk、replacementPlan 和 canonical `promptBundles`。
- 更新 single-pack prompt 与 normalization：90s 至少 30 shots，180s 至少 60 shots，prompt bundle 数量等于 shot 数量。
- 新增 Production Studio 纯函数层与 `/projects/[projectId]/production-studio` 页面，展示 shot/prompt 对齐、gate score、版权汇总和修正原因。
- Showcase 顶部显示 Shot / Prompt Gate 摘要；低于标准时显示“需要重跑 / 人工修正”。
- 导出增强：`production-pack.md` 增加 Shot / Prompt Gate Summary，`storyboard.csv` 增加 versionType 等字段，`prompt-pack.md` 按 versionType + shotNumber 输出。
- real-run audit 增加 30/60 shots、prompt count、red replacement 和 needsFix 门禁，失败不覆盖 latest success。
- 更新 README、TODO、Agent Contracts、Batch Log、Decisions、Runbook 和 env token 建议。

## Batch 12A - Strict Real Output and Audit Failure Gate

- 新增 strict AI policy：默认 `AI_REQUIRE_REAL_OUTPUT=true`、`AI_ALLOW_MOCK_FALLBACK=false`，真实模式下 AI 失败不再保存 mock fallback 成功项目。
- 新增 output contamination scanner，递归扫描 ProductionPack 文本字段，命中 `mock`、`Batch 02`、`后续补齐`、`demo-data` 等禁用词时拒绝作为真实成品保存。
- 改造 `POST /api/ai/production-pack`：strict 失败返回 422 与安全错误摘要，不返回 fallback mock `projectId`；fast demo 才允许显式 fallback。
- 改造 real-run audit：默认要求真实 AI 成功，fallback 或污染输出写入 failed artifacts 并 exit 1，不覆盖 latest success。
- Showcase / Export 对 fallback/mock 项目标红，禁用主 `production-pack.md` 下载；strict mode 下阻止 fallback/mock 的 production-pack 下载。
- `/quick-demo` 增加“真实生成 / 快速演示”模式，默认真实生成；`/articles/new` 明确完整文章和事实材料要求。
- 更新 `.env.example`、README、TODO、Batch Log、Decisions、Runbook 和 Real Run Audit Summary。

## Batch 11C - Demo Freeze and Rights Display Polish

- 新增 `docs/13_REAL_RUN_AUDIT_SUMMARY.md`，冻结已验证成功的真实 AI Demo 项目、Showcase 路径、导出路径、审计分数和展示注意事项。
- Showcase 版权风险摘要保留 red/yellow/green/placeholder 原始等级，并将 red 文案解释为“不可直接使用素材”。
- red 版权项在 Showcase 和 `production-pack.md` 中显示替代方案，不再只呈现为失败状态。
- `production-pack.md` 版权段落改为“版权风险与替代方案”，保留所有风险项和原始等级。
- 更新最终演示标题清单、Runbook、Batch Log、Decisions、README 和 TODO。

## Batch 11B - Storyboard / Prompt Quality Upgrade

- 补齐 MiniMax OpenAI-compatible single-pack 生成路径，`AI_AGENT_MODE` 默认 `single_pack`，仅显式设置 `sequential` 时走旧 runner。
- 新增 single-pack ProductionPack prompt，强化 8 个以上分镜、shot-prompt 一一对应、统一视觉风格锁、negativePrompt 禁用项和版权替代方案。
- 新增 ProductionPack normalization，保存前补齐分镜、prompt 覆盖、style lock、negativePrompt 和 red rights 替代 action。
- 提升 Real Run Audit QA scorer，报告低分 shotId / promptId，并区分 red rights 是否已有替代方案。
- 新增 MiniMax config、single-pack prompt、normalization、single-pack runner 和 QA scorer 测试。

## Batch 11A - Real Run Audit

- 新增 `pnpm audit:real-run`，从标题构造 Title-only ArticleInput，复用现有 AI production-pack handler 运行真实端到端审计。
- 新增真实审计输出：`tmp/real-run-audit/latest-production-pack.json` 与 `tmp/real-run-audit/latest-qa-report.md`。
- 新增 QA scorer，按 7 个 Agent 输出分数、Top 10 problems、fix priority、建议修改位置和 demo-ready 判断。
- Storyboard QA 检查镜头主体、镜头运动、剪辑可执行性、真实 Logo / 上市现场 / 人物肖像风险和 90s 节奏覆盖。
- Prompt QA 检查 style lock、negativePrompt、真实品牌 Logo / 可读文字风险和 prompt-shot 对应关系。
- 新增 `tmp/` ignore、`tsx` dev dependency 和审计相关测试。

## Batch 10B - Final Demo QA and Demo Runbook

- 增强 `/quick-demo` 的 AI fallback 提示，配置缺失提示检查 `.env.local`，超时提示可改用短标题或稍后重试。
- `POST /api/ai/production-pack` 在 fallback 时新增安全摘要字段 `safeErrorSummary` 与 `fallbackReason`，不暴露 API key。
- Showcase 顶部在 fallback 时显示黄色风险提示，并继续展示 generationMode、fallbackUsed 和 Title-only 事实核验提示。
- Dashboard 和 `/demo` 增加最终演示路径：Quick Demo → AI Generate → Showcase → Export。
- 新增 `docs/12_FINAL_DEMO_RUNBOOK.md`，覆盖演示前检查、环境变量检查、启动命令、标准路径、推荐标题、出错处理、展示话术和不可承诺事项。
- 新增最终演示 QA 测试，覆盖 fallback 分类、Showcase 状态、下载链接和演示路径提示。

## Batch 10A - Title-only Fast Demo

- 新增 `/quick-demo` 极简演示入口，只输入标题、内容类型和可选行业标签即可生成 AI 视频号生产包。
- 新增 Title-only ArticleInput 构造 helper，自动生成演示 brief、默认标签、当天日期和固定 90s/180s 时长。
- Quick Demo 调用现有 `POST /api/ai/production-pack`，成功后直接跳转 `/projects/[projectId]/showcase`。
- Dashboard 和 `/demo` 增加 Quick Demo 入口。
- Showcase 对 `Title-only Demo` 来源项目显示事实核验提示。
- 明确该入口只用于外部快速展示，不适合正式发布，不生成图片、视频、音频或自动发布。

## Batch 09 - Showcase 成品展示页

- 新增 `/projects/[projectId]/showcase`，用于外部展示、录屏和讲解视频号生产包。
- 新增 Showcase mapper，将 ProductionPack、Review 发布文案、Export 下载链接和 Agent Run 摘要整理为展示模型。
- 新增 Showcase 展示组件，突出核心观点、标题候选、90s/180s 脚本、分镜摘要、Prompt 摘要、版权风险和发布文案。
- Dashboard、ProjectNav、Analysis、Review 和 Export 页面增加 Showcase 入口。
- 明确 Showcase 不是最终成片视频，不生成真实图片、视频、音频，不自动发布。

## Batch 08 - Real AI Production Pack Pipeline

- 新增 `openai` SDK 与 `.env.example`，支持 `OPENAI_API_KEY`、`AI_PROVIDER`、`AI_MODEL`、`GENERATION_MODE`。
- 新增 server-side AI config、OpenAI client、structured output 封装和 AI error 类型。
- 新增 7 个 AI Agent prompt template 与 AI output schema。
- 新增 `runAiPipeline`，按 Agent 顺序调用真实 AI 文本生成，并在配置缺失或单步失败时 fallback 到 mock 输出。
- 新增 `POST /api/ai/production-pack`，返回 `projectId`、`productionPack`、`agentRunId`、`fallbackUsed` 和 `generationMode`。
- 扩展 `ProductionPack.mode` 为 `mock | ai`，扩展 Agent Run/Step 状态为 `completed_with_fallback`。
- 改造 `/articles/new`，支持 Mock / AI Agent 模式选择。
- Analysis、Dashboard 和 Agent Runs 页面展示 AI / Mock / fallback 状态。
- 新增 AI pipeline、AI schema、AI API 和客户端凭据隔离测试。

## Batch 07 - Agent Management Layer

- 新增 7 个本地 mock Agent 定义：Article Analyst、Thesis Agent、Script Writer、Storyboard Agent、Prompt Generator、Asset Finder、QA Agent。
- 新增 `agent_definitions`、`agent_runs`、`agent_run_steps`、`agent_context_snapshots`、`qa_results` 表和 migration。
- 新增 tracked mock pipeline，记录每次生成的 agent run、step input/output、context snapshot 和 deterministic QA summary。
- 改造 `POST /api/mock/production-pack`，返回兼容字段 `agentRunId`。
- 改造 Demo reset，公开 demo 项目也会生成 agent run 记录。
- 新增 `/agents`、`/agents/[agentSlug]`、`/projects/[projectId]/agent-runs`、`/projects/[projectId]/agent-runs/[runId]`。
- Dashboard 和动态项目页增加 Agent Runs 入口和最近 agent run 状态。

## Batch 06 - Public Demo Hardening

- 新增 `/demo` 公开演示首页，展示产品流程、公开安全样例、当前能力和限制。
- 新增公开安全 demo 数据，使用虚构消费品牌和虚构家庭医疗公司，不使用真实公司、Logo、新闻图或财务数据。
- 新增 `video_projects.is_demo` 字段和 migration，用于区分 demo 项目与普通项目。
- 新增 `POST /api/demo/reset`，只重置 `is_demo = true` 的公开 demo 项目。
- 新增 Demo Mode Banner，并在 demo、Dashboard 和动态项目页展示模拟数据提示。
- 改造 Dashboard，分开展示公开 Demo 项目和最近普通项目，并提供 Analysis / Review / Export 快捷入口。
- 新增 Public Demo Guide 文档。

## Batch 05 - 导出审阅层 + 发布文案编辑 + 事实核验记录

- 新增 `publish_copies`、`fact_checks`、`review_checklists` 表和 migration。
- 新增 review repository，支持审阅 summary、导出前 checklist、事实核验和人工发布文案。
- 新增 `/projects/[projectId]/review` 页面。
- 新增 `GET/POST /api/projects/[projectId]/review` 和两个 PATCH API。
- 改造 Dashboard 与 Export 页展示 review 状态并提供进入 Review 入口。
- 改造 `publish-copy.md`，优先使用人工编辑后的发布文案。
- 新增 review repository、导出覆盖和 API helper 测试。

## Batch 04 - 真实 Markdown / CSV / JSON 导出生成

- 新增纯函数导出层，支持 `production-pack.md`、`storyboard.csv`、`project.json`、`rights-check.csv`、`prompt-pack.md`、`publish-copy.md`。
- 新增 `GET /api/projects/[projectId]/exports/[fileName]`，从 SQLite 读取 ProductionPack 并即时返回附件下载。
- 改造 `/projects/[projectId]/export`，支持选择文件、预览、复制和下载。
- 保留 `/projects/demo/export` fallback，不破坏 Batch 01/02 demo 页面。
- 新增导出测试，覆盖 Markdown、CSV、JSON、风险等级和非法文件名。

## Batch 03 - SQLite + Drizzle 本地持久化

- 新增 SQLite + Drizzle 本地数据库层，数据库文件位于 `data/unicorn-video-agent.sqlite`。
- 新增 `articles`、`video_projects`、`analysis_runs`、`scripts`、`shots`、`asset_prompts`、`rights_checks`、`export_manifests`、`review_logs` 表。
- 新增 `drizzle.config.ts`、迁移文件和 `db:generate`、`db:migrate`、`db:studio` 脚本。
- 改造 `POST /api/mock/production-pack`，生成 mock ProductionPack 后写入 SQLite 并返回 `projectId`。
- 新增 `GET /api/projects` 和 `GET /api/projects/[projectId]`。
- 新增动态项目页 `/projects/[projectId]/analysis|scripts|shots|rights|export`。
- 改造 `/articles/new` 提交后跳转到动态项目页，localStorage 降级为 demo fallback。
- 改造 `/dashboard` 展示最近 SQLite 项目和空状态。
- 新增 repository 测试，覆盖 article 创建、ProductionPack 保存和 SQLite readback。

## Batch 02 - 本地 Mock 生产包流程

- 新增 Batch 02 `ProductionPackSchema`、`ArticleInputSchema` 和相关结果 schema。
- 新增纯函数 mock Agent pipeline，覆盖文章分析、观点、脚本、分镜、Prompt、版权风险和导出 manifest。
- 新增 `POST /api/mock/production-pack`。
- 改造 `/articles/new` 为可交互 mock 表单，生成后保存到 localStorage 并跳转分析页。
- 改造结果页从 ProductionPack 读取 analysis、scripts、storyboard、rightsChecks 和 exportManifest。
- 新增 ProductionPack 展示组件和 localStorage 工具。
- 新增 schema/pipeline 测试，覆盖脚本、版权等级和导出 manifest。

## Batch 01 - 后台 UI Shell 与导航结构

- 新增统一后台 `AppShell`、`SidebarNav`、`PageHeader`、`StatusBadge`、`MetricCard`、`DataTable`。
- 新增 10 个静态页面路由：`/`、`/dashboard`、`/articles/new`、`/articles/demo`、`/projects/demo/analysis`、`/projects/demo/scripts`、`/projects/demo/shots`、`/projects/demo/rights`、`/projects/demo/export`、`/settings`。
- 新增集中假数据 `src/lib/demo-data.ts`，覆盖导航、分析、脚本、分镜、版权、导出和设置占位。
- 新增 demo data 测试，校验 Batch 01 路由、四级版权风险和导出文件不生成。
- 新增 `pnpm typecheck` 脚本。
- 补齐 `TODO.md`、`AGENTS.md` 和编号版 docs 基线。

## Batch 00 - 项目初始化与文档系统

- 初始化 Next.js + TypeScript + pnpm 项目骨架。
- 新增 Zod schema、样例输入/输出 fixture 和 schema 单元测试。
- 新增 MVP、输出结构、版权策略和 prompt 系统边界文档。
