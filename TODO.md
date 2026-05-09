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

## Batch 04 建议

- [ ] 实现真实 Markdown / CSV / JSON 导出生成，但仍不自动发布。
- [ ] 增加导出预览和复制下载交互。
- [ ] 为 ProductionPack 增加更完整的 fixture 覆盖。
- [ ] 增加浏览器端流程测试。

## 暂不做

- [ ] AI API 接入。
- [ ] 云数据库接入。
- [ ] 登录和权限。
- [ ] 自动素材下载。
- [ ] 自动发布视频号。
- [ ] 自动生成完整成片。
