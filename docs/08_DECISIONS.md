# 08 Decisions

## D001 - Batch 01 使用静态 UI Shell

决定：Batch 01 只做后台 UI Shell 与导航结构，不做业务生成。

原因：先确认信息架构、页面边界和编辑工作流，再进入生成链路。

## D002 - Demo 数据集中管理

决定：所有 Batch 01 假数据集中放在 `src/lib/demo-data.ts`。

原因：避免页面各自硬编码数据，便于后续替换为 mock 生成流程或真实数据源。

## D003 - 不安装大型 UI 库

决定：Batch 01 使用原生 CSS 和小型自定义组件。

原因：当前目标是内部后台骨架，暂不需要引入组件库成本。

## D004 - 版权风险使用四级展示

决定：Batch 01 页面展示 Green / Yellow / Red / Placeholder 四级版权风险。

原因：比 Batch 00 的低中高风险更适合 UI 表达，也能区分未进入真实授权检查的占位素材。
