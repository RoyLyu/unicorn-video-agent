# TODO

## Batch 13B

- [x] ProductionPack schema 兼容 `creativeDirection`、`visualStyleBible`、`continuityBible`。
- [x] single-pack prompt 要求全片 Creative Direction、Visual Bible、Continuity Bible 和 shot-level production contract。
- [x] normalization 补齐 shotFunction、productionMethod、editing metadata、continuityAssets 和 8 类 prompt 信息。
- [x] Production Studio gate 增加 Visual Bible、Continuity、Shot Function、Production Method、Editing Readiness 和 Prompt Completeness 分数。
- [x] Production Studio UI 增加 AIGC contract 总览、pack-level 编辑区、筛选和新增字段编辑。
- [x] Showcase 展示视觉总控、连续性、镜头功能、制作方式、剪辑准备度和 prompt 完整性。
- [x] Export 输出 Creative Direction、Visual Style Bible、Continuity Bible、editing summary 和新增 CSV/Prompt 字段。
- [x] real-run audit 增加 AIGC production contract 分数和 needsFix 判定。
- [x] 新增/更新 schema、normalization、Studio gate、effective edits、Showcase 和 Export 测试。

## Batch 13A

- [x] 新增 Shot Density Profile：lite / standard / dense，默认 standard。
- [x] single-pack prompt、normalization、Production Studio gate 和 audit 支持 density profile。
- [x] 新增 production_studio_edits、production_studio_gate_runs、production_studio_locks 表。
- [x] 新增 effective ProductionPack resolver，人工 edits 不覆盖原始 AI 输出。
- [x] Production Studio 支持编辑 shot、prompt 和 replacementPlan。
- [x] Production Studio 支持批量保存、重新校验 Gate、锁定和解除锁定。
- [x] 新增 Production Studio GET/PATCH/revalidate/lock/unlock API。
- [x] Showcase、Export 和 Dashboard 显示 density、gate、lock、edited count 和 needsFix 状态。
- [x] Export 使用 effective ProductionPack，并在 project.json 中包含 productionStudio summary。
- [x] 新增 density、effective pack、repository、API no-AI 和 export 联动测试。

## Batch 12B

- [x] 扩展 ProductionPack schema，支持 versionType、shotNumber 和 promptBundles。
- [x] 更新 single-pack prompt，要求 90s 30 shots、180s 60 shots 和一一对应 prompt bundle。
- [x] normalization 补齐 30/60 micro-shots、promptBundles、legacy prompts 和 red replacementPlan。
- [x] 新增 Production Studio alignment、mapper 和 score 工具。
- [x] 新增 `/projects/[projectId]/production-studio` 页面。
- [x] ProjectNav、Dashboard、Showcase、Review、Export、Agent Runs 增加 Production Studio 入口。
- [x] Showcase 展示 Shot / Prompt Gate 摘要和“需要重跑 / 人工修正”。
- [x] Export 增加 Shot / Prompt Gate Summary、storyboard versionType 和 prompt-pack bundle 输出。
- [x] real-run audit 增加 shot/prompt gate 失败门禁。
- [x] 新增 schema、normalization、Studio、Export、Showcase 和 Audit 测试。

## Batch 12A

- [x] 新增 strict AI policy，默认真实输出必需、mock fallback 不允许。
- [x] 新增 output contamination scanner，递归扫描 ProductionPack 文本字段。
- [x] `/api/ai/production-pack` 在 strict 失败时返回 422，不保存 fallback mock 成品。
- [x] `generationProfile=fast_demo` 才允许显式 fallback，并标记不可投入使用。
- [x] real-run audit 默认 require real，fallback 或污染输出写入 failed artifacts 且不覆盖 latest success。
- [x] Showcase 对 fallback/mock 项目标红、禁用主下载并提供重新生成入口。
- [x] Export 在 fallback/mock markdown 顶部写不可投入使用，strict mode 阻止 fallback production-pack 下载。
- [x] `/quick-demo` 增加“真实生成 / 快速演示”模式，默认真实生成。
- [x] `/quick-demo` 和 `/articles/new` 明确完整文章正文或事实材料要求。
- [x] 更新 `.env.example` 与 Batch 12A 文档。

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

## Batch 06

- [x] 新增 `/demo` 公开演示首页。
- [x] 新增两份公开安全模拟文章和 demo seed。
- [x] 新增 Demo Mode Banner。
- [x] 新增 `POST /api/demo/reset`。
- [x] 为 `video_projects` 增加 `is_demo` 标记。
- [x] Dashboard 区分公开 Demo 项目和最近普通项目。
- [x] 动态项目页对 demo 项目展示 Demo Mode Banner。
- [x] 新增 Public Demo Guide。
- [x] 新增 demo seed/reset/banner/dashboard 测试。

## Batch 07

- [x] 新增 Agent 定义层和 7 个 mock Agent。
- [x] 新增 Agent run、step、context snapshot 和 QA result 数据表。
- [x] 新增 tracked mock pipeline。
- [x] `/api/mock/production-pack` 返回 `agentRunId`。
- [x] Demo reset 生成 agent run 记录。
- [x] 新增 `/agents` 和 `/agents/[agentSlug]`。
- [x] 新增项目 Agent Runs 页面。
- [x] Dashboard 展示最近 agent run 状态。
- [x] 新增 Agent registry、tracked pipeline、QA 和 dashboard helper 测试。

## Batch 08 建议

- [x] 安装 OpenAI SDK。
- [x] 新增 `.env.example`。
- [x] 新增 server-side AI config、client、structured output 和 error 类型。
- [x] 新增 7 个 AI Agent prompt template。
- [x] 新增 AI output schema。
- [x] 新增 `runAiPipeline`，支持 Zod 校验和 mock fallback。
- [x] 新增 `POST /api/ai/production-pack`。
- [x] `/articles/new` 支持 Mock / AI Agent 模式选择。
- [x] Analysis 和 Agent Runs 展示 generation mode / fallback 状态。
- [x] 新增 Batch 08 测试。

## Batch 09

- [x] 新增 `/projects/[projectId]/showcase` 成品展示页。
- [x] 新增 Showcase mapper 和展示模型测试。
- [x] 展示 generation mode、fallback、Agent Run 摘要、核心观点、标题候选、脚本、分镜、Prompt、版权风险和发布文案。
- [x] Dashboard、ProjectNav、Analysis、Review、Export 增加 Showcase 入口。
- [x] Showcase 下载 `production-pack.md` 并跳转 Review / Export / Agent Runs。
- [x] 文档更新为 Batch 09 状态。

## Batch 10A

- [x] 新增 `/quick-demo` Title-only Fast Demo 页面。
- [x] 根据标题、内容类型和可选行业标签构造合法 `ArticleInput`。
- [x] `rawText` 明确标注标题演示 brief、事实需核验和“不构成投资建议”。
- [x] 调用现有 `/api/ai/production-pack` 并成功跳转 Showcase。
- [x] Dashboard 和 `/demo` 增加 Quick Demo 入口。
- [x] Showcase 对 `Title-only Demo` 来源项目显示事实核验提示。
- [x] 新增 Quick Demo helper、导航和 Showcase warning 测试。

## Batch 10B

- [x] Quick Demo fallback 时显示“当前使用 fallback 结果”。
- [x] AI 配置缺失时提示检查 `.env.local`，超时时提示可改用短标题或稍后重试。
- [x] AI fallback API response 增加安全摘要和 fallback reason，不展示 API key。
- [x] Showcase fallback 时显示黄色风险提示。
- [x] Dashboard 和 `/demo` 展示最终演示路径。
- [x] 新增 `docs/12_FINAL_DEMO_RUNBOOK.md`。
- [x] 新增最终演示 QA 测试。

## Batch 11A

- [x] 新增 `pnpm audit:real-run`。
- [x] 新增 `scripts/real-run-audit.ts`。
- [x] 从标题、templateType、industryTags 构造 Title-only ArticleInput。
- [x] 复用现有 AI production-pack handler 生成真实本地项目。
- [x] 保存 `tmp/real-run-audit/latest-production-pack.json`。
- [x] 保存 `tmp/real-run-audit/latest-qa-report.md`。
- [x] 新增 7 个 Agent 的 QA scorer 和 Markdown 报告。
- [x] 新增 Storyboard、Prompt、Rights 风险识别测试。
- [x] `.gitignore` 忽略 `tmp/` 和 `tmp/real-run-audit/`。

## Batch 11B

- [x] 补齐 MiniMax single-pack prompt 和 runner。
- [x] `/api/ai/production-pack` 默认走 `AI_AGENT_MODE=single_pack`。
- [x] AI config 支持 `AI_PROVIDER=minimax`、MiniMax key/baseURL 优先级和请求参数默认值。
- [x] 新增 ProductionPack normalization，补齐 8 个以上可执行分镜。
- [x] Prompt normalization 覆盖每个 shot，并补齐 style lock 与 negativePrompt 禁用项。
- [x] red rights risk 自动补替代方案。
- [x] Real Run Audit scorer 输出低分 shotId / promptId。
- [x] QA scorer 对可执行分镜、完整 prompt 和有替代方案的 red rights 给出 4/5+。

## Batch 11C

- [x] 新增 `docs/13_REAL_RUN_AUDIT_SUMMARY.md`。
- [x] 冻结成功 Demo 项目 Showcase 和 `production-pack.md` 路径。
- [x] Showcase red rights risk 显示为“不可直接使用素材”。
- [x] Showcase red rights risk 显示替代方案且不隐藏 red 等级。
- [x] `production-pack.md` 版权段落改为“版权风险与替代方案”。
- [x] red rights risk 在导出中保留 red 等级，不自动降级。
- [x] 更新最终演示标题清单和 Batch 11C 文档。

## Batch 13B 后续建议

- [x] Batch 13B-Hotfix：`production-pack.md` 输出完整逐镜头 AIGC 制作表。
- [x] Batch 13B-Hotfix：`prompt-pack.md`、`storyboard.csv`、`rights-check.csv` 输出 production contract 字段。
- [x] Batch 13B-Hotfix：新增 report completeness gate，并接入 Production Studio、Showcase 和 real-run audit。
- [ ] 增加 prompt 版本管理和 prompt diff。
- [ ] 增加真实 AI 输出质量评分和人工批准开关。
- [ ] 增加浏览器端流程测试。
- [ ] 增加审阅历史和审阅人字段。
- [ ] 增加导出前事实核验 checklist 的锁定/确认流程。
- [ ] 增加 Production Studio 编辑 diff 视图和撤销能力。
- [ ] 增加按 shot 批量替换 style lock / negativePrompt 的工具。

## 暂不做

- [x] AI API 文本生成接入。
- [ ] 云数据库接入。
- [ ] 登录和权限。
- [ ] 自动素材下载。
- [ ] 自动发布视频号。
- [ ] 自动生成完整成片。
