# Changelog

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
