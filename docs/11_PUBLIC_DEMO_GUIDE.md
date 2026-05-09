# 11 Public Demo Guide

## 外部演示路径

1. 运行 `pnpm db:migrate`。
2. 运行 `pnpm dev`。
3. 打开 `/demo`。
4. 点击“重置 Demo 数据”。
5. 依次展示公开样例的 Analysis、Review 和 Export 页面。
6. 打开 Agent Runs，展示每个 mock Agent 的运行步骤、上下文快照和 QA summary。

## 标准展示话术

这是《独角兽早知道》Video Agent MVP 的本地公开 Demo。它演示文章输入如何经过本地 mock pipeline 或受控 AI 文本 pipeline，形成视频号生产包，再进入人工审阅和文本导出。页面中的公开 demo 公司、行业数据、素材和文案均为模拟数据。

## 当前功能边界

- 支持文章输入到 ProductionPack 的本地 mock 闭环。
- 支持 SQLite 本地持久化。
- 支持 Review checklist、事实核验和人工发布文案。
- 支持 Markdown / CSV / JSON 文本预览、复制和下载。
- 支持两个公开安全 demo 项目重置。
- 支持 Agent 注册表、运行日志、上下文快照和 deterministic QA summary。
- 支持在普通项目中选择 AI Agent 文本生成，并在失败时 fallback 到 mock。

## Mock 与真实 AI 的区别

当前公开 demo 默认使用确定性本地 mock pipeline，保证外部演示稳定。普通项目可选择 AI Agent 文本生成；AI 输出必须通过 Zod schema 校验，失败会 fallback 到 mock。无论 Mock 或 AI，都不做真实投研承诺，不自动生成真实图片、视频、音频或剪辑成片。

Batch 08 的 Agent Runs 页面会展示 AI / Mock / fallback 状态。Agent 页面中的未来模式仍表示后续可能增强为可配置真实 Agent，不代表已具备自动发布或自动成片能力。

## 版权合规说明

Demo 不使用真实公司 Logo、真实新闻图、真实视频素材、真实招股书截图或未确认授权素材。导出中的素材信息只作为搜索线索和审阅占位，不代表已经获得授权。

## 不可承诺事项

- 不承诺自动生成可发布视频。
- 不承诺自动发布视频号。
- 不承诺自动抓取公众号全文。
- 不承诺自动下载或授权素材。
- 不承诺 AI 输出无需人工复核。
- 不构成投资建议。

## 后续路线

Batch 09 可优先补充 prompt 版本管理、AI 输出质量评分、人工批准开关、浏览器端演示流程测试、审阅历史、审阅人字段和导出前锁定确认流程。
