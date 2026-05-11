import { z } from "zod";

import { ShotDensityProfileSchema } from "./density-profile";

export const ProductionStudioEditTypeSchema = z.enum(["shot", "prompt", "rights"]);

const ShotPatchSchema = z.object({
  visual: z.string().optional(),
  voiceover: z.string().optional(),
  overlayText: z.string().optional(),
  camera: z.string().optional(),
  composition: z.string().optional(),
  motion: z.string().optional()
});

const PromptPatchSchema = z.object({
  imagePrompt: z.string().optional(),
  videoPrompt: z.string().optional(),
  negativePrompt: z.string().optional()
});

const RightsPatchSchema = z.object({
  replacementPlan: z.string().optional()
});

export const ProductionStudioEditInputSchema = z.discriminatedUnion("editType", [
  z.object({
    versionType: z.enum(["90s", "180s"]),
    shotNumber: z.number().int().positive(),
    editType: z.literal("shot"),
    patch: ShotPatchSchema
  }),
  z.object({
    versionType: z.enum(["90s", "180s"]),
    shotNumber: z.number().int().positive(),
    editType: z.literal("prompt"),
    patch: PromptPatchSchema
  }),
  z.object({
    versionType: z.enum(["90s", "180s"]),
    shotNumber: z.number().int().positive(),
    editType: z.literal("rights"),
    patch: RightsPatchSchema
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
