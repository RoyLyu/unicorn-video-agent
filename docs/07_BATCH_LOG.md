# 07 Batch Log

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
