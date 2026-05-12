# 15 Product Demo Freeze

## 当前冻结项目

- projectId: `d0de3657-352b-468b-8304-738229500be1`
- agentRunId: `149300c8-74e0-4ad3-9767-a3f1b3413ddb`

## 路径

- Product Demo: `/product-demo`
- Showcase: `/projects/d0de3657-352b-468b-8304-738229500be1/showcase`
- Production Studio: `/projects/d0de3657-352b-468b-8304-738229500be1/production-studio`
- Export: `/projects/d0de3657-352b-468b-8304-738229500be1/export`
- Agent Runs: `/projects/d0de3657-352b-468b-8304-738229500be1/agent-runs`
- production-pack.md: `/api/projects/d0de3657-352b-468b-8304-738229500be1/exports/production-pack.md`
- storyboard.csv: `/api/projects/d0de3657-352b-468b-8304-738229500be1/exports/storyboard.csv`
- prompt-pack.md: `/api/projects/d0de3657-352b-468b-8304-738229500be1/exports/prompt-pack.md`

## 成功标准

- `fallbackUsed=false`
- `generationMode=ai`
- `ProductionPack.mode=ai`
- prompt count = shot count = 72
- shotFunction coverage 5/5
- full production report pass
- report completeness pass
- Production Studio Gate pass

## 演示顺序

1. Product Demo
2. Showcase
3. Production Studio
4. Export
5. Agent Runs

## 展示话术

这是内部 AIGC 视频号生产包，不是最终成片视频。它把财经文章转成可审阅、可编辑、可导出的生产规格：Creative Direction、Visual Bible、Continuity Bible、逐镜头 AIGC 制作表、Prompt、版权风险与替代方案。

所有事实、版权和发布文案仍需人工复核，不构成投资建议。

## 出错时

- 不重新生成。
- 使用冻结项目继续演示。
- 如果数据库缺失，提示需要恢复 `backups/` 中的 SQLite，或重新跑成功 audit。
- 如果现场生成失败，不能用 fallback/mock 冒充正式成品。
