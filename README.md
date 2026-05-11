# 独角兽早知道 Video Agent MVP

将《独角兽早知道》的公众号财经文章转化为微信视频号生产包，包括核心观点、90s/180s 脚本、分镜表、AI 素材 Prompt、素材搜索线索、版权风险表和发布文案。

## 当前阶段

Batch 10A：Title-only Fast Demo。

当前仓库提供：

- Next.js + TypeScript App Router 项目骨架
- 统一后台 `AppShell`、侧边栏导航和静态页面
- 文章输入到本地 mock `ProductionPack` 的闭环
- `POST /api/mock/production-pack` 本地 API route，返回 `projectId` 与 `ProductionPack`
- SQLite + Drizzle 本地持久化，数据库文件位于 `data/unicorn-video-agent.sqlite`
- 动态项目页 `/projects/[projectId]/*`
- 即时生成 Markdown / CSV / JSON 文本导出
- 导出预览、复制和下载入口
- 内部审阅页、导出前 checklist、事实核验和发布文案编辑
- Dashboard 与 Export 页展示审阅状态
- 公开 Demo 首页 `/demo`
- 两个公开安全模拟项目、Demo Mode 标识和 Demo reset API
- Agent 注册表、Agent 运行日志、上下文快照和 deterministic QA summary
- Agent 管理页面与项目 Agent Runs 页面
- 真实 AI 文本生产包生成路径：`POST /api/ai/production-pack`
- AI Agent 生成失败时自动 fallback 到 mock pipeline
- 面向外部展示、录屏和讲解的 `/projects/[projectId]/showcase`
- 只输入标题即可生成并跳转 Showcase 的 `/quick-demo`
- 纯函数 mock Agent pipeline
- `localStorage` demo fallback
- Zod schema 与 pipeline 单元测试
- repository 单元测试
- 编号版产品、版权、视频号标准、Agent 合同、数据库、批次日志和决策文档

## MVP 范围

第一版只做“文章 → 视频号生产包”，不做自动成片。Batch 10A 只新增标题快速演示入口，不做 AI 生图、生视频、TTS、Remotion、自动成片、素材下载、登录、云数据库、云部署或视频号发布。

## 环境变量

复制 `.env.example` 到本地 `.env.local` 后填写：

```bash
GENERATION_MODE=ai
AI_PROVIDER=minimax
AI_MODEL=MiniMax-M2.7
MINIMAX_API_KEY=
MINIMAX_BASE_URL=https://api.minimaxi.com/v1
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.minimaxi.com/v1
AI_AGENT_MODE=single_pack
AI_REQUEST_TIMEOUT_MS=180000
AI_MAX_TOKENS=4000
```

`AI_MODEL` 必须从环境变量读取，业务逻辑不写默认模型。MiniMax OpenAI-compatible client 会优先读取 `MINIMAX_API_KEY` 与 `MINIMAX_BASE_URL`，再 fallback 到 `OPENAI_API_KEY` 与 `OPENAI_BASE_URL`。`AI_AGENT_MODE` 默认 `single_pack`，即一次 Chat Completions 调用生成完整 `ProductionPack`；只有显式设置为 `sequential` 时才走旧的 7-step remote runner。缺少 key、baseURL 或 model 时，AI 生成会记录 fallback 并使用 mock pipeline 继续完成生产包。

## 启动

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

本地开发服务默认运行在 `http://localhost:3000`。

## 验证

```bash
pnpm db:generate
pnpm db:migrate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Batch 10A 验证路径

1. 打开 `/quick-demo`，输入标题，选择内容类型，可选填写行业标签。
2. 点击生成，确认调用 `/api/ai/production-pack`，成功后跳转 `/projects/[projectId]/showcase`。
3. 在 Showcase 顶部确认出现“该项目由标题生成，事实信息需要人工核验。”提示。
4. 打开 `/articles/new`，确认完整文章输入流程未被破坏。
5. 打开 `/dashboard` 和 `/demo`，确认都有 Quick Demo 入口。
6. 点击 Showcase 页的 `production-pack.md` 下载、Review、Export、Agent Runs 入口。

## Batch 10A 页面

- `/`
- `/demo`
- `/quick-demo`
- `/agents`
- `/agents/[agentSlug]`
- `/dashboard`
- `/articles/new`
- `/articles/demo`
- `/projects/demo/analysis`
- `/projects/demo/scripts`
- `/projects/demo/shots`
- `/projects/demo/rights`
- `/projects/demo/export`
- `/projects/[projectId]/showcase`
- `/projects/[projectId]/analysis`
- `/projects/[projectId]/scripts`
- `/projects/[projectId]/shots`
- `/projects/[projectId]/rights`
- `/projects/[projectId]/agent-runs`
- `/projects/[projectId]/agent-runs/[runId]`
- `/projects/[projectId]/review`
- `/projects/[projectId]/export`
- `/settings`

## 导出 API

```text
GET /api/projects/[projectId]/exports/production-pack.md
GET /api/projects/[projectId]/exports/storyboard.csv
GET /api/projects/[projectId]/exports/project.json
GET /api/projects/[projectId]/exports/rights-check.csv
GET /api/projects/[projectId]/exports/prompt-pack.md
GET /api/projects/[projectId]/exports/publish-copy.md
```

导出 API 从 SQLite 读取 `ProductionPack`，即时返回文本内容和 `Content-Disposition: attachment`，不写入服务器文件系统。

## Review API

```text
GET /api/projects/[projectId]/review
POST /api/projects/[projectId]/review
PATCH /api/projects/[projectId]/review/publish-copy
PATCH /api/projects/[projectId]/review/fact-checks
```

Review API 只保存本地审阅状态、事实核验记录和人工发布文案，不调用外部 API。

## Demo API

```text
POST /api/demo/reset
```

Demo reset API 只删除并重建 `is_demo = true` 的公开演示项目，返回两个 demo `projectId`。普通 mock 项目不会被删除。

## AI API

```text
POST /api/ai/production-pack
```

AI API 接收 `ArticleInput`，使用 `openai` SDK 调用 MiniMax OpenAI-compatible Chat Completions 生成文本 ProductionPack，写入 SQLite，返回 `projectId`、`productionPack`、`agentRunId`、`fallbackUsed` 和 `generationMode`。默认 single-pack 路径只调用一次 `client.chat.completions.create`，不传 `response_format` 或 Responses API 参数；所有 AI 输出都会先清理 `<think>...</think>`、Markdown code fence 和 JSON 前后解释文字，再 JSON.parse，并通过 Zod schema 校验；失败时记录 schema path，Agent Run/Step 标记 `completed_with_fallback` 并 fallback 到 mock。

## Agent Management

Batch 07 新增本地 Agent 管理层：

- `Article Analyst`
- `Thesis Agent`
- `Script Writer`
- `Storyboard Agent`
- `Prompt Generator`
- `Asset Finder`
- `QA Agent`

每次 mock 或 AI pipeline 会创建 `agent_run`，并记录 7 个 `agent_run_step`、上下文快照和 QA summary。Batch 08 的真实 AI 只生成文本结构化输出；失败时 step/run 会显示 `completed_with_fallback`。

## 数据库

- 数据库文件：`data/unicorn-video-agent.sqlite`
- 迁移目录：`drizzle/`
- Schema：`src/db/schema.ts`
- Drizzle 配置：`drizzle.config.ts`
- Batch 05 新增表：`publish_copies`、`fact_checks`、`review_checklists`
- Batch 06 新增字段：`video_projects.is_demo`
- Batch 07 新增表：`agent_definitions`、`agent_runs`、`agent_run_steps`、`agent_context_snapshots`、`qa_results`

初始化或迁移：

```bash
pnpm db:migrate
```

重新生成迁移：

```bash
pnpm db:generate
```

## 项目结构

```text
docs/
  01_MVP_SCOPE.md
  03_COPYRIGHT_POLICY.md
  04_VIDEOHAO_STANDARD.md
  05_AGENT_CONTRACTS.md
  06_DATABASE_SCHEMA.md
  07_BATCH_LOG.md
  08_DECISIONS.md
drizzle/
src/
  app/
    api/mock/production-pack/route.ts
    api/demo/reset/route.ts
    api/projects/
    agents/
    demo/
    quick-demo/
    projects/[projectId]/
  components/
  db/
  lib/
    export/
    agents/
    quick-demo/
    mock-pipeline/
    schemas/
    storage/
```

## 不做什么

- 不自动抓取公众号全文
- 不自动下载网络素材
- 不自动发布视频号
- 不自动生成完整成片
- 不接云数据库
- 不做登录
- 不做云部署
- 不生成真实图片、视频、音频
- 不做 AI 生图、生视频或 TTS
- 不把导出文件写入仓库或 data 目录
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体
