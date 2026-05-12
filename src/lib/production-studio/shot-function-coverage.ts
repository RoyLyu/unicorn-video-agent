import type {
  ProductionPack,
  ShotFunction
} from "@/lib/schemas/production-pack";
import {
  getShotDensitySpec,
  type ShotDensityProfile
} from "./density-profile";

export const requiredShotFunctions90s: ShotFunction[] = [
  "hook_shot",
  "context_shot",
  "evidence_shot",
  "concept_shot",
  "data_shot",
  "risk_shot",
  "summary_shot"
];

export const requiredShotFunctions180s: ShotFunction[] = [
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
];

export const allShotFunctions: ShotFunction[] = [
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
];

const maxSingleFunctionRatio = 0.35;
const standard90Distribution: Array<[ShotFunction, number]> = [
  ["hook_shot", 2],
  ["context_shot", 3],
  ["evidence_shot", 4],
  ["concept_shot", 4],
  ["data_shot", 4],
  ["risk_shot", 3],
  ["transition_shot", 2],
  ["emotional_shot", 1],
  ["summary_shot", 1]
];
const standard180Distribution: Array<[ShotFunction, number]> = [
  ["hook_shot", 3],
  ["context_shot", 5],
  ["evidence_shot", 7],
  ["concept_shot", 7],
  ["transition_shot", 5],
  ["emotional_shot", 4],
  ["data_shot", 7],
  ["risk_shot", 5],
  ["summary_shot", 3],
  ["cta_shot", 2]
];

export type ShotFunctionCoverageResult = {
  distribution90s: Record<ShotFunction, number>;
  distribution180s: Record<ShotFunction, number>;
  missingFunctions90s: ShotFunction[];
  missingFunctions180s: ShotFunction[];
  overRepeatedFunctions90s: ShotFunction[];
  overRepeatedFunctions180s: ShotFunction[];
  coverageScore: number;
  needsFix: boolean;
  fixReasons: string[];
};

export function analyzeShotFunctionCoverage(
  shots: ProductionPack["storyboard"]["shots"]
): ShotFunctionCoverageResult {
  const shots90 = shots.filter((shot) => shot.versionType === "90s");
  const shots180 = shots.filter((shot) => shot.versionType === "180s");
  const distribution90s = countShotFunctions(shots90);
  const distribution180s = countShotFunctions(shots180);
  const missingFunctions90s = missingRequired(distribution90s, requiredShotFunctions90s);
  const missingFunctions180s = missingRequired(distribution180s, requiredShotFunctions180s);
  const overRepeatedFunctions90s = overRepeated(distribution90s, shots90.length);
  const overRepeatedFunctions180s = overRepeated(distribution180s, shots180.length);
  const score90 = scoreVersion(
    requiredShotFunctions90s,
    distribution90s,
    shots90.length,
    overRepeatedFunctions90s.length
  );
  const score180 = scoreVersion(
    requiredShotFunctions180s,
    distribution180s,
    shots180.length,
    overRepeatedFunctions180s.length
  );
  const coverageScore = Math.min(score90, score180);
  const fixReasons = [
    missingFunctions90s.length
      ? `需要重跑 / 人工修正：镜头功能分工不足，90s 缺少 ${missingFunctions90s.join(" / ")}。`
      : null,
    missingFunctions180s.length
      ? `需要重跑 / 人工修正：镜头功能分工不足，180s 缺少 ${missingFunctions180s.join(" / ")}。`
      : null,
    overRepeatedFunctions90s.length
      ? `需要重跑 / 人工修正：90s 镜头功能重复过多 ${overRepeatedFunctions90s.join(" / ")}。`
      : null,
    overRepeatedFunctions180s.length
      ? `需要重跑 / 人工修正：180s 镜头功能重复过多 ${overRepeatedFunctions180s.join(" / ")}。`
      : null
  ].filter(Boolean) as string[];

  return {
    distribution90s,
    distribution180s,
    missingFunctions90s,
    missingFunctions180s,
    overRepeatedFunctions90s,
    overRepeatedFunctions180s,
    coverageScore,
    needsFix: coverageScore < 4 || fixReasons.length > 0,
    fixReasons
  };
}

export function buildShotFunctionSequence(
  versionType: "90s" | "180s",
  densityProfile: ShotDensityProfile,
  countOverride?: number
): ShotFunction[] {
  const densitySpec = getShotDensitySpec(densityProfile);
  const count = countOverride ?? (versionType === "90s" ? densitySpec.min90s : densitySpec.min180s);
  const standard = versionType === "90s" ? standard90Distribution : standard180Distribution;
  const required = versionType === "90s" ? requiredShotFunctions90s : requiredShotFunctions180s;
  const targetCounts = scaleDistribution(standard, count, required);

  return targetCounts.flatMap(([shotFunction, shotCount]) =>
    Array.from({ length: shotCount }, () => shotFunction)
  ).slice(0, count);
}

function countShotFunctions(
  shots: ProductionPack["storyboard"]["shots"]
): Record<ShotFunction, number> {
  const counts = emptyShotFunctionCounts();

  for (const shot of shots) {
    if (shot.shotFunction) {
      counts[shot.shotFunction] += 1;
    }
  }

  return counts;
}

function emptyShotFunctionCounts(): Record<ShotFunction, number> {
  return {
    hook_shot: 0,
    context_shot: 0,
    evidence_shot: 0,
    concept_shot: 0,
    transition_shot: 0,
    emotional_shot: 0,
    data_shot: 0,
    risk_shot: 0,
    summary_shot: 0,
    cta_shot: 0
  };
}

function missingRequired(
  distribution: Record<ShotFunction, number>,
  required: ShotFunction[]
) {
  return required.filter((shotFunction) => distribution[shotFunction] === 0);
}

function overRepeated(
  distribution: Record<ShotFunction, number>,
  total: number
) {
  if (total === 0) {
    return [];
  }

  return allShotFunctions.filter(
    (shotFunction) => distribution[shotFunction] / total > maxSingleFunctionRatio
  );
}

function scoreVersion(
  required: ShotFunction[],
  distribution: Record<ShotFunction, number>,
  total: number,
  overRepeatedCount: number
) {
  if (total === 0) {
    return 1;
  }

  const covered = required.filter((shotFunction) => distribution[shotFunction] > 0).length;
  const coverageScore = Math.floor((covered / required.length) * 5);
  const repeatPenalty = overRepeatedCount > 0 ? 2 : 0;

  return Math.max(1, Math.min(5, coverageScore - repeatPenalty));
}

function scaleDistribution(
  standard: Array<[ShotFunction, number]>,
  count: number,
  required: ShotFunction[]
): Array<[ShotFunction, number]> {
  const standardTotal = standard.reduce((sum, [, value]) => sum + value, 0);
  const scaled = new Map<ShotFunction, number>();

  for (const [shotFunction, value] of standard) {
    scaled.set(shotFunction, Math.max(required.includes(shotFunction) ? 1 : 0, Math.floor((value / standardTotal) * count)));
  }
  for (const requiredFunction of required) {
    scaled.set(requiredFunction, Math.max(1, scaled.get(requiredFunction) ?? 0));
  }

  let currentTotal = [...scaled.values()].reduce((sum, value) => sum + value, 0);
  const byWeight = [...standard].sort((a, b) => b[1] - a[1]).map(([shotFunction]) => shotFunction);

  while (currentTotal < count) {
    for (const shotFunction of byWeight) {
      if (currentTotal >= count) break;
      scaled.set(shotFunction, (scaled.get(shotFunction) ?? 0) + 1);
      currentTotal += 1;
    }
  }

  while (currentTotal > count) {
    const removable = [...scaled.entries()]
      .filter(([shotFunction, value]) => value > (required.includes(shotFunction) ? 1 : 0))
      .sort((a, b) => b[1] - a[1])[0];

    if (!removable) {
      break;
    }
    scaled.set(removable[0], removable[1] - 1);
    currentTotal -= 1;
  }

  return [...scaled.entries()].filter(([, value]) => value > 0);
}
