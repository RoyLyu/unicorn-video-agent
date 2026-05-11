import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateExportFile } from "@/lib/export/generate-export-file";
import {
  createTitleOnlyArticleInput,
  type QuickDemoContentType
} from "@/lib/quick-demo/title-only-article";
import {
  createRealRunAuditReport,
  renderRealRunAuditMarkdown
} from "@/lib/real-run-audit/quality-scorer";
import type { GenerationMode, ProductionPack } from "@/lib/schemas/production-pack";

type AuditArgs = {
  title: string;
  templateType: QuickDemoContentType;
  industryTags: string;
};

type AiProductionPackResponse = {
  projectId: string;
  productionPack: ProductionPack;
  agentRunId?: string;
  fallbackUsed: boolean;
  generationMode: GenerationMode;
  fallbackReason?: string;
  safeErrorSummary?: string;
};

const outputDir = path.join(process.cwd(), "tmp", "real-run-audit");
const productionPackPath = path.join(outputDir, "latest-production-pack.json");
const qaReportPath = path.join(outputDir, "latest-qa-report.md");

async function main() {
  await loadLocalEnv();
  const { handleAiProductionPackRequest } = await import(
    "@/app/api/ai/production-pack/route"
  );
  const args = parseArgs(process.argv.slice(2));
  const articleInput = createTitleOnlyArticleInput({
    title: args.title,
    contentType: args.templateType,
    industryTagsText: args.industryTags
  });
  const response = await handleAiProductionPackRequest(
    new Request("http://localhost/api/ai/production-pack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(articleInput)
    })
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Audit AI request failed with ${response.status}: ${body}`);
  }

  const body = (await response.json()) as AiProductionPackResponse;
  const productionPackExport = generateExportFile(
    "production-pack.md",
    body.productionPack
  );
  const auditReport = createRealRunAuditReport({
    productionPack: body.productionPack,
    projectId: body.projectId,
    agentRunId: body.agentRunId ?? null,
    fallbackUsed: body.fallbackUsed,
    generationMode: body.generationMode
  });
  const markdown = [
    renderRealRunAuditMarkdown(auditReport),
    "",
    "## Export Readiness",
    "",
    productionPackExport
      ? "- production-pack.md generated in memory: yes"
      : "- production-pack.md generated in memory: no"
  ].join("\n");

  await mkdir(outputDir, { recursive: true });
  await writeFile(productionPackPath, JSON.stringify(body, null, 2), "utf8");
  await writeFile(qaReportPath, markdown, "utf8");

  console.log(`Real run audit complete.`);
  console.log(`ProductionPack response: ${productionPackPath}`);
  console.log(`QA report: ${qaReportPath}`);
  console.log(`Showcase: /projects/${body.projectId}/showcase`);
}

function parseArgs(argv: string[]): AuditArgs {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--") {
      continue;
    }

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    args.set(key, value);
    index += 1;
  }

  const title = args.get("title")?.trim();
  const templateType = args.get("templateType")?.trim() as QuickDemoContentType | undefined;
  const industryTags = args.get("industryTags")?.trim() ?? "";

  if (!title) {
    throw new Error("Missing required --title");
  }

  if (!isQuickDemoContentType(templateType)) {
    throw new Error(
      "Missing or invalid --templateType. Use one of: ipo, financing, industry_trend, growth_case, policy_macro"
    );
  }

  return { title, templateType, industryTags };
}

function isQuickDemoContentType(
  value: string | undefined
): value is QuickDemoContentType {
  return (
    value === "ipo" ||
    value === "financing" ||
    value === "industry_trend" ||
    value === "growth_case" ||
    value === "policy_macro"
  );
}

async function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");

  try {
    const content = await readFile(envPath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // The route handler will report missing configuration and fallback.
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Real run audit failed: ${message}`);
  process.exitCode = 1;
});
