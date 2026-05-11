# 12 Final Demo Runbook

## 演示前检查

- 确认当前分支包含 Batch 09 Showcase、Batch 10A Quick Demo 和 Batch 10B QA 更新。
- 确认 `pnpm install` 已完成。
- 确认本地 SQLite 可用：`pnpm db:migrate`。
- 确认最终验证命令已通过：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
- 演示前先跑一次真实审计，确认 `fallbackUsed=false`、`generationMode=ai`、`ProductionPack.mode=ai`。
- 演示前打开 `/quick-demo`，确认默认模式为“真实生成”，并检查 Showcase 不出现 fallback 提示。

## .env.local 检查项

`.env.local` 至少需要检查这些变量名，不要在演示中展示或朗读真实 key：

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
AI_REQUIRE_REAL_OUTPUT=true
AI_ALLOW_MOCK_FALLBACK=false
AI_BANNED_OUTPUT_TERMS=mock,Batch 02,后续补齐,demo-data,不是真实 AI,只生成 JSON 生产包,本地 mock,Mock Pipeline
```

如果 Quick Demo 提示检查 `.env.local`，优先确认 `AI_PROVIDER`、`AI_MODEL`、`MINIMAX_API_KEY` / `OPENAI_API_KEY` 和 baseURL。Batch 12A 默认不允许 fallback 冒充成品；如临时需要链路演示，只能在 `/quick-demo` 选择“快速演示”，并说明结果不可投入使用。

## 启动命令

```bash
pnpm db:migrate
pnpm dev
```

本地服务默认访问：

```text
http://localhost:3000
```

## 标准演示路径

1. 打开 `/dashboard` 或 `/demo`，说明最终演示路径。
2. 点击 `/quick-demo`。
3. 输入一个标题，选择内容类型，可选填写行业标签。
4. 点击生成，等待 AI Agent 生成。
5. 进入 `/projects/[projectId]/showcase`，先确认 generationMode 为 AI、fallbackUsed 为 false，再讲解核心观点、标题候选、脚本、分镜、Prompt、版权风险和发布文案。
6. 点击下载 `production-pack.md`。
7. 点击 Export，展示其余文本导出文件。

## 真实运行审计

演示前或发现输出质量问题时，可以运行一次审计命令：

```bash
pnpm audit:real-run -- --title "虚构家庭医疗公司冲刺上市" --templateType ipo --industryTags "医疗,IPO"
```

审计默认 require real。真实成功时会创建一个本地项目记录，并保存两份 latest 文件：

- `tmp/real-run-audit/latest-production-pack.json`
- `tmp/real-run-audit/latest-qa-report.md`

报告重点检查 Storyboard 是否可剪辑执行、Prompt 是否可直接用于后续素材生成工具、版权风险是否可控，以及当前结果是否适合 demo。审计只记录问题和修改建议，不会自动优化 Agent、不生成图片视频、不下载素材。

如果 AI 失败、fallbackUsed 为 true、mode 不是 `ai` 或输出包含禁用占位词，审计命令会 exit 1，并改写 failed 文件：

- `tmp/real-run-audit/failed-production-pack.json`
- `tmp/real-run-audit/failed-qa-report.md`

失败审计不会覆盖 `latest-production-pack.json` 与 `latest-qa-report.md`。只有显式传入 `--allowFallback` 才允许 fallback 审计，但该报告不能作为成功演示锚点。

Batch 11B 后，演示前建议使用这条标题做一次质量验收：

```bash
pnpm audit:real-run -- --title "新消费品牌上市背后：中国品牌全球化的第二轮机会来了" --templateType ipo --industryTags "IPO,消费,出海,新消费"
```

验收口径：

- `fallbackUsed` 必须为 `false` 才能说明真实 AI 质量达标。
- `generationMode` 与 `ProductionPack.mode` 必须为 `ai`。
- 输出中不得出现 `mock`、`Batch 02`、`后续补齐`、`demo-data`、`不是真实 AI` 等禁用词。
- `storyboard_actionability_score`、`prompt_usability_score`、`rights_safety_score`、`overall_demo_readiness_score` 应达到 4/5 或以上。
- `production-pack.md` 下载路径应出现在报告中，并可从 Showcase 或 Export 进入。
- 如果报告列出低分 shotId / promptId，优先检查 single-pack prompt 和 normalization 规则。

## 推荐 5 个标题

1. 新消费品牌上市背后：中国品牌全球化的第二轮机会来了
2. AI Agent 正在重写企业软件，为什么下一代 SaaS 会先被替代？
3. 人形机器人融资升温：资本为什么重新押注具身智能？
4. 家庭医疗器械上市潮背后：中国正在进入家庭健康管理时代
5. 中国品牌出海进入第二阶段：从低价供应链到全球生活方式

## Batch 11C 冻结 Demo

- 冻结 Showcase：`/projects/f966086f-1599-4b30-be3d-231b04d02d45/showcase`
- 冻结导出：`/api/projects/f966086f-1599-4b30-be3d-231b04d02d45/exports/production-pack.md`
- 该项目真实 AI 运行 `fallbackUsed=false`，Demo-ready yes。
- red 版权项不是生成失败，而是“不可直接使用素材”。演示时必须说明替代方案，例如自制图表、抽象 AI 商业画面或 placeholder 复核项。
- 详见 `docs/13_REAL_RUN_AUDIT_SUMMARY.md`。

## 出错时如何处理

- 看到 `.env.local` 配置提示：暂停演示真实 AI，检查环境变量是否完整。
- 看到 strict 生成失败：不要继续当成成品展示；检查 `.env.local`、模型响应或 schema 错误后重新生成。
- 看到“当前使用 fallback 结果”：只能作为快速演示链路说明，不能作为真实 AI 结果或正式成品。
- 看到超时提示：改用更短标题，或稍后重试。
- 如果 `/quick-demo` 请求失败：切到 `/demo` 的公开安全样例，继续展示 Showcase、Review 和 Export。
- 不要展示 API key，不要复制 `.env.local` 内容到公开屏幕。

## 展示话术

这是《独角兽早知道》Video Agent MVP 的最终本地演示路径。演示从一个标题开始，系统构造 title-only brief，调用 AI Agent 生成文本 ProductionPack，然后进入 Showcase 展示核心观点、脚本、分镜、Prompt、版权风险和发布文案。Showcase 是视频号生产包展示，不是最终成片视频。

如果页面出现 fallback/mock 红色提示，说明当前结果不可作为正式成品。Batch 12A 默认真实生成会阻断这种结果；只有显式“快速演示”才允许进入链路，用来说明产品流程而不是证明真实 AI 质量。

## 不可承诺事项

- 不承诺自动生成最终视频。
- 不承诺 AI 生图、AI 生视频或 TTS。
- 不承诺自动剪辑或自动发布视频号。
- 不承诺自动下载或授权素材。
- 不承诺 Title-only Demo 可直接正式发布。
- 不承诺 AI 输出无需人工事实核验、版权复核和审阅。
- 不构成投资建议。
