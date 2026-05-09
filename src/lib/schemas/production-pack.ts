import { z } from "zod";

const NonEmptyString = z.string().trim().min(1);

export const TargetDurationSchema = z.union([z.literal(90), z.literal(180)]);
export const RightsRiskLevelSchema = z.enum([
  "green",
  "yellow",
  "red",
  "placeholder"
]);

export const ArticleInputSchema = z.object({
  title: NonEmptyString,
  rawText: NonEmptyString,
  sourceUrl: z.url(),
  publishDate: z.iso.date(),
  sourceName: NonEmptyString,
  industryTags: z.array(NonEmptyString).min(1),
  targetDurations: z.array(TargetDurationSchema).min(1)
});

export const AnalysisResultSchema = z.object({
  summary: NonEmptyString,
  keyFacts: z.array(NonEmptyString).min(1),
  industryData: z
    .array(
      z.object({
        metric: NonEmptyString,
        value: NonEmptyString,
        note: NonEmptyString
      })
    )
    .min(1),
  risks: z.array(NonEmptyString).min(1)
});

export const ThesisResultSchema = z.object({
  coreTheses: z.array(NonEmptyString).min(1),
  videoAngle: NonEmptyString,
  audienceTakeaway: NonEmptyString
});

export const ScriptLineSchema = z.object({
  timeRange: NonEmptyString,
  narration: NonEmptyString,
  visual: NonEmptyString,
  onScreenText: NonEmptyString
});

export const ScriptBlockSchema = z.object({
  duration: TargetDurationSchema,
  title: NonEmptyString,
  hook: NonEmptyString,
  lines: z.array(ScriptLineSchema).min(1),
  closing: NonEmptyString
});

export const ScriptResultSchema = z.object({
  video90s: ScriptBlockSchema.extend({ duration: z.literal(90) }),
  video180s: ScriptBlockSchema.extend({ duration: z.literal(180) })
});

export const StoryboardResultSchema = z.object({
  shots: z
    .array(
      z.object({
        id: NonEmptyString,
        timeRange: NonEmptyString,
        scene: NonEmptyString,
        narration: NonEmptyString,
        visual: NonEmptyString,
        assetType: z.enum(["chart", "ai-image", "ai-video", "stock", "screen", "text"]),
        rightsLevel: RightsRiskLevelSchema
      })
    )
    .min(1)
});

export const AssetPromptResultSchema = z.object({
  imagePrompts: z.array(
    z.object({
      id: NonEmptyString,
      sceneRef: NonEmptyString,
      prompt: NonEmptyString,
      negativePrompt: NonEmptyString,
      notes: NonEmptyString
    })
  ),
  videoPrompts: z.array(
    z.object({
      id: NonEmptyString,
      sceneRef: NonEmptyString,
      prompt: NonEmptyString,
      negativePrompt: NonEmptyString,
      notes: NonEmptyString
    })
  ),
  searchLeads: z.array(
    z.object({
      query: NonEmptyString,
      platform: NonEmptyString,
      intendedUse: NonEmptyString,
      licenseRequirement: NonEmptyString
    })
  )
});

export const RightsCheckResultSchema = z.object({
  item: NonEmptyString,
  level: RightsRiskLevelSchema,
  reason: NonEmptyString,
  action: NonEmptyString
});

export const ExportManifestSchema = z.object({
  files: z.array(
    z.object({
      filename: NonEmptyString,
      format: NonEmptyString,
      purpose: NonEmptyString,
      status: z.literal("planned"),
      generated: z.literal(false)
    })
  )
});

export const ProductionPackSchema = z.object({
  id: NonEmptyString,
  createdAt: z.iso.datetime(),
  mode: z.literal("mock"),
  articleInput: ArticleInputSchema,
  analysis: AnalysisResultSchema,
  thesis: ThesisResultSchema,
  scripts: ScriptResultSchema,
  storyboard: StoryboardResultSchema,
  assetPrompts: AssetPromptResultSchema,
  rightsChecks: z.array(RightsCheckResultSchema).min(1),
  exportManifest: ExportManifestSchema
});

export type ArticleInput = z.infer<typeof ArticleInputSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type ThesisResult = z.infer<typeof ThesisResultSchema>;
export type ScriptResult = z.infer<typeof ScriptResultSchema>;
export type StoryboardResult = z.infer<typeof StoryboardResultSchema>;
export type AssetPromptResult = z.infer<typeof AssetPromptResultSchema>;
export type RightsCheckResult = z.infer<typeof RightsCheckResultSchema>;
export type ExportManifest = z.infer<typeof ExportManifestSchema>;
export type ProductionPack = z.infer<typeof ProductionPackSchema>;
export type RightsRiskLevel = z.infer<typeof RightsRiskLevelSchema>;
