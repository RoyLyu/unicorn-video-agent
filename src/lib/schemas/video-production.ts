import { z } from "zod";

const NonEmptyString = z.string().trim().min(1);

export const TargetDurationSchema = z.union([z.literal(90), z.literal(180)]);

export const ArticleInputSchema = z.object({
  title: NonEmptyString,
  body: NonEmptyString,
  url: z.url(),
  publishedAt: z.iso.date(),
  source: NonEmptyString,
  industryTags: z.array(NonEmptyString).min(1),
  targetDuration: TargetDurationSchema
});

export const ScriptLineSchema = z.object({
  timestamp: NonEmptyString,
  narration: NonEmptyString,
  visualDirection: NonEmptyString,
  onScreenText: NonEmptyString.optional()
});

export const ScriptBlockSchema = z.object({
  durationSeconds: TargetDurationSchema,
  hook: NonEmptyString,
  lines: z.array(ScriptLineSchema).min(1),
  closing: NonEmptyString
});

export const StoryboardShotSchema = z.object({
  shotId: NonEmptyString,
  timeRange: NonEmptyString,
  scene: NonEmptyString,
  narration: NonEmptyString,
  visual: NonEmptyString,
  assetType: z.enum(["chart", "ai-image", "ai-video", "stock", "screen", "text"]),
  copyrightNote: NonEmptyString
});

export const ChartSuggestionSchema = z.object({
  title: NonEmptyString,
  chartType: z.enum(["bar", "line", "pie", "table", "timeline", "comparison"]),
  dataNeeded: z.array(NonEmptyString).min(1),
  purpose: NonEmptyString
});

export const PromptItemSchema = z.object({
  id: NonEmptyString,
  sceneRef: NonEmptyString,
  prompt: NonEmptyString,
  negativePrompt: z.string().optional(),
  styleNotes: NonEmptyString
});

export const SearchLeadSchema = z.object({
  query: NonEmptyString,
  platform: NonEmptyString,
  intendedUse: NonEmptyString,
  licenseRequirement: NonEmptyString
});

export const CopyrightRiskSchema = z.object({
  item: NonEmptyString,
  riskLevel: z.enum(["low", "medium", "high"]),
  reason: NonEmptyString,
  mitigation: NonEmptyString
});

export const VideoProductionPackageSchema = z.object({
  coreSummary: NonEmptyString,
  coreViewpoints: z.array(NonEmptyString).min(1),
  scripts: z.object({
    video90s: ScriptBlockSchema.extend({
      durationSeconds: z.literal(90)
    }),
    video180s: ScriptBlockSchema.extend({
      durationSeconds: z.literal(180)
    })
  }),
  storyboard: z.array(StoryboardShotSchema).min(1),
  chartSuggestions: z.array(ChartSuggestionSchema),
  aiImagePrompts: z.array(PromptItemSchema),
  aiVideoPrompts: z.array(PromptItemSchema),
  materialSearchLeads: z.array(SearchLeadSchema),
  copyrightRisks: z.array(CopyrightRiskSchema),
  coverCopy: z.array(NonEmptyString).min(1),
  publishCopy: NonEmptyString,
  exports: z.object({
    markdown: z.boolean(),
    csv: z.boolean(),
    json: z.boolean()
  })
});

export type ArticleInput = z.infer<typeof ArticleInputSchema>;
export type VideoProductionPackage = z.infer<
  typeof VideoProductionPackageSchema
>;
