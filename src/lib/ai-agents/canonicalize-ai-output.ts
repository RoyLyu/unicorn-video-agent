export type CanonicalizationChangedField = {
  path: string;
  enumName: string;
  originalValue: string;
  canonicalValue: string;
};

export type UnknownEnumField = {
  path: string;
  enumName: string;
  originalValue: string;
  allowedValues: string[];
};

export type CanonicalizationReport = {
  changedFields: CanonicalizationChangedField[];
  unknownEnumFields: UnknownEnumField[];
  warnings: string[];
};

type EnumSpec = {
  enumName: string;
  allowedValues: string[];
  aliases: Record<string, string>;
};

const enumSpecs = {
  cutType: makeSpec("cutType", [
    "hard_cut",
    "dissolve",
    "wipe",
    "match_cut",
    "graphic_match",
    "push",
    "zoom_cut"
  ], {
    "hard cut": "hard_cut",
    "硬切": "hard_cut",
    "cut": "hard_cut",
    "direct cut": "hard_cut",
    "dissolve": "dissolve",
    "叠化": "dissolve",
    "fade": "dissolve",
    "fade transition": "dissolve",
    "wipe": "wipe",
    "擦除": "wipe",
    "wipe transition": "wipe",
    "match cut": "match_cut",
    "matchcut": "match_cut",
    "匹配剪辑": "match_cut",
    "graphic match": "graphic_match",
    "图形匹配": "graphic_match",
    "graphic match cut": "graphic_match",
    "push": "push",
    "推入": "push",
    "push transition": "push",
    "zoom cut": "zoom_cut",
    "zoom": "zoom_cut",
    "快速变焦切": "zoom_cut"
  }),
  rollType: makeSpec("rollType", [
    "a_roll",
    "b_roll",
    "graphic_roll",
    "transition_roll"
  ], {
    "A-roll": "a_roll",
    "a roll": "a_roll",
    "主叙事": "a_roll",
    "主画面": "a_roll",
    "talking head": "a_roll",
    "B-roll": "b_roll",
    "b roll": "b_roll",
    "补充画面": "b_roll",
    "氛围画面": "b_roll",
    "graphic": "graphic_roll",
    "graphic roll": "graphic_roll",
    "图表画面": "graphic_roll",
    "信息图": "graphic_roll",
    "motion graphics": "graphic_roll",
    "transition": "transition_roll",
    "transition roll": "transition_roll",
    "转场画面": "transition_roll",
    "过渡镜头": "transition_roll"
  }),
  pace: makeSpec("pace", ["fast", "medium", "slow"], {
    "快": "fast",
    "快速": "fast",
    "fast pace": "fast",
    "中": "medium",
    "中速": "medium",
    "moderate": "medium",
    "慢": "slow",
    "缓慢": "slow",
    "slow pace": "slow"
  }),
  shotFunction: makeSpec("shotFunction", [
    "hook_shot",
    "context_shot",
    "evidence_shot",
    "concept_shot",
    "transition_shot",
    "emotional_shot",
    "data_shot",
    "risk_shot",
    "summary_shot",
    "cta_shot"
  ], {
    "Hook Shot": "hook_shot",
    "hook": "hook_shot",
    "开头抓人": "hook_shot",
    "Context Shot": "context_shot",
    "context": "context_shot",
    "背景": "context_shot",
    "Evidence Shot": "evidence_shot",
    "evidence": "evidence_shot",
    "事实证据": "evidence_shot",
    "Concept Shot": "concept_shot",
    "concept": "concept_shot",
    "概念解释": "concept_shot",
    "Transition Shot": "transition_shot",
    "transition": "transition_shot",
    "段落过渡": "transition_shot",
    "Emotional Shot": "emotional_shot",
    "emotional": "emotional_shot",
    "情绪": "emotional_shot",
    "Data Shot": "data_shot",
    "data": "data_shot",
    "数字": "data_shot",
    "图表": "data_shot",
    "Risk Shot": "risk_shot",
    "risk": "risk_shot",
    "风险": "risk_shot",
    "Summary Shot": "summary_shot",
    "summary": "summary_shot",
    "总结": "summary_shot",
    "CTA Shot": "cta_shot",
    "cta": "cta_shot",
    "关注评论": "cta_shot"
  }),
  productionMethod: makeSpec("productionMethod", [
    "text_to_video",
    "image_to_video",
    "text_to_image_edit",
    "motion_graphics",
    "stock_footage",
    "manual_design",
    "compositing"
  ], {
    "Text-to-Video": "text_to_video",
    "文生视频": "text_to_video",
    "Image-to-Video": "image_to_video",
    "图生视频": "image_to_video",
    "Text-to-Image + Edit": "text_to_image_edit",
    "文生图后编辑": "text_to_image_edit",
    "Motion Graphics": "motion_graphics",
    "动效": "motion_graphics",
    "动态图表": "motion_graphics",
    "Stock Footage": "stock_footage",
    "库存素材": "stock_footage",
    "素材库": "stock_footage",
    "Manual Design": "manual_design",
    "手工设计": "manual_design",
    "人工设计": "manual_design",
    "Compositing": "compositing",
    "合成": "compositing"
  }),
  rightsRisk: makeSpec("rightsRisk", ["green", "yellow", "red", "placeholder"], {
    "low": "green",
    "safe": "green",
    "可用": "green",
    "medium": "yellow",
    "needs review": "yellow",
    "需复核": "yellow",
    "high": "red",
    "unsafe": "red",
    "不可用": "red",
    "pending": "placeholder",
    "placeholder": "placeholder",
    "占位": "placeholder"
  })
};

export function canonicalizeAiOutput(raw: unknown): {
  value: unknown;
  report: CanonicalizationReport;
} {
  const report: CanonicalizationReport = {
    changedFields: [],
    unknownEnumFields: [],
    warnings: []
  };
  const value = visit(raw, [], report);

  return { value, report };
}

function visit(value: unknown, path: string[], report: CanonicalizationReport): unknown {
  if (Array.isArray(value)) {
    return value.map((item, index) => visit(item, [...path, String(index)], report));
  }

  if (!isRecord(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      const currentPath = [...path, key];
      const spec = specForPath(currentPath);

      if (spec && typeof item === "string" && item.trim()) {
        return [key, canonicalizeValue(item, currentPath.join("."), spec, report)];
      }

      return [key, visit(item, currentPath, report)];
    })
  );
}

function canonicalizeValue(
  value: string,
  path: string,
  spec: EnumSpec,
  report: CanonicalizationReport
) {
  const canonical = spec.aliases[normalizeAliasKey(value)];

  if (!canonical) {
    report.unknownEnumFields.push({
      path,
      enumName: spec.enumName,
      originalValue: value,
      allowedValues: spec.allowedValues
    });
    return value;
  }

  if (canonical !== value) {
    report.changedFields.push({
      path,
      enumName: spec.enumName,
      originalValue: value,
      canonicalValue: canonical
    });
  }

  return canonical;
}

function specForPath(path: string[]): EnumSpec | null {
  const key = path.at(-1);

  if (key === "cutType") return enumSpecs.cutType;
  if (key === "rollType") return enumSpecs.rollType;
  if (key === "pace") return enumSpecs.pace;
  if (key === "shotFunction") return enumSpecs.shotFunction;
  if (key === "productionMethod") return enumSpecs.productionMethod;
  if (key === "copyrightRisk" || key === "rightsLevel" || key === "riskLevel") {
    return enumSpecs.rightsRisk;
  }
  if (key === "level" && path.includes("rightsChecks")) {
    return enumSpecs.rightsRisk;
  }

  return null;
}

function makeSpec(
  enumName: string,
  allowedValues: string[],
  aliases: Record<string, string>
): EnumSpec {
  const normalizedAliases = Object.fromEntries(
    [
      ...allowedValues.map((value) => [value, value] as const),
      ...Object.entries(aliases)
    ].map(([key, value]) => [normalizeAliasKey(key), value])
  );

  return {
    enumName,
    allowedValues,
    aliases: normalizedAliases
  };
}

function normalizeAliasKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[－–—]/g, "-")
    .replace(/[_\s-]+/g, " ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
