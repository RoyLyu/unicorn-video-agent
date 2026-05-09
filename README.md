# 独角兽早知道 Video Agent MVP

将《独角兽早知道》的公众号财经文章转化为微信视频号生产包，包括核心观点、90s/180s 脚本、分镜表、AI 素材 Prompt、素材搜索线索、版权风险表和发布文案。

## 当前阶段

Batch 00：项目初始化与文档系统。

当前仓库提供：

- Next.js + TypeScript 最小应用骨架
- 文章输入与视频号生产包的 Zod schema
- 合法输入与完整输出样例 fixture
- schema 单元测试
- MVP、导出结构、版权策略和 prompt 系统边界文档

## MVP 范围

第一版只做“文章 → 视频号生产包”，不做自动成片。

## 启动

```bash
pnpm install
pnpm dev
```

本地开发服务默认运行在 `http://localhost:3000`。

## 验证

```bash
pnpm test
pnpm lint
pnpm build
```

## 项目结构

```text
docs/
  PRD.md
  OUTPUT_SCHEMA.md
  COPYRIGHT_POLICY.md
  PROMPT_SYSTEM.md
src/
  app/
    page.tsx
    layout.tsx
    globals.css
  lib/
    fixtures/
    schemas/
```

## 第一版输入

- 公众号文章标题
- 公众号文章正文
- 文章链接
- 发布日期
- 来源
- 行业标签
- 目标时长：90s / 180s

## 第一版输出

- 核心摘要
- 核心观点
- 90s 视频号脚本
- 180s 视频号脚本
- 分镜表
- 图表建议
- AI 图像 Prompt
- AI 视频 Prompt
- 素材搜索线索
- 版权风险表
- 封面文案
- 发布文案
- Markdown / CSV / JSON 导出包

## 不做什么

- 不自动抓取公众号全文
- 不自动下载网络素材
- 不自动发布视频号
- 不自动生成完整成片
- 不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体
