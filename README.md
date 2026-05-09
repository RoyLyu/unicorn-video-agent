# 独角兽早知道 Video Agent MVP

将《独角兽早知道》的公众号财经文章转化为微信视频号生产包，包括核心观点、90s/180s 脚本、分镜表、AI 素材 Prompt、素材搜索线索、版权风险表和发布文案。

## 当前阶段

Batch 02：本地 Mock 生产包流程。

当前仓库提供：

- Next.js + TypeScript App Router 项目骨架
- 统一后台 `AppShell`、侧边栏导航和静态页面
- 文章输入到本地 mock `ProductionPack` 的闭环
- `POST /api/mock/production-pack` 本地 API route
- 纯函数 mock Agent pipeline
- `localStorage` 临时保存和 demo fallback
- Zod schema 与 pipeline 单元测试
- 编号版产品、版权、视频号标准、Agent 合同、批次日志和决策文档

## MVP 范围

第一版只做“文章 → 视频号生产包”，不做自动成片。Batch 02 只做本地 mock pipeline，不接真实 AI API、不接数据库、不抓取公众号、不下载素材、不生成真实媒体、不生成真实导出文件、不发布视频号。

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

## Batch 02 验证路径

1. 打开 `/articles/new`。
2. 使用默认 demo 输入或手动输入文章信息。
3. 点击“生成 Mock 生产包”。
4. 页面跳转到 `/projects/demo/analysis`。
5. 查看 `/projects/demo/scripts`、`/projects/demo/shots`、`/projects/demo/rights`、`/projects/demo/export`。
6. 确认导出页只展示 manifest，不创建或下载真实文件。

## Batch 02 页面

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
    api/mock/production-pack/route.ts
  components/
  lib/
    mock-pipeline/
    schemas/
    storage/
```

## 不做什么

- 不自动抓取公众号全文
- 不自动下载网络素材
- 不自动发布视频号
- 不自动生成完整成片
- 不接真实 AI API
- 不接数据库
- 不做登录
- 不生成真实图片、视频、音频
- 不生成真实导出文件
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体
