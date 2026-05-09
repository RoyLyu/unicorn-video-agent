import type { ProductionPack } from "@/lib/schemas/production-pack";
import {
  type ExportFileName,
  type ExportGenerationOptions,
  type GeneratedExportFile,
  isExportFileName
} from "./export-types";
import { generateProductionPackMarkdown } from "./production-pack-markdown";
import { generateProjectJson } from "./project-json";
import { generatePromptPackMarkdown } from "./prompt-pack-markdown";
import { generatePublishCopyMarkdown } from "./publish-copy-markdown";
import { generateRightsCheckCsv } from "./rights-check-csv";
import { generateStoryboardCsv } from "./storyboard-csv";

const contentTypes: Record<ExportFileName, string> = {
  "production-pack.md": "text/markdown; charset=utf-8",
  "storyboard.csv": "text/csv; charset=utf-8",
  "project.json": "application/json; charset=utf-8",
  "rights-check.csv": "text/csv; charset=utf-8",
  "prompt-pack.md": "text/markdown; charset=utf-8",
  "publish-copy.md": "text/markdown; charset=utf-8"
};

export function generateExportFile(
  fileName: string,
  productionPack: ProductionPack,
  options: ExportGenerationOptions = {}
): GeneratedExportFile | null {
  if (!isExportFileName(fileName)) {
    return null;
  }

  return {
    fileName,
    contentType: contentTypes[fileName],
    content: generateContent(fileName, productionPack, options)
  };
}

function generateContent(
  fileName: ExportFileName,
  productionPack: ProductionPack,
  options: ExportGenerationOptions
) {
  switch (fileName) {
    case "production-pack.md":
      return generateProductionPackMarkdown(productionPack);
    case "storyboard.csv":
      return generateStoryboardCsv(productionPack);
    case "project.json":
      return generateProjectJson(productionPack);
    case "rights-check.csv":
      return generateRightsCheckCsv(productionPack);
    case "prompt-pack.md":
      return generatePromptPackMarkdown(productionPack);
    case "publish-copy.md":
      return generatePublishCopyMarkdown(productionPack, options.publishCopy);
  }
}
