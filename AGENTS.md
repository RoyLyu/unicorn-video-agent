# Agent 工作约束

## 项目目标

本项目服务《独角兽早知道》Video Agent MVP，将公众号财经文章转化为微信视频号生产包。第一版只做生产包，不做自动成片。

## 技术约束

- 使用 Next.js App Router、TypeScript、pnpm。
- Batch 08 使用 SQLite 保存本地审阅、事实核验、人工发布文案、公开 demo 项目标记、Agent 运行追踪和 AI/fallback 生成记录。
- 不安装大型 UI 库。
- Batch 08 允许 server-side OpenAI 文本 API；API key 不得暴露到客户端。
- 不接云数据库，除非后续 Batch 明确要求。
- 不自动下载网络素材。
- 不自动发布视频号。
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体。

## Batch 08 约束

- 只做真实 AI 文本 ProductionPack pipeline，不做 AI 生图、生视频、TTS、自动成片或自动发布。
- 所有 AI 输出必须经过 Zod schema 校验。
- AI 配置缺失或单步失败必须 fallback 到 mock pipeline，不能中断 demo。
- `OPENAI_API_KEY` 和 `AI_MODEL` 只能 server-side 读取。
- 所有 mock agent 必须是纯函数，输入 JSON，输出 JSON。
- `/articles/new` 可调用本地 API route，但不抓取公众号全文。
- `/api/mock/production-pack` 必须写入本地 SQLite，并返回 `projectId` 与 `ProductionPack`。
- `/projects/[projectId]/*` 从 SQLite/API 读取展示数据。
- `/projects/demo/*` 保留为 demo fallback。
- export 页面可预览、复制、下载文本生产包。
- 导出 API 只即时返回响应，不写入仓库、`data/` 或服务器文件系统。
- review 页面只做本地内部审阅，不做登录、权限、自动发布或外部事实核验。
- `/demo` 只使用公开安全模拟数据，不使用真实公司名、真实财务数据、真实 Logo、真实新闻图或真实招股书截图。
- `/api/demo/reset` 只处理 `is_demo = true` 项目，不删除普通 mock 项目。
- Agent 管理层记录 mock 与 AI Agent run；真实 AI 仅限 OpenAI 文本 structured output。
- Agent run step 可以保存 JSON 输入输出摘要，但不得保存真实素材文件或外部下载结果。
- localStorage 仅作为 demo fallback，不再作为主存储。

## 验证命令

完成代码改动后运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
