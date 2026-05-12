import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectShowcaseView } from "./project-showcase-view";
import type { ShowcaseViewModel } from "@/lib/showcase/showcase-types";

describe("ProjectShowcaseView final demo status", () => {
  it("renders fallback and title-only warnings plus production-pack download", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectShowcaseView, { showcase: createShowcase() })
    );

    expect(html).toContain("fallback: yes");
    expect(html).toContain("当前使用 fallback 结果");
    expect(html).toContain("当前为 fallback/mock 结果，不可作为正式成品。");
    expect(html).toContain("该项目由标题生成，事实信息需要人工核验。");
    expect(html).toContain("该项目由标题生成，不是事实报告。");
    expect(html).toContain("aria-disabled=\"true\"");
    expect(html).toContain("重新生成真实 AI 版本");
    expect(html).toContain("不可直接使用素材");
    expect(html).toContain("建议替代");
    expect(html).toContain("red");
    expect(html).toContain("Shot / Prompt Gate");
    expect(html).toContain("90s: 30 shots");
    expect(html).toContain("180s: 60 shots");
    expect(html).toContain("Production Studio");
    expect(html).toContain("/projects/project-1/production-studio");
    expect(html).toContain("Prompt 字段完整性：pass");
    expect(html).toContain("报告字段完整性：pass");
    expect(html).toContain("查看完整 Production Report");
    expect(html).toContain("下载完整 production-pack.md");
  });
});

function createShowcase(): ShowcaseViewModel {
  return {
    projectId: "project-1",
    projectTitle: "虚构项目",
    sourceName: "Title-only Demo",
    isDemo: false,
    isTitleOnlyDemo: true,
    titleOnlyWarning: "该项目由标题生成，事实信息需要人工核验。",
    titleOnlyFactReportWarning: "该项目由标题生成，不是事实报告。",
    fallbackBlockedWarning: "当前为 fallback/mock 结果，不可作为正式成品。",
    blockProductionDownload: true,
    regenerateUrl: "/articles/new",
    fallbackWarning: "当前使用 fallback 结果，请在演示时说明 AI 结果已降级。",
    productionStudioGate: {
      densityProfile: "dense",
      lockStatus: "unlocked",
      latestGateStatus: "pass",
      editedCount: 0,
      shotCount90s: 30,
      shotCount180s: 60,
      promptCount: 90,
      alignment: "pass",
      visualBibleScore: 5,
      continuityScore: 5,
      shotFunctionCoverageScore: 5,
      productionMethodScore: 5,
      editingReadinessScore: 5,
      promptFieldCompletenessScore: 5,
      reportCompletenessScore: 5,
      reportFieldCompleteness: "pass",
      shotFunctionCounts: {},
      productionMethodCounts: {},
      needsFix: false,
      fixReasons: []
    },
    generation: {
      generationModeLabel: "Mock",
      productionPackMode: "mock",
      fallbackUsed: true,
      projectStatus: "ai_fallback_mock_saved"
    },
    agentSummary: {
      runId: "run-1",
      status: "completed_with_fallback",
      stepCount: 7,
      completedStepCount: 0,
      fallbackStepCount: 7,
      failedStepCount: 0,
      errorMessage: null
    },
    coreSummary: "摘要",
    coreViewpoints: ["观点"],
    videoAngle: "角度",
    audienceTakeaway: "收获",
    creativeDirection: {
      creativeConcept: "用数据空间展示产业升级",
      visualMetaphor: "从点状信号汇聚为增长路径",
      mainVisualMotif: "银色数据线"
    },
    visualBibleSummary: "9:16 vertical / 商业纪录片 / 禁止真实 Logo",
    continuityBibleSummary: "数据空间、信息卡和图表 HUD 贯穿全片",
    publishCopy: {
      coverTitle: "封面",
      titleCandidates: ["标题 1"],
      publishText: "发布文案",
      tags: ["AI"],
      riskNotice: "不构成投资建议",
      isManual: false
    },
    scripts: {
      video90s: createScript(90),
      video180s: createScript(180)
    },
    storyboard: [],
    promptSummary: {
      imagePromptCount: 0,
      videoPromptCount: 0,
      searchLeadCount: 0,
      imagePrompts: [],
      videoPrompts: [],
      searchLeads: []
    },
    riskSummary: {
      counts: { green: 0, yellow: 0, red: 1, placeholder: 0 },
      items: [
        {
          item: "真实新闻配图或融资现场照片",
          level: "red",
          reason: "版权归属不明，不能默认用于视频号。",
          action: "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项。",
          displayLabel: "不可直接使用素材",
          displayText:
            "不可直接使用：真实新闻配图或融资现场照片。建议替代：自制图表、抽象 AI 商业画面或 placeholder 复核项。",
          alternativeText:
            "建议替代：自制图表、抽象 AI 商业画面或 placeholder 复核项。"
        }
      ]
    },
    disclaimer: "不构成投资建议",
    links: {
      downloadProductionPack:
        "/api/projects/project-1/exports/production-pack.md",
      productionStudio: "/projects/project-1/production-studio",
      review: "/projects/project-1/review",
      export: "/projects/project-1/export",
      agentRuns: "/projects/project-1/agent-runs"
    }
  };
}

function createScript(duration: 90 | 180) {
  return {
    duration,
    title: `${duration}s`,
    hook: "开场",
    closing: "收尾",
    lines: [
      {
        timeRange: "0-10s",
        narration: "旁白",
        visual: "画面",
        onScreenText: "字幕"
      }
    ]
  };
}
