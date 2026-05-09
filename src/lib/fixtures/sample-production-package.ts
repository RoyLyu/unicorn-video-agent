import type { VideoProductionPackage } from "../schemas/video-production";

export const sampleProductionPackage: VideoProductionPackage = {
  coreSummary:
    "这篇文章聚焦 AI 基础设施公司的融资事件，并将融资金额、客户结构和行业竞争放在同一条叙事线上。",
  coreViewpoints: [
    "资本继续流向能直接支撑 AI 应用落地的基础设施环节。",
    "客户结构和商业化质量比单纯融资金额更能说明公司价值。",
    "视频号表达应避免夸大估值，用可核验事实建立判断。"
  ],
  scripts: {
    video90s: {
      durationSeconds: 90,
      hook: "AI 创业公司的钱，正在流向更底层的基础设施。",
      lines: [
        {
          timestamp: "00:00-00:12",
          narration:
            "今天这家公司完成新融资，表面看是资本事件，背后看的是 AI 产业链的资金流向。",
          visualDirection: "融资标题、行业关键词和资金流向动效",
          onScreenText: "AI 基础设施继续吸金"
        },
        {
          timestamp: "00:12-00:55",
          narration:
            "文章的核心不是金额本身，而是它服务的客户、收入质量，以及能否在激烈竞争里形成长期壁垒。",
          visualDirection: "客户类型、收入结构和竞争格局三栏信息图",
          onScreenText: "看客户、看收入、看壁垒"
        }
      ],
      closing: "这类融资新闻，真正值得看的，是钱为什么投向这里。"
    },
    video180s: {
      durationSeconds: 180,
      hook: "一笔 AI 基础设施融资，能看出资本市场正在奖励什么。",
      lines: [
        {
          timestamp: "00:00-00:20",
          narration:
            "如果只看融资金额，这是一条普通新闻；如果拆开产业链，它反映的是 AI 应用爆发后对底层能力的持续需求。",
          visualDirection: "从应用层下钻到算力、数据、工具链的动态图",
          onScreenText: "从融资看产业链"
        },
        {
          timestamp: "00:20-01:35",
          narration:
            "判断这家公司，重点看三点：客户是否真实付费，收入是否可持续，技术或交付能力是否形成壁垒。",
          visualDirection: "三点评估框架逐项出现",
          onScreenText: "真实付费 / 可持续收入 / 可防守壁垒"
        },
        {
          timestamp: "01:35-02:35",
          narration:
            "同一赛道竞争者会越来越多，资本更偏好的不是概念，而是能持续交付、能证明商业化效率的团队。",
          visualDirection: "赛道竞争和商业化效率对比图",
          onScreenText: "概念降温，交付升温"
        }
      ],
      closing: "所以，这笔融资不是终点，而是观察 AI 基础设施商业化的一扇窗口。"
    }
  },
  storyboard: [
    {
      shotId: "S01",
      timeRange: "00:00-00:12",
      scene: "开场融资信息",
      narration: "AI 创业公司的钱，正在流向更底层的基础设施。",
      visual: "标题卡叠加行业关键词，使用抽象数据中心和资金流向画面。",
      assetType: "ai-video",
      copyrightNote: "使用自生成抽象画面，不使用新闻原图。"
    }
  ],
  chartSuggestions: [
    {
      title: "AI 基础设施公司评估框架",
      chartType: "comparison",
      dataNeeded: ["客户类型", "收入来源", "竞争壁垒"],
      purpose: "把文章观点转化为视频中可扫描的信息图。"
    }
  ],
  aiImagePrompts: [
    {
      id: "IMG-01",
      sceneRef: "S01",
      prompt:
        "A clean editorial illustration of AI infrastructure, abstract server racks, flowing data lines, financial market accents, professional Chinese business media style",
      negativePrompt: "logos, real people, copyrighted news photos, stock watermarks",
      styleNotes: "冷静、财经媒体感、避免夸张科幻。"
    }
  ],
  aiVideoPrompts: [
    {
      id: "VID-01",
      sceneRef: "S01",
      prompt:
        "Slow camera move through abstract AI infrastructure nodes, subtle capital flow lines, clean data visualization overlays, no logos, no real brands",
      negativePrompt: "recognizable brands, news footage, celebrities, copyrighted clips",
      styleNotes: "适合视频号竖屏，节奏克制。"
    }
  ],
  materialSearchLeads: [
    {
      query: "AI infrastructure data center abstract royalty free vertical video",
      platform: "Pexels / Pixabay / Storyblocks",
      intendedUse: "补充非特定公司、非新闻现场的氛围镜头。",
      licenseRequirement: "必须确认可商用、可二创、无需署名或按平台规则署名。"
    }
  ],
  copyrightRisks: [
    {
      item: "新闻配图或融资发布会照片",
      riskLevel: "high",
      reason: "通常版权归媒体、公司或摄影师所有，不能默认用于视频号。",
      mitigation: "改用自制图表、AI 抽象画面或已确认授权素材。"
    }
  ],
  coverCopy: ["AI 基础设施为何继续吸金？", "一笔融资看懂产业链信号"],
  publishCopy:
    "一条融资新闻，真正值得看的不是金额，而是资本为什么继续流向 AI 基础设施。#独角兽早知道 #AI #一级市场",
  exports: {
    markdown: true,
    csv: true,
    json: true
  }
};
