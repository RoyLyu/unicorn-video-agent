# 06 Database Schema

## 当前阶段

Batch 08 继续使用 SQLite + Drizzle 做本地持久化。数据库服务本地 mock 闭环、真实 AI 文本 ProductionPack、公开受控演示和 Agent run 审阅；不接云数据库、不做登录、不保存真实素材文件、不保存真实导出文件。

## 文件位置

- 数据库文件：`data/unicorn-video-agent.sqlite`
- Drizzle 配置：`drizzle.config.ts`
- Schema 定义：`src/db/schema.ts`
- 迁移目录：`drizzle/`

`data/*.sqlite` 和 SQLite 临时文件已加入 `.gitignore`，不要提交真实数据库文件。

## 初始化与迁移

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

日常本地启动前至少运行一次：

```bash
pnpm db:migrate
```

## 表结构

- `articles`：文章输入，包括标题、正文、链接、发布日期、来源、行业标签和目标时长。
- `video_projects`：视频项目元数据，保存 `projectId`、状态、`is_demo` 和完整 `ProductionPack` JSON。
- `analysis_runs`：分析摘要、关键事实、行业数据、风险点和核心观点。
- `scripts`：90s / 180s mock 脚本。
- `shots`：分镜表。
- `asset_prompts`：AI 图像 prompt、AI 视频 prompt 和素材搜索线索。
- `rights_checks`：版权风险检查，等级限定为 `green`、`yellow`、`red`、`placeholder`。
- `export_manifests`：导出文件清单；Batch 04 的真实文本内容由 API 即时生成，不落盘保存。
- `review_logs`：本地 mock 保存和后续人工审阅事件占位。
- `publish_copies`：人工编辑后的封面标题、标题候选、发布文案、标签和风险提示。
- `fact_checks`：事实核验记录，状态限定为 `pending`、`verified`、`needs_review`、`rejected`。
- `review_checklists`：导出前 checklist 的完成状态。
- `agent_definitions`：Agent 注册表快照，代码定义为 source of truth。
- `agent_runs`：一次 mock 或 AI pipeline 运行摘要，包括项目、状态、时间和错误信息。
- `agent_run_steps`：每个 Agent step 的顺序、状态、输入输出 JSON 和摘要。
- `agent_context_snapshots`：每个 Agent step 的上下文快照。
- `qa_results`：deterministic QA summary，包括 red rights risk 数量。

## 数据读取约定

- `POST /api/mock/production-pack` 接收 `ArticleInput`，运行 mock pipeline，写入 SQLite，返回 `projectId` 和 `ProductionPack`。
- `POST /api/ai/production-pack` 接收 `ArticleInput`，运行 OpenAI 文本 structured output pipeline，失败时 fallback 到 mock，写入 SQLite 并返回 `projectId`、`ProductionPack`、`agentRunId`、`fallbackUsed` 和 `generationMode`。
- `GET /api/projects` 返回最近项目列表。
- `GET /api/projects/[projectId]` 返回项目详情和完整 `ProductionPack`。
- `/projects/[projectId]/*` 动态页面从 SQLite 读取。
- `/api/projects/[projectId]/exports/[fileName]` 从 SQLite 读取 ProductionPack，并即时返回 Markdown、CSV 或 JSON 下载响应。
- `/api/projects/[projectId]/review` 读取和保存本地审阅聚合数据。
- `/api/projects/[projectId]/review/publish-copy` 保存人工发布文案。
- `/api/projects/[projectId]/review/fact-checks` 保存事实核验记录。
- `/api/demo/reset` 只删除并重建 `video_projects.is_demo = true` 的公开 demo 项目。
- `/projects/[projectId]/agent-runs` 读取项目 agent run。
- `/agents` 和 `/agents/[agentSlug]` 读取 Agent 注册表和最近运行。
- `/projects/demo/*` 保留 demo fallback，不作为主存储路径。

## 不做事项

- 不做 AI 生图、生视频或 TTS。
- 不接云数据库。
- 不做用户登录。
- 不自动抓取公众号。
- 不自动下载网络素材。
- 不生成真实图片、视频、音频。
- 不把 Markdown、CSV、JSON 导出文件写入仓库、`data/` 或服务器文件系统。
- 不自动成片或发布视频号。
