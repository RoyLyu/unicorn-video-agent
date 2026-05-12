# 13 Real Run Audit Summary

## 审计标题

新消费品牌上市背后：中国品牌全球化的第二轮机会来了

## 成功项目

- projectId: `d0de3657-352b-468b-8304-738229500be1`
- agentRunId: `149300c8-74e0-4ad3-9767-a3f1b3413ddb`
- generationMode: `ai`
- fallbackUsed: `false`
- Demo-ready: yes
- Product Demo: `/product-demo`
- Showcase: `/projects/d0de3657-352b-468b-8304-738229500be1/showcase`
- Production Studio: `/projects/d0de3657-352b-468b-8304-738229500be1/production-studio`
- production-pack.md: `/api/projects/d0de3657-352b-468b-8304-738229500be1/exports/production-pack.md`

## Scores

- Storyboard 5/5
- Prompt 5/5
- Rights 5/5
- Visual Bible 5/5
- Creative Direction 5/5
- Continuity 5/5
- Shot Function Coverage 5/5
- Production Method 5/5
- Editing Readiness 5/5
- Prompt Field Completeness 5/5
- Overall 5/5

## Batch 13B AIGC Production Contract / Gate

- Shot Density Profile: `standard`
- Gate standard: 90s >= 24, 180s >= 48, total >= 72

- Production Studio Gate: pass
- 90s shots: 24
- 180s shots: 48
- promptBundles: 72
- prompt count equals shot count: yes
- unmatched shots: 0
- unmatched prompts: 0
- red risks without replacementPlan: 0
- banned output hits: 0
- needsFix: false
- creativeDirection exists: yes
- visualStyleBible exists: yes
- continuityBible exists: yes
- every prompt bundle has 8 production fields: yes
- shotFunction coverage: pass
- 90s shotFunction distribution: hook_shot 2 / context_shot 3 / evidence_shot 4 / concept_shot 4 / transition_shot 2 / emotional_shot 1 / data_shot 4 / risk_shot 3 / summary_shot 1
- 180s shotFunction distribution: hook_shot 3 / context_shot 5 / evidence_shot 7 / concept_shot 7 / transition_shot 5 / emotional_shot 4 / data_shot 7 / risk_shot 5 / summary_shot 3 / cta_shot 2
- missingFunctions90s: none
- missingFunctions180s: none
- overRepeatedFunctions90s: none
- overRepeatedFunctions180s: none
- productionMethod coverage: pass
- editing readiness: pass
- 如果后续审计失败或出现“需要重跑 / 人工修正”，不要覆盖本冻结项目；只查看 failed artifacts 定位问题。

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

- Batch 13E 起，先打开 `/product-demo`。该入口不调用 AI，只读冻结成功项目。
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
