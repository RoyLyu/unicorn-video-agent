import type {
  AgentRunStatus,
  AgentStepStatus
} from "@/lib/agents/agent-run-types";
import type { RightsRiskLevel } from "@/lib/schemas/production-pack";

export type ShowcaseGenerationSummary = {
  generationModeLabel: "AI Agent" | "Mock";
  productionPackMode: "ai" | "mock";
  fallbackUsed: boolean;
  projectStatus: string;
};

export type ShowcaseAgentSummary = {
  runId: string | null;
  status: AgentRunStatus | "not_started";
  stepCount: number;
  completedStepCount: number;
  fallbackStepCount: number;
  failedStepCount: number;
  errorMessage: string | null;
};

export type ShowcaseScriptLine = {
  timeRange: string;
  narration: string;
  visual: string;
  onScreenText: string;
};

export type ShowcaseScriptSection = {
  duration: 90 | 180;
  title: string;
  hook: string;
  closing: string;
  lines: ShowcaseScriptLine[];
};

export type ShowcaseStoryboardItem = {
  id: string;
  timeRange: string;
  scene: string;
  narration: string;
  visual: string;
  assetType: string;
  rightsLevel: RightsRiskLevel;
};

export type ShowcasePromptSummary = {
  imagePromptCount: number;
  videoPromptCount: number;
  searchLeadCount: number;
  imagePrompts: string[];
  videoPrompts: string[];
  searchLeads: string[];
};

export type ShowcaseProductionStudioGate = {
  densityProfile: string;
  lockStatus: string;
  latestGateStatus: string;
  editedCount: number;
  shotCount90s: number;
  shotCount180s: number;
  promptCount: number;
  alignment: "pass" | "fail";
  needsFix: boolean;
  fixReasons: string[];
};

export type ShowcaseRiskSummary = {
  counts: Record<RightsRiskLevel, number>;
  items: Array<{
    item: string;
    level: RightsRiskLevel;
    reason: string;
    action: string;
    displayLabel: string;
    displayText: string;
    alternativeText: string;
  }>;
};

export type ShowcasePublishCopy = {
  coverTitle: string;
  titleCandidates: string[];
  publishText: string;
  tags: string[];
  riskNotice: string;
  isManual: boolean;
};

export type ShowcaseLinks = {
  downloadProductionPack: string;
  productionStudio: string;
  review: string;
  export: string;
  agentRuns: string;
};

export type ShowcaseViewModel = {
  projectId: string;
  projectTitle: string;
  sourceName: string;
  isDemo: boolean;
  isTitleOnlyDemo: boolean;
  titleOnlyWarning: string | null;
  titleOnlyFactReportWarning: string | null;
  fallbackWarning: string | null;
  fallbackBlockedWarning: string | null;
  blockProductionDownload: boolean;
  regenerateUrl: string;
  productionStudioGate: ShowcaseProductionStudioGate;
  generation: ShowcaseGenerationSummary;
  agentSummary: ShowcaseAgentSummary;
  coreSummary: string;
  coreViewpoints: string[];
  videoAngle: string;
  audienceTakeaway: string;
  publishCopy: ShowcasePublishCopy;
  scripts: {
    video90s: ShowcaseScriptSection;
    video180s: ShowcaseScriptSection;
  };
  storyboard: ShowcaseStoryboardItem[];
  promptSummary: ShowcasePromptSummary;
  riskSummary: ShowcaseRiskSummary;
  disclaimer: string;
  links: ShowcaseLinks;
};

export type ShowcaseStepStatusCount = Record<AgentStepStatus, number>;
