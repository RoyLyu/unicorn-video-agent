# 独角兽早知道 Video Agent MVP

将《独角兽早知道》的公众号财经文章转化为微信视频号生产包，包括核心观点、90s/180s 脚本、分镜表、AI 素材 Prompt、素材搜索线索、版权风险表和发布文案。

## 当前阶段

Batch 01：后台 UI Shell 与导航结构。

当前仓库提供：

- Next.js + TypeScript App Router 项目骨架
- 统一后台 `AppShell`、侧边栏导航和静态页面
- 10 个 Batch 01 页面路由
- 集中 demo 假数据 `src/lib/demo-data.ts`
- 文章输入与视频号生产包的 Zod schema
- Schema 与 demo data 单元测试
- 编号版产品、版权、视频号标准、Agent 合同、批次日志和决策文档

## MVP 范围

第一版只做“文章 → 视频号生产包”，不做自动成片。Batch 01 只做静态 UI Shell，不接 AI API、不接数据库、不做自动导出、不做自动发布。

编号文档为后续主线：

- `docs/01_MVP_SCOPE.md`
- `docs/03_COPYRIGHT_POLICY.md`
- `docs/04_VIDEOHAO_STANDARD.md`
- `docs/05_AGENT_CONTRACTS.md`
- `docs/07_BATCH_LOG.md`
- `docs/08_DECISIONS.md`

Batch 00 原始文档仍保留在 `docs/PRD.md`、`docs/OUTPUT_SCHEMA.md`、`docs/COPYRIGHT_POLICY.md`、`docs/PROMPT_SYSTEM.md`。

## 启动

```bash
pnpm install
pnpm dev
```

本地开发服务默认运行在 `http://localhost:3000`。

## 验证

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Batch 01 页面

- `/`
- `/dashboard`
- `/articles/new`
- `/articles/demo`
- `/projects/demo/analysis`
- `/projects/demo/scripts`
- `/projects/demo/shots`
- `/projects/demo/rights`
- `/projects/demo/export`
- `/settings`

## 项目结构

```text
docs/
  01_MVP_SCOPE.md
  03_COPYRIGHT_POLICY.md
  04_VIDEOHAO_STANDARD.md
  05_AGENT_CONTRACTS.md
  07_BATCH_LOG.md
  08_DECISIONS.md
src/
  app/
  components/
  lib/
    demo-data.ts
    fixtures/
    schemas/
```

## 不做什么

- 不自动抓取公众号全文
- 不自动下载网络素材
- 不自动发布视频号
- 不自动生成完整成片
- 不接 AI API
- 不接数据库
- 不做登录
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体
