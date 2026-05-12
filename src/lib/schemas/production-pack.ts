import { z } from "zod";

const NonEmptyString = z.string().trim().min(1);
const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const DateTimeString = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/
);

export const TargetDurationSchema = z.union([z.literal(90), z.literal(180)]);
export const GenerationModeSchema = z.enum(["mock", "ai"]);
export const RightsRiskLevelSchema = z.enum([
  "green",
  "yellow",
  "red",
  "placeholder"
]);
export const StoryboardVersionTypeSchema = z.enum(["90s", "180s"]);
export const ShotFunctionSchema = z.enum([
  "hook_shot",
  "context_shot",
  "evidence_shot",
  "concept_shot",
  "transition_shot",
  "emotional_shot",
  "data_shot",
  "risk_shot",
  "summary_shot",
  "cta_shot"
]);
export const ProductionMethodSchema = z.enum([
  "text_to_video",
  "image_to_video",
  "text_to_image_edit",
  "motion_graphics",
  "stock_footage",
  "manual_design",
  "compositing"
]);
export const CutTypeSchema = z.enum([
  "hard_cut",
  "dissolve",
  "wipe",
  "match_cut",
  "graphic_match",
  "push",
  "zoom_cut"
]);
export const PaceSchema = z.enum(["fast", "medium", "slow"]);
export const RollTypeSchema = z.enum([
  "a_roll",
  "b_roll",
  "graphic_roll",
  "transition_roll"
]);

export const CreativeDirectionSchema = z.object({
  creativeConcept: NonEmptyString,
  visualMetaphor: NonEmptyString,
  mainVisualMotif: NonEmptyString,
  narrativeDevice: NonEmptyString,
  emotionalCurve: NonEmptyString,
  visualProgression: NonEmptyString,
  audienceTakeaway: NonEmptyString,
  productionNotes: NonEmptyString
});

export const VisualStyleBibleSchema = z.object({
  aspectRatio: NonEmptyString,
  imageType: NonEmptyString,
  colorSystem: z.object({
    primaryColor: NonEmptyString,
    secondaryColor: NonEmptyString,
    accentColor: NonEmptyString,
    forbiddenColors: z.array(NonEmptyString).min(1)
  }),
  lightingSystem: z.object({
    contrast: NonEmptyString,
    temperature: NonEmptyString,
    keyLightDirection: NonEmptyString,
    atmosphere: NonEmptyString
  }),
  materialSystem: z.object({
    metal: NonEmptyString,
    glass: NonEmptyString,
    dataParticles: NonEmptyString,
    paperProspectus: NonEmptyString,
    screenUI: NonEmptyString,
    otherMaterials: z.array(NonEmptyString).min(1)
  }),
  cameraTexture: z.object({
    realistic: NonEmptyString,
    semiRealistic: NonEmptyString,
    motionGraphics: NonEmptyString,
    threeD: NonEmptyString
  }),
  typographyStyle: z.object({
    fontMood: NonEmptyString,
    placement: NonEmptyString,
    sizeRule: NonEmptyString,
    motionRule: NonEmptyString
  }),
  chartStyle: z.object({
    flat: NonEmptyString,
    threeD: NonEmptyString,
    transparentHUD: NonEmptyString,
    infoCard: NonEmptyString
  }),
  forbiddenElements: z.array(NonEmptyString).min(1)
});

export const ContinuityBibleSchema = z.object({
  mainCharacterBible: NonEmptyString,
  environmentBible: NonEmptyString,
  objectBible: NonEmptyString,
  colorContinuity: NonEmptyString,
  motionContinuity: NonEmptyString,
  graphicContinuity: NonEmptyString,
  typographyContinuity: NonEmptyString,
  referenceFramePlan: NonEmptyString
});

export const EditingMetadataSchema = z.object({
  beat: NonEmptyString,
  cutType: CutTypeSchema,
  transitionLogic: NonEmptyString,
  screenTextTiming: NonEmptyString,
  graphicTiming: NonEmptyString,
  musicCue: NonEmptyString,
  sfxCue: NonEmptyString,
  pace: PaceSchema,
  rollType: RollTypeSchema
});

export const ArticleInputSchema = z.object({
  title: NonEmptyString,
  rawText: NonEmptyString,
  sourceUrl: z.url(),
  publishDate: DateString,
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
        rightsLevel: RightsRiskLevelSchema,
        versionType: StoryboardVersionTypeSchema.optional(),
        shotNumber: z.number().int().positive().optional(),
        beat: NonEmptyString.optional(),
        duration: NonEmptyString.optional(),
        voiceover: NonEmptyString.optional(),
        overlayText: NonEmptyString.optional(),
        camera: NonEmptyString.optional(),
        composition: NonEmptyString.optional(),
        motion: NonEmptyString.optional(),
        visualType: NonEmptyString.optional(),
        chartNeed: NonEmptyString.optional(),
        copyrightRisk: RightsRiskLevelSchema.optional(),
        replacementPlan: NonEmptyString.optional(),
        shotCode: NonEmptyString.optional(),
        shotFunction: ShotFunctionSchema.optional(),
        productionMethod: ProductionMethodSchema.optional(),
        methodReason: NonEmptyString.optional(),
        subject: NonEmptyString.optional(),
        environment: NonEmptyString.optional(),
        lighting: NonEmptyString.optional(),
        style: NonEmptyString.optional(),
        continuityAssets: z.array(NonEmptyString).optional(),
        editing: EditingMetadataSchema.optional()
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
  ),
  promptBundles: z
    .array(
      z.object({
        versionType: StoryboardVersionTypeSchema,
        shotNumber: z.number().int().positive(),
        shotId: NonEmptyString,
        imagePrompt: NonEmptyString,
        videoPrompt: NonEmptyString,
        negativePrompt: NonEmptyString,
        styleLock: NonEmptyString,
        aspectRatio: NonEmptyString,
        usageWarning: NonEmptyString,
        shotCode: NonEmptyString.optional(),
        duration: NonEmptyString.optional(),
        subject: NonEmptyString.optional(),
        environment: NonEmptyString.optional(),
        camera: NonEmptyString.optional(),
        lighting: NonEmptyString.optional(),
        style: NonEmptyString.optional(),
        negativeConstraints: NonEmptyString.optional(),
        forbiddenElements: z.array(NonEmptyString).optional(),
        replacementPlan: NonEmptyString.optional()
      })
    )
    .optional()
});

export const RightsCheckResultSchema = z.object({
  item: NonEmptyString,
  level: RightsRiskLevelSchema,
  reason: NonEmptyString,
  action: NonEmptyString,
  replacementPlan: NonEmptyString.optional()
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
  createdAt: DateTimeString,
  mode: GenerationModeSchema,
  articleInput: ArticleInputSchema,
  analysis: AnalysisResultSchema,
  thesis: ThesisResultSchema,
  scripts: ScriptResultSchema,
  storyboard: StoryboardResultSchema,
  assetPrompts: AssetPromptResultSchema,
  rightsChecks: z.array(RightsCheckResultSchema).min(1),
  exportManifest: ExportManifestSchema,
  creativeDirection: CreativeDirectionSchema.optional(),
  visualStyleBible: VisualStyleBibleSchema.optional(),
  continuityBible: ContinuityBibleSchema.optional()
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
export type GenerationMode = z.infer<typeof GenerationModeSchema>;
export type RightsRiskLevel = z.infer<typeof RightsRiskLevelSchema>;
export type StoryboardVersionType = z.infer<typeof StoryboardVersionTypeSchema>;
export type ShotFunction = z.infer<typeof ShotFunctionSchema>;
export type ProductionMethod = z.infer<typeof ProductionMethodSchema>;
export type CutType = z.infer<typeof CutTypeSchema>;
export type Pace = z.infer<typeof PaceSchema>;
export type RollType = z.infer<typeof RollTypeSchema>;
