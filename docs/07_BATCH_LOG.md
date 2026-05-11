# 07 Batch Log

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
