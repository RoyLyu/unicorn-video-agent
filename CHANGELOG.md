# Changelog

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
