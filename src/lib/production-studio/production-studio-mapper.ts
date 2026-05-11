import type { ProductionPack, RightsRiskLevel } from "@/lib/schemas/production-pack";

import {
  analyzeShotPromptAlignment,
  getPromptBundles,
  type ProductionStudioSummary
} from "./shot-prompt-alignment";
import { productionStudioGateLabel } from "./production-studio-score";

export type ProductionStudioRow = {
  shotId: string;
  versionType: string;
  shotNumber: number;
  beat: string;
  duration: string;
  voiceover: string;
  overlayText: string;
  visual: string;
  camera: string;
  composition: string;
  motion: string;
  visualType: string;
  chartNeed: string;
  copyrightRisk: RightsRiskLevel;
  replacementPlan: string;
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
};

export type ProductionStudioViewModel = {
  projectId: string;
  projectTitle: string;
  summary: ProductionStudioSummary;
  gateLabel: string;
  rows: ProductionStudioRow[];
  links: {
    showcase: string;
    review: string;
    export: string;
    agentRuns: string;
  };
};

export function mapProductionStudioViewModel(input: {
  projectId: string;
  projectTitle: string;
  productionPack: ProductionPack;
}): ProductionStudioViewModel {
  const summary = analyzeShotPromptAlignment(input.productionPack);
  const promptByShot = new Map(
    getPromptBundles(input.productionPack).map((prompt) => [prompt.shotId, prompt])
  );

  return {
    projectId: input.projectId,
    projectTitle: input.projectTitle,
    summary,
    gateLabel: productionStudioGateLabel(summary),
    rows: input.productionPack.storyboard.shots.map((shot) => {
      const prompt = promptByShot.get(shot.id);

      return {
        shotId: shot.id,
        versionType: shot.versionType ?? "90s",
        shotNumber: shot.shotNumber ?? 0,
        beat: shot.beat ?? shot.scene,
        duration: shot.duration ?? shot.timeRange,
        voiceover: shot.voiceover ?? shot.narration,
        overlayText: shot.overlayText ?? shot.scene,
        visual: shot.visual,
        camera: shot.camera ?? "",
        composition: shot.composition ?? "",
        motion: shot.motion ?? "",
        visualType: shot.visualType ?? shot.assetType,
        chartNeed: shot.chartNeed ?? "",
        copyrightRisk: shot.copyrightRisk ?? shot.rightsLevel,
        replacementPlan: shot.replacementPlan ?? "",
        imagePrompt: prompt?.imagePrompt ?? "",
        videoPrompt: prompt?.videoPrompt ?? "",
        negativePrompt: prompt?.negativePrompt ?? ""
      };
    }),
    links: {
      showcase: `/projects/${input.projectId}/showcase`,
      review: `/projects/${input.projectId}/review`,
      export: `/projects/${input.projectId}/export`,
      agentRuns: `/projects/${input.projectId}/agent-runs`
    }
  };
}
