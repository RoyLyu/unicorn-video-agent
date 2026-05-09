# 05 Agent Contracts

## 当前状态

Batch 03 不接真实 Agent，不接 AI API。本文件定义本地 mock Agent、ProductionPack 和后续真实 Agent 的输入输出边界。

## Article Input Contract

输入应符合 `ArticleInputSchema`：

- `title`
- `rawText`
- `sourceUrl`
- `publishDate`
- `sourceName`
- `industryTags`
- `targetDurations`

## Production Package Contract

Batch 03 输出应符合 `ProductionPackSchema`，包括：

- `analysis`
- `thesis`
- `scripts`
- `storyboard`
- `assetPrompts`
- `rightsChecks`
- `exportManifest`

## Batch 03 Mock Agent Contract

`src/lib/mock-pipeline/*` 中的每个 mock agent 都必须是纯函数。它们只接收 JSON 数据、返回 JSON 数据，不调用外部 API，不读写数据库，不下载素材，不生成真实文件。数据库写入只发生在 API route 调用 pipeline 之后的 repository 层。
