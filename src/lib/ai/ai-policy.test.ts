import { describe, expect, it } from "vitest";

import { readAiPolicy } from "./ai-policy";

describe("AI strict output policy", () => {
  it("defaults to requiring real output and disallowing mock fallback", () => {
    const policy = readAiPolicy({});

    expect(policy.requireRealOutput).toBe(true);
    expect(policy.allowMockFallback).toBe(false);
    expect(policy.bannedOutputTerms).toContain("mock");
    expect(policy.bannedOutputTerms).toContain("Batch 02");
  });

  it("allows explicit fallback only when configured", () => {
    const policy = readAiPolicy({
      AI_REQUIRE_REAL_OUTPUT: "false",
      AI_ALLOW_MOCK_FALLBACK: "true",
      AI_BANNED_OUTPUT_TERMS: "mock,Batch 02"
    });

    expect(policy.requireRealOutput).toBe(false);
    expect(policy.allowMockFallback).toBe(true);
    expect(policy.bannedOutputTerms).toEqual(["mock", "Batch 02"]);
  });
});
