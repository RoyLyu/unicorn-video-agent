# TODO

## Batch 01

- [x] 建立统一 AppShell。
- [x] 建立左侧 SidebarNav。
- [x] 建立 PageHeader、StatusBadge、MetricCard、DataTable。
- [x] 建立集中 demo data。
- [x] 建立 10 个静态页面路由。
- [x] 展示 Batch 01 / UI Shell 状态。
- [x] 补齐编号版文档基线。
- [x] 增加 `pnpm typecheck`。

## Batch 02

- [x] 设计文章输入到生产包的前端状态模型。
- [x] 增加本地 mock 生成流程，不接真实 AI。
- [x] 定义 Markdown / CSV / JSON 导出适配层的接口。
- [x] 为 Agent 合同补更严格的输入输出测试。
- [x] 新增 `/api/mock/production-pack`。
- [x] 使用 localStorage 保存 ProductionPack 并提供 demo fallback。

## Batch 03

- [x] 安装并接入 Drizzle + SQLite 本地依赖。
- [x] 新增 Drizzle schema、config、migration 和数据库脚本。
- [x] 建立 articles、video_projects、analysis_runs、scripts、shots、asset_prompts、rights_checks、export_manifests、review_logs 表。
- [x] 改造 mock 生产包 API，生成后写入 SQLite 并返回 projectId。
- [x] 新增项目列表和项目详情 API。
- [x] 新增 `/projects/[projectId]/*` 动态结果页。
- [x] 改造 `/articles/new` 跳转动态项目页。
- [x] 改造 `/dashboard` 最近项目列表和空状态。
- [x] 新增 repository 持久化测试。
- [x] 新增数据库 schema 文档。

## Batch 04

- [x] 实现真实 Markdown / CSV / JSON 文本导出生成，但仍不自动发布。
- [x] 支持 6 个导出文件：production-pack、storyboard、project、rights-check、prompt-pack、publish-copy。
- [x] 新增导出 API，按 projectId 从 SQLite 即时生成并下载。
- [x] 增加导出预览、复制和下载交互。
- [x] 新增导出纯函数测试。

## Batch 05

- [x] 新增导出审阅页。
- [x] 增加导出前 checklist。
- [x] 增加事实核验记录。
- [x] 增加发布文案编辑。
- [x] 增加 review summary。
- [x] Dashboard 与 Export 页展示审阅状态。
- [x] `publish-copy.md` 优先使用人工编辑文案。

## Batch 06

- [x] 新增 `/demo` 公开演示首页。
- [x] 新增两份公开安全模拟文章和 demo seed。
- [x] 新增 Demo Mode Banner。
- [x] 新增 `POST /api/demo/reset`。
- [x] 为 `video_projects` 增加 `is_demo` 标记。
- [x] Dashboard 区分公开 Demo 项目和最近普通项目。
- [x] 动态项目页对 demo 项目展示 Demo Mode Banner。
- [x] 新增 Public Demo Guide。
- [x] 新增 demo seed/reset/banner/dashboard 测试。

## Batch 07

- [x] 新增 Agent 定义层和 7 个 mock Agent。
- [x] 新增 Agent run、step、context snapshot 和 QA result 数据表。
- [x] 新增 tracked mock pipeline。
- [x] `/api/mock/production-pack` 返回 `agentRunId`。
- [x] Demo reset 生成 agent run 记录。
- [x] 新增 `/agents` 和 `/agents/[agentSlug]`。
- [x] 新增项目 Agent Runs 页面。
- [x] Dashboard 展示最近 agent run 状态。
- [x] 新增 Agent registry、tracked pipeline、QA 和 dashboard helper 测试。

## Batch 08 建议

- [x] 安装 OpenAI SDK。
- [x] 新增 `.env.example`。
- [x] 新增 server-side AI config、client、structured output 和 error 类型。
- [x] 新增 7 个 AI Agent prompt template。
- [x] 新增 AI output schema。
- [x] 新增 `runAiPipeline`，支持 Zod 校验和 mock fallback。
- [x] 新增 `POST /api/ai/production-pack`。
- [x] `/articles/new` 支持 Mock / AI Agent 模式选择。
- [x] Analysis 和 Agent Runs 展示 generation mode / fallback 状态。
- [x] 新增 Batch 08 测试。

## Batch 09

- [x] 新增 `/projects/[projectId]/showcase` 成品展示页。
- [x] 新增 Showcase mapper 和展示模型测试。
- [x] 展示 generation mode、fallback、Agent Run 摘要、核心观点、标题候选、脚本、分镜、Prompt、版权风险和发布文案。
- [x] Dashboard、ProjectNav、Analysis、Review、Export 增加 Showcase 入口。
- [x] Showcase 下载 `production-pack.md` 并跳转 Review / Export / Agent Runs。
- [x] 文档更新为 Batch 09 状态。

## Batch 10A

- [x] 新增 `/quick-demo` Title-only Fast Demo 页面。
- [x] 根据标题、内容类型和可选行业标签构造合法 `ArticleInput`。
- [x] `rawText` 明确标注标题演示 brief、事实需核验和“不构成投资建议”。
- [x] 调用现有 `/api/ai/production-pack` 并成功跳转 Showcase。
- [x] Dashboard 和 `/demo` 增加 Quick Demo 入口。
- [x] Showcase 对 `Title-only Demo` 来源项目显示事实核验提示。
- [x] 新增 Quick Demo helper、导航和 Showcase warning 测试。

## Batch 10 建议

- [ ] 增加 prompt 版本管理和 prompt diff。
- [ ] 增加真实 AI 输出质量评分和人工批准开关。
- [ ] 增加浏览器端流程测试。
- [ ] 增加审阅历史和审阅人字段。
- [ ] 增加导出前事实核验 checklist 的锁定/确认流程。

## 暂不做

- [x] AI API 文本生成接入。
- [ ] 云数据库接入。
- [ ] 登录和权限。
- [ ] 自动素材下载。
- [ ] 自动发布视频号。
- [ ] 自动生成完整成片。
