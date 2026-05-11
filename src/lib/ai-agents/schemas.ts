import { z } from "zod";

import type { AgentSlug } from "@/lib/agents/agent-run-types";
import {
  AnalysisResultSchema,
  AssetPromptResultSchema,
  RightsCheckResultSchema,
  ScriptResultSchema,
  StoryboardResultSchema,
  ThesisResultSchema
} from "@/lib/schemas/production-pack";

const NonEmptyString = z.string().trim().min(1);

export const AssetFinderResultSchema = z.object({
  searchLeads: AssetPromptResultSchema.shape.searchLeads,
  note: NonEmptyString
});

export const AgentQaSummarySchema = z.object({
  fact: z.object({
    hasCompany: z.boolean(),
    hasEvent: z.boolean(),
    hasIndustry: z.boolean()
  }),
  script: z.object({
    has90sScript: z.boolean(),
    has180sScript: z.boolean()
  }),
  copyright: z.object({
    hasNoRedRightsRisk: z.boolean(),
    redRightsRiskCount: z.number().int().min(0)
  }),
  export: z.object({
    hasRequiredManifestFiles: z.boolean(),
    fileCount: z.number().int().min(0)
  }),
  publish: z.object({
    includesInvestmentDisclaimer: z.boolean()
  })
});

export const QaAgentResultSchema = z.object({
  rightsChecks: z.array(RightsCheckResultSchema).min(1),
  qaSummary: AgentQaSummarySchema
});

export const AiAgentOutputSchemas = {
  "article-analyst": AnalysisResultSchema,
  "thesis-agent": ThesisResultSchema,
  "script-writer": ScriptResultSchema,
  "storyboard-agent": StoryboardResultSchema,
  "prompt-generator": AssetPromptResultSchema,
  "asset-finder": AssetFinderResultSchema,
  "qa-agent": QaAgentResultSchema
} satisfies Record<AgentSlug, z.ZodType>;
