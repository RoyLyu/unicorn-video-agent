import { generateExportFile } from "@/lib/export/generate-export-file";
import type { ProductionPack } from "@/lib/schemas/production-pack";

import type { AgentQaSummary } from "./agent-run-types";

const requiredExportFiles = [
  "production-pack.md",
  "storyboard.csv",
  "project.json",
  "rights-check.csv",
  "prompt-pack.md",
  "publish-copy.md"
];

export function createQaSummary(pack: ProductionPack): AgentQaSummary {
  const articleText = `${pack.articleInput.title} ${pack.articleInput.rawText}`;
  const redRightsRiskCount = pack.rightsChecks.filter(
    (risk) => risk.level === "red"
  ).length;
  const manifestFiles = pack.exportManifest.files.map((file) => file.filename);
  const publishCopy = generateExportFile("publish-copy.md", pack)?.content ?? "";

  return {
    fact: {
      hasCompany: /公司|品牌|企业|项目/.test(articleText),
      hasEvent: /上市|融资|发布|完成|观察/.test(articleText),
      hasIndustry: pack.articleInput.industryTags.length > 0
    },
    script: {
      has90sScript: pack.scripts.video90s.lines.length > 0,
      has180sScript: pack.scripts.video180s.lines.length > 0
    },
    copyright: {
      hasNoRedRightsRisk: redRightsRiskCount === 0,
      redRightsRiskCount
    },
    export: {
      hasRequiredManifestFiles: requiredExportFiles.every((fileName) =>
        manifestFiles.includes(fileName)
      ),
      fileCount: manifestFiles.length
    },
    publish: {
      includesInvestmentDisclaimer: publishCopy.includes("不构成投资建议")
    }
  };
}
