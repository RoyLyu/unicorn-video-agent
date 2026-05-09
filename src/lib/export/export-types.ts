import type { ProductionPack } from "@/lib/schemas/production-pack";

export const allowedExportFileNames = [
  "production-pack.md",
  "storyboard.csv",
  "project.json",
  "rights-check.csv",
  "prompt-pack.md",
  "publish-copy.md"
] as const;

export type ExportFileName = (typeof allowedExportFileNames)[number];

export type GeneratedExportFile = {
  fileName: ExportFileName;
  contentType: string;
  content: string;
};

export type ExportGenerator = (productionPack: ProductionPack) => string;

export type PublishCopyExportData = {
  coverTitle: string;
  titleCandidates: string[];
  publishText: string;
  tags: string[];
  riskNotice: string;
  isManual?: boolean;
};

export type ExportGenerationOptions = {
  publishCopy?: PublishCopyExportData;
};

export function isExportFileName(fileName: string): fileName is ExportFileName {
  return allowedExportFileNames.includes(fileName as ExportFileName);
}
