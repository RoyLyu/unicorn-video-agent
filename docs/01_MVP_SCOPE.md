# 01 MVP Scope

## 一句话

将《独角兽早知道》的公众号财经文章转化为微信视频号生产包。

## 第一版输入

- 公众号文章标题
- 公众号文章正文
- 文章链接
- 发布日期
- 来源
- 行业标签
- 目标时长：90s / 180s

## 第一版输出

- 核心摘要
- 核心观点
- 90s 视频号脚本
- 180s 视频号脚本
- 分镜表
- 图表建议
- AI 图像 Prompt
- AI 视频 Prompt
- 素材搜索线索
- 版权风险表
- 封面文案
- 发布文案
- Markdown / CSV / JSON 导出包

## Batch 08 范围

Batch 08 在 SQLite + ProductionPack + Review + 文本导出 + Public Demo + Agent Management Layer 基础上新增真实 AI 文本生产包生成。用户可在 `/articles/new` 选择 Mock 或 AI Agent；AI 输出必须经过 Zod schema 校验，失败时 fallback 到 mock。仍不做 AI 生图、生视频、TTS、素材网站接入、素材下载、自动成片、登录、云部署或视频号发布。

## 非目标

- 不自动抓取公众号全文
- 不自动下载网络素材
- 不自动发布视频号
- 不自动生成完整成片
- 不做 AI 生图、生视频或 TTS
- 不接云数据库
- 不做登录
- 不做云部署
