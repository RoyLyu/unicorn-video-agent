# Agent 工作约束

## 项目目标

本项目服务《独角兽早知道》Video Agent MVP，将公众号财经文章转化为微信视频号生产包。第一版只做生产包，不做自动成片。

## 技术约束

- 使用 Next.js App Router、TypeScript、pnpm。
- 不安装大型 UI 库。
- 不接 AI API，除非后续 Batch 明确要求。
- 不接数据库，除非后续 Batch 明确要求。
- 不自动下载网络素材。
- 不自动发布视频号。
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体。

## Batch 01 约束

- 只做静态 UI Shell 与导航结构。
- 所有业务内容来自 `src/lib/demo-data.ts`。
- `/articles/new` 只展示静态表单，不提交数据。
- `/projects/demo/export` 只展示未来导出文件清单，不生成文件。
- 所有页面必须明确标注 Batch 01 / UI Shell。

## 验证命令

完成代码改动后运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
