# Agent 工作约束

## 项目目标

本项目服务《独角兽早知道》Video Agent MVP，将公众号财经文章转化为微信视频号生产包。第一版只做生产包，不做自动成片。

## 技术约束

- 使用 Next.js App Router、TypeScript、pnpm。
- Batch 03 使用 SQLite + Drizzle 做本地持久化。
- 不安装大型 UI 库。
- 不接 AI API，除非后续 Batch 明确要求。
- 不接云数据库，除非后续 Batch 明确要求。
- 不自动下载网络素材。
- 不自动发布视频号。
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体。

## Batch 03 约束

- 只做本地 mock pipeline，不接真实 AI。
- 所有 mock agent 必须是纯函数，输入 JSON，输出 JSON。
- `/articles/new` 可调用本地 API route，但不抓取公众号全文。
- `/api/mock/production-pack` 必须写入本地 SQLite，并返回 `projectId` 与 `ProductionPack`。
- `/projects/[projectId]/*` 从 SQLite/API 读取展示数据。
- `/projects/demo/*` 保留为 demo fallback。
- export 页面只展示 exportManifest，不生成真实文件。
- localStorage 仅作为 demo fallback，不再作为主存储。

## 验证命令

完成代码改动后运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
