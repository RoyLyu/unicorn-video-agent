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

## Batch 02 约束

- 只做本地 mock pipeline，不接真实 AI。
- 所有 mock agent 必须是纯函数，输入 JSON，输出 JSON。
- `/articles/new` 可调用本地 API route，但不抓取公众号全文。
- `/projects/demo/export` 只展示 exportManifest，不生成文件。
- localStorage 仅用于 Batch 02 临时保存最近一次 ProductionPack。

## 验证命令

完成代码改动后运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
