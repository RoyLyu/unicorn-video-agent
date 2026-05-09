# 输出 Schema 与导出约定

代码中的 `src/lib/schemas/video-production.ts` 是字段结构的唯一事实来源。本文档只解释当前 Batch 00 已定义的输入、输出和导出约定。

## ArticleInput

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 公众号文章标题，不能为空。 |
| `body` | `string` | 公众号文章正文，不能为空。 |
| `url` | `string` | 文章链接，必须是合法 URL。 |
| `publishedAt` | `string` | 发布日期，格式为 `YYYY-MM-DD`。 |
| `source` | `string` | 文章来源，不能为空。 |
| `industryTags` | `string[]` | 行业标签，至少 1 个。 |
| `targetDuration` | `90 \| 180` | 用户希望优先生成的目标时长。 |

## VideoProductionPackage

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `coreSummary` | `string` | 对文章的核心摘要。 |
| `coreViewpoints` | `string[]` | 可用于视频表达的核心观点。 |
| `scripts.video90s` | `ScriptBlock` | 90 秒视频号脚本。 |
| `scripts.video180s` | `ScriptBlock` | 180 秒视频号脚本。 |
| `storyboard` | `StoryboardShot[]` | 分镜表。 |
| `chartSuggestions` | `ChartSuggestion[]` | 图表建议。 |
| `aiImagePrompts` | `PromptItem[]` | AI 图像生成 Prompt。 |
| `aiVideoPrompts` | `PromptItem[]` | AI 视频生成 Prompt。 |
| `materialSearchLeads` | `SearchLead[]` | 素材搜索线索。 |
| `copyrightRisks` | `CopyrightRisk[]` | 版权风险表。 |
| `coverCopy` | `string[]` | 封面文案备选。 |
| `publishCopy` | `string` | 视频号发布文案。 |
| `exports` | `{ markdown: boolean; csv: boolean; json: boolean }` | 当前生产包支持的导出格式标记。 |

## 主要子结构

`ScriptBlock` 包含 `durationSeconds`、`hook`、`lines` 和 `closing`。90 秒脚本的 `durationSeconds` 必须是 `90`，180 秒脚本必须是 `180`。

`StoryboardShot` 使用 `assetType` 区分素材类型：`chart`、`ai-image`、`ai-video`、`stock`、`screen`、`text`。

`CopyrightRisk` 的 `riskLevel` 只支持 `low`、`medium`、`high`。

## Markdown 导出

Markdown 导出面向编辑和编导阅读，建议按以下顺序组织：

1. 文章信息
2. 核心摘要
3. 核心观点
4. 90s 脚本
5. 180s 脚本
6. 分镜表
7. 图表建议
8. AI 图像 Prompt
9. AI 视频 Prompt
10. 素材搜索线索
11. 版权风险表
12. 封面文案
13. 发布文案

## CSV 导出

CSV 导出面向分工协作。Batch 00 建议后续至少拆成三类表：

- `storyboard.csv`：每行一个分镜。
- `material_search_leads.csv`：每行一个素材搜索线索。
- `copyright_risks.csv`：每行一个版权风险项。

## JSON 导出

JSON 导出应完整保留 `VideoProductionPackage` 结构，供后续自动化流程或内部工具消费。导出前必须通过 `VideoProductionPackageSchema` 校验。
