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

## Batch 06 建议

- [ ] 增加浏览器端流程测试。
- [ ] 增加审阅历史和审阅人字段。
- [ ] 增加导出前事实核验 checklist 的锁定/确认流程。
- [ ] 评估真实 AI 接入前的 prompt 版本管理。

## 暂不做

- [ ] AI API 接入。
- [ ] 云数据库接入。
- [ ] 登录和权限。
- [ ] 自动素材下载。
- [ ] 自动发布视频号。
- [ ] 自动生成完整成片。
