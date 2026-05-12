import {
  ProductionPackSchema,
  type ProductionPack
} from "@/lib/schemas/production-pack";
import { normalizeProductionPack } from "@/lib/ai-agents/normalize-production-pack";
import type { ProductionStudioEdit } from "@/db/repositories/production-studio-repository";
import {
  analyzeShotPromptAlignment,
  getPromptBundles,
  type ProductionStudioSummary
} from "./shot-prompt-alignment";
import type { ShotDensityProfile } from "./density-profile";

export type EffectiveProductionPackResult = {
  original: ProductionPack;
  effective: ProductionPack;
  summary: ProductionStudioSummary;
  editedCount: number;
};

export function resolveEffectiveProductionPack(input: {
  productionPack: ProductionPack;
  edits?: ProductionStudioEdit[];
  densityProfile?: ShotDensityProfile;
}): EffectiveProductionPackResult {
  const original = normalizeProductionPack(
    ProductionPackSchema.parse(input.productionPack),
    input.densityProfile
  );
  const edits = input.edits ?? [];

  if (edits.length === 0) {
    const effective = original;

    return {
      original,
      effective,
      summary: analyzeShotPromptAlignment(effective, input.densityProfile),
      editedCount: 0
    };
  }

  const editByKey = new Map(
    edits.map((edit) => [
      `${edit.versionType}:${edit.shotNumber}:${edit.editType}`,
      edit
    ])
  );
  const creativeDirectionEdit = edits.find((edit) => edit.editType === "creative_direction");
  const visualBibleEdit = edits.find((edit) => edit.editType === "visual_bible");
  const continuityBibleEdit = edits.find((edit) => edit.editType === "continuity_bible");
  const promptByShot = new Map(
    getPromptBundles(original).map((prompt) => [prompt.shotId, { ...prompt }])
  );
  const shots = original.storyboard.shots.map((shot) => {
    const keyPrefix = `${shot.versionType ?? "90s"}:${shot.shotNumber ?? 0}`;
    const shotEdit = editByKey.get(`${keyPrefix}:shot`);
    const rightsEdit = editByKey.get(`${keyPrefix}:rights`);
    const methodEdit = editByKey.get(`${keyPrefix}:method`);
    const editingEdit = editByKey.get(`${keyPrefix}:editing`);

    return {
      ...shot,
      ...(shotEdit?.editType === "shot" ? shotEdit.patch : {}),
      ...(rightsEdit?.editType === "rights" ? rightsEdit.patch : {}),
      ...(methodEdit?.editType === "method" ? methodEdit.patch : {}),
      editing: editingEdit?.editType === "editing"
        ? {
            ...shot.editing,
            ...editingEdit.patch
          }
        : shot.editing
    };
  });
  const promptBundles = shots.map((shot) => {
    const keyPrefix = `${shot.versionType ?? "90s"}:${shot.shotNumber ?? 0}`;
    const promptEdit = editByKey.get(`${keyPrefix}:prompt`);
    const originalPrompt = promptByShot.get(shot.id);

    return {
      versionType: shot.versionType ?? "90s" as const,
      shotNumber: shot.shotNumber ?? 0,
      shotId: shot.id,
      imagePrompt: originalPrompt?.imagePrompt ?? shot.visual,
      videoPrompt: originalPrompt?.videoPrompt ?? shot.visual,
      negativePrompt: originalPrompt?.negativePrompt ?? "",
      styleLock: originalPrompt?.styleLock ?? "legacy",
      aspectRatio: originalPrompt?.aspectRatio ?? "9:16",
      usageWarning: originalPrompt?.usageWarning ?? "",
      shotCode: originalPrompt?.shotCode ?? shot.shotCode ?? shot.id,
      duration: originalPrompt?.duration ?? shot.duration ?? shot.timeRange,
      subject: originalPrompt?.subject ?? shot.subject ?? shot.scene,
      environment: originalPrompt?.environment ?? shot.environment ?? shot.scene,
      camera: originalPrompt?.camera ?? shot.camera ?? "",
      lighting: originalPrompt?.lighting ?? shot.lighting ?? "",
      style: originalPrompt?.style ?? shot.style ?? "",
      negativeConstraints: originalPrompt?.negativeConstraints ?? originalPrompt?.negativePrompt ?? "",
      forbiddenElements: originalPrompt?.forbiddenElements ?? original.visualStyleBible?.forbiddenElements ?? [],
      replacementPlan: originalPrompt?.replacementPlan ?? shot.replacementPlan ?? "",
      ...(promptEdit?.editType === "prompt" ? promptEdit.patch : {})
    };
  });
  const effective = ProductionPackSchema.parse({
    ...original,
    creativeDirection: creativeDirectionEdit?.editType === "creative_direction"
      ? {
          ...original.creativeDirection,
          ...creativeDirectionEdit.patch.creativeDirection
        }
      : original.creativeDirection,
    visualStyleBible: visualBibleEdit?.editType === "visual_bible"
      ? {
          ...original.visualStyleBible,
          ...visualBibleEdit.patch.visualStyleBible,
          colorSystem: {
            ...original.visualStyleBible?.colorSystem,
            ...visualBibleEdit.patch.visualStyleBible?.colorSystem
          },
          lightingSystem: {
            ...original.visualStyleBible?.lightingSystem,
            ...visualBibleEdit.patch.visualStyleBible?.lightingSystem
          },
          materialSystem: {
            ...original.visualStyleBible?.materialSystem,
            ...visualBibleEdit.patch.visualStyleBible?.materialSystem
          },
          cameraTexture: {
            ...original.visualStyleBible?.cameraTexture,
            ...visualBibleEdit.patch.visualStyleBible?.cameraTexture
          },
          typographyStyle: {
            ...original.visualStyleBible?.typographyStyle,
            ...visualBibleEdit.patch.visualStyleBible?.typographyStyle
          },
          chartStyle: {
            ...original.visualStyleBible?.chartStyle,
            ...visualBibleEdit.patch.visualStyleBible?.chartStyle
          }
        }
      : original.visualStyleBible,
    continuityBible: continuityBibleEdit?.editType === "continuity_bible"
      ? {
          ...original.continuityBible,
          ...continuityBibleEdit.patch.continuityBible
        }
      : original.continuityBible,
    storyboard: {
      shots
    },
    assetPrompts: {
      ...original.assetPrompts,
      promptBundles,
      imagePrompts: original.assetPrompts.imagePrompts.map((prompt) => {
        const bundle = promptBundles.find((item) => item.shotId === prompt.sceneRef);

        return bundle
          ? {
              ...prompt,
              prompt: bundle.imagePrompt,
              negativePrompt: bundle.negativePrompt
            }
          : prompt;
      }),
      videoPrompts: original.assetPrompts.videoPrompts.map((prompt) => {
        const bundle = promptBundles.find((item) => item.shotId === prompt.sceneRef);

        return bundle
          ? {
              ...prompt,
              prompt: bundle.videoPrompt,
              negativePrompt: bundle.negativePrompt
            }
          : prompt;
      })
    },
    rightsChecks: original.rightsChecks.map((risk) => {
      if (risk.level !== "red" || risk.replacementPlan) {
        return risk;
      }

      const firstRightsEdit = edits.find((edit) => edit.editType === "rights");

      return firstRightsEdit?.editType === "rights" && firstRightsEdit.patch.replacementPlan
        ? {
            ...risk,
            replacementPlan: firstRightsEdit.patch.replacementPlan,
            action: `${risk.action} 建议替代：${firstRightsEdit.patch.replacementPlan}`
          }
        : risk;
    })
  });

  return {
    original,
    effective,
    summary: analyzeShotPromptAlignment(effective, input.densityProfile),
    editedCount: edits.length
  };
}
