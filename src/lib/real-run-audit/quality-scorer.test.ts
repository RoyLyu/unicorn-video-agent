import { describe, expect, it } from "vitest";

import { demoProductionPack } from "@/lib/mock-pipeline/demo-production-pack";
import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";

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

  it("scores executable storyboard and prompt outputs at 4 or higher", () => {
    const executablePack = makeExecutablePack();
    const report = createRealRunAuditReport({
      productionPack: executablePack,
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });

    expect(report.scorecard.storyboard_actionability_score).toBeGreaterThanOrEqual(4);
    expect(report.scorecard.prompt_usability_score).toBeGreaterThanOrEqual(4);
    expect(report.scorecard.rights_safety_score).toBeGreaterThanOrEqual(4);
  });

  it("lists low scoring shot and prompt ids in the markdown report", () => {
    const report = createRealRunAuditReport({
      productionPack: {
        ...demoProductionPack,
        assetPrompts: {
          ...demoProductionPack.assetPrompts,
          imagePrompts: demoProductionPack.assetPrompts.imagePrompts.map((prompt) => ({
            ...prompt,
            id: "IMG-BAD",
            negativePrompt: ""
          }))
        }
      },
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });
    const markdown = renderRealRunAuditMarkdown(report);

    expect(markdown).toContain("S01");
    expect(markdown).toContain("IMG-BAD");
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
            action: "不能直接使用"
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

  it("keeps red rights risks with replacement alternatives at 4 or higher", () => {
    const report = createRealRunAuditReport({
      productionPack: {
        ...makeExecutablePack(),
        rightsChecks: [
          {
            item: "真实新闻配图",
            level: "red",
            reason: "不能默认使用真实新闻素材。",
            action: "替换为自制图表、抽象 AI 画面或 placeholder 复核项，不使用真实素材。"
          }
        ]
      },
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });

    expect(report.scorecard.rights_safety_score).toBeGreaterThanOrEqual(4);
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

  it("requires shot prompt volume gate and marks low scores as needing rerun", () => {
    const report = createRealRunAuditReport({
      productionPack: demoProductionPack,
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });
    const markdown = renderRealRunAuditMarkdown(report);

    expect(report.demoReady).toBe(false);
    expect(report.topProblems.some((problem) => problem.id === "shot-prompt-volume-gate")).toBe(true);
    expect(markdown).toContain("需要重跑 / 人工修正");
  });

  it("passes shot prompt volume gate for normalized production studio packs", () => {
    const report = createRealRunAuditReport({
      productionPack: normalizeProductionPack(demoProductionPack),
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });

    expect(report.topProblems.some((problem) => problem.id === "shot-prompt-volume-gate")).toBe(false);
    expect(report.demoReady).toBe(true);
  });

  it("includes report completeness score in the markdown report", () => {
    const report = createRealRunAuditReport({
      productionPack: normalizeProductionPack(demoProductionPack),
      projectId: "project-1",
      agentRunId: "run-1",
      fallbackUsed: false,
      generationMode: "ai"
    });
    const markdown = renderRealRunAuditMarkdown(report);

    expect(report.scorecard.report_completeness_score).toBeGreaterThanOrEqual(4);
    expect(markdown).toContain("report_completeness_score");
    expect(markdown).toContain("report completeness score");
  });
});

function makeExecutablePack() {
  const styleLock =
    "cinematic business documentary style, Bloomberg-inspired, dark navy and silver color palette, realistic footage, low saturation, soft contrast, natural lighting, premium consulting video";
  const negativePrompt =
    "fake logo, unreadable text, distorted Chinese characters, artificial face, excessive cyberpunk";
  const shots = Array.from({ length: 8 }, (_, index) => {
    const number = index + 1;
    const id = `S${String(number).padStart(2, "0")}`;

    return {
      id,
      timeRange: `00:${String(index * 10).padStart(2, "0")}-00:${String(index * 10 + 10).padStart(2, "0")}`,
      scene: `可执行分镜 ${number}`,
      narration: `第 ${number} 段旁白，解释核心观点。`,
      visual: `主体：抽象商业团队和数据屏幕；场景：深色财经演播空间；镜头：slow push-in；构图：close-up with chart overlay；图表：字幕承载关键事实，不出现可读品牌文字。`,
      assetType: number % 2 === 0 ? "ai-video" as const : "ai-image" as const,
      rightsLevel: number % 3 === 0 ? "placeholder" as const : "green" as const
    };
  });

  return {
    ...demoProductionPack,
    storyboard: { shots },
    assetPrompts: {
      imagePrompts: shots.map((shot) => ({
        id: `IMG-${shot.id}`,
        sceneRef: shot.id,
        prompt: `${styleLock}, ${shot.visual}, no readable brand text, no real company mark`,
        negativePrompt,
        notes: "对应分镜的抽象商业纪录片画面。"
      })),
      videoPrompts: shots.map((shot) => ({
        id: `VID-${shot.id}`,
        sceneRef: shot.id,
        prompt: `${styleLock}, slow camera movement, ${shot.visual}, vertical business documentary shot`,
        negativePrompt,
        notes: "对应分镜的抽象商业纪录片动态画面。"
      })),
      searchLeads: demoProductionPack.assetPrompts.searchLeads
    },
    rightsChecks: [
      {
        item: "自制图表和抽象 AI 画面",
        level: "green" as const,
        reason: "不使用真实 logo、新闻图或人物肖像。",
        action: "保留源文件和生成记录。"
      }
    ]
  };
}
