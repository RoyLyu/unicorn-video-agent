import {
  ArticleInputSchema,
  ProductionPackSchema,
  type ArticleInput,
  type ProductionPack
} from "../schemas/production-pack";
import { analyzeArticle } from "./article-analyst";
import { createThesis } from "./thesis-agent";
import { writeScripts } from "./script-writer";
import { createStoryboard } from "./storyboard-agent";
import { generatePrompts } from "./prompt-generator";
import { checkRightsRisks } from "./rights-risk-agent";

export function runMockPipeline(input: ArticleInput): ProductionPack {
  const articleInput = ArticleInputSchema.parse(input);
  const analysis = analyzeArticle(articleInput);
  const thesis = createThesis(articleInput, analysis);
  const scripts = writeScripts(articleInput, thesis);
  const storyboard = createStoryboard(articleInput, scripts);
  const assetPrompts = generatePrompts(articleInput, storyboard);
  const rightsChecks = checkRightsRisks(storyboard, assetPrompts);

  return ProductionPackSchema.parse({
    id: `mock-${slugify(articleInput.title)}`,
    createdAt: "2026-05-09T00:00:00.000Z",
    mode: "mock",
    articleInput,
    analysis,
    thesis,
    scripts,
    storyboard,
    assetPrompts,
    rightsChecks,
    exportManifest: {
      files: [
        plannedFile("production-pack.md", "Markdown", "完整生产包阅读稿"),
        plannedFile("storyboard.csv", "CSV", "分镜协作表"),
        plannedFile("project.json", "JSON", "完整 ProductionPack JSON"),
        plannedFile("rights-check.csv", "CSV", "版权风险复核表"),
        plannedFile("prompt-pack.md", "Markdown", "AI 图像和视频 Prompt 清单"),
        plannedFile("publish-copy.md", "Markdown", "封面和发布文案")
      ]
    }
  });
}

function plannedFile(filename: string, format: string, purpose: string) {
  return {
    filename,
    format,
    purpose,
    status: "planned" as const,
    generated: false as const
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
