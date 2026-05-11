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
    const file = generateExportFile("production-pack.md", normalizeProductionPack(demoProductionPack));

    expect(file?.content).toContain("Shot / Prompt Gate Summary");
    expect(file?.content).toContain("90s shot count");
    expect(file?.content).toContain("180s shot count");
    expect(file?.content).toContain("needsFix");
  });

  it("generates storyboard.csv with required header and storyboard rows", () => {
    const file = generateExportFile("storyboard.csv", normalizeProductionPack(demoProductionPack));

    expect(file?.contentType).toBe("text/csv; charset=utf-8");
    expect(file?.content.split("\n")[0]).toContain("versionType");
    expect(file?.content.split("\n")[0]).toContain("replacementPlan");
    expect(file?.content).toContain("90s");
    expect(file?.content).toContain("180s");
  });

  it("generates rights-check.csv with only allowed risk levels", () => {
    const file = generateExportFile("rights-check.csv", demoProductionPack);
    const lines = file?.content.trim().split("\n") ?? [];
    const header = lines[0].split(",");
    const riskLevelIndex = header.indexOf("riskLevel");
    const riskLevels = lines
      .slice(1)
      .map((line) => line.split(",")[riskLevelIndex]);

    expect(file?.contentType).toBe("text/csv; charset=utf-8");
    expect(lines[0]).toBe(
      "shotId,materialType,sourceName,sourceUrl,licenseType,riskLevel,commercialAllowed,wechatVideoAllowed,needsAttribution,reviewStatus,notes"
    );
    expect(riskLevels.length).toBeGreaterThan(0);
    expect(riskLevels.every((level) => allowedRiskLevels.has(level))).toBe(true);
  });

  it("generates project.json as parseable ProductionPack JSON", () => {
    const file = generateExportFile("project.json", demoProductionPack);
    const parsed = JSON.parse(file?.content ?? "");

    expect(file?.contentType).toBe("application/json; charset=utf-8");
    expect(parsed).toEqual(demoProductionPack);
  });

  it("generates prompt-pack.md with image, video and negative prompts", () => {
    const file = generateExportFile("prompt-pack.md", normalizeProductionPack(demoProductionPack));

    expect(file?.content).toContain("imagePrompt");
    expect(file?.content).toContain("videoPrompt");
    expect(file?.content).toContain("negativePrompt");
    expect(file?.content).toContain("versionType：90s");
    expect(file?.content).toContain("shotNumber：1");
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
