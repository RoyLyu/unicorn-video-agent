import { describe, expect, it } from "vitest";

import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";

import {
  createRealRunAuditReport,
  renderRealRunAuditMarkdown
} from "./quality-scorer";

describe("real-run audit quality scorer", () => {
  it("recognizes storyboard shots that lack camera movement", () => {
    const report = createRealRunAuditReport({
      productionPack: {
        ...demoProductionPack,
        storyboard: {
          shots: demoProductionPack.storyboard.shots.map((shot) => ({
            ...shot,
            visual: "静态画面，展示抽象背景"
          }))
        }
      },
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });

    expect(report.scorecard.storyboard_actionability_score).toBeLessThan(5);
    expect(report.topProblems.some((problem) => problem.id === "storyboard-missing-camera-motion")).toBe(true);
  });

  it("recognizes prompts that lack negativePrompt content", () => {
    const report = createRealRunAuditReport({
      productionPack: {
        ...demoProductionPack,
        assetPrompts: {
          ...demoProductionPack.assetPrompts,
          imagePrompts: demoProductionPack.assetPrompts.imagePrompts.map((prompt) => ({
            ...prompt,
            negativePrompt: ""
          }))
        }
      },
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });

    expect(report.scorecard.prompt_usability_score).toBeLessThan(5);
    expect(report.topProblems.some((problem) => problem.id === "prompt-missing-negative-prompt")).toBe(true);
  });

  it("does not treat required fake logo negativePrompt text as a real brand risk", () => {
    const styleLockedPrompt =
      "cinematic business documentary style, Bloomberg-inspired, dark navy and silver color palette, realistic footage, low saturation, soft contrast, natural lighting, premium consulting video, abstract office and chart visuals";
    const requiredNegativePrompt =
      "fake logo, unreadable text, distorted Chinese characters, artificial face, excessive cyberpunk";
    const report = createRealRunAuditReport({
      productionPack: {
        ...demoProductionPack,
        assetPrompts: {
          ...demoProductionPack.assetPrompts,
          imagePrompts: demoProductionPack.assetPrompts.imagePrompts.map((prompt) => ({
            ...prompt,
            prompt: styleLockedPrompt,
            negativePrompt: requiredNegativePrompt
          })),
          videoPrompts: demoProductionPack.assetPrompts.videoPrompts.map((prompt) => ({
            ...prompt,
            prompt: styleLockedPrompt,
            negativePrompt: requiredNegativePrompt
          }))
        }
      },
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });

    expect(report.topProblems.some((problem) => problem.id === "prompt-real-brand-risk")).toBe(false);
  });

  it("recognizes red rights risks and lowers rights safety", () => {
    const report = createRealRunAuditReport({
      productionPack: {
        ...demoProductionPack,
        rightsChecks: [
          ...demoProductionPack.rightsChecks,
          {
            item: "真实公司 Logo",
            level: "red",
            reason: "未确认授权",
            action: "替换为抽象图形"
          }
        ]
      },
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });

    expect(report.scorecard.rights_safety_score).toBeLessThan(5);
    expect(report.topProblems.some((problem) => problem.id === "rights-red-risk")).toBe(true);
  });

  it("renders markdown with agent sections, scores and demo readiness", () => {
    const report = createRealRunAuditReport({
      productionPack: demoProductionPack,
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });
    const markdown = renderRealRunAuditMarkdown(report);

    expect(markdown).toContain("# Real Run Audit Report");
    expect(markdown).toContain("Article Analyst");
    expect(markdown).toContain("Storyboard Agent");
    expect(markdown).toContain("Prompt Generator");
    expect(markdown).toContain("overall_demo_readiness_score");
    expect(markdown).toContain("Top 10 Problems");
    expect(markdown).toContain("Demo-ready");
  });
});
