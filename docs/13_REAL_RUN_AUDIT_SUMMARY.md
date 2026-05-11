# 13 Real Run Audit Summary

## 审计标题

新消费品牌上市背后：中国品牌全球化的第二轮机会来了

## 成功项目

- projectId: `f966086f-1599-4b30-be3d-231b04d02d45`
- agentRunId: `1f154db7-7a3b-4eb7-88d7-99f31e60d8aa`
- generationMode: `ai`
- fallbackUsed: `false`
- Demo-ready: yes
- Showcase: `/projects/f966086f-1599-4b30-be3d-231b04d02d45/showcase`
- production-pack.md: `/api/projects/f966086f-1599-4b30-be3d-231b04d02d45/exports/production-pack.md`

## Scores

- Storyboard 5/5
- Prompt 5/5
- Rights 4/5
- Overall 4/5

## 当前剩余风险

- Batch 12A 起，fallback/mock 结果不能覆盖本成功快照；失败审计只能写入 `failed-production-pack.json` 与 `failed-qa-report.md`。
- strict mode 下，如果再次生成失败，应保留本 projectId 作为成功 Demo 锚点，不把 fallback 项目当作成品展示。
- red 版权项不代表生产包失败，代表“不可直接使用素材”。
- red 项必须在 Showcase 和 `production-pack.md` 中保留原始等级，并显示替代方案。
- 真实新闻配图、融资现场照片、真实 Logo、创始人肖像、招股书截图和可读品牌门店文字不可直接使用。
- 建议替代：自制图表、抽象 AI 商业画面或 placeholder 复核项。
- Title-only Demo 仍需要人工事实核验，不能直接正式发布。
- 不构成投资建议。

## 展示注意事项

- 先打开 Showcase，说明这是视频号生产包展示，不是最终成片视频。
- 顶部确认 `AI Agent`、`fallback: no` 和 Agent Run `completed`。
- 讲解版权段落时，不把 red 解读为“失败”，而是解释为“不可直接使用真实素材，需要替代方案”。
- 下载 `production-pack.md` 后，重点展示“版权风险与替代方案”段落。
- 如现场网络或模型异常，可切换到已冻结项目继续演示，不重新生成。
- 如果重新生成出现 fallback/mock 红色提示，不展示为 Demo-ready，也不下载为正式 `production-pack.md`。

## 最终演示标题清单

1. 新消费品牌上市背后：中国品牌全球化的第二轮机会来了
2. AI Agent 正在重写企业软件，为什么下一代 SaaS 会先被替代？
3. 人形机器人融资升温：资本为什么重新押注具身智能？
4. 家庭医疗器械上市潮背后：中国正在进入家庭健康管理时代
5. 中国品牌出海进入第二阶段：从低价供应链到全球生活方式
