import type { RightsCheckResult } from "@/lib/schemas/production-pack";

const defaultReplacementAlternative =
  "自制图表、抽象 AI 商业画面或 placeholder 复核项。";

export type RightsRiskDisplay = {
  item: string;
  level: RightsCheckResult["level"];
  reason: string;
  action: string;
  displayLabel: string;
  displayText: string;
  alternativeText: string;
};

export function formatRightsRiskDisplay(
  risk: RightsCheckResult
): RightsRiskDisplay {
  if (risk.level === "red") {
    const alternative = extractReplacementAlternative(risk.action);

    return {
      item: risk.item,
      level: risk.level,
      reason: risk.reason,
      action: risk.action,
      displayLabel: "不可直接使用素材",
      displayText: `不可直接使用：${risk.item}。建议替代：${alternative}`,
      alternativeText: `建议替代：${alternative}`
    };
  }

  return {
    item: risk.item,
    level: risk.level,
    reason: risk.reason,
    action: risk.action,
    displayLabel: labelForRiskLevel(risk.level),
    displayText: risk.reason,
    alternativeText: risk.action
  };
}

export function formatRightsRiskMarkdownLine(risk: RightsCheckResult) {
  const display = formatRightsRiskDisplay(risk);

  if (risk.level === "red") {
    return `- ${risk.level}：${risk.item}。${display.displayText} 原因：${risk.reason}。原始处理：${risk.action}`;
  }

  return `- ${risk.level}：${risk.item}。原因：${risk.reason}。处理：${risk.action}`;
}

function extractReplacementAlternative(action: string) {
  const normalized = action.trim();
  const replacementMatch = normalized.match(
    /(?:建议替代|替代方案|替换为|改用|使用)(?:[:：])?(.+)/
  );
  const candidate = replacementMatch?.[1]?.trim() ?? "";

  if (candidate) {
    return ensureFinalPunctuation(candidate);
  }

  if (/替换|自制图表|抽象 AI 画面|placeholder/.test(normalized)) {
    return ensureFinalPunctuation(
      normalized.replace(/^建议替代[:：]?/, "").replace(/^替代方案[:：]?/, "")
    );
  }

  return defaultReplacementAlternative;
}

function ensureFinalPunctuation(value: string) {
  return /[。.!！?？]$/.test(value) ? value : `${value}。`;
}

function labelForRiskLevel(level: RightsCheckResult["level"]) {
  switch (level) {
    case "green":
      return "可直接使用或自制素材";
    case "yellow":
      return "需人工确认授权";
    case "placeholder":
      return "占位待复核";
    case "red":
      return "不可直接使用素材";
  }
}
