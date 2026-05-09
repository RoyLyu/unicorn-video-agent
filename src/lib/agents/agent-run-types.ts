export type AgentSlug =
  | "article-analyst"
  | "thesis-agent"
  | "script-writer"
  | "storyboard-agent"
  | "prompt-generator"
  | "asset-finder"
  | "qa-agent";

export type AgentMode = "mock" | "real_ai_pending";
export type AgentRunStatus =
  | "running"
  | "completed"
  | "completed_with_fallback"
  | "failed";
export type AgentStepStatus = "completed" | "completed_with_fallback" | "failed";

export type AgentDefinition = {
  slug: AgentSlug;
  name: string;
  role: string;
  description: string;
  requiredContext: string[];
  inputSchemaSummary: string;
  outputSchemaSummary: string;
  currentMode: "mock";
  futureMode: "real_ai_pending";
  qaChecklist: string[];
};

export type AgentQaSummary = {
  fact: {
    hasCompany: boolean;
    hasEvent: boolean;
    hasIndustry: boolean;
  };
  script: {
    has90sScript: boolean;
    has180sScript: boolean;
  };
  copyright: {
    hasNoRedRightsRisk: boolean;
    redRightsRiskCount: number;
  };
  export: {
    hasRequiredManifestFiles: boolean;
    fileCount: number;
  };
  publish: {
    includesInvestmentDisclaimer: boolean;
  };
};
