export const frozenProductDemo = {
  projectId: "d0de3657-352b-468b-8304-738229500be1",
  agentRunId: "149300c8-74e0-4ad3-9767-a3f1b3413ddb",
  title: "新消费品牌上市背后：中国品牌全球化的第二轮机会来了",
  productLine: "《独角兽早知道》财经文章 -> 微信视频号 AIGC 生产包",
  generatedAt: "2026-05-12",
  status: {
    fallbackUsed: false,
    generationMode: "ai",
    productionPackMode: "ai",
    promptCount: 72,
    shotCount: 72,
    shotFunctionCoverageScore: "5/5",
    productionStudioGate: "pass"
  },
  qualityHighlights: [
    "Creative Direction",
    "Visual Style Bible",
    "Continuity Bible",
    "逐镜头 AIGC 制作表",
    "Prompt 完整性",
    "Shot Function Coverage",
    "Production Method Coverage",
    "Editing Readiness",
    "Report Completeness"
  ],
  paths: {
    productDemo: "/product-demo",
    showcase: "/projects/d0de3657-352b-468b-8304-738229500be1/showcase",
    productionStudio: "/projects/d0de3657-352b-468b-8304-738229500be1/production-studio",
    export: "/projects/d0de3657-352b-468b-8304-738229500be1/export",
    agentRuns: "/projects/d0de3657-352b-468b-8304-738229500be1/agent-runs",
    productionPack:
      "/api/projects/d0de3657-352b-468b-8304-738229500be1/exports/production-pack.md",
    storyboard:
      "/api/projects/d0de3657-352b-468b-8304-738229500be1/exports/storyboard.csv",
    promptPack:
      "/api/projects/d0de3657-352b-468b-8304-738229500be1/exports/prompt-pack.md"
  }
} as const;

export const productDemoExportLinks = [
  {
    label: "下载 production-pack.md",
    href: frozenProductDemo.paths.productionPack
  },
  {
    label: "下载 storyboard.csv",
    href: frozenProductDemo.paths.storyboard
  },
  {
    label: "下载 prompt-pack.md",
    href: frozenProductDemo.paths.promptPack
  }
] as const;

export const productDemoNavigationLinks = [
  {
    label: "打开 Showcase",
    href: frozenProductDemo.paths.showcase
  },
  {
    label: "打开 Production Studio",
    href: frozenProductDemo.paths.productionStudio
  },
  {
    label: "打开 Export",
    href: frozenProductDemo.paths.export
  },
  {
    label: "打开 Agent Runs",
    href: frozenProductDemo.paths.agentRuns
  }
] as const;
