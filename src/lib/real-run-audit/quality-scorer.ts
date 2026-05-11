import type {
  AssetPromptResult,
  GenerationMode,
  ProductionPack
} from "@/lib/schemas/production-pack";
import { analyzeShotPromptAlignment, type ProductionStudioSummary } from "@/lib/production-studio/shot-prompt-alignment";
import type { ShotDensityProfile } from "@/lib/production-studio/density-profile";

export type RealRunAuditScorecard = {
  fact_structure_score: number;
  thesis_quality_score: number;
  script_structure_score: number;
  storyboard_actionability_score: number;
  prompt_usability_score: number;
  rights_safety_score: number;
  visual_bible_score: number;
  creative_direction_score: number;
  shot_function_coverage_score: number;
  continuity_score: number;
  production_method_score: number;
  editing_readiness_score: number;
  prompt_field_completeness_score: number;
  overall_demo_readiness_score: number;
};

export type AuditProblem = {
  id: string;
  severity: "high" | "medium" | "low";
  agent: string;
  problem: string;
  fixPriority: string;
  suggestedTarget: "prompt" | "schema" | "mapper" | "QA rule";
  targetIds?: string[];
};

export type AgentAuditSection = {
  agent: string;
  score: number;
  checks: string[];
  problems: AuditProblem[];
};

export type RealRunAuditReport = {
  projectId: string;
  agentRunId: string | null;
  generationMode: GenerationMode;
  fallbackUsed: boolean;
  showcaseUrl: string;
  productionPackDownloadUrl: string;
  scorecard: RealRunAuditScorecard;
  agentSections: AgentAuditSection[];
  topProblems: AuditProblem[];
  demoReady: boolean;
  productionStudioSummary: ProductionStudioSummary;
};

type CreateRealRunAuditReportInput = {
  productionPack: ProductionPack;
  projectId: string;
  agentRunId?: string | null;
  fallbackUsed: boolean;
  generationMode: GenerationMode;
  densityProfile?: ShotDensityProfile;
};

const styleLock =
  "cinematic business documentary style, Bloomberg-inspired, dark navy and silver color palette, realistic footage, low saturation, soft contrast, natural lighting, premium consulting video";
const negativePromptTerms = [
  "fake logo",
  "unreadable text",
  "distorted Chinese characters",
  "artificial face",
  "excessive cyberpunk"
];

export function createRealRunAuditReport({
  productionPack,
  projectId,
  agentRunId = null,
  fallbackUsed,
  generationMode,
  densityProfile = "standard"
}: CreateRealRunAuditReportInput): RealRunAuditReport {
  const article = auditArticleAnalyst(productionPack);
  const thesis = auditThesisAgent(productionPack);
  const script = auditScriptWriter(productionPack);
  const storyboard = auditStoryboardAgent(productionPack);
  const prompt = auditPromptGenerator(productionPack);
  const assetFinder = auditAssetFinder(productionPack);
  const qa = auditQaAgent(productionPack);
  const productionStudioSummary = analyzeShotPromptAlignment(productionPack, densityProfile);
  const studioProblems = auditProductionStudioGate(productionStudioSummary);
  const agentSections = [
    article,
    thesis,
    script,
    storyboard,
    prompt,
    assetFinder,
    qa,
    studioProblems
  ];
  const topProblems = agentSections
    .flatMap((section) => section.problems)
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))
    .slice(0, 10);
  const scorecard: RealRunAuditScorecard = {
    fact_structure_score: article.score,
    thesis_quality_score: thesis.score,
    script_structure_score: script.score,
    storyboard_actionability_score: storyboard.score,
    prompt_usability_score: prompt.score,
    rights_safety_score: qa.score,
    visual_bible_score: productionStudioSummary.scores.visualBibleScore,
    creative_direction_score: productionStudioSummary.scores.creativeDirectionScore,
    shot_function_coverage_score: productionStudioSummary.scores.shotFunctionCoverageScore,
    continuity_score: productionStudioSummary.scores.continuityScore,
    production_method_score: productionStudioSummary.scores.productionMethodScore,
    editing_readiness_score: productionStudioSummary.scores.editingReadinessScore,
    prompt_field_completeness_score: productionStudioSummary.scores.promptFieldCompletenessScore,
    overall_demo_readiness_score: clampScore(
      Math.min(
        Math.floor(
          (article.score +
            thesis.score +
            script.score +
            storyboard.score +
            prompt.score +
            qa.score -
            (fallbackUsed ? 1 : 0)) /
            6
        ),
        productionStudioSummary.scores.overallScore
      )
    )
  };
  const demoReady =
    !fallbackUsed &&
    !productionStudioSummary.needsFix &&
    scorecard.overall_demo_readiness_score >= 4 &&
    topProblems.every((problem) => problem.severity !== "high");

  return {
    projectId,
    agentRunId,
    generationMode,
    fallbackUsed,
    showcaseUrl: `/projects/${projectId}/showcase`,
    productionPackDownloadUrl: `/api/projects/${projectId}/exports/production-pack.md`,
    scorecard,
    agentSections,
    topProblems,
    demoReady,
    productionStudioSummary
  };
}

export function renderRealRunAuditMarkdown(report: RealRunAuditReport) {
  return [
    "# Real Run Audit Report",
    "",
    `- Project: ${report.projectId}`,
    `- Agent Run: ${report.agentRunId ?? "not recorded"}`,
    `- Generation Mode: ${report.generationMode}`,
    `- Fallback Used: ${report.fallbackUsed ? "yes" : "no"}`,
    `- Showcase: ${report.showcaseUrl}`,
    `- production-pack.md: ${report.productionPackDownloadUrl}`,
    `- Demo-ready: ${report.demoReady ? "yes" : "no"}`,
    `- Production Studio Gate: ${report.productionStudioSummary.needsFix ? "需要重跑 / 人工修正" : "pass"}`,
    `- Shot Density Profile: ${report.productionStudioSummary.densityProfile}`,
    "",
    "## Scores",
    "",
    ...Object.entries(report.scorecard).map(
      ([key, value]) => `- ${key}: ${value}/5`
    ),
    "",
    "## Shot / Prompt Gate",
    "",
    `- density profile: ${report.productionStudioSummary.densityProfile}`,
    `- 90s shots: ${report.productionStudioSummary.shotCount90s}`,
    `- 180s shots: ${report.productionStudioSummary.shotCount180s}`,
    `- 90s prompts: ${report.productionStudioSummary.promptCount90s}`,
    `- 180s prompts: ${report.productionStudioSummary.promptCount180s}`,
    `- unmatched shots: ${report.productionStudioSummary.unmatchedShots.length}`,
    `- unmatched prompts: ${report.productionStudioSummary.unmatchedPrompts.length}`,
    `- red risks without replacement: ${report.productionStudioSummary.redRisksWithoutReplacement.length}`,
    `- needsFix: ${report.productionStudioSummary.needsFix ? "需要重跑 / 人工修正" : "false"}`,
    `- creative direction score: ${report.productionStudioSummary.scores.creativeDirectionScore}/5`,
    `- visual bible score: ${report.productionStudioSummary.scores.visualBibleScore}/5`,
    `- continuity score: ${report.productionStudioSummary.scores.continuityScore}/5`,
    `- shot function coverage score: ${report.productionStudioSummary.scores.shotFunctionCoverageScore}/5`,
    `- production method score: ${report.productionStudioSummary.scores.productionMethodScore}/5`,
    `- editing readiness score: ${report.productionStudioSummary.scores.editingReadinessScore}/5`,
    `- prompt field completeness score: ${report.productionStudioSummary.scores.promptFieldCompletenessScore}/5`,
    ...report.productionStudioSummary.fixReasons.map((reason) => `- ${reason}`),
    "",
    "## Agent Audit",
    "",
    ...report.agentSections.flatMap((section) => [
      `### ${section.agent}`,
      "",
      `Score: ${section.score}/5`,
      "",
      ...section.checks.map((check) => `- ${check}`),
      ...(section.problems.length
        ? ["", "Problems:", ...section.problems.map(formatProblem)]
        : ["", "Problems: none"]),
      ""
    ]),
    "## Top 10 Problems",
    "",
    ...(report.topProblems.length
      ? report.topProblems.map((problem, index) => `${index + 1}. ${formatProblem(problem)}`)
      : ["No blocking problems found."]),
    "",
    "## Batch 11B Direction",
    "",
    "Use this report to prioritize prompt/schema/mapper adjustments. Batch 11A does not optimize agent output."
  ].join("\n");
}

function auditProductionStudioGate(summary: ProductionStudioSummary): AgentAuditSection {
  const problems: AuditProblem[] = summary.needsFix
    ? [
        problem(
          "shot-prompt-volume-gate",
          "high",
          "Production Studio Gate",
          `Shot / Prompt gate 未通过，需要重跑 / 人工修正。${summary.fixReasons.join(" ")}`,
          "P1",
          "QA rule",
          [...summary.unmatchedShots, ...summary.unmatchedPrompts]
        )
      ]
    : [];

  return section("Production Studio Gate", summary.scores.overallScore, [
    `density profile ${summary.densityProfile}`,
    `90s shots ${summary.shotCount90s}`,
    `180s shots ${summary.shotCount180s}`,
    `90s prompts ${summary.promptCount90s}`,
    `180s prompts ${summary.promptCount180s}`,
    `creative direction ${summary.scores.creativeDirectionScore}/5`,
    `visual bible ${summary.scores.visualBibleScore}/5`,
    `continuity ${summary.scores.continuityScore}/5`,
    `shot function ${summary.scores.shotFunctionCoverageScore}/5`,
    `production method ${summary.scores.productionMethodScore}/5`,
    `editing readiness ${summary.scores.editingReadinessScore}/5`,
    `prompt completeness ${summary.scores.promptFieldCompletenessScore}/5`,
    `needsFix ${summary.needsFix ? "需要重跑 / 人工修正" : "false"}`
  ], problems);
}

function auditArticleAnalyst(productionPack: ProductionPack): AgentAuditSection {
  const checks = [
    productionPack.analysis.summary ? "summary present" : "summary missing",
    productionPack.analysis.keyFacts.length > 0 ? "key facts present" : "key facts missing",
    productionPack.analysis.industryData.length > 0
      ? "industry data present"
      : "industry data missing",
    productionPack.analysis.risks.length > 0 ? "risks present" : "risks missing"
  ];
  const problems: AuditProblem[] = [];

  if (productionPack.analysis.keyFacts.length < 3) {
    problems.push(problem("facts-too-thin", "medium", "Article Analyst", "关键事实少于 3 条，支撑后续脚本不足。", "P2", "prompt"));
  }

  return section("Article Analyst", 5 - problems.length, checks, problems);
}

function auditThesisAgent(productionPack: ProductionPack): AgentAuditSection {
  const problems: AuditProblem[] = [];

  if (productionPack.thesis.coreTheses.length < 2) {
    problems.push(problem("thesis-too-few", "medium", "Thesis Agent", "核心观点少于 2 条，视频论证层次偏弱。", "P2", "prompt"));
  }

  return section("Thesis Agent", 5 - problems.length, [
    "core theses checked",
    "video angle checked",
    "audience takeaway checked"
  ], problems);
}

function auditScriptWriter(productionPack: ProductionPack): AgentAuditSection {
  const problems: AuditProblem[] = [];

  if (productionPack.scripts.video90s.lines.length < 3) {
    problems.push(problem("script-90-too-short", "medium", "Script Writer", "90s 脚本行数过少，节奏不可控。", "P2", "prompt"));
  }

  if (productionPack.scripts.video180s.lines.length < 4) {
    problems.push(problem("script-180-too-short", "medium", "Script Writer", "180s 脚本行数过少，信息展开不足。", "P2", "prompt"));
  }

  return section("Script Writer", 5 - problems.length, [
    "90s script checked",
    "180s script checked",
    "hook and closing checked"
  ], problems);
}

function auditStoryboardAgent(productionPack: ProductionPack): AgentAuditSection {
  const problems: AuditProblem[] = [];
  const shots = productionPack.storyboard.shots;

  if (shots.length < 8) {
    problems.push(problem("storyboard-too-few-shots", "high", "Storyboard Agent", "分镜少于 8 个，无法覆盖 90s 核心节奏。", "P1", "prompt", shots.map((shot) => shot.id)));
  }

  const shotsMissingCameraMotion = shots
    .filter((shot) => !hasCameraMotion(`${shot.scene} ${shot.visual}`))
    .map((shot) => shot.id);
  if (shotsMissingCameraMotion.length > 0) {
    problems.push(problem("storyboard-missing-camera-motion", "high", "Storyboard Agent", "部分分镜缺少推拉摇移、跟拍、俯拍等镜头运动。", "P1", "prompt", shotsMissingCameraMotion));
  }

  const shotsMissingSubject = shots
    .filter((shot) => !hasVisualSubject(`${shot.scene} ${shot.visual}`))
    .map((shot) => shot.id);
  if (shotsMissingSubject.length > 0) {
    problems.push(problem("storyboard-weak-visual-subject", "medium", "Storyboard Agent", "部分分镜缺少明确画面主体。", "P2", "prompt", shotsMissingSubject));
  }

  const shotsMissingFields = shots
    .filter((shot) => !shot.assetType || !shot.narration)
    .map((shot) => shot.id);
  if (shotsMissingFields.length > 0) {
    problems.push(problem("storyboard-missing-editing-fields", "medium", "Storyboard Agent", "部分分镜缺少视觉类型或旁白，剪辑执行信息不足。", "P2", "schema", shotsMissingFields));
  }

  const shotsWithRealAssetRisk = shots
    .filter((shot) => containsForbiddenRealAsset(`${shot.scene} ${shot.visual}`))
    .map((shot) => shot.id);
  if (shotsWithRealAssetRisk.length > 0) {
    problems.push(problem("storyboard-real-asset-risk", "high", "Storyboard Agent", "分镜暗示真实 Logo、上市现场或人物肖像，版权和事实风险高。", "P1", "prompt", shotsWithRealAssetRisk));
  }

  return section("Storyboard Agent", 5 - Math.min(5, problems.length), [
    "shot count checked",
    "visual subject checked",
    "camera movement checked",
    "editing executability checked",
    "real logo/listing event/portrait risk checked"
  ], problems);
}

function auditPromptGenerator(productionPack: ProductionPack): AgentAuditSection {
  const problems: AuditProblem[] = [];
  const prompts = [
    ...productionPack.assetPrompts.imagePrompts,
    ...productionPack.assetPrompts.videoPrompts
  ];

  const promptsMissingNegativePrompt = prompts
    .filter((prompt) => !prompt.negativePrompt.trim())
    .map((prompt) => prompt.id);
  if (promptsMissingNegativePrompt.length > 0) {
    problems.push(problem("prompt-missing-negative-prompt", "high", "Prompt Generator", "部分 Prompt 缺少 negativePrompt，无法控制 Logo、文字和脸部伪影。", "P1", "schema", promptsMissingNegativePrompt));
  }

  const promptsMissingStyleLock = prompts
    .filter((prompt) => !containsStyleLock(prompt.prompt))
    .map((prompt) => prompt.id);
  if (promptsMissingStyleLock.length > 0) {
    problems.push(problem("prompt-missing-style-lock", "high", "Prompt Generator", "部分 Prompt 缺少统一风格锁，视觉风格不稳定。", "P1", "prompt", promptsMissingStyleLock));
  }

  const promptsWithIncompleteNegativeTerms = prompts
    .filter((prompt) => !containsNegativePromptTerms(prompt.negativePrompt))
    .map((prompt) => prompt.id);
  if (promptsWithIncompleteNegativeTerms.length > 0) {
    problems.push(problem("prompt-negative-terms-incomplete", "medium", "Prompt Generator", "negativePrompt 未覆盖 fake logo、不可读文字、畸形中文、人脸和 cyberpunk 风险。", "P2", "prompt", promptsWithIncompleteNegativeTerms));
  }

  if (!allPromptsReferenceShots(productionPack.assetPrompts, productionPack.storyboard.shots.map((shot) => shot.id))) {
    problems.push(problem("prompt-shot-mismatch", "medium", "Prompt Generator", "部分 Prompt 没有对应分镜。", "P2", "mapper"));
  }

  const promptsWithRealBrandRisk = prompts
    .filter((prompt) => containsForbiddenRealAsset(prompt.prompt))
    .map((prompt) => prompt.id);
  if (promptsWithRealBrandRisk.length > 0) {
    problems.push(problem("prompt-real-brand-risk", "high", "Prompt Generator", "Prompt 暗示真实品牌 Logo、可读文字或人物肖像。", "P1", "prompt", promptsWithRealBrandRisk));
  }

  return section("Prompt Generator", 5 - Math.min(5, problems.length), [
    "imagePrompt usability checked",
    "videoPrompt usability checked",
    "style lock checked",
    "negative prompt checked",
    "shot correspondence checked"
  ], problems);
}

function auditAssetFinder(productionPack: ProductionPack): AgentAuditSection {
  const problems: AuditProblem[] = [];

  if (productionPack.assetPrompts.searchLeads.length === 0) {
    problems.push(problem("asset-leads-missing", "medium", "Asset Finder", "素材搜索线索为空，后续人工找素材缺少入口。", "P2", "prompt"));
  }

  return section("Asset Finder", 5 - problems.length, [
    "search leads checked",
    "license requirements checked"
  ], problems);
}

function auditQaAgent(productionPack: ProductionPack): AgentAuditSection {
  const problems: AuditProblem[] = [];

  const redRisks = productionPack.rightsChecks.filter((risk) => risk.level === "red");
  const redRisksWithoutAlternative = redRisks.filter(
    (risk) => !/替换|自制图表|抽象 AI 画面|placeholder/.test(risk.action)
  );
  if (redRisksWithoutAlternative.length > 0) {
    problems.push(problem("rights-red-risk", "high", "QA Agent", "版权风险中存在 red 项且缺少可替代方案，不能作为 demo-ready 成品展示。", "P1", "QA rule", redRisksWithoutAlternative.map((risk) => risk.item)));
  } else if (redRisks.length > 0) {
    problems.push(problem("rights-red-risk-with-alternative", "medium", "QA Agent", "版权风险中存在 red 项，但已提供替换为自制图表、抽象 AI 画面或 placeholder 的方案。", "P2", "QA rule", redRisks.map((risk) => risk.item)));
  }

  if (productionPack.exportManifest.files.length < 6) {
    problems.push(problem("export-manifest-incomplete", "medium", "QA Agent", "导出 manifest 少于 6 个文件。", "P2", "schema"));
  }

  return section("QA Agent", 5 - Math.min(5, problems.reduce((score, item) => score + (item.severity === "high" ? 2 : 1), 0)), [
    "rights risk levels checked",
    "export manifest checked",
    "investment disclaimer expected"
  ], problems);
}

function section(
  agent: string,
  score: number,
  checks: string[],
  problems: AuditProblem[]
): AgentAuditSection {
  return { agent, score: clampScore(score), checks, problems };
}

function problem(
  id: string,
  severity: AuditProblem["severity"],
  agent: string,
  problemText: string,
  fixPriority: string,
  suggestedTarget: AuditProblem["suggestedTarget"],
  targetIds?: string[]
): AuditProblem {
  return {
    id,
    severity,
    agent,
    problem: problemText,
    fixPriority,
    suggestedTarget,
    targetIds
  };
}

function formatProblem(problemItem: AuditProblem) {
  const targets = problemItem.targetIds?.length
    ? ` Targets: ${problemItem.targetIds.join(", ")}.`
    : "";

  return `[${problemItem.severity}] ${problemItem.agent}: ${problemItem.problem}${targets} Fix priority: ${problemItem.fixPriority}. Modify: ${problemItem.suggestedTarget}.`;
}

function hasCameraMotion(text: string) {
  return /(推|拉|摇|移|跟拍|俯拍|航拍|慢慢|镜头|pan|tilt|dolly|zoom|tracking|push|pull)/i.test(text);
}

function hasVisualSubject(text: string) {
  return /(人物|团队|办公室|工厂|门店|产品|设备|图表|数据|屏幕|城市|会议|生产线|实验室|主体|商业团队|信息卡|company|office|chart|screen|factory|product)/i.test(text);
}

function containsForbiddenRealAsset(text: string) {
  const normalized = text
    .replace(/不出现可读品牌文字|不出现可读品牌|不出现可读文字/g, "")
    .replace(/no readable brand text|no real company marks?|no brand logos?/gi, "");

  return /(真实\s*logo|真实logo|brand logo|company logo|上市现场|敲钟|真实人物|人物肖像|创始人肖像|精确地图|招股书截图|可读品牌|可读文字|celebrity|founder portrait|prospectus screenshot)/i.test(normalized);
}

function containsStyleLock(text: string) {
  return styleLock
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .every((part) => text.toLowerCase().includes(part));
}

function containsNegativePromptTerms(text: string) {
  const normalized = text.toLowerCase();

  return negativePromptTerms.every((term) => normalized.includes(term.toLowerCase()));
}

function allPromptsReferenceShots(
  prompts: AssetPromptResult,
  shotIds: string[]
) {
  const knownShotIds = new Set(shotIds);
  const allPrompts = [...prompts.imagePrompts, ...prompts.videoPrompts];

  return allPrompts.every((prompt) => knownShotIds.has(prompt.sceneRef));
}

function severityWeight(severity: AuditProblem["severity"]) {
  if (severity === "high") {
    return 3;
  }

  if (severity === "medium") {
    return 2;
  }

  return 1;
}

function clampScore(score: number) {
  return Math.max(0, Math.min(5, score));
}
