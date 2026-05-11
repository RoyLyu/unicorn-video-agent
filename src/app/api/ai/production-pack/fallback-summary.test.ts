import { describe, expect, it } from "vitest";

import { classifyAiFallbackReason } from "./fallback-summary";

describe("AI fallback summary", () => {
  it("maps missing AI configuration to ai_config without exposing secrets", () => {
    const summary = classifyAiFallbackReason(
      "AI_PROVIDER is required. MINIMAX_API_KEY=secret-value"
    );

    expect(summary.fallbackReason).toBe("ai_config");
    expect(summary.safeErrorSummary).toContain(".env.local");
    expect(summary.safeErrorSummary).toContain("AI_PROVIDER");
    expect(summary.safeErrorSummary).not.toContain("secret-value");
  });

  it("maps aborted or timed-out requests to timeout", () => {
    const summary = classifyAiFallbackReason("provider_error: Request was aborted");

    expect(summary.fallbackReason).toBe("timeout");
    expect(summary.safeErrorSummary).toContain("短标题");
    expect(summary.safeErrorSummary).toContain("稍后重试");
  });

  it("defaults unknown fallback errors to unknown", () => {
    const summary = classifyAiFallbackReason("unexpected local fallback");

    expect(summary.fallbackReason).toBe("unknown");
    expect(summary.safeErrorSummary).toContain("fallback");
  });
});
