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
    expect(html).toContain("该项目由标题生成，事实信息需要人工核验。");
    expect(html).toContain("/api/projects/project-1/exports/production-pack.md");
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
    fallbackWarning: "当前使用 fallback 结果，请在演示时说明 AI 结果已降级。",
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
      counts: { green: 0, yellow: 0, red: 0, placeholder: 0 },
      items: []
    },
    disclaimer: "不构成投资建议",
    links: {
      downloadProductionPack:
        "/api/projects/project-1/exports/production-pack.md",
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
