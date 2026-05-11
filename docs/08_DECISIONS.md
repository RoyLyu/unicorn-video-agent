# 08 Decisions

## D001 - Batch 01 使用静态 UI Shell

决定：Batch 01 只做后台 UI Shell 与导航结构，不做业务生成。

原因：先确认信息架构、页面边界和编辑工作流，再进入生成链路。

## D002 - Demo 数据集中管理

决定：所有 Batch 01 假数据集中放在 `src/lib/demo-data.ts`。

原因：避免页面各自硬编码数据，便于后续替换为 mock 生成流程或真实数据源。

## D003 - 不安装大型 UI 库

决定：Batch 01 使用原生 CSS 和小型自定义组件。

原因：当前目标是内部后台骨架，暂不需要引入组件库成本。

## D004 - 版权风险使用四级展示

决定：Batch 01 页面展示 Green / Yellow / Red / Placeholder 四级版权风险。

原因：比 Batch 00 的低中高风险更适合 UI 表达，也能区分未进入真实授权检查的占位素材。

## D005 - 本地 mock pipeline 先于真实 AI

决定：Batch 02 只实现本地纯函数 mock pipeline。

原因：先验证数据流、页面展示和合同边界，再引入真实模型调用。

## D006 - ProductionPack schema 作为共同合同

决定：API route、mock pipeline、localStorage 和结果页都以 `ProductionPackSchema` 为共同合同。

原因：减少页面字段漂移，确保 mock 输出可以被后续真实 Agent 替换。

## D007 - localStorage 仅作 Batch 02 临时持久化

决定：Batch 02 使用 localStorage 保存最近一次 ProductionPack。

原因：不接数据库仍能完成端到端 UI 闭环；后续持久化方案另行设计。

## D008 - exportManifest 只描述未来导出

决定：Batch 02 的 exportManifest 只列出 planned 文件，不生成真实文件。

原因：避免过早进入导出文件格式和下载交互，保持本批范围清晰。

## D009 - Batch 03 使用 SQLite + Drizzle

决定：Batch 03 使用本地 SQLite 文件和 Drizzle ORM 做持久化。

原因：在不接云数据库和登录系统的前提下，先验证项目级数据模型、迁移和动态页面读取。

## D010 - ProductionPack JSON 与结构化表并存

决定：`video_projects` 保存完整 `ProductionPack` JSON，同时拆分写入分析、脚本、分镜、素材 prompt、版权和导出清单表。

原因：完整 JSON 保证页面 readback 与 schema 一致；结构化表为后续筛选、审阅和真实导出预留接口。

## D011 - localStorage 降级为 demo fallback

决定：Batch 03 新项目以 SQLite 为主存储，localStorage 只保留给 `/projects/demo/*` 和浏览器 fallback。

原因：避免 Batch 02 临时状态模型继续成为主数据源，同时不破坏已有 demo 页面。

## D012 - 显式迁移优先

决定：开发者使用 `pnpm db:migrate` 初始化和迁移本地数据库，应用请求不自动改表。

原因：保持数据库变更可追踪，避免 API 请求在未知状态下隐式修改本地数据结构。

## D013 - Batch 04 导出即时生成

决定：导出文件通过 API 从 SQLite 中的 ProductionPack 即时生成并返回下载。

原因：避免在仓库或 `data/` 目录写入派生文件，同时保留可复制、可下载的真实文本产物。

## D014 - 导出序列化函数保持纯函数

决定：Markdown、CSV、JSON 导出函数只接收 ProductionPack 并返回 string。

原因：让导出内容可单元测试，也避免导出层耦合数据库、文件系统或外部 API。

## D015 - 发布文案先做确定性派生

决定：Batch 04 的 `publish-copy.md` 从标题、核心观点、摘要和行业标签派生，不引入新 AI 生成链路。

原因：ProductionPack 当前没有独立发布文案字段；确定性派生能满足导出闭环，同时不越界进入真实 AI。

## D016 - Batch 05 审阅数据独立于 ProductionPack

决定：审阅 checklist、事实核验和人工发布文案写入独立表，不回写 `video_projects.production_pack_json`。

原因：ProductionPack 继续代表生成结果，Review 数据代表人工审阅状态，二者职责分离。

## D017 - Export 不强制拦截下载

决定：Export 页展示审阅风险和完成度，但不阻止下载。

原因：当前是内部 MVP，审阅层用于提示和记录，不引入复杂权限或审批流。

## D018 - 人工发布文案优先

决定：`publish-copy.md` 优先使用 `publish_copies` 中的人工编辑内容，没有人工内容时回退到 Batch 04 派生文案。

原因：让编辑可以覆盖发布文案，同时保留旧项目和未审阅项目的可导出能力。

## D019 - Public Demo 使用 is_demo 明确标记

决定：Batch 06 在 `video_projects` 增加 `is_demo` 字段，而不是复用 `status` 或模板名称。

原因：Demo reset 必须只处理公开演示项目，清晰字段能避免误删普通 mock 项目。

## D020 - Demo reset 只重建本地公开样例

决定：`POST /api/demo/reset` 只删除并重建 `is_demo = true` 的两个公开安全项目。

原因：外部演示需要稳定入口，但不能影响用户手动创建的普通项目。

## D021 - Demo Mode 明示模拟数据

决定：`/demo`、Dashboard 和 demo 项目详情页显示 Demo Mode Banner。

原因：受控外部展示必须明确说明内容为模拟数据，不构成投资建议，不代表真实公司分析。

## D022 - Agent 定义以代码注册表为 source of truth

决定：Batch 07 的 Agent definitions 先在 `src/lib/agents/agent-definitions.ts` 中维护，并同步快照到 SQLite。

原因：当前不做后台编辑 Agent 配置；代码注册表更稳定，也便于测试和未来接入真实 AI 前做版本管理。

## D023 - 纯函数 mock pipeline 保留，追踪层外包

决定：继续保留 `runMockPipeline` 和各 mock agent 纯函数，新增 tracked runner 负责记录运行日志。

原因：避免把数据库副作用塞进纯函数，让旧测试、demo fallback 和未来真实 Agent 替换路径更清晰。

## D024 - QA Agent 只做 deterministic summary

决定：QA Agent 只统计本地 ProductionPack 结构和版权风险，不做外部事实核验。

原因：Batch 07 仍不接真实 AI、搜索或素材网站；QA 结果只能作为审阅提示，不代表事实或法律确认。

## D025 - Batch 08 真实 AI 只做文本 Chat Completions JSON output

决定：真实 AI pipeline 只调用 MiniMax OpenAI-compatible Chat Completions，并把模型输出清理、JSON.parse 后交给 Zod 校验；不做 AI 生图、生视频、TTS、素材下载或自动成片。

原因：MiniMax M2.7 当前按 OpenAI-compatible Chat Completions 接入，文本包稳定后再单独评估媒体生成和剪辑。

## D026 - AI_MODEL 只从环境变量读取

决定：业务逻辑不硬编码默认模型；`AI_MODEL` 为空时记录清晰错误并 fallback mock。

原因：模型选择可能随账号、成本和能力变化，不能把临时默认值固化进业务流程。

## D027 - AI 失败不阻断 demo

决定：AI 配置缺失、单步调用失败或 schema 校验失败时，Agent Run/Step 标记 `completed_with_fallback` 并使用 mock 输出继续。

原因：公开 demo 和内部审阅流程必须稳定；AI 质量和可用性问题应被记录，而不是让生成闭环中断。

## D028 - MiniMax 默认使用 single-pack 生成

决定：`/api/ai/production-pack` 默认使用 `AI_AGENT_MODE=single_pack`，只调用一次 MiniMax OpenAI-compatible Chat Completions 生成完整 `ProductionPack`；只有显式设置 `AI_AGENT_MODE=sequential` 时才走旧的 7-step remote runner。

原因：MiniMax-M2.7 的单次 JSON 生成更稳定，减少多轮 schema 失败和 token 分散导致的 fallback。

## D029 - AI schema 错误必须暴露安全 path 摘要

决定：MiniMax 输出在 JSON.parse 后必须通过 Zod 校验；校验失败时 Agent Run Step 写入 `path=... message=...` 摘要，development API response 可返回 `safeErrorSummary`。

原因：只记录 generic fallback 无法判断是字段缺失、类型错误还是模板文案污染，影响后续 prompt 修复。

## D030 - Showcase 是展示视图，不是生成或发布层

决定：Batch 09 的 `/projects/[projectId]/showcase` 只读取 SQLite 中已有 ProductionPack、Review、Export 和 Agent Run 数据，整理为外部展示页；不调用 AI、不生成媒体、不写导出文件、不自动发布。

原因：Showcase 的价值是让已有生产包更适合演示和录屏，而不是扩大生成链路或改变发布合规边界。

## D031 - Title-only Demo 使用 sourceName 标记

决定：Batch 10A 的快速演示项目通过 `sourceName = "Title-only Demo"` 识别，不新增数据库字段或 API。

原因：本批只做外部展示用快速入口；复用现有 ArticleInput、AI API、SQLite 和 Showcase 数据流，可以避免扩大 schema 变更，同时让 Showcase 明确提示标题生成项目需要人工核验事实。

## D032 - Final Demo QA 只增强提示层

决定：Batch 10B 不修改 AI pipeline 主逻辑，只在 API response、Quick Demo、Showcase、Dashboard、Public Demo 和 Runbook 中增加最终演示提示、fallback 摘要和验收路径。

原因：今天的目标是外部展示稳定性；生成质量和 prompt 版本管理应留给后续批次，避免在演示前引入高风险逻辑变更。

## D033 - Real Run Audit 只产出审计证据

决定：Batch 11A 新增 `pnpm audit:real-run`，将真实运行 response 和 QA 报告写入 `tmp/real-run-audit/`，但不修改 Agent prompt、schema 或 mapper 来优化结果。

原因：当前问题是 Storyboard 与 Prompt Generator 质量需要被完整记录和定位；先用可复现审计报告形成 Batch 11B 的证据，再进入优化，避免把评估和修复混在同一批次。

## D034 - 审计产物不进入仓库

决定：`tmp/` 和 `tmp/real-run-audit/` 被 `.gitignore` 忽略，真实运行 JSON 与报告只作为本地诊断材料。

原因：审计 JSON 可能包含用户输入、模型输出和本地项目标识，不应作为源代码或文档提交；仓库只保留审计脚本、评分规则和报告模板。

## D035 - Batch 11B 先补齐 single-pack 路径再做质量修复

决定：当前工作区缺少 Batch 08 hotfix 的 single-pack 文件和 MiniMax-compatible wiring，Batch 11B 将其作为 Storyboard / Prompt 质量升级的前置修复。

原因：只有 `/api/ai/production-pack` 默认走 single-pack，新的分镜和 prompt 质量约束才会作用到真实 AI 生成结果；这不是新增产品功能，而是恢复已确认的生成路径。

## D036 - 分镜执行信息写入 visual 字段

决定：不修改 `ProductionPackSchema` 或 SQLite schema，镜头运动、构图和图表逻辑统一写进 `storyboard.shots[].visual`，格式为“主体 / 场景 / 镜头 / 构图 / 图表”。

原因：Batch 11B 目标是质量修复，不应引入数据库重构；现有 Showcase、Export 和 Audit 都能读取 `visual`。

## D037 - Normalization 作为 AI 输出质量护栏

决定：AI JSON 通过基础 schema 后，在保存 SQLite 前执行 ProductionPack normalization，补足 8 个分镜、prompt 覆盖、style lock、negativePrompt 和 red rights 替代方案。

原因：MiniMax 输出可能局部缺项；确定性 normalization 能稳定 demo 质量，同时保留 fallback 和审计记录。
