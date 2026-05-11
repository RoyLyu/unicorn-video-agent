import { describe, expect, it } from "vitest";

import { normalizeProductionPack } from "../ai-agents/normalize-production-pack";
import { demoProductionPack } from "../mock-pipeline/demo-production-pack";
import { generateExportFile } from "./generate-export-file";

const allowedRiskLevels = new Set(["green", "yellow", "red", "placeholder"]);

describe("Batch 04 export generation", () => {
  it("generates production-pack.md with title, scripts and risk warning", () => {
    const file = generateExportFile("production-pack.md", demoProductionPack);

    expect(file?.contentType).toBe("text/markdown; charset=utf-8");
    expect(file?.content).toContain(demoProductionPack.articleInput.title);
    expect(file?.content).toContain("90s 脚本");
    expect(file?.content).toContain("180s 脚本");
    expect(file?.content).toContain("版权风险与替代方案");
    expect(file?.content).toContain("不构成投资建议");
  });

  it("keeps red rights level and includes replacement alternatives in production-pack.md", () => {
    const file = generateExportFile("production-pack.md", {
      ...demoProductionPack,
      rightsChecks: [
        {
          item: "真实新闻配图或融资现场照片",
          level: "red",
          reason: "版权归属不明，不能默认用于视频号。",
          action: "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项。"
        }
      ]
    });

    expect(file?.content).toContain("版权风险与替代方案");
    expect(file?.content).toContain("- red：真实新闻配图或融资现场照片");
    expect(file?.content).toContain("不可直接使用");
    expect(file?.content).toContain("建议替代");
    expect(file?.content).not.toContain("- yellow：真实新闻配图或融资现场照片");
  });

  it("adds a not-for-use warning to fallback production-pack.md", () => {
    const file = generateExportFile("production-pack.md", demoProductionPack, {
      fallbackWarning: true
    });

    expect(file?.content).toMatch(/^> 当前文件为 fallback\/mock 结果，不可投入使用。/);
  });

  it("adds Shot / Prompt Gate Summary to production-pack.md", () => {
    const pack = normalizeProductionPack(demoProductionPack, "standard");
    const file = generateExportFile("production-pack.md", pack, {
      productionStudio: {
        densityProfile: "standard",
        lockStatus: "unlocked",
        latestGateStatus: "pass",
        editedCount: 1,
        summary: {
          densityProfile: "standard",
          shotCount90s: 24,
          shotCount180s: 48,
          totalShots: 72,
          promptCount90s: 24,
          promptCount180s: 48,
          totalPrompts: 72,
          unmatchedShots: [],
          unmatchedPrompts: [],
          redRisksWithoutReplacement: [],
          riskCounts: { green: 0, yellow: 0, red: 0, placeholder: 0 },
          shotFunctionCounts: {
            hook_shot: 1,
            context_shot: 1,
            evidence_shot: 1,
            concept_shot: 1,
            transition_shot: 1,
            emotional_shot: 1,
            data_shot: 1,
            risk_shot: 1,
            summary_shot: 1,
            cta_shot: 1
          },
          productionMethodCounts: {
            text_to_video: 1,
            image_to_video: 1,
            text_to_image_edit: 1,
            motion_graphics: 1,
            stock_footage: 1,
            manual_design: 1,
            compositing: 1
          },
          scores: {
            volumeScore: 5,
            alignmentScore: 5,
            rightsScore: 5,
            creativeDirectionScore: 5,
            visualBibleScore: 5,
            continuityScore: 5,
            shotFunctionCoverageScore: 5,
            productionMethodScore: 5,
            editingReadinessScore: 5,
            promptFieldCompletenessScore: 5,
            reportCompletenessScore: 5,
            overallScore: 5
          },
          missingReportFields: [],
          reportFieldCompleteness: "pass",
          needsFix: false,
          fixReasons: []
        },
        originalProductionPack: pack
      }
    });

    expect(file?.content).toContain("Shot / Prompt Gate Summary");
    expect(file?.content).toContain("Shot Density Profile：standard");
    expect(file?.content).toContain("Production Studio Lock Status：unlocked");
    expect(file?.content).toContain("Edited Fields Count：1");
    expect(file?.content).toContain("90s shot count");
    expect(file?.content).toContain("180s shot count");
    expect(file?.content).toContain("needsFix");
  });

  it("adds AIGC visual bible and editing summaries to production-pack.md", () => {
    const pack = normalizeProductionPack(demoProductionPack, "standard");
    const file = generateExportFile("production-pack.md", pack);

    expect(file?.content).toContain("AIGC 制作总控");
    expect(file?.content).toContain("视觉风格 Bible");
    expect(file?.content).toContain("连续性 Bible");
    expect(file?.content).toContain("Shot Function Summary");
    expect(file?.content).toContain("Production Method Summary");
    expect(file?.content).toContain("Editing Structure Summary");
    expect(file?.content).toContain("Prompt Completeness Summary");
  });

  it("writes full per-shot AIGC production blocks in production-pack.md", () => {
    const file = generateExportFile("production-pack.md", normalizeProductionPack(demoProductionPack));

    expect(file?.content).toContain("逐镜头 AIGC 制作表");
    expect(file?.content).toContain("### S90-01");
    expect(file?.content).toContain("- 镜头编号：");
    expect(file?.content).toContain("- 时长：");
    expect(file?.content).toContain("- 画面主体：");
    expect(file?.content).toContain("- 场景环境：");
    expect(file?.content).toContain("- 摄影机：");
    expect(file?.content).toContain("- 灯光：");
    expect(file?.content).toContain("- 风格：");
    expect(file?.content).toContain("- 禁止项：");
    expect(file?.content).toContain("- Image Prompt：");
    expect(file?.content).toContain("- Video Prompt：");
    expect(file?.content).toContain("- Negative Prompt：");
    expect(file?.content).toContain("- Replacement Plan：");
  });

  it("generates storyboard.csv with required header and storyboard rows", () => {
    const file = generateExportFile("storyboard.csv", normalizeProductionPack(demoProductionPack));

    expect(file?.contentType).toBe("text/csv; charset=utf-8");
    expect(file?.content.split("\n")[0]).toContain("versionType");
    expect(file?.content.split("\n")[0]).toContain("replacementPlan");
    expect(file?.content.split("\n")[0]).toContain("productionMethod");
    expect(file?.content.split("\n")[0]).toContain("cutType");
    expect(file?.content.split("\n")[0]).toContain("transitionLogic");
    expect(file?.content.split("\n")[0]).toContain("lighting");
    expect(file?.content.split("\n")[0]).toContain("style");
    expect(file?.content.split("\n")[0]).toContain("musicCue");
    expect(file?.content.split("\n")[0]).toContain("sfxCue");
    expect(file?.content).toContain("90s");
    expect(file?.content).toContain("180s");
  });

  it("generates rights-check.csv with replacement plans for red and placeholder rows", () => {
    const file = generateExportFile("rights-check.csv", normalizeProductionPack({
      ...demoProductionPack,
      rightsChecks: [
        {
          item: "真实新闻素材",
          level: "red",
          reason: "不可直接使用",
          action: "替换为自制图表。",
          replacementPlan: "替换为自制图表、抽象 AI 商业画面或 placeholder 复核项。"
        },
        {
          item: "待确认素材",
          level: "placeholder",
          reason: "需要复核",
          action: "使用 placeholder。",
          replacementPlan: "保留 placeholder 复核项，发布前确认授权。"
        }
      ]
    }));
    const lines = file?.content.trim().split("\n") ?? [];
    const header = lines[0].split(",");
    const riskLevelIndex = header.indexOf("riskLevel");
    const replacementIndex = header.indexOf("replacementPlan");
    const riskLevels = lines
      .slice(1)
      .map((line) => line.split(",")[riskLevelIndex]);

    expect(file?.contentType).toBe("text/csv; charset=utf-8");
    expect(lines[0]).toBe(
      "shotCode,versionType,materialType,riskLevel,reason,replacementPlan,productionMethod,usageStatus,reviewStatus,sourceUrl,notes"
    );
    expect(riskLevels.length).toBeGreaterThan(0);
    expect(riskLevels.every((level) => allowedRiskLevels.has(level))).toBe(true);
    for (const line of lines.slice(1)) {
      const columns = line.split(",");
      if (["red", "placeholder"].includes(columns[riskLevelIndex])) {
        expect(columns[replacementIndex]).not.toBe("");
      }
    }
  });

  it("generates project.json as parseable ProductionPack JSON", () => {
    const file = generateExportFile("project.json", demoProductionPack);
    const parsed = JSON.parse(file?.content ?? "");

    expect(file?.contentType).toBe("application/json; charset=utf-8");
    expect(parsed).toEqual(demoProductionPack);
  });

  it("generates project.json with productionStudio summary when provided", () => {
    const pack = normalizeProductionPack(demoProductionPack, "standard");
    const file = generateExportFile("project.json", pack, {
      productionStudio: {
        densityProfile: "standard",
        lockStatus: "locked",
        latestGateStatus: "pass",
        editedCount: 2,
        summary: {
          densityProfile: "standard",
          shotCount90s: 24,
          shotCount180s: 48,
          totalShots: 72,
          promptCount90s: 24,
          promptCount180s: 48,
          totalPrompts: 72,
          unmatchedShots: [],
          unmatchedPrompts: [],
          redRisksWithoutReplacement: [],
          riskCounts: { green: 0, yellow: 0, red: 0, placeholder: 0 },
          shotFunctionCounts: {
            hook_shot: 1,
            context_shot: 1,
            evidence_shot: 1,
            concept_shot: 1,
            transition_shot: 1,
            emotional_shot: 1,
            data_shot: 1,
            risk_shot: 1,
            summary_shot: 1,
            cta_shot: 1
          },
          productionMethodCounts: {
            text_to_video: 1,
            image_to_video: 1,
            text_to_image_edit: 1,
            motion_graphics: 1,
            stock_footage: 1,
            manual_design: 1,
            compositing: 1
          },
          scores: {
            volumeScore: 5,
            alignmentScore: 5,
            rightsScore: 5,
            creativeDirectionScore: 5,
            visualBibleScore: 5,
            continuityScore: 5,
            shotFunctionCoverageScore: 5,
            productionMethodScore: 5,
            editingReadinessScore: 5,
            promptFieldCompletenessScore: 5,
            reportCompletenessScore: 5,
            overallScore: 5
          },
          missingReportFields: [],
          reportFieldCompleteness: "pass",
          needsFix: false,
          fixReasons: []
        },
        originalProductionPack: pack
      }
    });
    const parsed = JSON.parse(file?.content ?? "");

    expect(parsed.productionStudio.densityProfile).toBe("standard");
    expect(parsed.productionStudio.lockStatus).toBe("locked");
    expect(parsed.productionStudio.editedCount).toBe(2);
    expect(parsed.productionStudio.originalProductionPack).toBeTruthy();
    expect(parsed.productionPack.creativeDirection).toBeTruthy();
    expect(parsed.productionPack.visualStyleBible).toBeTruthy();
    expect(parsed.productionPack.continuityBible).toBeTruthy();
    expect(parsed.productionPack.assetPrompts.promptBundles.length).toBeGreaterThan(0);
  });

  it("generates prompt-pack.md with image, video and negative prompts", () => {
    const file = generateExportFile("prompt-pack.md", normalizeProductionPack(demoProductionPack));

    expect(file?.content).toContain("imagePrompt");
    expect(file?.content).toContain("videoPrompt");
    expect(file?.content).toContain("negativePrompt");
    expect(file?.content).toContain("versionType：90s");
    expect(file?.content).toContain("shotNumber：1");
    expect(file?.content).toContain("subject：");
    expect(file?.content).toContain("environment：");
    expect(file?.content).toContain("camera：");
    expect(file?.content).toContain("lighting：");
    expect(file?.content).toContain("style：");
    expect(file?.content).toContain("negativeConstraints：");
    expect(file?.content).toContain("productionMethod：");
    expect(file?.content).toContain("methodReason：");
    expect(file?.content).toContain("continuityAssets：");
    expect(file?.content).toContain("forbiddenElements：");
    expect(file?.content).toContain("Creative Concept");
    expect(file?.content).toContain("Visual Style Bible");
    expect(file?.content).toContain("Continuity Bible");
  });

  it("generates publish-copy.md with investment advice disclaimer", () => {
    const file = generateExportFile("publish-copy.md", demoProductionPack);

    expect(file?.content).toContain("视频号标题候选");
    expect(file?.content).toContain("不构成投资建议");
  });

  it("uses manual publish copy when provided", () => {
    const file = generateExportFile("publish-copy.md", demoProductionPack, {
      publishCopy: {
        coverTitle: "人工封面标题",
        titleCandidates: ["人工标题 A", "人工标题 B"],
        publishText: "人工编辑后的发布文案。",
        tags: ["AI", "审阅"],
        riskNotice: "不构成投资建议",
        isManual: true
      }
    });

    expect(file?.content).toContain("人工封面标题");
    expect(file?.content).toContain("人工标题 A");
    expect(file?.content).toContain("人工编辑后的发布文案。");
  });

  it("returns null for illegal file names", () => {
    expect(generateExportFile("unknown.txt", demoProductionPack)).toBeNull();
  });
});
