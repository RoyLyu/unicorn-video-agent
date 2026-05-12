# 14 Internal Use SOP

## 固定 Mac 启动方式

内部投产 v0.1 采用固定 Mac + 本地 SQLite。不要公网部署，不要开启用户系统，不要把 `.env.local`、SQLite 或备份文件提交到 Git。

首次准备：

```bash
pnpm install
pnpm db:migrate
pnpm build
```

开发模式：

```bash
pnpm dev
```

生产模式：

```bash
pnpm build
pnpm start
```

固定 Mac 后台运行建议：

```bash
pm2 start "pnpm start" --name unicorn-video-agent
pm2 save
```

局域网访问：

```text
http://<Mac局域网IP>:3000
```

## .env.local 检查

确认 `.env.local` 存在，并只检查变量名是否齐全，不展示真实 key：

- `AI_PROVIDER=minimax`
- `AI_MODEL=MiniMax-M2.7`
- `MINIMAX_API_KEY`
- `MINIMAX_BASE_URL`
- `AI_AGENT_MODE=single_pack`
- `SHOT_DENSITY_PROFILE=standard`
- `AI_REQUIRE_REAL_OUTPUT=true`
- `AI_ALLOW_MOCK_FALLBACK=false`

## 数据库迁移

```bash
pnpm db:migrate
```

数据库文件位于：

```text
data/unicorn-video-agent.sqlite
```

## 启动服务

开发演示用 `pnpm dev`。固定 Mac 后台运行用 `pnpm build && pnpm start` 或 pm2。

## 新建文章项目流程

1. 打开 `/articles/new`。
2. 输入完整文章正文或事实材料。
3. 选择 AI Agent 生成。
4. 生成后进入 Showcase / Production Studio。
5. 通过 gate 后再进入 Export。

## Quick Demo 流程

1. 打开 `/quick-demo`。
2. 输入标题、内容类型和行业标签。
3. 默认选择真实生成。
4. 如果选择快速演示，必须说明 fallback 结果不可投入使用。

Title-only 只能生成待核验策划案，不是事实报告。

## Product Demo 流程

1. 打开 `/product-demo`。
2. 确认冻结 projectId 为 `d0de3657-352b-468b-8304-738229500be1`。
3. 依次打开 Showcase、Production Studio、Export 和 Agent Runs。
4. 下载 `production-pack.md`、`storyboard.csv` 和 `prompt-pack.md`。

Product Demo 不调用 AI，只读冻结成功项目。

## Production Studio 检查流程

1. 检查 density profile 是否为 `standard`。
2. 检查 shot count、prompt count、alignment、rights replacement。
3. 检查 Creative Direction、Visual Bible、Continuity、Shot Function Coverage、Production Method、Editing Readiness、Prompt Completeness 和 Report Completeness。
4. 如有 needsFix，进入对应 shot/prompt/replacementPlan 编辑。
5. 点击重新校验 Gate。

## 什么时候可以 lock

只有 Production Studio Gate 为 `pass` 时可以 lock。gate fail 时不要锁版。

## 如何处理 gate fail

出现 gate fail 时：

- 不把当前项目当作成品。
- 阅读 fix reasons。
- 如果是 shotFunction coverage fail，检查 distribution / missingFunctions / overRepeatedFunctions。
- 如果是 report completeness fail，检查 export serializer。
- 如果是 rights fail，补充 red / placeholder replacementPlan。
- 修正后重新校验 Gate。

## 下载生产包

- `production-pack.md`：主生产报告，包含完整逐镜头 AIGC 制作表。
- `storyboard.csv`：分镜制作表。
- `prompt-pack.md`：逐镜头 prompt 附件。

Product Demo 下载路径固定在 `/product-demo`。

## 如何解释 red / placeholder risk

- `red`：不可直接使用素材，必须替换为自制图表、抽象 AI 商业画面或 placeholder 复核项。
- `placeholder`：发布前必须人工复核。
- 不要把 red 自动降级为 yellow。

## SQLite 备份

```bash
pnpm backup:db
```

备份文件写入：

```text
backups/unicorn-video-agent-YYYYMMDD-HHMMSS.sqlite
```

`backups/` 被 Git ignore。

## SQLite 恢复

1. 停止服务。
2. 将备份文件复制回 `data/unicorn-video-agent.sqlite`。
3. 运行 `pnpm internal:smoke`。
4. 重新启动服务。

## 停止服务

开发模式按 `Ctrl+C`。pm2 模式：

```bash
pm2 stop unicorn-video-agent
```

## 常见错误

- AI provider error：检查 `.env.local`、网络和 MiniMax 服务状态。
- schema fail：查看 API safeErrorSummary 或 failed audit report。
- shotFunction coverage fail：查看 missingFunctions 和 overRepeatedFunctions。
- report completeness fail：检查 `production-pack.md` 是否缺少主生产报告字段。
- fallback/mock warning：该结果不可作为正式成品。

## 不可承诺事项

- 不自动生成最终视频。
- 不自动发布视频号。
- 不自动授权素材。
- 不保证无需人工核验。
- 不构成投资建议。
