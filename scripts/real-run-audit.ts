import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { readAiPolicy } from "@/lib/ai/ai-policy";
import { scanOutputContamination } from "@/lib/ai/output-contamination";
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
  allowFallback: boolean;
};

const allowFallbackFlag = "--allowFallback";

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
const failedProductionPackPath = path.join(outputDir, "failed-production-pack.json");
const failedQaReportPath = path.join(outputDir, "failed-qa-report.md");

async function main() {
  await loadLocalEnv();
  printSafeEnvSummary();
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
      body: JSON.stringify({
        ...articleInput,
        generationProfile: args.allowFallback ? "fast_demo" : "real_output"
      })
    })
  );

  if (!response.ok) {
    const body = await response.text();
    await writeFailedArtifacts({
      reason: `Audit AI request failed with ${response.status}`,
      responseBody: body
    });
    process.exitCode = 1;
    return;
  }

  const body = (await response.json()) as AiProductionPackResponse;
  const policy = readAiPolicy();
  const contamination = scanOutputContamination(
    body.productionPack,
    policy.bannedOutputTerms
  );

  if (
    !args.allowFallback &&
    (body.fallbackUsed ||
      body.generationMode !== "ai" ||
      body.productionPack.mode !== "ai" ||
      contamination.contaminated)
  ) {
    await writeFailedArtifacts({
      reason: body.fallbackUsed
        ? "fallbackUsed=true"
        : contamination.safeErrorSummary ?? "real output gate failed",
      responseBody: JSON.stringify(body, null, 2),
      productionPack: body.productionPack
    });
    process.exitCode = 1;
    return;
  }

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

    if (`--${key}` === allowFallbackFlag) {
      args.set(key, "true");
      continue;
    }

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

  return {
    title,
    templateType,
    industryTags,
    allowFallback: args.get("allowFallback") === "true"
  };
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

function printSafeEnvSummary() {
  const env = process.env as Record<string, string | undefined>;
  const getEnv = (key: string) => env[key];

  console.log("safe env summary");
  console.log(`AI_PROVIDER=${getEnv("AI_PROVIDER") ?? ""}`);
  console.log(`AI_MODEL=${getEnv("AI_MODEL") ?? ""}`);
  console.log(`AI_AGENT_MODE=${getEnv("AI_AGENT_MODE") ?? ""}`);
  console.log(`MINIMAX_BASE_URL exists=${Boolean(getEnv("MINIMAX_BASE_URL"))}`);
  console.log(`MINIMAX_API_KEY exists=${Boolean(getEnv("MINIMAX_API_KEY"))}`);
  console.log(`AI_REQUIRE_REAL_OUTPUT=${getEnv("AI_REQUIRE_REAL_OUTPUT") ?? ""}`);
  console.log(`AI_ALLOW_MOCK_FALLBACK=${getEnv("AI_ALLOW_MOCK_FALLBACK") ?? ""}`);
}

async function writeFailedArtifacts(input: {
  reason: string;
  responseBody: string;
  productionPack?: ProductionPack;
}) {
  await mkdir(outputDir, { recursive: true });
  const payload = {
    failed: true,
    reason: input.reason,
    responseBody: input.responseBody,
    productionPack: input.productionPack ?? null
  };
  const markdown = [
    "# Failed Real Run Audit",
    "",
    `- Reason: ${input.reason}`,
    "- latest-production-pack.json was not overwritten.",
    "- latest-qa-report.md was not overwritten.",
    "",
    "## Response",
    "",
    "```json",
    input.responseBody,
    "```"
  ].join("\n");

  await writeFile(failedProductionPackPath, JSON.stringify(payload, null, 2), "utf8");
  await writeFile(failedQaReportPath, markdown, "utf8");
  console.error(`Real run audit failed: ${input.reason}`);
  console.error(`Failed response: ${failedProductionPackPath}`);
  console.error(`Failed QA report: ${failedQaReportPath}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Real run audit failed: ${message}`);
  process.exitCode = 1;
});
