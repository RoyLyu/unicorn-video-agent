import { z } from "zod";

import { ShotDensityProfileSchema } from "./density-profile";
import {
  ContinuityBibleSchema,
  CreativeDirectionSchema,
  EditingMetadataSchema,
  ProductionMethodSchema,
  ShotFunctionSchema,
  VisualStyleBibleSchema
} from "@/lib/schemas/production-pack";

export const ProductionStudioEditTypeSchema = z.enum([
  "shot",
  "prompt",
  "rights",
  "method",
  "editing",
  "creative_direction",
  "visual_bible",
  "continuity_bible"
]);

const ShotPatchSchema = z.object({
  visual: z.string().optional(),
  voiceover: z.string().optional(),
  overlayText: z.string().optional(),
  camera: z.string().optional(),
  composition: z.string().optional(),
  motion: z.string().optional(),
  shotCode: z.string().optional(),
  duration: z.string().optional(),
  shotFunction: ShotFunctionSchema.optional(),
  subject: z.string().optional(),
  environment: z.string().optional(),
  lighting: z.string().optional(),
  style: z.string().optional(),
  continuityAssets: z.array(z.string()).optional()
});

const PromptPatchSchema = z.object({
  imagePrompt: z.string().optional(),
  videoPrompt: z.string().optional(),
  negativePrompt: z.string().optional(),
  shotCode: z.string().optional(),
  duration: z.string().optional(),
  subject: z.string().optional(),
  environment: z.string().optional(),
  camera: z.string().optional(),
  lighting: z.string().optional(),
  style: z.string().optional(),
  negativeConstraints: z.string().optional(),
  forbiddenElements: z.array(z.string()).optional(),
  replacementPlan: z.string().optional()
});

const RightsPatchSchema = z.object({
  replacementPlan: z.string().optional()
});
const MethodPatchSchema = z.object({
  productionMethod: ProductionMethodSchema.optional(),
  methodReason: z.string().optional()
});
const PackVersionSchema = z.enum(["90s", "180s"]);
const GlobalPatchSchema = z.object({
  versionType: z.literal("global"),
  shotNumber: z.literal(0)
});

export const ProductionStudioEditInputSchema = z.discriminatedUnion("editType", [
  z.object({
    versionType: PackVersionSchema,
    shotNumber: z.number().int().positive(),
    editType: z.literal("shot"),
    patch: ShotPatchSchema
  }),
  z.object({
    versionType: PackVersionSchema,
    shotNumber: z.number().int().positive(),
    editType: z.literal("prompt"),
    patch: PromptPatchSchema
  }),
  z.object({
    versionType: PackVersionSchema,
    shotNumber: z.number().int().positive(),
    editType: z.literal("rights"),
    patch: RightsPatchSchema
  }),
  z.object({
    versionType: PackVersionSchema,
    shotNumber: z.number().int().positive(),
    editType: z.literal("method"),
    patch: MethodPatchSchema
  }),
  z.object({
    versionType: PackVersionSchema,
    shotNumber: z.number().int().positive(),
    editType: z.literal("editing"),
    patch: EditingMetadataSchema.partial()
  }),
  GlobalPatchSchema.extend({
    editType: z.literal("creative_direction"),
    patch: z.object({ creativeDirection: CreativeDirectionSchema.partial() })
  }),
  GlobalPatchSchema.extend({
    editType: z.literal("visual_bible"),
    patch: z.object({ visualStyleBible: VisualStyleBibleSchema.partial() })
  }),
  GlobalPatchSchema.extend({
    editType: z.literal("continuity_bible"),
    patch: z.object({ continuityBible: ContinuityBibleSchema.partial() })
  })
]);

export const ProductionStudioEditBatchSchema = z.object({
  edits: z.array(ProductionStudioEditInputSchema).min(1)
});

export const ProductionStudioRevalidateInputSchema = z.object({
  densityProfile: ShotDensityProfileSchema.default("standard")
});

export const ProductionStudioLockInputSchema = z.object({
  lockNote: z.string().optional()
});

export type ProductionStudioEditInput = z.infer<typeof ProductionStudioEditInputSchema>;
export type ProductionStudioEditBatch = z.infer<typeof ProductionStudioEditBatchSchema>;
export type ProductionStudioRevalidateInput = z.infer<typeof ProductionStudioRevalidateInputSchema>;
export type ProductionStudioLockInput = z.infer<typeof ProductionStudioLockInputSchema>;
