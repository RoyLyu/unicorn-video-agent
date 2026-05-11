# 07 Batch Log

## Batch 13B - AIGC Visual Bible + Shot Prompt Production Contract

目标：将 ProductionPack 升级为可执行 AIGC 视频制作规格，补齐 Creative Direction、Visual Style Bible、Continuity Bible、shot-level production method、editing metadata 和 8 类 prompt 信息。

完成内容：

- ProductionPack schema 兼容新增全局三大 bible 和 shot/prompt production contract 字段。
- single-pack prompt 要求输出 Creative Direction、Visual Style Bible、Continuity Bible、shotFunction、productionMethod、editing metadata 和 prompt production contract。
- normalization 补齐缺失字段，并保持 prompt bundle 与 shot 一一对应。
- Production Studio gate 新增 creative / visual / continuity / function / method / editing / prompt completeness 分数。
- Production Studio UI 增加 AIGC contract 总览、pack-level 编辑区、筛选和新增字段编辑。
- Showcase 展示 Visual Bible、Continuity、Shot Function、Production Method、Editing Readiness 和 Prompt Completeness。
- Export 输出 Creative Direction、Visual Style Bible、Continuity Bible、Shot Function Summary、Production Method Summary、Editing Structure Summary 和 Prompt Completeness Summary。
- real-run audit 增加 AIGC production contract 分数和 needsFix 判定。

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion 自动成片
- 公网部署
- 用户系统
- 自动发布视频号
- 真实素材下载
- 新增数据库表或覆盖原始 AI ProductionPack

## Batch 13A - Production Studio Edit / Density Profile / Revalidate / Lock

目标：把 Production Studio 从只读检查页升级为内部生产编辑台，引入 `lite / standard / dense` Shot Density Profile，默认 `standard`，并通过 edits overlay、deterministic gate revalidate 和 lock 状态驱动 Showcase / Export 的 effective ProductionPack。

完成内容：

- Shot Density Profile：lite 20/40/60、standard 24/48/72、dense 30/60/90
- `.env.example` 增加 `SHOT_DENSITY_PROFILE=standard`
- single-pack prompt、normalization、Production Studio scorer 和 real-run audit 支持 density profile
- `production_studio_edits`
- `production_studio_gate_runs`
- `production_studio_locks`
- effective ProductionPack resolver，人工编辑不覆盖原始 AI JSON
- Production Studio 可编辑 shot、prompt、replacementPlan
- 批量保存 edits
- deterministic “重新校验 Gate”
- Gate pass 后锁定当前生产包，支持解除锁定
- Production Studio GET/PATCH/revalidate/lock/unlock API
- Showcase 展示 density、gate、lock、edited count
- Export 使用 effective ProductionPack，并在 project JSON 中保留 original + productionStudio summary
- Dashboard 展示 density、gate、lock 和 needsFix 状态

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion
- 部署
- 用户系统
- 自动发布视频号
- 真实素材下载
- 调用 AI 重新生成
- 覆盖原始 AI ProductionPack

验收口径：

- 默认 density profile 为 `standard`
- 30/60 dense 项目在 standard 和 dense 下继续 pass
- edits 能形成 effective ProductionPack，original 不变
- revalidate 不调用 AI，只写入 gate run
- gate fail 不能 lock，gate pass 可以 lock
- Showcase / Export 使用 effective ProductionPack

## Batch 12B - Shot / Prompt Volume Gate and Production Studio Core

目标：把分镜头脚本与 Prompt Generator 升级为内部产品核心能力，真实 AI 输出必须满足 90s 至少 30 shots、180s 至少 60 shots、每个 shot 一个 prompt bundle，且 red rights risk 必须有替代方案。

完成内容：

- ProductionPack schema 最小兼容升级
- `storyboard.shots` 新增 versionType、shotNumber、camera、composition、motion、chartNeed、copyrightRisk、replacementPlan
- `assetPrompts.promptBundles` canonical prompt bundle
- single-pack prompt 更新到 30/60 micro-shots
- normalization 扩展到 90 个 micro-shots
- promptBundles、imagePrompts、videoPrompts 一一覆盖所有 shots
- red rights replacementPlan 补齐
- Production Studio alignment、mapper 和 score 工具
- `/projects/[projectId]/production-studio`
- ProjectNav、Dashboard、Showcase、Review、Export、Agent Runs 入口
- Showcase Shot / Prompt Gate 摘要
- `production-pack.md` Shot / Prompt Gate Summary
- `storyboard.csv` versionType 字段
- `prompt-pack.md` 按 versionType + shotNumber 输出
- real-run audit shot/prompt gate

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion
- 部署
- 用户系统
- 自动发布视频号
- 真实素材下载
- 数据库大重构或迁移
- mock 内容补正式真实输出

验收口径：

- `fallbackUsed=false`
- `generationMode=ai`
- `ProductionPack.mode=ai`
- 90s shots >= 30
- 180s shots >= 60
- prompt bundle count == shot count
- red rights risk 全部有 replacementPlan
- gate 失败时页面、导出和审计报告显示“需要重跑 / 人工修正”

## Batch 12A - Strict Real Output and Audit Failure Gate

目标：建立严格真实输出边界，真实生产、真实审计和默认 Quick Demo 不能把 fallback/mock 结果保存成成功项目、覆盖 latest audit、进入 Showcase 成品展示，或作为 `production-pack.md` 主下载。

完成内容：

- strict AI policy helper
- `AI_REQUIRE_REAL_OUTPUT`、`AI_ALLOW_MOCK_FALLBACK`、`AI_BANNED_OUTPUT_TERMS`
- ProductionPack output contamination scanner
- `/api/ai/production-pack` strict failure 422
- explicit `generationProfile=fast_demo` fallback
- real-run audit failure gate
- failed audit artifacts，不覆盖 latest success
- Showcase fallback/mock 红色 warning 和主下载禁用
- strict mode 下 fallback/mock `production-pack.md` 下载阻断
- Quick Demo “真实生成 / 快速演示”模式
- `/articles/new` 与 `/quick-demo` 完整文章/事实材料提示
- strict policy、scanner、API、audit、Showcase、Export 和 UI 测试

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion
- 部署
- 数据库重构
- 删除 mock pipeline
- Storyboard / Prompt 继续优化
- Batch 12B 或 Batch 13 功能

验收口径：

- 真实审计只有在 `fallbackUsed=false`、`generationMode=ai`、`ProductionPack.mode=ai`、无禁用词污染时才写入 latest success。
- AI 失败时 strict mode 必须 fail loudly，并保留上一份 latest success。

## Batch 11C - Demo Freeze and Rights Display Polish

目标：不新增生成能力，不修改 AI pipeline，只冻结已验证成功的 Demo 案例，并优化版权风险展示和导出文案。

完成内容：

- 成功 Demo 项目冻结摘要
- `docs/13_REAL_RUN_AUDIT_SUMMARY.md`
- Showcase red rights risk 展示口径
- “不可直接使用素材”与“建议替代”文案
- `production-pack.md` 版权段落改为“版权风险与替代方案”
- red/yellow/green/placeholder 原始等级保留
- 最终演示标题清单更新
- README、CHANGELOG、TODO、Decisions 和 Runbook 更新

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion
- 部署
- 素材下载
- 数据库重构
- single-pack AI pipeline 修改
- Batch 12 功能

## Batch 11B - Storyboard / Prompt Quality Upgrade

目标：根据真实运行审计报告，只优化 Storyboard、Prompt Generator 和 Rights 输出质量，使关键审计分数达到 4/5 或以上。

完成内容：

- MiniMax OpenAI-compatible single-pack 生成路径
- `AI_AGENT_MODE=single_pack` 默认路由
- single-pack ProductionPack prompt
- 8 个以上可执行分镜要求
- `visual` 字段中的主体、场景、镜头、构图和图表逻辑
- imagePrompt / videoPrompt 与 shot 一一对应
- 统一 style lock 与 negativePrompt 禁用项
- ProductionPack normalization
- red rights risk 替代方案补齐
- Real Run Audit scorer 输出低分 shotId / promptId
- Storyboard、Prompt、Rights 质量测试

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion
- 部署
- 素材下载
- 数据库重构
- Showcase 主结构改造
- Batch 12 功能

## Batch 11A - Real Run Audit

目标：建立一次真实 AI 端到端运行审计能力，用于跑通 `/quick-demo → AI production pack → Showcase → Export` 并输出质量问题报告。

完成内容：

- `pnpm audit:real-run`
- `scripts/real-run-audit.ts`
- 从标题、内容类型和行业标签构造 Title-only `ArticleInput`
- 复用现有 `/api/ai/production-pack` route handler 写入 SQLite 项目
- 保存完整 response JSON 到 `tmp/real-run-audit/latest-production-pack.json`
- 保存 QA Markdown 报告到 `tmp/real-run-audit/latest-qa-report.md`
- 逐 Agent 审计 Article Analyst、Thesis Agent、Script Writer、Storyboard Agent、Prompt Generator、Asset Finder、QA Agent
- 输出 7 项评分、Top 10 problems、fix priority、建议修改位置和 demo-ready 判断
- Storyboard 与 Prompt Generator 质量检查规则
- `tmp/` 审计产物忽略提交
- QA scorer、审计脚本表面和忽略规则测试

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion
- 部署
- 素材下载
- 数据库重构
- Agent 输出优化
- Batch 11B 功能

## Batch 10B - Final Demo QA and Demo Runbook

目标：为 `/quick-demo → AI Agent → Showcase → Export` 建立最终演示验收、错误提示、演示说明和最小浏览器流程测试基础。

完成内容：

- Quick Demo fallback 状态提示
- AI 配置缺失时提示检查 `.env.local`
- AI 请求超时时提示可改用短标题或稍后重试
- `/api/ai/production-pack` fallback 响应增加 `safeErrorSummary` 与 `fallbackReason`
- Showcase fallback 黄色风险提示
- Dashboard 和 `/demo` 最终演示路径提示
- `docs/12_FINAL_DEMO_RUNBOOK.md`
- fallback 分类、Showcase 状态、最终演示路径和 Runbook 测试

明确不做：

- AI 生图
- AI 生视频
- TTS
- 自动剪辑
- 部署
- 权限系统
- 修改 AI pipeline 主逻辑
- Batch 11 功能

## Batch 10A - Title-only Fast Demo

目标：新增一个极简演示入口，只输入标题即可生成 AI 视频号生产包，并直接进入 Showcase。

完成内容：

- `/quick-demo`
- Title-only ArticleInput 构造 helper
- 内容类型默认标签和行业标签 normalize
- 标题演示 brief，明确事实需人工核验和“不构成投资建议”
- 调用现有 `/api/ai/production-pack`
- 成功后跳转 `/projects/[projectId]/showcase`
- Dashboard 和 `/demo` Quick Demo 入口
- Showcase 对 Title-only 项目显示事实核验提示
- Quick Demo、导航和 Showcase warning 测试

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion 自动成片
- 自动下载网络素材
- 自动发布视频号
- 公网部署
- prompt versioning
- 修改 `/articles/new` 主流程

## Batch 09 - Showcase 成品展示页

目标：把 AI 或 Mock 生成的 ProductionPack 整理成适合外部展示、录屏和讲解的成品展示页。

完成内容：

- `/projects/[projectId]/showcase`
- Showcase 数据映射层
- ProjectShowcaseView 和脚本、分镜、风险、Agent 摘要展示组件
- Dashboard Showcase 快捷入口
- ProjectNav Showcase 入口
- Analysis、Review、Export 页面进入 Showcase 按钮
- `production-pack.md` 下载入口
- Showcase mapper 和导航测试

明确不做：

- AI 生图
- AI 生视频
- TTS
- Remotion 自动成片
- 自动下载网络素材
- 素材网站接入
- 自动发布视频号
- 公网部署

## Batch 08 - Real AI Production Pack Pipeline

目标：跑通真实 AI 文本 Agent 生产包生成，同时保留 mock fallback，保证 demo 稳定。

完成内容：

- OpenAI SDK 和 `.env.example`
- server-side AI config、client、structured output 和 error 处理
- 7 个 AI Agent prompt template
- AI Agent output schema
- `runAiPipeline`
- `POST /api/ai/production-pack`
- `/articles/new` Mock / AI Agent 模式选择
- AI 配置缺失或单步失败 fallback 到 mock
- ProductionPack `mode: mock | ai`
- Agent Run/Step `completed_with_fallback`
- Analysis、Dashboard、Agent Runs 展示 generation mode / fallback 状态

明确不做：

- AI 生图
- AI 生视频
- TTS
- 自动下载网络素材
- 自动发布视频号
- 自动成片
- Postgres 迁移
- 公网部署

## Batch 07 - Agent Management Layer

目标：把现有 mock pipeline 背后的 Agent 升级为可展示、可审阅、可追踪的本地 Agent 管理层。

完成内容：

- 7 个 Agent 定义
- Agent registry 页面
- Agent detail 页面
- 项目 Agent Runs 页面
- Agent run detail 页面
- `agent_definitions`、`agent_runs`、`agent_run_steps`、`agent_context_snapshots`、`qa_results` 表
- tracked mock pipeline
- deterministic QA summary
- Dashboard 最近 agent run 状态
- Demo reset 生成 agent run

明确不做：

- 真实 AI API
- 素材网站接入
- 自动下载网络素材
- 真实图片、视频、音频生成
- 自动发布视频号
- 自动成片
- 用户登录
- 云部署

## Batch 06 - Public Demo Hardening

目标：把内部 MVP 打磨成可外部受控展示的本地公开 Demo。

完成内容：

- `/demo` 公开演示首页
- 两份公开安全模拟文章
- `video_projects.is_demo` 字段和 migration
- `POST /api/demo/reset`
- Demo Mode Banner
- Dashboard 的公开 Demo 项目区和最近项目区
- 动态项目页 demo 标识
- Public Demo Guide
- demo seed/reset/banner/dashboard 测试

明确不做：

- 真实 AI API
- 素材网站接入
- 自动下载网络素材
- 真实图片、视频、音频生成
- 自动发布视频号
- 自动成片
- 用户登录
- 云部署

## Batch 05 - 导出审阅层 + 发布文案编辑 + 事实核验记录

目标：在本地 SQLite 持久化和文本导出基础上，新增内部审阅工作流。

完成内容：

- `/projects/[projectId]/review`
- 导出前 checklist
- 事实核验表
- 版权复核摘要
- 发布文案编辑器
- `publish_copies`、`fact_checks`、`review_checklists` 表
- Review API
- Dashboard 和 Export 页展示审阅状态
- `publish-copy.md` 使用人工编辑文案覆盖
- review repository 和导出联动测试

明确不做：

- 真实 AI API
- 素材网站接入
- 自动下载网络素材
- 真实图片、视频、音频生成
- 自动发布视频号
- 自动成片
- 云存储
- 用户登录或复杂权限

## Batch 04 - 真实 Markdown / CSV / JSON 导出生成

目标：将 planned export manifest 升级为可预览、可复制、可下载的文本导出能力。

完成内容：

- 纯函数导出序列化层
- `production-pack.md`
- `storyboard.csv`
- `project.json`
- `rights-check.csv`
- `prompt-pack.md`
- `publish-copy.md`
- `GET /api/projects/[projectId]/exports/[fileName]`
- `/projects/[projectId]/export` 预览、复制和下载交互
- 导出纯函数测试

明确不做：

- 真实 AI API
- 素材网站接入
- 自动下载网络素材
- 真实图片、视频、音频生成
- 自动发布视频号
- 自动成片
- 云存储
- 将导出文件写入仓库或 `data/` 目录

## Batch 03 - SQLite + Drizzle 本地持久化

目标：实现“文章输入 → mock pipeline → ProductionPack → SQLite → 动态项目页面读取展示”的闭环。

完成内容：

- SQLite + Drizzle 本地数据库层
- `data/unicorn-video-agent.sqlite` 本地数据库位置
- `drizzle.config.ts` 和 `drizzle/` 迁移文件
- `articles`、`video_projects`、`analysis_runs`、`scripts`、`shots`、`asset_prompts`、`rights_checks`、`export_manifests`、`review_logs` 表
- `db:generate`、`db:migrate`、`db:studio` 脚本
- `POST /api/mock/production-pack` 写入 SQLite 并返回 `projectId`
- `GET /api/projects` 和 `GET /api/projects/[projectId]`
- `/projects/[projectId]/analysis|scripts|shots|rights|export` 动态页面
- `/dashboard` 最近项目列表和空状态
- repository 持久化测试

明确不做：

- 真实 AI API
- 云数据库
- 用户登录
- 自动抓取公众号
- 自动下载网络素材
- 真实图片、视频、音频生成
- 真实导出文件生成
- 自动成片
- 视频号发布

## Batch 02 - 本地 Mock 生产包流程

目标：实现“文章输入 → 本地 mock Agent pipeline → ProductionPack JSON → localStorage → 结果页展示”的闭环。

完成内容：

- Batch 02 ProductionPack schema
- 本地纯函数 mock Agent pipeline
- `POST /api/mock/production-pack`
- 可交互文章输入表单
- localStorage 保存、读取、清除和 demo fallback
- analysis、scripts、shots、rights、export 页面读取 ProductionPack
- ProductionPack 展示组件
- schema 和 pipeline 测试

明确不做：

- 真实 AI API
- 数据库
- 自动抓取公众号
- 自动下载网络素材
- 真实图片、视频、音频生成
- 真实导出文件生成
- 登录
- 视频号发布

## Batch 01 - 后台 UI Shell 与导航结构

目标：建立内部后台的静态 UI 骨架和页面导航。

完成内容：

- 统一 `AppShell`
- `SidebarNav`
- `PageHeader`
- `StatusBadge`
- `MetricCard`
- `DataTable`
- 集中假数据 `src/lib/demo-data.ts`
- 10 个静态页面路由
- 编号版文档基线
- `pnpm typecheck` 脚本

明确不做：

- AI API
- 数据库
- 登录
- 自动素材下载
- 自动导出
- 自动发布
- 自动成片

## Batch 00 - 项目初始化与文档系统

目标：建立 Next.js + TypeScript 项目骨架、schema、fixture、基础测试和文档系统。

状态：已完成。
