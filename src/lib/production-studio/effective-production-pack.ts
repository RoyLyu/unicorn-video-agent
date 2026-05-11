import {
  ProductionPackSchema,
  type ProductionPack
} from "@/lib/schemas/production-pack";
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
  const original = ProductionPackSchema.parse(input.productionPack);
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
  const promptByShot = new Map(
    getPromptBundles(original).map((prompt) => [prompt.shotId, { ...prompt }])
  );
  const shots = original.storyboard.shots.map((shot) => {
    const keyPrefix = `${shot.versionType ?? "90s"}:${shot.shotNumber ?? 0}`;
    const shotEdit = editByKey.get(`${keyPrefix}:shot`);
    const rightsEdit = editByKey.get(`${keyPrefix}:rights`);

    return {
      ...shot,
      ...(shotEdit?.editType === "shot" ? shotEdit.patch : {}),
      ...(rightsEdit?.editType === "rights" ? rightsEdit.patch : {})
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
      ...(promptEdit?.editType === "prompt" ? promptEdit.patch : {})
    };
  });
  const effective = ProductionPackSchema.parse({
    ...original,
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
