# 12 Final Demo Runbook

## 演示前检查

- 确认当前分支包含 Batch 09 Showcase、Batch 10A Quick Demo 和 Batch 10B QA 更新。
- 确认 `pnpm install` 已完成。
- 确认本地 SQLite 可用：`pnpm db:migrate`。
- 确认最终验证命令已通过：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build`。
- 演示前先跑一次 `/quick-demo`，确认能进入 Showcase，并检查是否出现 fallback 提示。

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
```

如果 Quick Demo 提示检查 `.env.local`，优先确认 `AI_PROVIDER`、`AI_MODEL`、`MINIMAX_API_KEY` / `OPENAI_API_KEY` 和 baseURL。

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
5. 进入 `/projects/[projectId]/showcase`，讲解 generationMode、fallbackUsed、核心观点、标题候选、脚本、分镜、Prompt、版权风险和发布文案。
6. 点击下载 `production-pack.md`。
7. 点击 Export，展示其余文本导出文件。

## 推荐 5 个标题

1. 虚构家庭医疗公司冲刺上市，基层健康管理赛道迎来新样本
2. 虚构消费品牌完成新一轮融资，线下渠道增长进入复盘期
3. 虚构 AI 芯片服务商扩张海外市场，算力产业链出现新变量
4. 虚构新能源回收企业提交上市申请，循环经济商业化提速
5. 虚构低空物流平台获得战略投资，区域配送网络进入验证阶段

## 出错时如何处理

- 看到 `.env.local` 配置提示：暂停演示真实 AI，检查环境变量是否完整。
- 看到“当前使用 fallback 结果”：继续进入 Showcase，但说明这是降级生产包，不代表真实 AI 完整成功。
- 看到超时提示：改用更短标题，或稍后重试。
- 如果 `/quick-demo` 请求失败：切到 `/demo` 的公开安全样例，继续展示 Showcase、Review 和 Export。
- 不要展示 API key，不要复制 `.env.local` 内容到公开屏幕。

## 展示话术

这是《独角兽早知道》Video Agent MVP 的最终本地演示路径。演示从一个标题开始，系统构造 title-only brief，调用 AI Agent 生成文本 ProductionPack，然后进入 Showcase 展示核心观点、脚本、分镜、Prompt、版权风险和发布文案。Showcase 是视频号生产包展示，不是最终成片视频。

如果页面出现 fallback 提示，说明系统为了保证演示不中断，已经使用本地 fallback 生产包继续完成流程。该结果可以用于说明产品链路，但不能作为真实 AI 输出质量证明。

## 不可承诺事项

- 不承诺自动生成最终视频。
- 不承诺 AI 生图、AI 生视频或 TTS。
- 不承诺自动剪辑或自动发布视频号。
- 不承诺自动下载或授权素材。
- 不承诺 Title-only Demo 可直接正式发布。
- 不承诺 AI 输出无需人工事实核验、版权复核和审阅。
- 不构成投资建议。
