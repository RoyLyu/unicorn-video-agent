import type { AiEnvironment } from "./ai-config";

export type GenerationProfile = "real_output" | "fast_demo";

export type AiStrictPolicy = {
  requireRealOutput: boolean;
  allowMockFallback: boolean;
  bannedOutputTerms: string[];
};

export const defaultBannedOutputTerms = [
  "mock",
  "Batch 02",
  "后续补齐",
  "demo-data",
  "不是真实 AI",
  "只生成 JSON 生产包",
  "本地 mock",
  "Mock Pipeline"
];

export function readAiPolicy(env: AiEnvironment = process.env): AiStrictPolicy {
  return {
    requireRealOutput: env.AI_REQUIRE_REAL_OUTPUT !== "false",
    allowMockFallback: env.AI_ALLOW_MOCK_FALLBACK === "true",
    bannedOutputTerms: parseBannedTerms(env.AI_BANNED_OUTPUT_TERMS)
  };
}

export function shouldAllowMockFallback(input: {
  policy: AiStrictPolicy;
  generationProfile: GenerationProfile;
}) {
  return (
    input.generationProfile === "fast_demo" || input.policy.allowMockFallback
  );
}

function parseBannedTerms(value: string | undefined) {
  const terms = (value ?? defaultBannedOutputTerms.join(","))
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);

  return terms.length > 0 ? terms : defaultBannedOutputTerms;
}
