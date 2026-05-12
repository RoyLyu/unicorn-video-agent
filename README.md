# 独角兽早知道 Video Agent MVP

将《独角兽早知道》的公众号财经文章转化为微信视频号生产包，包括核心观点、90s/180s 脚本、分镜表、AI 素材 Prompt、素材搜索线索、版权风险表和发布文案。

## 当前阶段

Batch 13D：Shot Function Coverage Stabilization。

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
- Strict Real AI Mode：真实生产和真实审计默认不允许 mock fallback 冒充成品
- 面向外部展示、录屏和讲解的 `/projects/[projectId]/showcase`
- 只输入标题即可生成并跳转 Showcase 的 `/quick-demo`
- 最终演示路径提示、fallback 风险提示和 `docs/12_FINAL_DEMO_RUNBOOK.md`
- 真实 AI 端到端审计命令 `pnpm audit:real-run`
- Storyboard / Prompt / Rights 输出质量 normalization 与审计评分
- 90s / 180s micro-shot 与 prompt bundle 对齐门禁
- Shot Density Profile：`lite` / `standard` / `dense`，默认 `standard`
- 可编辑 Production Studio 页面 `/projects/[projectId]/production-studio`
- Production Studio edits overlay、Gate revalidate 和锁版状态
- AIGC Creative Direction、Visual Style Bible、Continuity Bible
- shot-level production contract：shotFunction、productionMethod、editing metadata 和 8 类 prompt 信息
- `production-pack.md` 完整逐镜头 AIGC 制作表、Prompt/Report completeness gate
- AI raw output enum canonicalization gate：在严格 schema 校验前规范化常见自然语言 enum，未知 enum 仍 fail loudly
- Shot Function Coverage gate：90s / 180s 分镜必须覆盖必要镜头功能，normalization 可基于真实 AI 输出重平衡 shotFunction
- 冻结成功 Demo 项目和版权风险替代方案展示
- fallback/mock 成品门禁：Showcase、Export 和 real-run audit 不再把 fallback 当作成功成品
- 纯函数 mock Agent pipeline
- `localStorage` demo fallback
- Zod schema 与 pipeline 单元测试
- repository 单元测试
- 编号版产品、版权、视频号标准、Agent 合同、数据库、批次日志和决策文档

## MVP 范围

第一版只做“文章 → 视频号生产包”，不做自动成片。Batch 13D 只修复 shotFunction coverage：允许 normalization 基于真实 AI 返回的 shot、位置、版本和密度 profile 重平衡 `shotFunction` 标签，确保 90s / 180s 都有清晰镜头功能分工；不放宽 strict real output gate，不降低评分标准，不允许 mock/fallback 冒充正式成品，不调用 AI 重新生成，不做 AI 生图、生视频、TTS、Remotion、自动成片、素材下载、登录、云数据库、云部署或视频号发布。

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
AI_MAX_TOKENS=16000
SHOT_DENSITY_PROFILE=standard
AI_REQUIRE_REAL_OUTPUT=true
AI_ALLOW_MOCK_FALLBACK=false
AI_BANNED_OUTPUT_TERMS=mock,Batch 02,后续补齐,demo-data,不是真实 AI,只生成 JSON 生产包,本地 mock,Mock Pipeline
```

`AI_MODEL` 必须从环境变量读取，业务逻辑不写默认模型。MiniMax OpenAI-compatible client 会优先读取 `MINIMAX_API_KEY` 与 `MINIMAX_BASE_URL`，再 fallback 到 `OPENAI_API_KEY` 与 `OPENAI_BASE_URL`。`AI_AGENT_MODE` 默认 `single_pack`，即一次 Chat Completions 调用生成完整 `ProductionPack`；只有显式设置为 `sequential` 时才走旧的 7-step remote runner。Batch 12B/13A 建议 `AI_MAX_TOKENS=16000`，以承载 dense profile 的 90 个 micro-shots 和对应 prompt bundles。`SHOT_DENSITY_PROFILE` 默认 `standard`：90s 至少 24 shots、180s 至少 48 shots、总数至少 72；`dense` 继续用于 30/60 高密度剪辑和压力测试。

Batch 12A 默认启用 strict real output：`AI_REQUIRE_REAL_OUTPUT=true` 且 `AI_ALLOW_MOCK_FALLBACK=false`。缺少 key、baseURL、model、AI schema 失败、provider 失败或命中 `AI_BANNED_OUTPUT_TERMS` 时，`/api/ai/production-pack` 返回 422，不保存 mock 项目为成功成品。只有 `/quick-demo` 中显式选择“快速演示”或设置允许 fallback 时，mock fallback 才会保存，并且页面和导出会标红提示不可投入使用。

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

## Batch 11A Real Run Audit

运行一次真实 AI 端到端审计：

```bash
pnpm audit:real-run -- --title "虚构家庭医疗公司冲刺上市" --templateType ipo --industryTags "医疗,IPO"
```

审计默认要求真实 AI 成功。成功时会创建本地 SQLite 项目，并输出：

```text
tmp/real-run-audit/latest-production-pack.json
tmp/real-run-audit/latest-qa-report.md
```

`tmp/` 已加入 `.gitignore`，不要提交真实审计 JSON。报告只指出质量问题和 Batch 11B 修复方向，不会优化 Storyboard 或 Prompt Generator。

Batch 12A 起，如果审计检测到 API 非 2xx、`fallbackUsed=true`、`generationMode` 或 `ProductionPack.mode` 不是 `ai`、或输出包含禁用占位词，命令会 exit 1，并只写入：

```text
tmp/real-run-audit/failed-production-pack.json
tmp/real-run-audit/failed-qa-report.md
```

失败审计不会覆盖 `latest-production-pack.json` 与 `latest-qa-report.md`。只有显式传入 `--allowFallback` 才允许生成 fallback 审计报告，但该报告不能冒充 latest success。

Batch 13B-Hotfix 起，审计还会生成并检查 `production-pack.md` 文本本身。缺少 `AIGC 制作总控`、`视觉风格 Bible`、`连续性 Bible`、`逐镜头 AIGC 制作表` 或关键 shot/prompt 字段时，命令会写入 failed artifacts，不覆盖 latest success。

## Batch 11B 质量验收

## Batch 13B AIGC Production Contract

Batch 13B 将 ProductionPack 从“shot/prompt 对齐文本包”升级为 AIGC 视频制作规格。真实或 effective ProductionPack 应包含：

- `creativeDirection`：视觉核心、视觉隐喻、主视觉符号、叙事推进和制作总说明。
- `visualStyleBible`：9:16 竖屏、色彩、灯光、材质、字体、图表和禁止元素。
- `continuityBible`：人物/空间/物件/色彩/运动/图形/字体连续性和 reference frame plan。
- 每个 shot 的 `shotFunction`、`productionMethod`、`methodReason`、subject、environment、lighting、style 和 editing metadata。
- 每个 prompt bundle 的 shotCode、duration、subject、environment、camera、lighting、style、negativeConstraints、forbiddenElements 和 replacementPlan。

Production Studio、Showcase、Export 和 `pnpm audit:real-run` 会显示 Visual Bible、Continuity、Shot Function、Production Method、Editing Readiness 和 Prompt Completeness。任一核心分数低于 4 时，界面和审计报告必须显示“需要重跑 / 人工修正”，且 Production Studio lock 会被拒绝。

Batch 11B 默认使用 `AI_AGENT_MODE=single_pack`。生成后的 ProductionPack 会在保存前做文本 normalization：

- 分镜至少 8 个 shots。
- 每个 shot 的 `visual` 包含主体、场景、镜头、构图和图表逻辑。
- imagePrompt / videoPrompt 覆盖每个 shot，并带统一 style lock。
- negativePrompt 自动补齐 Logo、文字、中文、人脸和 cyberpunk 禁用项。
- red rights risk 必须带替代方案。

验收时重新运行真实审计，并确认 `storyboard_actionability_score`、`prompt_usability_score`、`rights_safety_score`、`overall_demo_readiness_score` 均达到 4/5 或以上。若 `fallbackUsed=true`，不能把结果计为真实 AI 质量达标。

## Batch 11C 冻结 Demo

- Showcase: `/projects/f966086f-1599-4b30-be3d-231b04d02d45/showcase`
- production-pack.md: `/api/projects/f966086f-1599-4b30-be3d-231b04d02d45/exports/production-pack.md`
- generationMode: `ai`
- fallbackUsed: `false`
- Demo-ready: yes
- Storyboard 5/5，Prompt 5/5，Rights 4/5，Overall 4/5

版权展示口径：red 项保留原始 `red` 等级，但展示为“不可直接使用素材”，并必须说明替代方案，例如自制图表、抽象 AI 商业画面或 placeholder 复核项。详见 `docs/13_REAL_RUN_AUDIT_SUMMARY.md`。

## Batch 12A 严格真实输出门禁

- `/api/ai/production-pack` 在真实模式下失败即返回 422，不返回 fallback mock `projectId`。
- output contamination scanner 会递归扫描 ProductionPack 文本字段，命中 `mock`、`Batch 02`、`后续补齐`、`demo-data` 等禁用词时拒绝保存为成品。
- `/quick-demo` 默认“真实生成”，不允许 fallback；“快速演示”允许 fallback，但明确不可投入使用。
- Showcase 对 fallback/mock 项目显示红色诊断或风险提示，禁用主 `production-pack.md` 下载按钮。
- Export 在 fallback/mock markdown 顶部写入“当前文件为 fallback/mock 结果，不可投入使用。”；strict mode 下会阻止 fallback/mock 的 `production-pack.md` 下载。

## Batch 12B Shot / Prompt Gate

- ProductionPack 支持 90s / 180s micro-shots；Batch 13A 后数量由 Shot Density Profile 决定。
- `assetPrompts.promptBundles` 是 canonical prompt 数量来源，每个 shot 对应一个 bundle，包含 imagePrompt、videoPrompt、negativePrompt、styleLock、aspectRatio 和 usageWarning。
- normalization 只基于真实 AI 输出、脚本、观点和文章输入扩展 micro-shots，不调用 mock pipeline 补正式输出。
- red rights risk 必须包含 replacementPlan。
- Showcase 和 `production-pack.md` 展示 Shot / Prompt Gate Summary；低于标准时显示“需要重跑 / 人工修正”。
- Production Studio 页面展示 shot / prompt 对应表、版权等级汇总、red replacementPlan 和 gate score。

## Batch 13A Production Studio

- 默认 Shot Density Profile 为 `standard`：90s >= 24、180s >= 48、total >= 72。
- `lite` 为 20/40/60，适合轻量策划案；`dense` 为 30/60/90，适合高密度剪辑和压力测试。
- Production Studio 的人工编辑以 overlay 方式保存到 `production_studio_edits`，不覆盖原始 AI `ProductionPack`。
- “重新校验 Gate”只做 deterministic 检查，不调用 AI、不读取 API key。
- Gate pass 后可以锁定当前生产包；Showcase 和 Export 优先使用 effective ProductionPack，并显示 density、gate、lock、edited count 状态。

## Batch 10B 最终演示验收路径

1. 打开 `/dashboard` 或 `/demo`，确认展示最终演示路径：Quick Demo → AI Generate → Showcase → Export。
2. 打开 `/quick-demo`，确认默认模式为“真实生成”，输入标题，选择内容类型，可选填写行业标签。
3. 点击生成，确认调用 `/api/ai/production-pack`，成功后跳转 `/projects/[projectId]/showcase`。
4. 在 Showcase 顶部确认 generationMode 为 AI、fallbackUsed 为 false、Title-only 事实核验提示存在且没有 fallback 风险提示。
5. 点击 Showcase 页的 `production-pack.md` 下载、Review、Export、Agent Runs 入口。
6. 对照 `docs/12_FINAL_DEMO_RUNBOOK.md` 完成演示前检查、推荐标题和异常处理预案。

## Batch 10B 页面

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
- `/projects/[projectId]/production-studio`
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

## Production Studio API

```text
GET /api/projects/[projectId]/production-studio
PATCH /api/projects/[projectId]/production-studio/edits
POST /api/projects/[projectId]/production-studio/revalidate
POST /api/projects/[projectId]/production-studio/lock
POST /api/projects/[projectId]/production-studio/unlock
```

这些 API 只读取 SQLite 和执行 deterministic gate check，不调用 AI、不下载素材、不读取 API key。

Demo reset API 只删除并重建 `is_demo = true` 的公开演示项目，返回两个 demo `projectId`。普通 mock 项目不会被删除。

## AI API

```text
POST /api/ai/production-pack
```

AI API 接收 `ArticleInput`，使用 `openai` SDK 调用 MiniMax OpenAI-compatible Chat Completions 生成文本 ProductionPack，写入 SQLite，返回 `projectId`、`productionPack`、`agentRunId`、`fallbackUsed` 和 `generationMode`。默认 single-pack 路径只调用一次 `client.chat.completions.create`，不传 `response_format` 或 Responses API 参数；所有 AI 输出都会先清理 `<think>...</think>`、Markdown code fence 和 JSON 前后解释文字，再 JSON.parse，并通过 Zod schema 校验。Batch 12A strict real output 默认开启，失败时返回 422，不保存 mock 成品；只有显式 fast demo 或允许 fallback 时，才会保存 fallback 项目并标红为不可投入使用。

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
  11_PUBLIC_DEMO_GUIDE.md
  12_FINAL_DEMO_RUNBOOK.md
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
