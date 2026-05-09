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

## D005 - 本地 mock pipeline 先于真实 AI

决定：Batch 02 只实现本地纯函数 mock pipeline。

原因：先验证数据流、页面展示和合同边界，再引入真实模型调用。

## D006 - ProductionPack schema 作为共同合同

决定：API route、mock pipeline、localStorage 和结果页都以 `ProductionPackSchema` 为共同合同。

原因：减少页面字段漂移，确保 mock 输出可以被后续真实 Agent 替换。

## D007 - localStorage 仅作 Batch 02 临时持久化

决定：Batch 02 使用 localStorage 保存最近一次 ProductionPack。

原因：不接数据库仍能完成端到端 UI 闭环；后续持久化方案另行设计。

## D008 - exportManifest 只描述未来导出

决定：Batch 02 的 exportManifest 只列出 planned 文件，不生成真实文件。

原因：避免过早进入导出文件格式和下载交互，保持本批范围清晰。
