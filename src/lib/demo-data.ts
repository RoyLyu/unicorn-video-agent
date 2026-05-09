export const requiredBatch01Routes = [
  "/",
  "/dashboard",
  "/articles/new",
  "/articles/demo",
  "/projects/demo/analysis",
  "/projects/demo/scripts",
  "/projects/demo/shots",
  "/projects/demo/rights",
  "/projects/demo/export",
  "/settings"
] as const;

export type Batch01Route = (typeof requiredBatch01Routes)[number];

export const navigationItems: Array<{
  href: Batch01Route;
  label: string;
  description: string;
}> = [
  { href: "/", label: "总览入口", description: "Batch 05 Review Workflow" },
  { href: "/dashboard", label: "Dashboard", description: "后台总览" },
  { href: "/articles/new", label: "新建文章", description: "静态输入表单" },
  { href: "/articles/demo", label: "Demo 文章", description: "示例文章状态" },
  {
    href: "/projects/demo/analysis",
    label: "分析结果",
    description: "观点、事实、数据和风险"
  },
  {
    href: "/projects/demo/scripts",
    label: "脚本",
    description: "90s / 180s 静态脚本"
  },
  {
    href: "/projects/demo/shots",
    label: "分镜",
    description: "视频号分镜表"
  },
  {
    href: "/projects/demo/rights",
    label: "版权",
    description: "四级版权风险"
  },
  {
    href: "/projects/demo/export",
    label: "导出",
    description: "未来文件清单"
  },
  { href: "/settings", label: "设置", description: "项目配置占位" }
];

export const batchStatus = {
  label: "Batch 05 / Review Workflow",
  description: "本地 mock 生产包流程，写入 SQLite，并支持审阅和文本导出；不接 AI、云数据库、素材下载或自动发布。"
};

export const dashboardMetrics = [
  {
    label: "Demo 项目",
    value: "1",
    detail: "仅用于 UI Shell 展示"
  },
  {
    label: "输出模块",
    value: "8",
    detail: "分析、脚本、分镜、版权、导出等"
  },
  {
    label: "版权等级",
    value: "4",
    detail: "Green / Yellow / Red / Placeholder"
  }
];

export const demoArticle = {
  title: "虚构融资案例：AI 基础设施公司完成新一轮融资",
  source: "独角兽早知道 Demo",
  url: "https://example.com/demo-article",
  publishedAt: "2026-05-09",
  tags: ["AI", "基础设施", "一级市场"],
  targetDuration: "90s / 180s",
  status: "UI Shell Demo",
  body:
    "这是一篇用于 Batch 01 静态界面的虚构示例文章。内容用于展示后台导航、分析结果、脚本、分镜和版权风险页面，不代表真实公司或真实新闻。"
};

export const analysis = {
  viewpoints: [
    "基础设施叙事适合用资金流向和客户需求做开场。",
    "视频号表达应优先解释行业信号，而不是堆叠融资术语。",
    "版权策略必须把新闻图、真实视频片段和字体授权前置检查。"
  ],
  facts: [
    "示例文章为虚构内容，不对应真实融资事件。",
    "目标输出包含 90s 与 180s 两套脚本。",
    "所有素材建议都应经过人工版权确认。"
  ],
  industryData: [
    { metric: "内容类型", value: "财经短视频", note: "面向视频号" },
    { metric: "目标时长", value: "90s / 180s", note: "双脚本策略" },
    { metric: "素材策略", value: "自制图表 + 授权素材", note: "避免未授权新闻图" }
  ],
  risks: [
    "把虚构 demo 误认为真实业务输出。",
    "未来接入 AI 后生成未经核验的融资金额或公司信息。",
    "素材搜索线索被误用为已授权素材。"
  ]
};

export const scripts = {
  video90s: [
    {
      time: "00:00-00:10",
      narration: "一笔融资新闻，真正值得看的不是金额，而是资金为什么流向这里。",
      visual: "抽象数据流和标题卡，不使用真实新闻图。"
    },
    {
      time: "00:10-00:55",
      narration: "从客户需求、交付能力和行业位置三个角度，快速拆解这类 AI 基础设施项目。",
      visual: "三栏信息图：需求、交付、位置。"
    },
    {
      time: "00:55-01:30",
      narration: "结论很简单：概念不够，能被客户持续使用的能力才是关键。",
      visual: "收束到视频号封面文案和观点摘要。"
    }
  ],
  video180s: [
    {
      time: "00:00-00:20",
      narration: "今天用一个虚构案例，演示如何把财经文章拆成视频号生产包。",
      visual: "后台 UI Shell 的项目概览，不展示真实素材。"
    },
    {
      time: "00:20-01:20",
      narration: "第一层看事实，第二层看行业信号，第三层看观众能否在 3 秒内理解重点。",
      visual: "三层分析框架动效。"
    },
    {
      time: "01:20-02:25",
      narration: "脚本之外，还要同步准备分镜、图表、素材线索和版权风险。",
      visual: "分镜表、版权表、导出清单依次出现。"
    },
    {
      time: "02:25-03:00",
      narration: "Batch 01 只做静态 UI，后续 Batch 才会进入真实生成流程。",
      visual: "Batch 01 / UI Shell 状态标签。"
    }
  ]
};

export const storyboardShots = [
  {
    id: "S01",
    timeRange: "00:00-00:10",
    scene: "开场标题",
    visual: "深色文本标题卡与抽象数据线",
    asset: "自制 UI / AI 抽象画面",
    rights: "Placeholder"
  },
  {
    id: "S02",
    timeRange: "00:10-00:55",
    scene: "三点评估框架",
    visual: "需求、交付、位置三栏卡片",
    asset: "自制图表",
    rights: "Green"
  },
  {
    id: "S03",
    timeRange: "00:55-01:30",
    scene: "结论收束",
    visual: "封面文案与观点摘要",
    asset: "文本动效",
    rights: "Green"
  }
];

export type RightsRiskLevel = "Green" | "Yellow" | "Red" | "Placeholder";

export const rightsRisks: Array<{
  item: string;
  level: RightsRiskLevel;
  reason: string;
  action: string;
}> = [
  {
    item: "自制框架图",
    level: "Green",
    reason: "团队原创信息图，不含第三方素材。",
    action: "可进入剪辑，但保留源文件。"
  },
  {
    item: "开放素材平台抽象数据中心视频",
    level: "Yellow",
    reason: "可能存在署名、商用或二创限制。",
    action: "使用前人工确认授权条款。"
  },
  {
    item: "真实融资新闻配图",
    level: "Red",
    reason: "新闻图版权归属不明，不能默认用于视频号。",
    action: "替换为自制图表或取得明确授权。"
  },
  {
    item: "AI 生成科技背景",
    level: "Placeholder",
    reason: "Batch 01 仅为占位，不代表最终可用素材。",
    action: "后续生成后再做版权和相似性复核。"
  }
];

export const exportFiles = [
  {
    filename: "production-package.md",
    format: "Markdown",
    purpose: "编辑和编导阅读的完整生产包",
    status: "Planned",
    generated: false
  },
  {
    filename: "storyboard.csv",
    format: "CSV",
    purpose: "剪辑协作使用的分镜表",
    status: "Planned",
    generated: false
  },
  {
    filename: "rights-risks.csv",
    format: "CSV",
    purpose: "版权风险复核表",
    status: "Planned",
    generated: false
  },
  {
    filename: "production-package.json",
    format: "JSON",
    purpose: "后续自动化流程消费",
    status: "Planned",
    generated: false
  }
] as const;

export const settings = [
  { label: "栏目名", value: "独角兽早知道" },
  { label: "视频号标准", value: "财经解释型竖屏短视频，90s / 180s 双版本" },
  { label: "版权策略", value: "只使用自制、授权或人工确认可用素材" },
  { label: "Agent 模式", value: "UI Shell Only，未接入真实 AI" }
];
