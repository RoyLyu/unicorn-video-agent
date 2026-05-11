import type {
  AgentRunDetail,
  AgentRunSummary
} from "@/db/repositories/agent-run-repository";
import type { ProjectDetail } from "@/db/repositories/project-repository";
import type { ReviewData } from "@/db/repositories/review-repository";
import { derivePublishCopy } from "@/db/repositories/publish-copy-repository";
import { investmentDisclaimer } from "@/lib/export/export-utils";
import {
  TITLE_ONLY_DEMO_SOURCE_NAME,
  TITLE_ONLY_WARNING
} from "@/lib/quick-demo/title-only-article";
import { formatRightsRiskDisplay } from "@/lib/rights/rights-display";
import { analyzeShotPromptAlignment } from "@/lib/production-studio/shot-prompt-alignment";
import type { ProductionPack, RightsRiskLevel } from "@/lib/schemas/production-pack";
import type { ProductionStudioState } from "@/db/repositories/production-studio-repository";

import type {
  ShowcaseAgentSummary,
  ShowcaseGenerationSummary,
  ShowcasePromptSummary,
  ShowcaseRiskSummary,
  ShowcaseScriptSection,
  ShowcaseViewModel
} from "./showcase-types";

type MapShowcaseInput = {
  project: ProjectDetail;
  productionPack: ProductionPack;
  reviewData: ReviewData | null;
  latestAgentRun: AgentRunSummary | null;
  latestAgentRunDetail?: AgentRunDetail | null;
  productionStudioState?: ProductionStudioState;
};

export function mapShowcaseViewModel({
  project,
  productionPack,
  reviewData,
  latestAgentRun,
  latestAgentRunDetail,
  productionStudioState
}: MapShowcaseInput): ShowcaseViewModel {
  const publishCopy =
    reviewData?.publishCopy ?? derivePublishCopy(productionPack);
  const isTitleOnlyDemo =
    project.sourceName === TITLE_ONLY_DEMO_SOURCE_NAME ||
    productionPack.articleInput.sourceName === TITLE_ONLY_DEMO_SOURCE_NAME;
  const generation = mapGenerationSummary(project, productionPack, latestAgentRun);
  const productionStudioSummary = analyzeShotPromptAlignment(
    productionPack,
    productionStudioState?.densityProfile
  );

  return {
    projectId: project.id,
    projectTitle: project.title,
    sourceName: project.sourceName,
    isDemo: project.isDemo,
    isTitleOnlyDemo,
    titleOnlyWarning: isTitleOnlyDemo ? TITLE_ONLY_WARNING : null,
    titleOnlyFactReportWarning: isTitleOnlyDemo
      ? "该项目由标题生成，不是事实报告。"
      : null,
    fallbackWarning: generation.fallbackUsed
      ? "当前使用 fallback 结果：该生产包为降级输出，演示时请说明真实 AI 生成未完全成功。"
      : null,
    fallbackBlockedWarning: generation.fallbackUsed
      ? "当前为 fallback/mock 结果，不可作为正式成品。"
      : null,
    blockProductionDownload: generation.fallbackUsed,
    regenerateUrl: "/articles/new",
    productionStudioGate: {
      densityProfile: productionStudioSummary.densityProfile,
      lockStatus: productionStudioState?.lock?.locked ? "locked" : "unlocked",
      latestGateStatus: productionStudioState?.latestGateRun?.status ?? "not_run",
      editedCount: productionStudioState?.edits.length ?? 0,
      shotCount90s: productionStudioSummary.shotCount90s,
      shotCount180s: productionStudioSummary.shotCount180s,
      promptCount: productionStudioSummary.promptCount90s + productionStudioSummary.promptCount180s,
      alignment:
        productionStudioSummary.unmatchedShots.length === 0 &&
        productionStudioSummary.unmatchedPrompts.length === 0
          ? "pass"
          : "fail",
      needsFix: productionStudioSummary.needsFix,
      fixReasons: productionStudioSummary.fixReasons,
      visualBibleScore: productionStudioSummary.scores.visualBibleScore,
      continuityScore: productionStudioSummary.scores.continuityScore,
      shotFunctionCoverageScore: productionStudioSummary.scores.shotFunctionCoverageScore,
      productionMethodScore: productionStudioSummary.scores.productionMethodScore,
      editingReadinessScore: productionStudioSummary.scores.editingReadinessScore,
      promptFieldCompletenessScore: productionStudioSummary.scores.promptFieldCompletenessScore,
      shotFunctionCounts: productionStudioSummary.shotFunctionCounts,
      productionMethodCounts: productionStudioSummary.productionMethodCounts
    },
    creativeDirection: {
      creativeConcept: productionPack.creativeDirection?.creativeConcept ?? "未提供",
      visualMetaphor: productionPack.creativeDirection?.visualMetaphor ?? "未提供",
      mainVisualMotif: productionPack.creativeDirection?.mainVisualMotif ?? "未提供"
    },
    visualBibleSummary: productionPack.visualStyleBible
      ? `${productionPack.visualStyleBible.imageType} / ${productionPack.visualStyleBible.aspectRatio} / ${productionPack.visualStyleBible.colorSystem.primaryColor}`
      : "未提供",
    continuityBibleSummary: productionPack.continuityBible
      ? `${productionPack.continuityBible.environmentBible} / ${productionPack.continuityBible.motionContinuity}`
      : "未提供",
    generation,
    agentSummary: mapAgentSummary(latestAgentRun, latestAgentRunDetail),
    coreSummary: productionPack.analysis.summary,
    coreViewpoints: productionPack.thesis.coreTheses,
    videoAngle: productionPack.thesis.videoAngle,
    audienceTakeaway: productionPack.thesis.audienceTakeaway,
    publishCopy: {
      coverTitle: publishCopy.coverTitle,
      titleCandidates: publishCopy.titleCandidates,
      publishText: publishCopy.publishText,
      tags: publishCopy.tags,
      riskNotice: publishCopy.riskNotice,
      isManual: publishCopy.isManual
    },
    scripts: {
      video90s: mapScriptSection(productionPack.scripts.video90s),
      video180s: mapScriptSection(productionPack.scripts.video180s)
    },
    storyboard: productionPack.storyboard.shots.slice(0, 8).map((shot) => ({
      id: shot.id,
      timeRange: shot.timeRange,
      scene: shot.scene,
      narration: shot.narration,
      visual: shot.visual,
      assetType: shot.assetType,
      rightsLevel: shot.rightsLevel
    })),
    promptSummary: mapPromptSummary(productionPack),
    riskSummary: mapRiskSummary(productionPack),
    disclaimer: investmentDisclaimer,
    links: {
      downloadProductionPack: `/api/projects/${project.id}/exports/production-pack.md`,
      productionStudio: `/projects/${project.id}/production-studio`,
      review: `/projects/${project.id}/review`,
      export: `/projects/${project.id}/export`,
      agentRuns: `/projects/${project.id}/agent-runs`
    }
  };
}

function mapGenerationSummary(
  project: ProjectDetail,
  productionPack: ProductionPack,
  latestAgentRun: AgentRunSummary | null
): ShowcaseGenerationSummary {
  const fallbackUsed =
    latestAgentRun?.status === "completed_with_fallback" ||
    project.status.includes("fallback") ||
    productionPack.mode === "mock" ||
    project.status.includes("mock");

  return {
    generationModeLabel: productionPack.mode === "ai" ? "AI Agent" : "Mock",
    productionPackMode: productionPack.mode,
    fallbackUsed,
    projectStatus: project.status
  };
}

function mapAgentSummary(
  latestAgentRun: AgentRunSummary | null,
  latestAgentRunDetail: AgentRunDetail | null | undefined
): ShowcaseAgentSummary {
  const steps = latestAgentRunDetail?.steps ?? [];

  return {
    runId: latestAgentRun?.id ?? null,
    status: latestAgentRun?.status ?? "not_started",
    stepCount: steps.length,
    completedStepCount: steps.filter((step) => step.status === "completed").length,
    fallbackStepCount: steps.filter(
      (step) => step.status === "completed_with_fallback"
    ).length,
    failedStepCount: steps.filter((step) => step.status === "failed").length,
    errorMessage: latestAgentRun?.errorMessage ?? null
  };
}

function mapScriptSection(
  script: ProductionPack["scripts"]["video90s"] | ProductionPack["scripts"]["video180s"]
): ShowcaseScriptSection {
  return {
    duration: script.duration,
    title: script.title,
    hook: script.hook,
    closing: script.closing,
    lines: script.lines.map((line) => ({
      timeRange: line.timeRange,
      narration: line.narration,
      visual: line.visual,
      onScreenText: line.onScreenText
    }))
  };
}

function mapPromptSummary(productionPack: ProductionPack): ShowcasePromptSummary {
  return {
    imagePromptCount: productionPack.assetPrompts.imagePrompts.length,
    videoPromptCount: productionPack.assetPrompts.videoPrompts.length,
    searchLeadCount: productionPack.assetPrompts.searchLeads.length,
    imagePrompts: productionPack.assetPrompts.imagePrompts
      .slice(0, 3)
      .map((prompt) => prompt.prompt),
    videoPrompts: productionPack.assetPrompts.videoPrompts
      .slice(0, 3)
      .map((prompt) => prompt.prompt),
    searchLeads: productionPack.assetPrompts.searchLeads
      .slice(0, 3)
      .map((lead) => `${lead.platform}：${lead.query}`)
  };
}

function mapRiskSummary(productionPack: ProductionPack): ShowcaseRiskSummary {
  const counts: Record<RightsRiskLevel, number> = {
    green: 0,
    yellow: 0,
    red: 0,
    placeholder: 0
  };

  for (const item of productionPack.rightsChecks) {
    counts[item.level] += 1;
  }

  return {
    counts,
    items: productionPack.rightsChecks.slice(0, 6).map(formatRightsRiskDisplay)
  };
}
