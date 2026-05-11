# 11 Public Demo Guide

## 外部演示路径

1. 运行 `pnpm db:migrate`。
2. 运行 `pnpm dev`。
3. 打开 `/demo`。
4. 点击“重置 Demo 数据”。
5. 依次展示公开样例的 Analysis、Review 和 Export 页面。
6. 打开 Showcase，展示标题候选、脚本、分镜、Prompt、版权风险和发布文案。
7. 打开 Agent Runs，展示每个 mock Agent 的运行步骤、上下文快照和 QA summary。
8. 如需快速展示真实 AI 流程，打开 `/quick-demo`，输入一个标题后生成并直接进入 Showcase。
9. 外部演示前按 `docs/12_FINAL_DEMO_RUNBOOK.md` 完成最终检查。

## 标准展示话术

这是《独角兽早知道》Video Agent MVP 的本地公开 Demo。它演示文章输入或标题选题如何经过本地 mock pipeline 或受控 AI 文本 pipeline，形成视频号生产包，再进入人工审阅、Showcase 展示和文本导出。页面中的公开 demo 公司、行业数据、素材和文案均为模拟数据。

## 当前功能边界

- 支持文章输入到 ProductionPack 的本地 mock 闭环。
- 支持 SQLite 本地持久化。
- 支持 Review checklist、事实核验和人工发布文案。
- 支持 Markdown / CSV / JSON 文本预览、复制和下载。
- 支持两个公开安全 demo 项目重置。
- 支持 Agent 注册表、运行日志、上下文快照和 deterministic QA summary。
- 支持在普通项目中选择 AI Agent 文本生成，并在失败时 fallback 到 mock。
- 支持 Showcase 成品展示页，用于外部演示、录屏和讲解。
- 支持 `/quick-demo` Title-only Fast Demo，从一个标题快速生成生产包并进入 Showcase。
- 支持最终演示路径提示和 fallback 风险提示，便于现场说明 AI 是否完整成功。

## Mock 与真实 AI 的区别

当前公开 demo 默认使用确定性本地 mock pipeline，保证外部演示稳定。普通项目可选择 AI Agent 文本生成；AI 输出必须通过 Zod schema 校验，失败会 fallback 到 mock。无论 Mock 或 AI，都不做真实投研承诺，不自动生成真实图片、视频、音频或剪辑成片。

Batch 09 的 Showcase 页面会展示 AI / Mock / fallback 状态、生产包摘要和下载入口。Batch 10A 的 Title-only Demo 会在 Showcase 顶部提示“该项目由标题生成，事实信息需要人工核验”。Batch 10B 增加最终演示路径和 fallback 风险提示：如果出现“当前使用 fallback 结果”，可以继续演示链路，但不能把该结果表述为真实 AI 完整成功。Agent 页面中的未来模式仍表示后续可能增强为可配置真实 Agent，不代表已具备自动发布或自动成片能力。

## 版权合规说明

Demo 不使用真实公司 Logo、真实新闻图、真实视频素材、真实招股书截图或未确认授权素材。导出中的素材信息只作为搜索线索和审阅占位，不代表已经获得授权。

## 不可承诺事项

- 不承诺自动生成可发布视频。
- 不承诺自动发布视频号。
- 不承诺自动抓取公众号全文。
- 不承诺自动下载或授权素材。
- 不承诺 AI 输出无需人工复核。
- 不承诺 Title-only Demo 可直接用于正式发布。
- 不承诺 fallback 结果代表真实 AI 完整成功。
- 不构成投资建议。

## 后续路线

后续可优先补充 prompt 版本管理、AI 输出质量评分、人工批准开关、浏览器端演示流程测试、审阅历史、审阅人字段和导出前锁定确认流程。
