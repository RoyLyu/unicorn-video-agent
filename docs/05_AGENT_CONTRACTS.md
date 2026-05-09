# 05 Agent Contracts

## 当前状态

Batch 01 不接真实 Agent，不接 AI API。本文件只定义后续 Agent 的输入输出边界。

## Article Input Contract

输入应符合 `ArticleInputSchema`：

- `title`
- `body`
- `url`
- `publishedAt`
- `source`
- `industryTags`
- `targetDuration`

## Production Package Contract

输出应符合 `VideoProductionPackageSchema`，包括：

- 核心摘要和核心观点
- 90s / 180s 脚本
- 分镜表
- 图表建议
- AI 图像与视频 Prompt
- 素材搜索线索
- 版权风险
- 封面文案和发布文案
- Markdown / CSV / JSON 导出标记

## Batch 01 Demo Data Contract

`src/lib/demo-data.ts` 是 Batch 01 静态 UI 的唯一假数据来源。它不代表真实 Agent 输出，不能用于发布。
